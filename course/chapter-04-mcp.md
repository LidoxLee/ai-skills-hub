# Chapter 4：MCP — 讓 Agent 長出手腳

> **時長**：約 1.5 小時 ｜ **週次**：Week 4

---

## 本章目標

- 理解 MCP 的概念和它改變了什麼
- 安裝並使用 GitHub MCP
- 安裝 ai-skills-hub MCP，建立共用 Skill
- 讓 Gemini 能使用 Claude Code 建立的 Skill

---

## 4.1 MCP 介紹（理論 · 20 min）

### MCP 是什麼？

**MCP（Model Context Protocol）** 是 Anthropic 提出的開放協議，讓 AI Agent 能夠**安全地連接外部工具和服務**。

### 沒有 MCP 的 AI

```
你 → 輸入文字 → AI → 輸出文字 → 你複製貼上到其他地方
```

AI 只能說話，沒有手——它能告訴你怎麼做，但自己做不了。

### 有 MCP 的 AI

```
你 → 輸入指令 → AI → 呼叫 MCP Tool → 外部服務 → 結果回來 → AI 繼續
                          ↓
                    GitHub API
                    資料庫
                    Slack
                    Jira
                    你自己的 Server
```

AI 有了「工具」，能直接操作外部世界。

### MCP 的架構

```
┌─────────────────────────────────────────┐
│              Claude Code                 │
│  (AI Agent + Tool Caller)               │
└─────────┬──────────────────────────────┘
          │ MCP Protocol（JSON-RPC）
    ┌─────┴──────┐
    │            │
┌───▼───┐  ┌───▼──────────┐
│GitHub │  │ ai-skills-hub│  ... 更多 MCP Server
│ MCP   │  │    MCP       │
└───────┘  └──────────────┘
    │            │
GitHub API    你的 Skill 庫
```

### MCP vs Skill 的差異

| | Skill | MCP |
|--|-------|-----|
| **本質** | AI 指令模板 | 程式碼工具（Server） |
| **執行方式** | AI 讀指令，自己判斷怎麼做 | AI 呼叫明確定義的函式 |
| **能力** | 受限於 AI 本身的工具 | 可呼叫任何 API、執行任何程式 |
| **適合用途** | 工作流程封裝 | 整合外部服務 |

---

## 4.2 使用第一個 MCP：GitHub MCP（操作 · 25 min）

### 安裝 GitHub MCP

```bash
# 確認 Claude Code 版本夠新
claude --version

# 安裝 GitHub MCP（使用 Claude Code 的 MCP 管理）
claude mcp add github
```

或者手動設定 `~/.claude/settings.json`：

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_你的token"
      }
    }
  }
}
```

### 取得 GitHub Personal Access Token

1. 前往 GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. 點 "Generate new token"
4. 勾選：`repo`, `read:user`, `read:org`
5. 複製 token（只顯示一次！）

### 驗證 GitHub MCP 可用

啟動 Claude Code 後，試試這些指令：

```
幫我查一下我的 GitHub 帳號有哪些 repository
```

```
幫我在 GitHub 上建立一個新的 repository，
名稱：pawfeast-frontend
描述：PawFeast 寵物飼料品牌前端
設定為 private
```

```
幫我查看 pawfeast-frontend 最近的 commit 紀錄
```

### 搭配 push-to-github Skill 使用

現在你的 workflow 可以是：

```
開發完成
  ↓
/push-to-github        ← Skill：commit + push
  ↓
（Claude Code 透過 GitHub MCP 自動建立 PR）
  ↓
幫我建立一個 PR，標題說明這次改動的功能
```

---

## 4.3 安裝 ai-skills-hub MCP（操作 · 20 min）

### 什麼是 ai-skills-hub？

`ai-skills-hub` 是一個自建的 MCP Server，讓你能夠：

- 集中管理跨專案的 Skill
- 讓多個 AI 工具（Claude、Gemini）共用同一套 Skill 庫
- 透過 MCP 呼叫，讓 Skill 的執行更可靠

### 安裝步驟

```bash
# Clone ai-skills-hub
git clone https://github.com/你的組織/ai-skills-hub.git
cd ai-skills-hub
npm install

