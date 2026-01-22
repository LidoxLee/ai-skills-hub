import { readdir, readFile, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { existsSync } from 'fs';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// User skills directory (unified management)
export const USER_SKILLS_DIR = join(homedir(), '.ai-skills-hub', 'skills');

// User settings file path
export const USER_SETTINGS_FILE = join(homedir(), '.ai-skills-hub', 'settings.json');

/**
 * Settings interface
 */
export interface UserSettings {
  autoExecuteScripts?: boolean;
}

/**
 * Read user settings from ~/.ai-skills-hub/settings.json
 */
export async function readUserSettings(): Promise<UserSettings> {
  try {
    if (!existsSync(USER_SETTINGS_FILE)) {
      return {};
    }
    const content = await readFile(USER_SETTINGS_FILE, 'utf-8');
    return JSON.parse(content) as UserSettings;
  } catch (error) {
    console.error('Error reading user settings:', error);
    return {};
  }
}

/**
 * Check if auto-execute scripts is enabled
 */
export async function isAutoExecuteEnabled(): Promise<boolean> {
  const settings = await readUserSettings();
  return settings.autoExecuteScripts === true;
}

/**
 * Recursively scan skills directory, return all SKILL.md file paths in subdirectories
 * Only scans ~/.ai-skills-hub/skills directory
 * Example: ['go-testing/SKILL.md', 'api-design/SKILL.md']
 */
export async function scanSkillsDirectory(): Promise<string[]> {
  const skillPaths: string[] = [];
  
  try {
    if (existsSync(USER_SKILLS_DIR)) {
      await scanDirectory(USER_SKILLS_DIR, '', skillPaths);
    }
  } catch (error) {
    console.error('Error scanning skills directory:', error);
  }
  
  return skillPaths;
}

/**
 * Recursively scan directory, looking for SKILL.md files
 */
async function scanDirectory(dir: string, relativePath: string, results: string[]): Promise<void> {
  const entries = await readdir(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const relativeEntryPath = relativePath ? `${relativePath}/${entry}` : entry;
    const stats = await stat(fullPath);
    
    if (stats.isDirectory()) {
      // Recursively scan subdirectories
      await scanDirectory(fullPath, relativeEntryPath, results);
    } else if (entry === 'SKILL.md') {
      // Found SKILL.md file, add to results
      results.push(relativeEntryPath);
    }
  }
}

/**
 * Convert file path to tool name
 * Example: go-testing/SKILL.md -> go_testing
 * Example: api-design/SKILL.md -> api_design
 */
export function filenameToToolName(path: string): string {
  // Remove SKILL.md or trailing .md extension
  let basePath = path.replace(/\/SKILL\.md$/, '').replace(/\.md$/, '');
  
  // If contains directory structure (e.g., go-testing/SKILL.md), only take directory name
  const parts = basePath.split('/');
  basePath = parts[parts.length - 1];
  
  // Convert non-alphanumeric characters to underscores and convert to lowercase
  const toolName = basePath
    .replace(/[^a-z0-9]+/gi, '_')
    .toLowerCase();
  return toolName;
}

/**
 * Convert tool name back to file path
 * Since hyphens in filenames are converted to underscores, we need to scan actual files to find matching path
 * Example: go_testing -> go-testing/SKILL.md
 */
export async function toolNameToFilename(toolName: string): Promise<string | null> {
  // Scan skills directory, find all SKILL.md files
  const files = await scanSkillsDirectory();
  
  // Find path matching tool name
  for (const filepath of files) {
    const expectedToolName = filenameToToolName(filepath);
    if (expectedToolName === toolName) {
      return filepath;
    }
  }
  
  // If not found, try simple conversion (convert underscores back to hyphens)
  const baseName = toolName.replace(/_/g, '-');
  return `${baseName}/SKILL.md`;
}

/**
 * Read skill file content
 * filename can be a relative path, e.g.: go-testing/SKILL.md
 * Only reads from ~/.ai-skills-hub/skills directory
 */
export async function readSkillFile(filepath: string): Promise<string> {
  try {
    const filePath = join(USER_SKILLS_DIR, filepath);
    const content = await readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Failed to read skill file: ${filepath}. ${error}`);
  }
}

/**
 * Resource file information (for indexing)
 */
export interface ResourceInfo {
  filename: string;
  description: string;
}

/**
 * Read index information of all .md files in the resources directory under skill directory
 * Only reads filename and description, not full content (to save tokens)
 * filepath example: go-testing/SKILL.md
 * Only reads from ~/.ai-skills-hub/skills directory
 */
export async function readSkillResourcesIndex(filepath: string): Promise<ResourceInfo[]> {
  const resources: ResourceInfo[] = [];
  
  try {
    // Get skill directory path (e.g.: go-testing)
    const skillDir = filepath.replace(/\/SKILL\.md$/, '');
    const resourcesDir = join(USER_SKILLS_DIR, skillDir, 'resources');
    
    // Check if resources directory exists
    try {
      const stats = await stat(resourcesDir);
      if (!stats.isDirectory()) {
        return resources; // Not a directory, return empty array
      }
    } catch {
      // resources directory does not exist, return empty array
      return resources;
    }
    
    // Read all files in resources directory
    const entries = await readdir(resourcesDir);
    
    // Only process .md files
    const mdFiles = entries.filter(entry => entry.endsWith('.md'));
    
    // Sort by filename to ensure consistent order
    mdFiles.sort();
    
    // Read index information for each file (only read first few lines to extract description)
    for (const filename of mdFiles) {
      try {
        const resourcePath = join(resourcesDir, filename);
        // Only read first 50 lines to extract description (usually frontmatter and title are in first few lines)
        const content = await readFile(resourcePath, 'utf-8');
        const description = getSkillDescription(content, filename);
        resources.push({ filename, description });
      } catch (error) {
        // If read fails, skip the file and log error
        console.error(`Error reading resource file ${filename}:`, error);
      }
    }
  } catch (error) {
    // If reading resources directory fails, only log error but don't throw exception
    // This way skill can still work normally even without resources directory
    console.error(`Error reading resources directory for ${filepath}:`, error);
  }
  
  return resources;
}

/**
 * Scan all skills and resources files, return complete resource list
 * Used for resources/list request
 */
export async function scanAllResources(): Promise<Array<{ uri: string; path: string; description: string }>> {
  const resources: Array<{ uri: string; path: string; description: string }> = [];
  
  try {
    // First scan all SKILL.md files
    const skillFiles = await scanSkillsDirectory();
    
    for (const skillPath of skillFiles) {
      try {
        // Read SKILL.md to get description
        const content = await readSkillFile(skillPath);
        const description = getSkillDescription(content, skillPath);
        
        // Build URI, format: skill://<skill-name>/SKILL.md
        const skillName = skillPath.replace(/\/SKILL\.md$/, '');
        const uri = `skill://${skillName}/SKILL.md`;
        
        resources.push({
          uri,
          path: skillPath,
          description,
        });
        
        // Scan resources files under this skill directory
        const resourcesIndex = await readSkillResourcesIndex(skillPath);
        for (const resource of resourcesIndex) {
          const resourceUri = `skill://${skillName}/resources/${resource.filename}`;
          const resourcePath = skillPath.replace(/SKILL\.md$/, `resources/${resource.filename}`);
          resources.push({
            uri: resourceUri,
            path: resourcePath,
            description: resource.description,
          });
        }
      } catch (error) {
        console.error(`Error processing skill ${skillPath}:`, error);
      }
    }
  } catch (error) {
    console.error('Error scanning all resources:', error);
  }
  
  return resources;
}

