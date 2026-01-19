# AI Skills Hub

An MCP (Model Context Protocol) server that dynamically loads Markdown skill files, enabling AI assistants to access your team's coding standards, best practices, and skill knowledge base.

## Languages / 語言

- [English](README.md)
- [繁體中文](README.TW.md)

## Project Architecture

```
ai-skills-hub/
├── src/                    # --- MCP Server Core (Librarian) ---
│   ├── index.ts            # Auto-scans ~/.ai-skills-hub/skills/*/SKILL.md and converts to MCP Tools
│   ├── cli.ts              # CLI tool entry point
│   ├── utils.ts            # Helper functions (Markdown parsing, path handling)
│   └── commands/           # CLI command implementations
│       ├── sync.ts          # Sync command
│       └── check.ts         # Check command
├── dist/                   # [Ignore] Compiled JS (actual execution code)
├── package.json            # Project dependencies and script definitions
├── tsconfig.json           # TypeScript configuration
└── README.md               # Team usage manual
```

## Installation

### Method 1: Global Installation (Recommended)

Install the package globally to use the CLI commands from anywhere:

```bash
npm install -g ai-skills-hub
```

After installation, you can use both `skillshub` and `ai-skills-hub` commands:

```bash
# Sync skills library and configure AI tools
skillshub sync
# Or use the full command name
ai-skills-hub sync

# Add a skill from URL
skillshub add <url>

# Check status
skillshub check

# List all skills
skillshub list

# View help
skillshub help
```

### Method 2: Using npx (No Installation)

If you prefer not to install globally, you can use npx to run commands directly:

```bash
# Sync skills library and configure AI tools
npx ai-skills-hub sync

# Add a skill from URL
npx ai-skills-hub add <url>

# Check status
npx ai-skills-hub check

# List all skills
npx ai-skills-hub list

# View help
npx ai-skills-hub help
```

### Method 3: Local Development Installation

For contributing or local development:

1. **Clone the project**
   ```bash
   git clone <repository-url>
   cd ai-skills-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Link for local development**
   ```bash
   npm link
   ```

After linking, you can use `skillshub` commands as if it were globally installed.

## CLI Commands

### `skillshub sync` / `skillshub s`

Sync and update AI tool configurations. This command will:
- Compile TypeScript code (in local development mode)
- Configure MCP settings for supported AI tools

**Note:** Skills are stored in `~/.ai-skills-hub/skills/`, not in the repository. Use `skillshub add` to add skills from a repository.

**Options:**
- `-f, --force`: Force recompilation even if there are no changes

**Examples:**
```bash
skillshub sync
skillshub sync --force
```

### `skillshub check` / `skillshub c`

Check AI tool installation status and MCP configuration status.

This command will:
- Display which AI tools are currently installed
- Display which AI tools have MCP routes configured
- Provide a configuration status summary

**Options:**
- `-v, --verbose`: Show detailed information (version numbers, config file paths, commands, etc.)

**Examples:**
```bash
skillshub check
skillshub check --verbose
```

**Output Legend:**
- `✓` Green marker: Installed/Configured
- `○` Yellow marker: Not installed/Not configured

### `skillshub add` / `skillshub a`

Add a skill from a URL to your local skills library.

This command will:
- Download a `SKILL.md` file from the provided URL
- Automatically convert GitHub blob URLs to raw URLs
- Extract the skill name from the URL path
- Save the skill to `~/.ai-skills-hub/skills/<skill-name>/`

**Options:**
- `-f, --force`: Overwrite existing skill if it already exists

**Examples:**
```bash
# Add a skill from GitHub blob URL
skillshub add https://github.com/user/repo/blob/main/skills/api-design/SKILL.md

# Add a skill from raw URL
skillshub add https://raw.githubusercontent.com/user/repo/main/skills/api-design/SKILL.md

# Force overwrite existing skill
skillshub add https://github.com/user/repo/blob/main/skills/api-design/SKILL.md --force
```

**URL Formats:**
- GitHub blob URL: `https://github.com/{user}/{repo}/blob/{branch}/path/to/SKILL.md`
- Raw GitHub URL: `https://raw.githubusercontent.com/{user}/{repo}/{branch}/path/to/SKILL.md`
- The command automatically converts blob URLs to raw URLs

**Workflow:**
1. Command downloads the SKILL.md file from the URL
2. Extracts skill name from the directory path (e.g., `api-design` from `.../api-design/SKILL.md`)
3. Creates directory `~/.ai-skills-hub/skills/<skill-name>/`
4. Saves the file as `SKILL.md` in that directory
5. Run `skillshub sync` to update MCP configuration

