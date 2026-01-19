import { existsSync, readFileSync, readdirSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import { homedir } from 'os';

interface CheckOptions {
  verbose?: boolean;
}

interface AITool {
  name: string;
  checkInstalled: () => boolean;
  getConfigPath: () => string | null;
}

/**
 * Agent configuration - similar to spec-kit's AGENT_CONFIG
 * Each agent has:
 * - name: Display name
 * - cliTool: Actual CLI command name (what users type in terminal)
 * - requiresCli: Whether CLI tool check is needed
 * - installUrl: Installation documentation URL (optional)
 */
interface AgentConfig {
  name: string;
  cliTool: string | null; // null for IDE-based agents
  requiresCli: boolean;
  installUrl?: string | null;
}

const AGENT_CONFIG: Record<string, AgentConfig> = {
  'copilot': {
    name: 'GitHub Copilot CLI',
    cliTool: 'copilot',
    requiresCli: true,
    installUrl: 'https://github.com/github/copilot-cli',
  },
  'claude-code': {
    name: 'Claude Code',
    cliTool: 'claude', // Actual CLI tool name
    requiresCli: true,
    installUrl: 'https://docs.anthropic.com/en/docs/claude-code/setup',
  },
  'cursor': {
    name: 'Cursor',
    cliTool: null, // IDE-based, but may have CLI
    requiresCli: false,
    installUrl: 'https://cursor.sh',
  },
  'gemini': {
    name: 'Gemini CLI',
    cliTool: 'gemini',
    requiresCli: true,
    installUrl: 'https://github.com/google-gemini/gemini-cli',
  },

  'codex': {
    name: 'OpenAI Codex CLI',
    cliTool: 'codex',
    requiresCli: true,
    installUrl: 'https://github.com/openai/codex',
  },
  'vscode': {
    name: 'VS Code',
    cliTool: null, // IDE-based, but may have CLI
    requiresCli: false,
    installUrl: 'https://code.visualstudio.com',
  },
};

/**
 * Check if a CLI tool is installed (similar to spec-kit's check_tool)
 * Uses which/where command to check if tool exists in PATH
 * 
 * Special handling for Claude CLI after `claude migrate-installer`:
 * The migrate-installer command REMOVES the original executable from PATH
 * and creates an alias at ~/.claude/local/claude instead
 */
function checkTool(tool: string): boolean {
  // Special handling for Claude CLI
  if (tool === 'claude') {
    const claudeLocalPath = join(homedir(), '.claude', 'local', 'claude');
    if (existsSync(claudeLocalPath)) {
      return true;
    }
  }

  // Check if tool exists in PATH using which/where
  return checkCommandInstalled(tool);
}

export async function checkCommand(options: CheckOptions) {
  console.log('\x1b[32m=== AI Skills Hub Status Check ===\x1b[0m\n');

  const os = detectOS();
  const customToolsMap = getAIToolsMap();

  // 1. Check installed AI tools (CLI-based agents)
  console.log('\x1b[33m[1] Installed AI Tools\x1b[0m');
  const installedTools: Array<{ key: string; config: AgentConfig }> = [];

  // Iterate through AGENT_CONFIG to check all agents
  for (const [agentKey, agentConfig] of Object.entries(AGENT_CONFIG)) {
    let isInstalled = false;

    if (agentConfig.requiresCli && agentConfig.cliTool) {
      // Check CLI tool
      isInstalled = checkTool(agentConfig.cliTool);
    } else {
      // For IDE-based agents or agents without CLI, use custom check
      const customTool = customToolsMap.get(agentKey);
      if (customTool) {
        isInstalled = customTool.checkInstalled();
      }
    }

    if (isInstalled) {
      installedTools.push({ key: agentKey, config: agentConfig });
      console.log(`\x1b[32m✓ ${agentConfig.name}\x1b[0m`);
      if (options.verbose && agentConfig.cliTool) {
        try {
          // Try to get version information
          const version = getToolVersion(agentConfig.cliTool);
          if (version) {
            console.log(`   Version: ${version}`);
          }
        } catch {
          // Ignore error
        }
      }
    } else {
      const statusText = agentConfig.requiresCli ? '(not installed)' : '(IDE-based, no CLI check)';
      console.log(`\x1b[33m○ ${agentConfig.name} ${statusText}\x1b[0m`);
    }
  }

  if (installedTools.length === 0) {
    console.log('\x1b[33mTip: No installed AI tools detected\x1b[0m');
  }

  // 2. Check tools with configured MCP routes
  console.log('\n\x1b[33m[2] Tools with Configured MCP Routes\x1b[0m');
  const configuredTools: string[] = [];
  const notConfiguredTools: string[] = [];

  for (const { key: agentKey, config: agentConfig } of installedTools) {
    const customTool = customToolsMap.get(agentKey);
    const configPath = customTool ? customTool.getConfigPath() : null;

    if (!configPath || !existsSync(configPath)) {
      // Config file doesn't exist
      notConfiguredTools.push(agentConfig.name);
      const reason = agentConfig.requiresCli && agentConfig.cliTool
        ? '(installed but MCP not configured)'
        : '(config file does not exist)';
      console.log(`\x1b[33m○ ${agentConfig.name} ${reason}\x1b[0m`);
      if (options.verbose) {
        console.log(`   Config file: ${configPath || 'No config file path'}`);
      }
      continue;
    }

    // Config file exists, check MCP configuration
    try {
      const content = readFileSync(configPath, 'utf-8');
      const json = JSON.parse(content);
      
      // VS Code uses 'mcp.servers' format, other tools use 'mcpServers'
      const hasMcpConfig = agentKey === 'vscode'
        ? (json['mcp.servers'] && json['mcp.servers']['ai-skills-hub'])
        : (json.mcpServers && json.mcpServers['ai-skills-hub']);
      
      if (hasMcpConfig) {
        configuredTools.push(agentConfig.name);
        console.log(`\x1b[32m✓ ${agentConfig.name}\x1b[0m`);
        if (options.verbose) {
          console.log(`   Config file: ${configPath}`);
          const mcpConfig = agentKey === 'vscode'
            ? json['mcp.servers']['ai-skills-hub']
            : json.mcpServers['ai-skills-hub'];
          if (mcpConfig.command) {
            console.log(`   Command: ${mcpConfig.command} ${mcpConfig.args?.join(' ') || ''}`);
          }
        }
      } else {
        notConfiguredTools.push(agentConfig.name);
        console.log(`\x1b[33m○ ${agentConfig.name} (installed but MCP not configured)\x1b[0m`);
        if (options.verbose) {
          console.log(`   Config file: ${configPath}`);
        }
      }
    } catch {
      notConfiguredTools.push(agentConfig.name);
      console.log(`\x1b[33m○ ${agentConfig.name} (config file format error)\x1b[0m`);
      if (options.verbose) {
        console.log(`   Config file: ${configPath}`);
      }
    }
  }

  // Summary
  console.log('\n\x1b[36m=== Check Summary ===\x1b[0m');
  const totalAgents = Object.keys(AGENT_CONFIG).length;
  console.log(`Installed tools: ${installedTools.length}/${totalAgents}`);
  console.log(`Configured MCP: ${configuredTools.length}/${installedTools.length}`);

  if (notConfiguredTools.length > 0) {
    console.log('\n\x1b[33mTip: Run "skillshub sync" to configure unconfigured AI tools\x1b[0m');
  }

  if (installedTools.length === 0) {
    console.log('\n\x1b[33mTip: No installed AI tools detected, please install required tools first\x1b[0m');
  }
}

function detectOS(): string {
  const platform = process.platform;
  if (platform === 'darwin') return 'macos';
  if (platform === 'linux') return 'linux';
  if (platform === 'win32') return 'windows';
  return 'unknown';
}

/**
 * Get configuration file path for a tool based on OS
 */
function getConfigPath(os: string, tool: string): string | null {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const appData = process.env.APPDATA || '';
  
  const pathMap: Record<string, Record<string, string>> = {
    macos: {
      cursor: `${homeDir}/.cursor/mcp.json`,
      codex: `${homeDir}/.codex/config.json`,
      copilot: `${homeDir}/.config/github-copilot/config.json`,
      gemini: `${homeDir}/.config/gemini/config.json`,
      'claude-code': `${homeDir}/.claude.json`,
      vscode: `${homeDir}/Library/Application Support/Code/User/settings.json`,
      claude: `${homeDir}/.claude.json`
    },
    linux: {
      cursor: `${homeDir}/.config/cursor/mcp.json`,
      codex: `${homeDir}/.config/codex/config.json`,
      copilot: `${homeDir}/.config/github-copilot/config.json`,
      gemini: `${homeDir}/.config/gemini/config.json`,
      'claude-code': `${homeDir}/.claude.json`,
      vscode: `${homeDir}/.config/Code/User/settings.json`,
      claude: `${homeDir}/.claude.json`
    },
    windows: {
      cursor: `${appData}/Cursor/User/mcp.json`,
      codex: `${appData}/codex/config.json`,
      copilot: `${appData}/github-copilot/config.json`,
      gemini: `${appData}/gemini/config.json`,
      'claude-code': `${homeDir}/.claude.json`,
      vscode: `${appData}/Code/User/settings.json`,
      claude: `${homeDir}/.claude.json`
    }
  };

  return pathMap[os]?.[tool] || null;
}

function checkCommandInstalled(command: string): boolean {
  try {
    if (process.platform === 'win32') {
      execSync(`where ${command}`, { stdio: 'ignore' });
    } else {
      execSync(`which ${command}`, { stdio: 'ignore' });
    }
    return true;
  } catch {
    return false;
  }
}

function getToolVersion(cliTool: string): string | null {
  try {
    // Try to get version using --version flag
    const command = `${cliTool} --version`;
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    return output.trim();
  } catch {
    // If --version fails, try -v
    try {
      const command = `${cliTool} -v`;
      const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
      return output.trim();
    } catch {
      // Ignore error
    }
  }
  return null;
}

function checkCursorInstalled(): boolean {
  const platform = process.platform;
  
  if (platform === 'darwin') {
    // macOS: Check for Cursor.app in common locations
    const homeDir = process.env.HOME || '';
    const paths = [
      '/Applications/Cursor.app',
      `${homeDir}/Applications/Cursor.app`
    ];
    return paths.some(path => existsSync(path));
  } else if (platform === 'linux') {
    // Linux: Check if cursor command exists or check common AppImage locations
    if (checkCommandInstalled('cursor')) {
      return true;
    }
    const homeDir = process.env.HOME || '';
    
    // Try to find AppImage files in ~/Applications
    try {
      const appsDir = join(homeDir, 'Applications');
      if (existsSync(appsDir)) {
        const files = readdirSync(appsDir);
        if (files.some((f: string) => f.toLowerCase().includes('cursor') && f.endsWith('.AppImage'))) {
          return true;
        }
      }
    } catch {
      // Ignore errors
    }
    
    // Check other common paths
    const commonPaths = [
      join(homeDir, '.local', 'bin', 'cursor'),
      '/usr/bin/cursor',
      '/usr/local/bin/cursor',
      '/opt/cursor/cursor'
    ];
    
    return commonPaths.some(path => {
      try {
        return existsSync(path);
      } catch {
        return false;
      }
    });
  } else if (platform === 'win32') {
    // Windows: Check common installation paths
    const localAppData = process.env.LOCALAPPDATA || '';
    const programFiles = process.env.ProgramFiles || '';
    const programFilesX86 = process.env['ProgramFiles(x86)'] || '';
    const appData = process.env.APPDATA || '';
    
    const paths = [
      join(localAppData, 'Programs', 'cursor', 'Cursor.exe'),
      join(programFiles, 'Cursor', 'Cursor.exe'),
      join(programFilesX86, 'Cursor', 'Cursor.exe'),
      join(appData, 'Cursor', 'Cursor.exe')
    ];
    
    // Also check if cursor command exists in PATH
    if (checkCommandInstalled('cursor')) {
      return true;
    }
    
    return paths.some(path => existsSync(path));
  }
  
  return false;
}

function checkVSCodeInstalled(): boolean {
  const platform = process.platform;
  
  if (platform === 'darwin') {
    // macOS: Check for Visual Studio Code.app in common locations
    const homeDir = process.env.HOME || '';
    const paths = [
      '/Applications/Visual Studio Code.app',
      `${homeDir}/Applications/Visual Studio Code.app`
    ];
    return paths.some(path => existsSync(path));
  } else if (platform === 'linux') {
    // Linux: Check if code command exists
    if (checkCommandInstalled('code')) {
      return true;
    }
    const homeDir = process.env.HOME || '';
    
    // Check common installation paths
    const commonPaths = [
      join(homeDir, '.local', 'bin', 'code'),
      '/usr/bin/code',
      '/usr/local/bin/code',
      '/opt/visual-studio-code/code'
    ];
    
    return commonPaths.some(path => {
      try {
        return existsSync(path);
      } catch {
        return false;
      }
    });
  } else if (platform === 'win32') {
    // Windows: Check common installation paths
    const localAppData = process.env.LOCALAPPDATA || '';
    const programFiles = process.env.ProgramFiles || '';
    const programFilesX86 = process.env['ProgramFiles(x86)'] || '';
    
    const paths = [
      join(localAppData, 'Programs', 'Microsoft VS Code', 'Code.exe'),
      join(programFiles, 'Microsoft VS Code', 'Code.exe'),
      join(programFilesX86, 'Microsoft VS Code', 'Code.exe')
    ];
    
    // Also check if code command exists in PATH
    if (checkCommandInstalled('code')) {
      return true;
    }
    
    return paths.some(path => existsSync(path));
  }
  
  return false;
}

/**
 * Get custom tool definitions for agents that need special installation checks
 * Returns a Map for O(1) lookup performance
 */
function getAIToolsMap(): Map<string, AITool> {
  const os = detectOS();
  
  return new Map([
    [
      'cursor',
      {
        name: 'cursor',
        checkInstalled: checkCursorInstalled,
        getConfigPath: () => getConfigPath(os, 'cursor')
      }
    ],
    [
      'vscode',
      {
        name: 'vscode',
        checkInstalled: checkVSCodeInstalled,
        getConfigPath: () => getConfigPath(os, 'vscode')
      }
    ],
    // CLI-based tools can use standard checkCommandInstalled, but we still need config paths
    [
      'codex',
      {
        name: 'codex',
        checkInstalled: () => checkCommandInstalled('codex'),
        getConfigPath: () => getConfigPath(os, 'codex')
      }
    ],
    [
      'copilot',
      {
        name: 'copilot',
        checkInstalled: () => checkCommandInstalled('copilot'),
        getConfigPath: () => getConfigPath(os, 'copilot')
      }
    ],
    [
      'gemini',
      {
        name: 'gemini',
        checkInstalled: () => checkCommandInstalled('gemini'),
        getConfigPath: () => getConfigPath(os, 'gemini')
      }
    ],
    [
      'claude-code',
      {
        name: 'claude-code',
        checkInstalled: () => checkCommandInstalled('claude') || checkCommandInstalled('claude-code'),
        getConfigPath: () => getConfigPath(os, 'claude-code')
      }
    ],
    [
      'claude',
      {
        name: 'claude',
        checkInstalled: () => checkCommandInstalled('claude'),
        getConfigPath: () => getConfigPath(os, 'claude')
      }
    ]
  ]);
}