# 建立設定檔
cp .env.example .env
```

設定 `~/.claude/settings.json`：

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_你的token"
      }
    },
    "ai-skills-hub": {
      "command": "node",
      "args": ["/path/to/ai-skills-hub/dist/index.js"],
      "env": {
        "CLIENT_PROJECT_PATH": "/Users/你的名字/git/ai-skills-hub"
      }
    }
  }
}
```

### 驗證 ai-skills-hub MCP 可用

```
列出 ai-skills-hub 裡的所有可用 skill
```

```
使用 ai-skills-hub 執行 create-skill，
幫我建立一個新的 skill 叫做 daily-standup
```

---

## 4.4 使用 ai-skills-hub MCP 建立共用 Skill（操作 · 20 min）

### 概念：共用 Skill 庫

個人 Skill（`~/.claude/skills/`）只有你自己可用。

如果你在一個開發團隊，想讓所有人共用一套 Skill：
1. Skill 定義存在 ai-skills-hub 的 repo 裡
2. 透過 MCP，任何安裝了 ai-skills-hub 的人都能呼叫
3. 更新 Skill 只需要更新 repo

### 建立一個共用 Skill

```
使用 ai-skills-hub MCP 的 skill_creator 工具，
建立一個名為 create-component 的共用 Skill

這個 Skill 的工作流程：
1. 詢問使用者：元件名稱、元件類型（UI/功能）、需要哪些 Props
2. 根據回答，在 src/components/ 建立符合團隊規範的 TypeScript 元件
3. 自動在元件文件（docs/components.md）新增這個元件的說明
4. 詢問是否要建立對應的測試檔案（__tests__/ComponentName.test.tsx）
```

### 查看 Skill 是否上線

```
列出 ai-skills-hub 的所有 skill，確認 create-component 已建立
```

---

## 🎯 本章實戰練習

### 題目：讓 Gemini 能使用 Claude Code 建立的 Skill

**背景**：你現在同時使用 Claude Code 和 Gemini。兩個 AI 各有強項：
- Claude Code：深度程式碼操作、複雜推理
- Gemini：免費額度多、整合 Google 服務、多模態能力強

如果 Skill 只能在 Claude Code 裡用，那就太可惜了。

**目標**：讓 Gemini 能夠呼叫 ai-skills-hub 裡的 Skill。

**步驟一：理解 Gemini CLI**

```bash
# 安裝 Gemini CLI
npm install -g @google/gemini-cli

# 登入
gemini auth login
```

**步驟二：設定 Gemini 的 MCP 連線**

在 Gemini 的設定中加入 ai-skills-hub MCP：

```json
// ~/.gemini/settings.json
{
  "mcpServers": {
    "ai-skills-hub": {
      "command": "node",
      "args": ["/path/to/ai-skills-hub/dist/index.js"],
      "env": {
        "CLIENT_PROJECT_PATH": "/Users/你的名字/git/ai-skills-hub"
      }
    }
  }
}
```

**步驟三：在 Gemini 中測試呼叫 Skill**

```bash
cd pawfeast-frontend
gemini
```

在 Gemini 中輸入：
```
使用 ai-skills-hub 的 create-component skill，
幫我建立一個 PriceTag 元件
```

**步驟四：比較兩個 AI 的執行結果**

對同一個 Skill 請求，分別讓 Claude Code 和 Gemini 執行，記錄：
- 哪個 AI 的結果更符合期待？
- 哪個速度更快？
- 在什麼情況下你會選哪個？

**預期產出**：
- Gemini 能成功呼叫 ai-skills-hub MCP 的 Skill
- 一份簡短的比較筆記（用 AI 幫你寫就好！）

---

## 延伸資源

- [MCP 官方文件](https://modelcontextprotocol.io)
- [MCP Server 列表](https://github.com/modelcontextprotocol/servers)
- [Gemini CLI 文件](https://github.com/google-gemini/gemini-cli)

---

*上一章：[Chapter 3 — Claude Code Agent 進階](./chapter-03-claude-code-advanced.md)*
*下一章：[Chapter 5 — 需求分析與開發](./chapter-05-requirements-development.md)*