/**
 * Read resource file from URI
 * URI format: skill://<skill-name>/SKILL.md or skill://<skill-name>/resources/<filename>
 * Only reads from ~/.ai-skills-hub/skills directory
 */
export async function readResourceByUri(uri: string): Promise<string> {
  // Validate URI format
  if (!uri.startsWith('skill://')) {
    throw new Error(`Invalid resource URI: ${uri}. Must start with 'skill://'`);
  }
  
  // Remove 'skill://' prefix
  const path = uri.substring('skill://'.length);
  const filePath = join(USER_SKILLS_DIR, path);
  
  try {
    const content = await readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Failed to read resource: ${uri}. ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Extract description from Markdown content
 * Prioritize extracting description from YAML frontmatter, otherwise use title or first line
 */
export function getSkillDescription(content: string, filepath: string): string {
  const lines = content.split('\n');
  
  if (lines.length === 0) {
    // If file is empty, use path as description
    const basePath = filepath.replace(/\/SKILL\.md$/, '').replace(/\.md$/, '');
    const parts = basePath.split('/');
    const name = parts[parts.length - 1];
    return name.replace(/[-_]/g, ' ');
  }
  
  // Try to extract description from YAML frontmatter
  // frontmatter may start from first or second line (first line may be empty)
  const firstNonEmptyLineIdx = lines.findIndex(line => line.trim());
  if (firstNonEmptyLineIdx >= 0 && lines[firstNonEmptyLineIdx].trim() === '---') {
    // Start searching from second line of frontmatter (skip first ---)
    for (let i = firstNonEmptyLineIdx + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '---') {
        // frontmatter ended, break
        break;
      }
      // Match description: "..." or description: ...
      const descriptionMatch = line.match(/^description:\s*(.+)$/i);
      if (descriptionMatch) {
        let desc = descriptionMatch[1].trim();
        // Remove quotes
        if ((desc.startsWith('"') && desc.endsWith('"')) || 
            (desc.startsWith("'") && desc.endsWith("'"))) {
          desc = desc.slice(1, -1);
        }
        return desc;
      }
    }
  }
  
  // If no YAML frontmatter or description not found, extract from Markdown content
  const nonEmptyLines = lines.filter(line => line.trim());
  if (nonEmptyLines.length === 0) {
    const basePath = filepath.replace(/\/SKILL\.md$/, '').replace(/\.md$/, '');
    const parts = basePath.split('/');
    const name = parts[parts.length - 1];
    return name.replace(/[-_]/g, ' ');
  }
  
  // Skip frontmatter, find first Markdown content line
  let startIdx = 0;
  if (firstNonEmptyLineIdx >= 0 && lines[firstNonEmptyLineIdx].trim() === '---') {
    for (let i = firstNonEmptyLineIdx + 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        startIdx = i + 1;
        break;
      }
    }
  }
  
  // Find first non-empty line
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // If it's a Markdown heading, extract heading text
    if (line.startsWith('# ')) {
      return line.slice(2).trim();
    }
    
    // If it's another format of heading
    if (line.startsWith('## ')) {
      return line.slice(3).trim();
    }
    
    // Otherwise use first line as description (limit length)
    const maxLength = 100;
    if (line.length > maxLength) {
      return line.slice(0, maxLength) + '...';
    }
    
    return line;
  }
  
  // If no content found, use path as description
  const basePath = filepath.replace(/\/SKILL\.md$/, '').replace(/\.md$/, '');
  const parts = basePath.split('/');
  const name = parts[parts.length - 1];
  return name.replace(/[-_]/g, ' ');
}

