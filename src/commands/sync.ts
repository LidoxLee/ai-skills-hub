import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Detect runtime environment: determine if running in npm package (npx or global installation)
// If in node_modules, it means installed via npm
function isNpmPackage(): boolean {
  return __dirname.includes('node_modules');
}

// Get project directory
// If in npm package, PROJECT_DIR is the package directory itself
// If local development, PROJECT_DIR is the project root directory
const PROJECT_DIR = isNpmPackage() ? __dirname.replace(/\/dist\/commands$/, '').replace(/\\dist\\commands$/, '') : join(__dirname, '../..');

interface SyncOptions {
  force?: boolean;
}

export async function syncCommand(options: SyncOptions) {
  console.log('\x1b[32m=== AI Skills Hub Sync Script ===\x1b[0m');
  console.log(`Project directory: ${PROJECT_DIR}`);

  const isNpmEnv = isNpmPackage();
  
  try {
    // 1. Git Pull (only execute in local development environment)
    if (!isNpmEnv) {
      console.log('\n\x1b[33m[1/4] Updating skills library...\x1b[0m');
      if (existsSync(join(PROJECT_DIR, '.git'))) {
        try {
          execSync('git pull', { cwd: PROJECT_DIR, stdio: 'inherit' });
        } catch (error) {
          console.log('\x1b[31mWarning: Git pull failed, continuing...\x1b[0m');
        }
      } else {
        console.log('\x1b[33mTip: This directory is not a Git repository, skipping git pull\x1b[0m');
      }
    } else {
      console.log('\n\x1b[33m[1/4] Using skills library from npm package...\x1b[0m');
      console.log('Tip: When using npx, skills library is included in package, no update needed');
    }

    // 2. Install dependencies and compile (only execute in local development environment)
    if (!isNpmEnv) {
      console.log('\n\x1b[33m[2/4] Compiling TypeScript...\x1b[0m');
      if (!existsSync(join(PROJECT_DIR, 'node_modules'))) {
        console.log('Installing dependencies...');
        execSync('npm install', { cwd: PROJECT_DIR, stdio: 'inherit' });
      }
      
      if (options.force || !existsSync(join(PROJECT_DIR, 'dist'))) {
        execSync('npm run build', { cwd: PROJECT_DIR, stdio: 'inherit' });
      } else {
        console.log('Skipping compilation (use --force to force recompilation)');
      }
    } else {
      console.log('\n\x1b[33m[2/4] Using precompiled code...\x1b[0m');
      console.log('Tip: When using npx, code is precompiled, no recompilation needed');
      
      // Verify dist directory exists
      if (!existsSync(join(PROJECT_DIR, 'dist'))) {
        throw new Error('dist directory not found. npm package may be incomplete.');
      }
      
      // Verify skills directory exists
      if (!existsSync(join(PROJECT_DIR, 'skills'))) {
        throw new Error('skills directory not found. npm package may be incomplete.');
      }
    }

    // 3. Detect operating system
    const os = detectOS();
    console.log(`\n\x1b[33mDetected OS: ${os}\x1b[0m`);
    if (isNpmEnv) {
      console.log(`Runtime environment: npm package (${PROJECT_DIR})`);
    } else {
      console.log(`Runtime environment: local development`);
    }

    // 4. Configure MCP server settings
    const stepNumber = isNpmEnv ? '[2/3]' : '[3/4]';
    console.log(`\n\x1b[33m${stepNumber} Configuring AI tools MCP settings...\x1b[0m`);
    
    const mcpServerPath = join(PROJECT_DIR, 'dist', 'index.js');
    const mcpConfig = {
      mcpServers: {
        'ai-skills-hub': {
          command: 'node',
          args: [mcpServerPath]
        }
      }
    };

    // Configure each AI tool
    await configureClaudeDesktop(os, mcpConfig);
    await configureCursor(os, mcpConfig);
    await configureCodex(os);
    await configureCopilot(os);
    await configureGemini(os);
    await configureClaudeCode(os);

    // 5. Complete
    const finalStepNumber = isNpmEnv ? '[3/3]' : '[4/4]';
    console.log(`\n\x1b[32m${finalStepNumber} Sync complete!\x1b[0m`);
    if (!isNpmEnv) {
      console.log('\n\x1b[32m✓ Skills library updated');
      console.log('✓ TypeScript compiled');
    } else {
      console.log('\n\x1b[32m✓ Using skills library from npm package');
      console.log('✓ Using precompiled code');
    }
    console.log('✓ AI tools configuration updated\x1b[0m');
    console.log('\n\x1b[33mTip: Some AI tools may require restart to load new MCP configuration\x1b[0m');
  } catch (error) {
    console.error('\x1b[31mError:', error instanceof Error ? error.message : String(error), '\x1b[0m');
    process.exit(1);
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

function backupConfig(configPath: string): void {
  if (existsSync(configPath)) {
    const backupPath = `${configPath}.backup.${Date.now()}`;
    copyFileSync(configPath, backupPath);
    console.log(`\x1b[32mBacked up: ${backupPath}\x1b[0m`);
  }
}

function updateJsonConfig(configPath: string, mcpConfig: any): void {
  const configDir = dirname(configPath);
  mkdirSync(configDir, { recursive: true });

  backupConfig(configPath);

  let existingConfig: any = {};
  if (existsSync(configPath)) {
    try {
      const content = readFileSync(configPath, 'utf-8');
      existingConfig = JSON.parse(content);
    } catch (error) {
      console.log(`\x1b[33mWarning: Unable to read existing config, will create new config\x1b[0m`);
    }
  }

  // Merge configuration
  const mergedConfig = {
    ...existingConfig,
    mcpServers: {
      ...existingConfig.mcpServers,
      ...mcpConfig.mcpServers
    }
  };

  writeFileSync(configPath, JSON.stringify(mergedConfig, null, 2), 'utf-8');
  console.log(`\x1b[32mUpdated: ${configPath}\x1b[0m`);
}

async function configureClaudeDesktop(os: string, mcpConfig: any): Promise<void> {
  console.log('\n\x1b[33mConfiguring Claude Desktop...\x1b[0m');
  const configPath = getConfigPath(os, 'claude-desktop');
  if (configPath) {
    updateJsonConfig(configPath, mcpConfig);
  }
}

async function configureCursor(os: string, mcpConfig: any): Promise<void> {
  console.log('\n\x1b[33mConfiguring Cursor...\x1b[0m');
  const configPath = getConfigPath(os, 'cursor');
  if (configPath) {
    updateJsonConfig(configPath, mcpConfig);
  }
}

async function configureCodex(os: string): Promise<void> {
  console.log('\n\x1b[33mConfiguring OpenAI Codex...\x1b[0m');
  try {
    execSync('which codex', { stdio: 'ignore' });
    const configPath = getConfigPath(os, 'codex');
    if (configPath) {
      mkdirSync(dirname(configPath), { recursive: true });
      if (!existsSync(configPath)) {
        writeFileSync(configPath, '{}', 'utf-8');
      }
      console.log(`\x1b[32mCodex config file location: ${configPath}\x1b[0m`);
      console.log('\x1b[33mPlease manually check if Codex supports MCP configuration\x1b[0m');
    }
  } catch {
    console.log('\x1b[33mCodex CLI not installed, skipping configuration\x1b[0m');
    console.log('Install command: npm install -g @openai/codex');
  }
}

async function configureCopilot(os: string): Promise<void> {
  console.log('\n\x1b[33mConfiguring GitHub Copilot...\x1b[0m');
  try {
    execSync('which copilot', { stdio: 'ignore' });
    const configPath = getConfigPath(os, 'copilot');
    if (configPath) {
      mkdirSync(dirname(configPath), { recursive: true });
      if (!existsSync(configPath)) {
        writeFileSync(configPath, '{}', 'utf-8');
      }
      console.log(`\x1b[32mCopilot config file location: ${configPath}\x1b[0m`);
      console.log('\x1b[33mPlease manually check if Copilot supports MCP configuration\x1b[0m');
    }
  } catch {
    console.log('\x1b[33mCopilot CLI not installed, skipping configuration\x1b[0m');
    console.log('Install command: brew install copilot-cli or npm install -g @github/copilot-cli');
  }
}

async function configureGemini(os: string): Promise<void> {
  console.log('\n\x1b[33mConfiguring Gemini CLI...\x1b[0m');
  try {
    execSync('which gemini', { stdio: 'ignore' });
    const configPath = getConfigPath(os, 'gemini');
    if (configPath) {
      mkdirSync(dirname(configPath), { recursive: true });
      if (!existsSync(configPath)) {
        writeFileSync(configPath, '{}', 'utf-8');
      }
      console.log(`\x1b[32mGemini config file location: ${configPath}\x1b[0m`);
      console.log('\x1b[33mPlease manually check if Gemini CLI supports MCP configuration\x1b[0m');
    }
  } catch {
    console.log('\x1b[33mGemini CLI not installed, skipping configuration\x1b[0m');
    console.log('Install command: npm install -g @google/gemini-cli');
  }
}

async function configureClaudeCode(os: string): Promise<void> {
  console.log('\n\x1b[33mConfiguring Claude Code CLI...\x1b[0m');
  try {
    execSync('which claude', { stdio: 'ignore' });
    const configPath = getConfigPath(os, 'claude-code');
    if (configPath) {
      mkdirSync(dirname(configPath), { recursive: true });
      if (!existsSync(configPath)) {
        writeFileSync(configPath, '{}', 'utf-8');
      }
      console.log(`\x1b[32mClaude Code config file location: ${configPath}\x1b[0m`);
      console.log('\x1b[33mPlease manually check if Claude Code CLI supports MCP configuration\x1b[0m');
    }
  } catch {
    try {
      execSync('which claude-code', { stdio: 'ignore' });
    } catch {
      console.log('\x1b[33mClaude Code CLI not installed, skipping configuration\x1b[0m');
      console.log('Install command: npm install -g @anthropic-ai/claude-code');
    }
  }
}
