# AI Skills Hub

一個 MCP (Model Context Protocol) 伺服器，可動態載入 Markdown 技能檔案，讓 AI 助手能夠存取您團隊的編碼標準、最佳實踐和技能知識庫。

## 專案架構

```
ai-skills-hub/
├── src/                    # --- MCP 伺服器核心 (圖書館管理員) ---
│   ├── index.ts            # 自動掃描 ~/.ai-skills-hub/skills/*/SKILL.md 並轉換為 MCP 工具
│   ├── cli.ts              # CLI 工具入口點
│   ├── utils.ts            # 輔助函數 (Markdown 解析、路徑處理)
│   └── commands/           # CLI 命令實作
│       ├── sync.ts          # 同步命令
│       └── check.ts         # 檢查命令
├── scripts/                # --- 自動化腳本 (已移除，改用 CLI) ---
├── dist/                   # [忽略] 編譯後的 JS (實際執行碼)
├── package.json            # 專案依賴和腳本定義
├── tsconfig.json           # TypeScript 配置
└── README.md               # 團隊使用手冊
```

## 安裝

### 方法 1：使用 npx（推薦）

**前置需求：** 此方法需要套件已發布到 npm 註冊表。如果套件尚未發布，請使用方法 2（本地安裝）。

無需安裝，直接使用：

```bash
# 同步技能庫並配置 AI 工具
npx ai-skills-hub sync

# 檢查狀態
npx ai-skills-hub check

# 列出所有技能
npx ai-skills-hub list

# 查看說明
npx ai-skills-hub help
```

**注意：** 如果套件尚未發布到 npm，`npx` 將無法找到它。請先使用方法 2 進行本地安裝，或參考「發布到 npm」章節進行發布。

### 方法 2：本地安裝

1. **複製專案**
   ```bash
   git clone <repository-url>
   cd ai-skills-hub
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **建置專案**
   ```bash
   npm run build
   ```

4. **使用 CLI 命令**
   ```bash
   # 同步技能庫並配置 AI 工具
   skillshub sync
   # 或使用簡寫
   skillshub s

   # 檢查狀態
   skillshub check
   # 或使用簡寫
   skillshub c

   # 列出所有技能
   skillshub list
   # 或使用簡寫
   skillshub l

   # 查看說明
   skillshub help
   ```

### 方法 3：全域安裝

```bash
npm install -g ai-skills-hub
```

安裝後，您可以從任何目錄使用 `skillshub` 命令。

## CLI 命令

### `skillshub sync` / `skillshub s`

同步並更新 AI 工具配置。此命令將：
- 編譯 TypeScript 程式碼（在本地開發模式下）
- 為支援的 AI 工具配置 MCP 設定

**注意：** 技能儲存在 `~/.ai-skills-hub/skills/`，不在儲存庫中。使用 `skillshub add` 從儲存庫新增技能。

**選項：**
- `-f, --force`: 即使沒有變更也強制重新編譯

**範例：**
```bash
skillshub sync
skillshub sync --force
```

### `skillshub check` / `skillshub c`

檢查 AI 工具安裝狀態和 MCP 配置狀態。

此命令將：
- 顯示目前已安裝的 AI 工具
- 顯示已配置 MCP 路由的 AI 工具
- 提供配置狀態摘要

**選項：**
- `-v, --verbose`: 顯示詳細資訊（版本號、配置檔案路徑、命令等）

**範例：**
```bash
skillshub check
skillshub check --verbose
```

**輸出圖例：**
- `✓` 綠色標記：已安裝/已配置
- `○` 黃色標記：未安裝/未配置

### `skillshub list` / `skillshub l`

列出所有可用技能及其說明。

此命令將：
- 掃描 `~/.ai-skills-hub/skills/` 目錄中的所有 `SKILL.md` 檔案
- 顯示每個技能的檔案名稱、工具名稱和說明
- 提供使用提示

**選項：**
- `-v, --verbose`: 顯示詳細資訊（檔案大小、行數、最後修改時間）

**範例：**
```bash
skillshub list
skillshub list --verbose
```

**輸出內容：**
- 檔案名稱（例如：`api-design.md`）
- 工具名稱（例如：`api_design`）
- 說明（從 Markdown 檔案的第一個標題中提取）
- 詳細資訊（詳細模式）：檔案大小、行數、修改時間

### `skillshub help`

顯示說明資訊。

## 支援的 AI 工具

此專案支援以下 AI 工具的 MCP 配置：

- **Claude Desktop** - Anthropic 的 Claude 桌面應用程式
- **Cursor** - AI 驅動的程式碼編輯器
- **OpenAI Codex** - OpenAI 的程式碼助手 CLI
- **GitHub Copilot CLI** - GitHub 的 AI 程式碼助手
- **Gemini CLI** - Google 的 Gemini AI CLI 工具
- **Claude Code CLI** - Anthropic 的 Claude Code 命令列工具

### 各工具的安裝方法

#### OpenAI Codex CLI
```bash
npm install -g @openai/codex
# 設定環境變數
export OPENAI_API_KEY="your-api-key"
```

#### GitHub Copilot CLI
```bash
# macOS/Linux (使用 Homebrew)
brew install copilot-cli