### `skillshub list` / `skillshub l`

List all available skills and their descriptions.

This command will:
- Scan all `SKILL.md` files in the `~/.ai-skills-hub/skills/` directory
- Display each skill's filename, tool name, and description
- Provide usage tips

**Options:**
- `-v, --verbose`: Show detailed information (file size, line count, last modified time)

**Examples:**
```bash
skillshub list
skillshub list --verbose
```

**Output Content:**
- Filename (e.g., `api-design.md`)
- Tool name (e.g., `api_design`)
- Description (extracted from the first heading in the Markdown file)
- Detailed information (verbose mode): file size, line count, modification time

### `skillshub help`

Display help information.

## Supported AI Tools

This project supports MCP configuration for the following AI tools:

- **Claude Desktop** - Anthropic's Claude desktop application
- **Cursor** - AI-powered code editor
- **OpenAI Codex** - OpenAI's code assistant CLI
- **GitHub Copilot CLI** - GitHub's AI code assistant
- **Gemini CLI** - Google's Gemini AI CLI tool
- **Claude Code CLI** - Anthropic's Claude Code command-line tool

### Installation Methods for Each Tool

#### OpenAI Codex CLI
```bash
npm install -g @openai/codex
# Set environment variable
export OPENAI_API_KEY="your-api-key"
```

#### GitHub Copilot CLI
```bash
# macOS/Linux (using Homebrew)
brew install copilot-cli

# Or using npm
npm install -g @github/copilot-cli
```

#### Gemini CLI
```bash
npm install -g @google/gemini-cli
# Login or set API key
gemini auth login
# Or
export GEMINI_API_KEY="your-api-key"
```

#### Claude Code CLI
```bash
npm install -g @anthropic-ai/claude-code
# Set environment variable
export ANTHROPIC_API_KEY="your-api-key"
```

## Usage

### Adding Skills

Skills are stored locally in `~/.ai-skills-hub/skills/`. To add a skill:

1. **Manual Method:** Create a directory in `~/.ai-skills-hub/skills/` (e.g., `api-design/`) and add a `SKILL.md` file inside it
2. **Using CLI:** Use `skillshub add <repository-url>` to add skills from a Git repository
3. The directory name will be automatically converted to a tool name (e.g., `api-design/` → `api_design`)

### Skill File Format

Skill files use standard Markdown format:

```markdown
# Skill Title

This is the skill description...

## Section

Content...

### Subsection

More content...
```

- The first heading will automatically be used as the tool description
- Supports all standard Markdown syntax (headings, lists, code blocks, etc.)

### Executing Shell Scripts from Skills

**New Feature!** Skills can now include executable shell scripts that AI agents can run.

**Directory Structure:**
```
~/.ai-skills-hub/skills/
└── your-skill/
    ├── SKILL.md
    ├── scripts/
    │   ├── setup.sh
    │   └── test.sh
    └── resources/
```

**Available Tool:**
- `execute_skill_script` - Execute a specific script from a skill directory

**How to Guide AI to Execute Scripts in SKILL.md:**
```markdown
# My Skill

When working with this skill, please:
1. Execute `scripts/setup.sh` to prepare the environment
2. Run `scripts/test.sh` to validate the implementation

## Available Scripts

### setup.sh
Prepares the development environment.
Execute: `scripts/setup.sh`

### test.sh
Validates the implementation.
Execute: `scripts/test.sh`

...
```


### Using MCP Skills in Cursor Agent

**Important: MCP tools are only available in Cursor's Agent mode!**

1. **Configure MCP** (if not already configured):
   ```bash
   skillshub sync
   ```

2. **Restart Cursor** to load the new MCP configuration

3. **Enable Agent Mode**:
   - Open Cursor chat panel (`Cmd+L` or `Ctrl+L`)
   - Switch to **Agent** mode (not Chat mode)

4. **Use Skills**:
   In Agent mode, ask in natural language, for example:
   ```
   Please use api_design to help me design a RESTful API
   ```
   ```
   According to go_concurrency standards, help me refactor this code
   ```

### Manual Testing of MCP Server

```bash
# Start the server (using stdio transport)
npm start
```

The server will communicate with MCP clients through standard input/output.

## Core Components

🏗️ **Core Components**

