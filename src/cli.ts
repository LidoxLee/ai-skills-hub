#!/usr/bin/env node

import { Command } from 'commander';
import { syncCommand } from './commands/sync.js';
import { checkCommand } from './commands/check.js';
import { listCommand } from './commands/list.js';
import { addCommand } from './commands/add.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);
const version = packageJson.version;

const program = new Command();

program
  .name('skillshub')
  .description('AI Skills Hub - MCP server for managing team coding skills and best practices')
  .version(version);

// sync command
program
  .command('sync')
  .alias('s')
  .description('Sync skills library and update AI tool configuration')
  .option('-f, --force', 'Force recompilation even if no changes')
  .action(async (options) => {
    await syncCommand(options);
  });

// check command
program
  .command('check')
  .alias('c')
  .description('Check skills library status and configuration')
  .option('-v, --verbose', 'Show detailed information')
  .action(async (options) => {
    await checkCommand(options);
  });

// list command
program
  .command('list')
  .alias('l')
  .description('List all available skills and their descriptions')
  .option('-v, --verbose', 'Show detailed information (file size, line count, modification time)')
  .option('-t, --tips', 'Show usage tips (including usage for Cursor, Claude Code, GitHub Copilot)')
  .action(async (options) => {
    await listCommand(options);
  });

// add command
program
  .command('add <url>')
  .alias('a')
  .description('Add skill from GitHub URL to local directory')
  .option('-f, --force', 'Force overwrite existing skill')
  .action(async (url, options) => {
    await addCommand(url, options);
  });

// help command (built-in to commander, but we can customize)
program
  .command('help')
  .alias('-h')
  .description('Show help information')
  .action(() => {
    program.help();
  });

// If no command provided, show help
if (process.argv.length === 2) {
  program.help();
}

program.parse();