/**
 * Execute a shell script in a skill directory
 * @param skillName - The name of the skill (e.g., 'go-testing')
 * @param scriptPath - The relative path to the script within the skill directory (e.g., 'scripts/test.sh')
 * @param args - Optional arguments to pass to the script
 * @returns The output of the script execution
 */
export async function executeSkillScript(
  skillName: string,
  scriptPath: string,
  args: string[] = []
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const { spawn } = await import('child_process');
  const { resolve, normalize } = await import('path');
  
  // Find the actual skill directory (handle underscore to hyphen conversion)
  let skillDir = join(USER_SKILLS_DIR, skillName);
  
  // If directory doesn't exist with underscores, try finding it by scanning
  if (!existsSync(skillDir)) {
    // Try converting underscores to hyphens
    const alternativeName = skillName.replace(/_/g, '-');
    const alternativeDir = join(USER_SKILLS_DIR, alternativeName);
    
    if (existsSync(alternativeDir)) {
      skillDir = alternativeDir;
    } else {
      // Scan directory to find matching skill
      try {
        const entries = await readdir(USER_SKILLS_DIR);
        for (const entry of entries) {
          const entryPath = join(USER_SKILLS_DIR, entry);
          const stats = await stat(entryPath);
          if (stats.isDirectory()) {
            // Check if this directory name matches when converted to tool name
            const normalizedEntry = entry.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
            if (normalizedEntry === skillName.toLowerCase()) {
              skillDir = entryPath;
              break;
            }
          }
        }
      } catch (error) {
        // If scanning fails, continue with original error
      }
    }
  }
  
  // Check if skill directory exists
  if (!existsSync(skillDir)) {
    throw new Error(`Skill directory not found: ${skillName}`);
  }
  
  // Normalize script path to prevent path traversal attacks
  const normalizedScriptPath = normalize(scriptPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const fullScriptPath = resolve(skillDir, normalizedScriptPath);
  
  // Security check: ensure script is within skill directory
  if (!fullScriptPath.startsWith(skillDir)) {
    throw new Error(`Script path must be within skill directory: ${scriptPath}`);
  }
  
  // Check if script file exists
  if (!existsSync(fullScriptPath)) {
    throw new Error(`Script file not found: ${scriptPath} in skill ${skillName}`);
  }
  
  // Execute the script using bash with the full absolute path
  return new Promise((resolve, reject) => {
    const childProcess = spawn('bash', [fullScriptPath, ...args], {
      cwd: skillDir,
      env: { ...process.env },
    });
    
    let stdout = '';
    let stderr = '';
    
    childProcess.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });
    
    childProcess.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });
    
    childProcess.on('close', (code: number | null) => {
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code || 0,
      });
    });
    
    childProcess.on('error', (error: Error) => {
      reject(new Error(`Failed to execute script: ${error.message}`));
    });
  });
}