1. **~/.ai-skills-hub/skills/*/SKILL.md (Skill Definitions)**
   Skills are stored locally in each user's home directory. Each skill is a directory containing a `SKILL.md` file.

   **Advantages:** Engineers only need to write in Markdown: "When I need to do task X, please follow steps Y, examples below...", and the AI will understand.

   **Maintenance:** Anyone who can write Markdown can add or modify skills. Skills can be managed individually or synced from shared repositories.

2. **src/index.ts (Dynamic Loader)**
   This MCP Server no longer contains specific business logic. It only does two things:

   - **List tools (list_tools):** Scans the `~/.ai-skills-hub/skills/` directory and converts each skill directory into a tool name for the AI (e.g., `api-design/` → `api_design`).

   - **Pass content (call_tool):** When the AI requests it, reads the corresponding `SKILL.md` content from `~/.ai-skills-hub/skills/` and feeds it to the AI as "background knowledge".

3. **CLI Tool (skillshub)**
   This CLI tool helps manage skills and AI tool configurations:

   - Use `skillshub add <url>` to add skills from Git repositories to `~/.ai-skills-hub/skills/`
   - Run `skillshub sync` to compile TypeScript code and configure MCP settings for AI tools
   - Automatically configures global settings for all supported AI tools (Claude Desktop, Cursor, OpenAI Codex, GitHub Copilot, Gemini CLI, Claude Code CLI)

🔄 **Team Collaboration Workflow**

- **Skill Repository:** Team maintains skill repositories (e.g., on GitHub) with standardized skill definitions.

- **Add Skills:** Team member A adds a skill repository using `skillshub add <repository-url>`, which clones it to `~/.ai-skills-hub/skills/`.

- **Skill Updates:** When the skill repository is updated, team members can update their local copy or re-add the skill.

- **AI Ready:** Team member B opens Cursor or Claude and asks: "Help me write a new Service logic", and the AI will actively read and adopt the skills from `~/.ai-skills-hub/skills/`.

🌟 **Why This is Suitable for a Team with 30 Microservices?**

- **No Pollution:** The source code of these 30 projects doesn't need any changes. No need to put `.cursorrules` or `.claudeprompt` in each project.

- **Centralized:** There's only one copy of the standards. If you put a copy in each of the 30 projects, updating them would be a disaster.

- **Cross-AI Tools:** Whether team members prefer Cursor, Claude Desktop, Codex, Copilot, Gemini, or Claude Code CLI, as long as they connect to this MCP, they all read the same "team brain".

## Development Guide

### Project Scripts

- `npm run build` - Compile TypeScript to `dist/` directory
- `npm start` - Run the compiled MCP server
- `npm run dev` - Watch mode compilation (for development)

### Publishing to npm

If you want team members to be able to use the `npx ai-skills-hub` command, you need to publish the package to npm first.

**📖 Detailed Guide:** Please refer to [NPM_PUBLISH_SOP.md](NPM_PUBLISH_SOP.md) for the complete publishing standard operating procedure.

**Quick Publishing Steps:**

1. **Login to npm**
   ```bash
   npm login
   ```

2. **Verify package name is available**
   ```bash
   npm view ai-skills-hub
   ```
   If the package name is already taken, you need to modify the `name` field in `package.json`.

3. **Publish the package**
   ```bash
   npm publish
   ```
   
   **Note:** The `prepublishOnly` script will automatically run `npm run build` to ensure the latest code is compiled before publishing.

4. **Verify publication**
   ```bash
   npx ai-skills-hub --version
   ```

After publishing, team members can use Method 1 (npx) to install and use this tool.

### Project Structure

- `src/index.ts` - MCP server main program, implements `list_tools` and `call_tool` handlers
- `src/cli.ts` - CLI tool entry point
- `src/utils.ts` - Utility functions: directory scanning, filename conversion, file reading, etc.
- `src/commands/` - CLI command implementations (sync, check, add, list, etc.)
- `~/.ai-skills-hub/skills/` - Local directory for storing skill Markdown files (created on first use)

### Contributing

**For Project Development:**
1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes to the MCP server or CLI tool
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

**For Adding Skills:**
Skills are managed separately in their own repositories. Users add skills using `skillshub add <repository-url>`. To create a new skill repository, see the skill repository documentation.

### Troubleshooting

#### AI Tool Can't Connect to MCP Server

- Confirm you've run `skillshub sync` to update configuration
- Check if the configuration file path is correct
- Some tools may need to be restarted to load new configuration
- Verify the MCP server path is correct in the configuration file
- Use `skillshub check` to check configuration status

## License

MIT License
