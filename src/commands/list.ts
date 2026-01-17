import { statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  scanSkillsDirectory,
  readSkillFile,
  getSkillDescription,
  filenameToToolName,
} from '../utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_DIR = join(__dirname, '../..');

interface ListOptions {
  verbose?: boolean;
  tips?: boolean;
}

export async function listCommand(options: ListOptions) {
  console.log('\x1b[32m=== AI Skills Hub - Available Skills ===\x1b[0m\n');

  try {
    const skillFiles = await scanSkillsDirectory();

    if (skillFiles.length === 0) {
      console.log('\x1b[33mNo skill files found\x1b[0m');
      console.log('Please create SKILL.md files in skills/ subdirectories (e.g.: skills/go-testing/SKILL.md)');
      return;
    }

    // Sort by filename
    skillFiles.sort();

    console.log(`Found ${skillFiles.length} skill${skillFiles.length > 1 ? 's' : ''}:\n`);

    for (let i = 0; i < skillFiles.length; i++) {
      const filename = skillFiles[i];
      const toolName = filenameToToolName(filename);

      try {
        // Read file content to get description
        const content = await readSkillFile(filename);
        const description = getSkillDescription(content, filename);

        // Display skill information
        console.log(`\x1b[36m${i + 1}. ${filename}\x1b[0m`);
        console.log(`   \x1b[33mTool name:\x1b[0m ${toolName}`);
        console.log(`   \x1b[33mDescription:\x1b[0m ${description}`);

        if (options.verbose) {
          // Display detailed information
          const filePath = join(PROJECT_DIR, 'skills', filename);
          const stats = statSync(filePath);
          const size = (stats.size / 1024).toFixed(2);
          const lines = content.split('\n').length;
          const lastModified = stats.mtime.toLocaleString('en-US');

          console.log(`   \x1b[33mFile size:\x1b[0m ${size} KB`);
          console.log(`   \x1b[33mLine count:\x1b[0m ${lines}`);
          console.log(`   \x1b[33mLast modified:\x1b[0m ${lastModified}`);
        }

        console.log('');
      } catch (error) {
        console.log(`\x1b[31m✗ ${filename}\x1b[0m`);
        console.log(`   \x1b[31mError: Unable to read file\x1b[0m`);
        if (options.verbose && error instanceof Error) {
          console.log(`   ${error.message}`);
        }
        console.log('');
      }
    }

    if (options.tips) {
        // Usage tips
        console.log('\x1b[36m=== Usage Tips ===\x1b[0m');
            
        console.log('\n\x1b[33m【Cursor Agent Mode】\x1b[0m');
        console.log('In Cursor Agent mode, you can call these skills using the following methods:');
        console.log('  • "Please use api_design to help me design an API"');
        console.log('  • "Refactor code according to go_concurrency specifications"');
        console.log('  • "What skills are available?"');

        console.log('\n\x1b[33m【Claude Code】\x1b[0m');
        console.log('In Claude Code, you can use these skills through the following methods:');
        console.log('  • Use @ symbol to mention skill name, e.g.: @go-testing');
        console.log('  • Directly describe requirements, Claude will automatically identify and use relevant skills');
        console.log('  • Explicitly specify in conversation: "Please use golang-microservice skill to create a service"');

        console.log('\n\x1b[33m【GitHub Copilot】\x1b[0m');
        console.log('In GitHub Copilot, you can use these skills through the following methods:');
        console.log('  • Mention skill name in comments, e.g.: // Use go-testing skill specifications');
        console.log('  • Reference skill name in PR descriptions or issues');
        console.log('  • Explicitly request in conversation: "Please follow golang-web skill architecture patterns"');
    }

    
    
  } catch (error) {
    console.error('\x1b[31mError:', error instanceof Error ? error.message : String(error), '\x1b[0m');
    process.exit(1);
  }
}
