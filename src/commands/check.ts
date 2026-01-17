import { existsSync, readFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CheckOptions {
  verbose?: boolean;
}

interface AITool {
  name: string;
  displayName: string;
  checkInstalled: () => boolean;
  getConfigPath: (os: string) => string | null;
}

export async function checkCommand(options: CheckOptions) {
  console.log('\x1b[32m=== AI Skills Hub Status Check ===\x1b[0m\n');

  const os = detectOS();
  const tools = getAITools();

  // 1. Check installed AI tools
  console.log('\x1b[33m[1] Installed AI Tools\x1b[0m');
  const installedTools: AITool[] = [];
  const notInstalledTools: AITool[] = [];

  for (const tool of tools) {
    const isInstalled = tool.checkInstalled();
    if (isInstalled) {
      installedTools.push(tool);
      console.log(`\x1b[32m✓ ${tool.displayName}\x1b[0m`);
      if (options.verbose) {
        try {
          // Try to get version information
          const version = getToolVersion(tool.name);
          if (version) {
            console.log(`   Version: ${version}`);
          }
        } catch {
          // Ignore error
        }
      }
    } else {
      notInstalledTools.push(tool);
      console.log(`\x1b[33m○ ${tool.displayName} (not installed)\x1b[0m`);
    }
  }

  if (installedTools.length === 0) {
    console.log('\x1b[33mTip: No installed AI tools detected\x1b[0m');
  }

  // 2. Check tools with configured MCP routes
  console.log('\n\x1b[33m[2] Tools with Configured MCP Routes\x1b[0m');
  const configuredTools: string[] = [];
  const notConfiguredTools: string[] = [];

  for (const tool of installedTools) {
    const configPath = tool.getConfigPath(os);
    if (configPath && existsSync(configPath)) {
      try {
        const content = readFileSync(configPath, 'utf-8');
        const json = JSON.parse(content);
        if (json.mcpServers && json.mcpServers['ai-skills-hub']) {
          configuredTools.push(tool.displayName);
          console.log(`\x1b[32m✓ ${tool.displayName}\x1b[0m`);
          if (options.verbose) {
            console.log(`   Config file: ${configPath}`);
            const mcpConfig = json.mcpServers['ai-skills-hub'];
            if (mcpConfig.command) {
              console.log(`   Command: ${mcpConfig.command} ${mcpConfig.args?.join(' ') || ''}`);
            }
          }
        } else {
          notConfiguredTools.push(tool.displayName);
          console.log(`\x1b[33m○ ${tool.displayName} (installed but MCP not configured)\x1b[0m`);
          if (options.verbose && configPath) {
            console.log(`   Config file: ${configPath}`);
          }
        }
      } catch (error) {
        notConfiguredTools.push(tool.displayName);
        console.log(`\x1b[33m○ ${tool.displayName} (config file format error)\x1b[0m`);
        if (options.verbose && configPath) {
          console.log(`   Config file: ${configPath}`);
        }
      }
    } else {
      // For tools that don't require config files (like CLI tools), check if config file exists
      if (tool.name === 'codex' || tool.name === 'copilot' || tool.name === 'gemini' || tool.name === 'claude-code') {
        notConfiguredTools.push(tool.displayName);
        console.log(`\x1b[33m○ ${tool.displayName} (installed but MCP not configured)\x1b[0m`);
        if (options.verbose && configPath) {
          console.log(`   Config file: ${configPath || 'No config file path'}`);
        }
      } else {
        // Claude Desktop and Cursor must have config files
        notConfiguredTools.push(tool.displayName);
        console.log(`\x1b[33m○ ${tool.displayName} (config file does not exist)\x1b[0m`);
      }
    }
  }

  // Summary
  console.log('\n\x1b[36m=== Check Summary ===\x1b[0m');
  console.log(`Installed tools: ${installedTools.length}/${tools.length}`);
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

function getConfigPath(os: string, tool: string): string | null {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  
  const paths: Record<string, Record<string, string>> = {
    macos: {
      'claude-desktop': `${homeDir}/Library/Application Support/Claude/claude_desktop_config.json`,
      'cursor': `${homeDir}/.cursor/mcp.json`,
      'codex': `${homeDir}/.codex/config.json`,
      'copilot': `${homeDir}/.config/github-copilot/config.json`,
      'gemini': `${homeDir}/.config/gemini/config.json`,
      'claude-code': `${homeDir}/.config/claude-code/config.json`
    },
    linux: {
      'claude-desktop': `${homeDir}/.config/Claude/claude_desktop_config.json`,
      'cursor': `${homeDir}/.config/cursor/mcp.json`,
      'codex': `${homeDir}/.config/codex/config.json`,
      'copilot': `${homeDir}/.config/github-copilot/config.json`,
      'gemini': `${homeDir}/.config/gemini/config.json`,
      'claude-code': `${homeDir}/.config/claude-code/config.json`
    },
    windows: {
      'claude-desktop': `${process.env.APPDATA}/Claude/claude_desktop_config.json`,
      'cursor': `${process.env.APPDATA}/Cursor/User/mcp.json`,
      'codex': `${process.env.APPDATA}/codex/config.json`,
      'copilot': `${process.env.APPDATA}/github-copilot/config.json`,
      'gemini': `${process.env.APPDATA}/gemini/config.json`,
      'claude-code': `${process.env.APPDATA}/claude-code/config.json`
    }
  };

  return paths[os]?.[tool] || null;
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

function getToolVersion(toolName: string): string | null {
  try {
    let command = '';
    switch (toolName) {
      case 'codex':
        command = 'codex --version';
        break;
      case 'copilot':
        command = 'copilot --version';
        break;
      case 'gemini':
        command = 'gemini --version';
        break;
      case 'claude-code':
        // Try two possible commands
        if (checkCommandInstalled('claude')) {
          command = 'claude --version';
        } else if (checkCommandInstalled('claude-code')) {
          command = 'claude-code --version';
        }
        break;
      default:
        return null;
    }
    
    if (command) {
      const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
      return output.trim();
    }
  } catch {
    // Ignore error
  }
  return null;
}

function getAITools(): AITool[] {
  return [
    {
      name: 'claude-desktop',
      displayName: 'Claude Desktop',
      checkInstalled: () => {
        // Claude Desktop doesn't need CLI, just check if config file exists
        const os = detectOS();
        const configPath = getConfigPath(os, 'claude-desktop');
        return configPath ? existsSync(configPath) : false;
      },
      getConfigPath: (os: string) => getConfigPath(os, 'claude-desktop')
    },
    {
      name: 'cursor',
      displayName: 'Cursor',
      checkInstalled: () => {
        // Cursor doesn't need CLI, just check if config file exists
        const os = detectOS();
        const configPath = getConfigPath(os, 'cursor');
        return configPath ? existsSync(configPath) : false;
      },
      getConfigPath: (os: string) => getConfigPath(os, 'cursor')
    },
    {
      name: 'codex',
      displayName: 'OpenAI Codex CLI',
      checkInstalled: () => checkCommandInstalled('codex'),
      getConfigPath: (os: string) => getConfigPath(os, 'codex')
    },
    {
      name: 'copilot',
      displayName: 'GitHub Copilot CLI',
      checkInstalled: () => checkCommandInstalled('copilot'),
      getConfigPath: (os: string) => getConfigPath(os, 'copilot')
    },
    {
      name: 'gemini',
      displayName: 'Gemini CLI',
      checkInstalled: () => checkCommandInstalled('gemini'),
      getConfigPath: (os: string) => getConfigPath(os, 'gemini')
    },
    {
      name: 'claude-code',
      displayName: 'Claude Code CLI',
      checkInstalled: () => checkCommandInstalled('claude') || checkCommandInstalled('claude-code'),
      getConfigPath: (os: string) => getConfigPath(os, 'claude-code')
    }
  ];
}
