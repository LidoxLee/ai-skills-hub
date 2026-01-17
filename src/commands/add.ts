import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { existsSync } from 'fs';

const USER_SKILLS_DIR = join(homedir(), '.ai-skills-hub', 'skills');

interface AddOptions {
  force?: boolean;
}

/**
 * Convert GitHub blob URL to raw URL
 * Example: https://github.com/n8n-io/n8n/blob/master/.claude/skills/create-pr/SKILL.md
 * Converts to: https://raw.githubusercontent.com/n8n-io/n8n/master/.claude/skills/create-pr/SKILL.md
 */
function convertToRawUrl(url: string): string {
  // If already a raw URL, return directly
  if (url.includes('raw.githubusercontent.com')) {
    return url;
  }
  
  // Convert blob URL to raw URL
  const blobPattern = /github\.com\/([^/]+\/[^/]+)\/blob\/(.+)/;
  const match = url.match(blobPattern);
  
  if (match) {
    const [, repo, path] = match;
    return `https://raw.githubusercontent.com/${repo}/${path}`;
  }
  
  // If cannot convert, return original URL (may be other format)
  return url;
}

/**
 * Extract skill name from URL
 * Example: https://raw.githubusercontent.com/n8n-io/n8n/master/.claude/skills/create-pr/SKILL.md
 * Extracts: create-pr
 */
function extractSkillName(url: string): string {
  // Extract the last directory name from the path (before SKILL.md)
  const parts = url.split('/');
  const skillMdIndex = parts.findIndex(part => part === 'SKILL.md');
  
  if (skillMdIndex > 0) {
    return parts[skillMdIndex - 1];
  }
  
  // If not found, try to extract from URL path
  const pathMatch = url.match(/\/([^/]+)\/SKILL\.md/);
  if (pathMatch) {
    return pathMatch[1];
  }
  
  // If still not found, use default name
  return 'skill';
}

/**
 * Download file content
 */
async function downloadFile(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    throw new Error(`Failed to download file from ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function addCommand(url: string, options: AddOptions) {
  console.log('\x1b[32m=== AI Skills Hub - Add Skill ===\x1b[0m\n');
  
  try {
    // 1. Convert URL to raw URL
    console.log('\x1b[33m[1/3] Processing URL...\x1b[0m');
    const rawUrl = convertToRawUrl(url);
    console.log(`Original URL: ${url}`);
    console.log(`Raw URL: ${rawUrl}`);
    
    // 2. Extract skill name
    const skillName = extractSkillName(rawUrl);
    console.log(`\n\x1b[33m[2/3] Extracting skill name...\x1b[0m`);
    console.log(`Skill name: ${skillName}`);
    
    // 3. Ensure user skills directory exists
    if (!existsSync(USER_SKILLS_DIR)) {
      console.log(`\nCreating directory: ${USER_SKILLS_DIR}`);
      mkdirSync(USER_SKILLS_DIR, { recursive: true });
    }
    
    // 4. Create skill directory
    const skillDir = join(USER_SKILLS_DIR, skillName);
    const skillFilePath = join(skillDir, 'SKILL.md');
    
    // Check if already exists
    if (existsSync(skillFilePath) && !options.force) {
      console.log(`\n\x1b[31mError: Skill "${skillName}" already exists\x1b[0m`);
      console.log(`Use --force option to overwrite existing skill`);
      process.exit(1);
    }
    
    // 5. Download file
    console.log(`\n\x1b[33m[3/3] Downloading SKILL.md...\x1b[0m`);
    const content = await downloadFile(rawUrl);
    
    // 6. Save file
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(skillFilePath, content, 'utf-8');
    
    console.log(`\n\x1b[32m✓ Skill successfully added!\x1b[0m`);
    console.log(`\nLocation: ${skillFilePath}`);
    console.log(`\nTip: Run "skillshub sync" to update MCP configuration`);
    
  } catch (error) {
    console.error('\n\x1b[31mError:', error instanceof Error ? error.message : String(error), '\x1b[0m');
    process.exit(1);
  }
}
