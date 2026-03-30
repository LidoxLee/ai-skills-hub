#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

function getVsCodeSettingsPath() {
  const platform = process.platform;
  
  if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'Code', 'User', 'settings.json');
  } else if (platform === 'win32') {
    return path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'User', 'settings.json');
  } else if (platform === 'linux') {
    return path.join(os.homedir(), '.config', 'Code', 'User', 'settings.json');
  }
  throw new Error(`Unsupported platform: ${platform}`);
}

function setupCopilot() {
  try {
    const settingsPath = getVsCodeSettingsPath();
    const settingsDir = path.dirname(settingsPath);
    
    if (!fs.existsSync(settingsDir)) {
      fs.mkdirSync(settingsDir, { recursive: true });
      console.log(`Created VS Code settings directory: ${settingsDir}`);
    }
    
    let settings = {};
    if (fs.existsSync(settingsPath)) {
      const content = fs.readFileSync(settingsPath, 'utf-8');
      try {
        const cleanContent = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
        settings = JSON.parse(cleanContent);
      } catch (e) {
        console.warn('Warning: Could not parse existing settings.json, backing up...');
        const backupPath = `${settingsPath}.backup.${Date.now()}`;
        fs.copyFileSync(settingsPath, backupPath);
        settings = {};
      }
    }
    
    if (!settings['mcp.servers']) {
      settings['mcp.servers'] = {};
    }
    
    const prefix = execSync('npm config get prefix', { encoding: 'utf-8' }).trim();
    const mcpPath = path.join(prefix, 'lib', 'node_modules', 'ai-skills-hub', 'dist', 'index.js');
    
    settings['mcp.servers']['ai-skills-hub'] = {
      type: 'stdio',
      command: 'node',
      args: [mcpPath]
    };
    
    if (!settings['mcp.inputs']) {
      settings['mcp.inputs'] = [];
    }
    
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    console.log('✅ Copilot MCP configuration completed');
    console.log(`   Settings: ${settingsPath}`);
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

if (process.env.CI !== 'true' && process.env.SKIP_MCP_SETUP !== 'true') {
  setupCopilot();
}
