---
marp: true
theme: default
paginate: true
backgroundColor: #ffffff
color: #1a1a2e
style: |
  section {
    font-family: 'Noto Sans TC', 'PingFang TC', sans-serif;
    font-size: 28px;
  }
  section.lead {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    color: white;
    text-align: center;
  }
  section.lead h1 { font-size: 2.2em; margin-bottom: 0.3em; }
  section.lead p { font-size: 0.9em; opacity: 0.8; }
  h1 { color: #0f3460; border-bottom: 3px solid #e94560; padding-bottom: 10px; }
  h2 { color: #16213e; }
  h3 { color: #0f3460; }
  table { width: 100%; font-size: 0.75em; }
  th { background: #0f3460; color: white; }
  tr:nth-child(even) { background: #f0f4ff; }
  code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; }
  pre code { background: transparent; padding: 0; }
  pre { background: #1a1a2e; color: #e0e0e0; padding: 20px; border-radius: 8px; font-size: 0.65em; }
  blockquote { border-left: 4px solid #e94560; background: #fff5f5; padding: 10px 16px; border-radius: 0 8px 8px 0; font-size: 0.85em; }
---

<!-- _class: lead -->

# 與 AI 共舞
## 萬能的小幫手

### Chapter 4：MCP — 讓 Agent 長出手腳

---

# 本章學習目標

- 理解 **MCP** 的概念和它改變了什麼
- 安裝並使用 **GitHub MCP**
- 安裝 **ai-skills-hub MCP**，建立共用 Skill
- 讓 **Gemini** 也能使用 Claude Code 的 Skill

---

<!-- _class: lead -->

# 4.1
## MCP 是什麼？

---

# 沒有 MCP 的 AI

```
你 → 輸入文字 → AI → 輸出文字 → 你複製貼上
```

AI 只能說話，**沒有手**

它能告訴你怎麼做，但自己做不了

---

# 有 MCP 的 AI

```
你 → 輸入指令 → AI → 呼叫 MCP Tool → 外部服務
                          ↓
                    GitHub API ✅
                    資料庫 ✅
                    Slack ✅
                    Jira ✅
                    你自己的 Server ✅
```

AI 有了「工具」，**能直接操作外部世界**

---

# MCP 架構圖

```
┌────────────────────────────────────┐
│           Claude Code              │
│    (AI Agent + Tool Caller)        │
└──────────────┬─────────────────────┘
               │ MCP Protocol (JSON-RPC)
       ┌───────┴──────────┐
       │                  │
  ┌────▼────┐  ┌──────────▼──────┐
  │ GitHub  │  │  ai-skills-hub  │  ... 更多
  │   MCP   │  │      MCP        │
  └─────────┘  └─────────────────┘
       │                  │
  GitHub API          你的 Skill 庫
```

---

# MCP vs Skill

| | Skill | MCP |
|--|-------|-----|
| **本質** | AI 指令模板 | 程式碼工具 Server |
| **執行方式** | AI 讀指令判斷 | AI 呼叫明確函式 |
| **能力** | 受限於 AI 本身工具 | 可呼叫任何 API |
| **適合** | 工作流程封裝 | 整合外部服務 |

---

<!-- _class: lead -->

# 4.2
## GitHub MCP

---

# 安裝 GitHub MCP

**方法一：Claude Code 指令**
```bash
claude mcp add github
```

**方法二：手動設定 `~/.claude/settings.json`**
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

---

# 取得 GitHub Token

1. GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token
4. 勾選：`repo`、`read:user`、`read:org`
5. 複製 token（**只顯示一次！**）

---

# 驗證 GitHub MCP

```
幫我查一下我的 GitHub 帳號有哪些 repository
```

```
幫我在 GitHub 建立新的 repository：
名稱：pawfeast-frontend
描述：PawFeast 寵物飼料品牌前端
設定為 private
```

```
幫我查看 pawfeast-frontend 最近的 commit 紀錄
```

---

<!-- _class: lead -->

# 4.3
## ai-skills-hub MCP

---

# 什麼是 ai-skills-hub？

自建的 MCP Server，讓你能夠：

- **集中管理**跨專案的 Skill
- 讓多個 AI 工具**共用**同一套 Skill 庫
- 透過 MCP 呼叫，讓 Skill 執行更可靠

---

# 安裝 ai-skills-hub

```bash
# Clone 並安裝
git clone https://github.com/你的組織/ai-skills-hub.git
cd ai-skills-hub
npm install
```

設定 `~/.claude/settings.json`：
```json
{
  "mcpServers": {
    "ai-skills-hub": {
      "command": "node",
      "args": ["/path/to/ai-skills-hub/dist/index.js"],
      "env": {
        "CLIENT_PROJECT_PATH": "/Users/你/git/ai-skills-hub"
      }
    }
  }
}
```

---

# 共用 Skill 庫的概念

```
個人 Skill（~/.claude/skills/）
  → 只有你自己可用

ai-skills-hub 共用 Skill
  → 團隊所有人都能呼叫
  → 更新 Skill 只需更新 repo
  → Claude、Gemini 都能使用
```

---

<!-- _class: lead -->

# 🎯 本章實戰練習

---

# 讓 Gemini 使用 Claude 建立的 Skill

**安裝 Gemini CLI**
```bash
npm install -g @google/gemini-cli
gemini auth login
```

**設定 MCP**
```json
// ~/.gemini/settings.json
{
  "mcpServers": {
    "ai-skills-hub": {
      "command": "node",
      "args": ["/path/to/ai-skills-hub/dist/index.js"]
    }
  }
}
```

---

# 在 Gemini 中呼叫 Skill

```bash
cd pawfeast-frontend
gemini
```

```
使用 ai-skills-hub 的 create-component skill，
幫我建立一個 PriceTag 元件
```

---

# 比較兩個 AI 的執行結果

對同一個 Skill 請求，分別讓 Claude Code 和 Gemini 執行：

| 比較點 | Claude Code | Gemini |
|--------|-------------|--------|
| 結果品質 | ? | ? |
| 執行速度 | ? | ? |
| 最適合的場景 | ? | ? |

> 用 AI 幫你寫這份比較報告！

---

<!-- _class: lead -->

# 下週預告

## Chapter 5
### 需求分析與開發

OpenSpec + AI 完整開發週期 + AI Code Review 📋

---

<!-- _class: lead -->

# Q & A