# 或使用 npm
npm install -g @github/copilot-cli
```

#### Gemini CLI
```bash
npm install -g @google/gemini-cli
# 登入或設定 API 金鑰
gemini auth login
# 或
export GEMINI_API_KEY="your-api-key"
```

#### Claude Code CLI
```bash
npm install -g @anthropic-ai/claude-code
# 設定環境變數
export ANTHROPIC_API_KEY="your-api-key"
```

## 使用方式

### 新增技能

技能儲存在本地的 `~/.ai-skills-hub/skills/`。要新增技能：

1. **手動方法：** 在 `~/.ai-skills-hub/skills/` 中建立目錄（例如：`api-design/`）並在其中新增 `SKILL.md` 檔案
2. **使用 CLI：** 使用 `skillshub add <repository-url>` 從 Git 儲存庫新增技能
3. 目錄名稱將自動轉換為工具名稱（例如：`api-design/` → `api_design`）

### 技能檔案格式

技能檔案使用標準 Markdown 格式：

```markdown
# 技能標題

這是技能說明...

## 章節

內容...

### 子章節

更多內容...
```

- 第一個標題將自動用作工具說明
- 支援所有標準 Markdown 語法（標題、列表、程式碼區塊等）

### 在 Cursor Agent 中使用 MCP 技能

**重要：MCP 工具僅在 Cursor 的 Agent 模式中可用！**

1. **配置 MCP**（如果尚未配置）：
   ```bash
   skillshub sync
   ```

2. **重新啟動 Cursor** 以載入新的 MCP 配置

3. **啟用 Agent 模式**：
   - 開啟 Cursor 聊天面板（`Cmd+L` 或 `Ctrl+L`）
   - 切換到 **Agent** 模式（不是 Chat 模式）

4. **使用技能**：
   在 Agent 模式中，用自然語言詢問，例如：
   ```
   請使用 api_design 幫我設計一個 RESTful API
   ```
   ```
   根據 go_concurrency 標準，幫我重構這段程式碼
   ```

詳細說明請參考 [CURSOR_MCP_GUIDE.md](CURSOR_MCP_GUIDE.md)

### 手動測試 MCP 伺服器

```bash
# 啟動伺服器（使用 stdio 傳輸）
npm start
```

伺服器將透過標準輸入/輸出與 MCP 客戶端通訊。

## 核心元件

🏗️ **核心元件**

1. **~/.ai-skills-hub/skills/*/SKILL.md (技能定義)**
   技能儲存在每個使用者的主目錄中。每個技能是一個包含 `SKILL.md` 檔案的目錄。

   **優點：** 工程師只需要用 Markdown 撰寫：「當我需要執行任務 X 時，請遵循步驟 Y，範例如下...」，AI 就能理解。

   **維護：** 任何會寫 Markdown 的人都可以新增或修改技能。技能可以單獨管理或從共享儲存庫同步。

2. **src/index.ts (動態載入器)**
   此 MCP 伺服器不再包含特定的業務邏輯。它只做兩件事：

   - **列出工具 (list_tools)：** 掃描 `~/.ai-skills-hub/skills/` 目錄，並將每個技能目錄轉換為 AI 的工具名稱（例如：`api-design/` → `api_design`）。

   - **傳遞內容 (call_tool)：** 當 AI 請求時，從 `~/.ai-skills-hub/skills/` 讀取對應的 `SKILL.md` 內容，並將其作為「背景知識」提供給 AI。

3. **CLI 工具 (skillshub)**
   此 CLI 工具協助管理技能和 AI 工具配置：

   - 使用 `skillshub add <url>` 從 Git 儲存庫新增技能到 `~/.ai-skills-hub/skills/`
   - 執行 `skillshub sync` 編譯 TypeScript 程式碼並為 AI 工具配置 MCP 設定
   - 自動為所有支援的 AI 工具配置全域設定（Claude Desktop、Cursor、OpenAI Codex、GitHub Copilot、Gemini CLI、Claude Code CLI）

🔄 **團隊協作工作流程**

- **技能儲存庫：** 團隊維護技能儲存庫（例如在 GitHub 上），包含標準化的技能定義。

- **新增技能：** 團隊成員 A 使用 `skillshub add <repository-url>` 新增技能儲存庫，將其複製到 `~/.ai-skills-hub/skills/`。

- **技能更新：** 當技能儲存庫更新時，團隊成員可以更新本地副本或重新新增技能。

- **AI 就緒：** 團隊成員 B 開啟 Cursor 或 Claude 並詢問：「幫我寫一個新的 Service 邏輯」，AI 將主動讀取並採用 `~/.ai-skills-hub/skills/` 中的技能。

🌟 **為什麼這適合擁有 30 個微服務的團隊？**

- **無污染：** 這 30 個專案的原始碼不需要任何變更。不需要在每個專案中放置 `.cursorrules` 或 `.claudeprompt`。

- **集中化：** 只有一份標準副本。如果您在 30 個專案中各放一份副本，更新它們將是一場災難。

- **跨 AI 工具：** 無論團隊成員偏好 Cursor、Claude Desktop、Codex、Copilot、Gemini 還是 Claude Code CLI，只要連接到此 MCP，他們都會讀取相同的「團隊大腦」。

## 開發指南

### 專案腳本

- `npm run build` - 將 TypeScript 編譯到 `dist/` 目錄
- `npm start` - 執行編譯後的 MCP 伺服器
- `npm run dev` - 監看模式編譯（用於開發）

### 發布到 npm

如果您希望團隊成員能夠使用 `npx ai-skills-hub` 命令，您需要先將套件發布到 npm。

**📖 詳細指南：** 請參考 [NPM_PUBLISH_SOP.md](NPM_PUBLISH_SOP.md) 以獲取完整的發布標準作業程序。

**快速發布步驟：**

1. **登入 npm**
   ```bash
   npm login
   ```

2. **驗證套件名稱是否可用**
   ```bash
   npm view ai-skills-hub
   ```
   如果套件名稱已被使用，您需要修改 `package.json` 中的 `name` 欄位。

3. **發布套件**
   ```bash
   npm publish
   ```
   
   **注意：** `prepublishOnly` 腳本會自動執行 `npm run build`，確保在發布前編譯最新程式碼。

4. **驗證發布**
   ```bash
   npx ai-skills-hub --version
   ```

發布後，團隊成員可以使用方法 1（npx）安裝和使用此工具。

### 專案結構

- `src/index.ts` - MCP 伺服器主程式，實作 `list_tools` 和 `call_tool` 處理器
- `src/cli.ts` - CLI 工具入口點
- `src/utils.ts` - 工具函數：目錄掃描、檔案名稱轉換、檔案讀取等
- `src/commands/` - CLI 命令實作（sync、check、add、list 等）
- `~/.ai-skills-hub/skills/` - 用於儲存技能 Markdown 檔案的本地目錄（首次使用時建立）

### 貢獻

**專案開發：**
1. Fork 專案
2. 建立功能分支（`git checkout -b feature/amazing-feature`）
3. 對 MCP 伺服器或 CLI 工具進行變更
4. 提交變更（`git commit -m 'Add amazing feature'`）
5. 推送到分支（`git push origin feature/amazing-feature`）
6. 開啟 Pull Request

**新增技能：**
技能在各自的儲存庫中單獨管理。使用者使用 `skillshub add <repository-url>` 新增技能。要建立新的技能儲存庫，請參閱技能儲存庫文件。

### 故障排除

#### MCP 伺服器無法啟動

- 確認您已執行 `npm run build`
- 檢查 `dist/index.js` 是否存在
- 驗證 Node.js 版本為 18+

#### AI 工具無法連接到 MCP 伺服器

- 確認您已執行 `skillshub sync` 以更新配置
- 檢查配置檔案路徑是否正確
- 某些工具可能需要重新啟動以載入新配置
- 驗證配置檔案中的 MCP 伺服器路徑是否正確
- 使用 `skillshub check` 檢查配置狀態

## 授權

MIT License
