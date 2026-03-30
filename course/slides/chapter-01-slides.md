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
  section.lead h1 {
    font-size: 2.2em;
    margin-bottom: 0.3em;
  }
  section.lead p {
    font-size: 0.9em;
    opacity: 0.8;
  }
  h1 { color: #0f3460; border-bottom: 3px solid #e94560; padding-bottom: 10px; }
  h2 { color: #16213e; }
  h3 { color: #0f3460; }
  table { width: 100%; font-size: 0.75em; }
  th { background: #0f3460; color: white; }
  tr:nth-child(even) { background: #f0f4ff; }
  code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; }
  pre code { background: transparent; padding: 0; }
  pre { background: #1a1a2e; color: #e0e0e0; padding: 20px; border-radius: 8px; font-size: 0.7em; }
  .tag { display: inline-block; background: #e94560; color: white; padding: 2px 10px; border-radius: 12px; font-size: 0.7em; margin-left: 10px; vertical-align: middle; }
  blockquote { border-left: 4px solid #e94560; background: #fff5f5; padding: 10px 16px; border-radius: 0 8px 8px 0; font-size: 0.85em; }
---

<!-- _class: lead -->

# 與 AI 共舞
## 萬能的小幫手

### Chapter 1：AI 概述

---

# 課程全覽

| 週次 | 章節 | 主題 |
|------|------|------|
| Week 1 | Chapter 1 | **AI 概述** ← 你在這裡 |
| Week 2 | Chapter 2 | Claude Code in VSCode |
| Week 3 | Chapter 3 | Claude Code Agent 進階 |
| Week 4 | Chapter 4 | MCP — 讓 Agent 長出手腳 |
| Week 5 | Chapter 5 | 需求分析與開發 |

> 理論 20% · 功能介紹 20% · **實戰 60%**

---

# 本章學習目標

- 理解生成式 AI 的本質
- 知道有哪些使用方式（以 Agent 為主）
- 了解 AI 能幫前端工程師做什麼
- 完成帳號申請與安裝
- 搞懂 Token / 額度
- **進行第一場與 AI 的對話**

---

<!-- _class: lead -->

# 1.1
## 生成式 AI 是什麼？

---

# AI 不是你想的那樣

**不是**：搜尋引擎升級版
**不是**：巨大的 if-else 資料庫

**是**：在海量文字中學習語言規律，推斷「下一個最可能的 token」

```
你輸入：「台北最好吃的」

AI 推斷：
  「牛肉麵」(機率 35%)
  「珍珠奶茶」(機率 28%)
  「夜市小吃」(機率 22%)
  ...
```

---

# 關鍵概念

| 概念 | 白話說明 |
|------|----------|
| **LLM** | Large Language Model，大型語言模型 |
| **訓練資料** | 餵給 AI 看的書、文章、程式碼 |
| **Context Window** | AI 一次能「看到」的文字量 |
| **Hallucination** | AI 一本正經說出的錯誤資訊 |
| **Token** | 語言模型的最小處理單位 |

> ⚠️ AI 會犯錯，你是最終把關者

---

# 主流模型比較（2025）

| 模型 | 公司 | 強項 |
|------|------|------|
| **Claude 4** | Anthropic | 程式碼、長文推理、安全性 |
| **GPT-4o** | OpenAI | 多模態、生態豐富 |
| **Gemini 2.0** | Google | 整合 Google 服務、免費額度多 |
| **Llama 3** | Meta | 開源、可自架 |

**本課程以 Claude 為主** — 最完整的 coding agent 工具鏈

---

<!-- _class: lead -->

# 1.2
## 有哪些使用方式？

---

# AI 使用方式全覽

```
┌────────────────────────────────────────────┐
│               AI 使用方式                   │
├──────────────┬─────────────────────────────┤
│  🌐 Web UI   │  瀏覽器對話，零安裝，最直覺  │
│  📱 App      │  手機隨時可用               │
│  🔌 API      │  整合進自己的產品           │
│  🤖 Agent    │ ⭐ 自主規劃、呼叫工具、完成任務 │
│  💻 CLI Agent│ ⭐ 在 IDE 中直接操控程式碼  │
└──────────────┴─────────────────────────────┘
```

---

# ⭐ Agent 模式（本課重點）

**傳統 AI 問答**
你問 → AI 答 → 你複製貼上 → 你執行

**Agent 模式**
```
你說：「幫我建一個 Next.js 專案，有首頁和關於頁」

Agent：
  Step 1: 執行 npx create-next-app
  Step 2: 建立 /app/about/page.tsx
  Step 3: 修改首頁
  Step 4: 確認 npm run dev 正常
  Step 5: 回報完成 ✅
```

---

# Agent 能做什麼？

```
你說目標
    ↓
AI 規劃步驟
    ↓
AI 執行工具 ──→ 讀寫檔案
    ↓          執行命令
AI 觀察結果    搜尋網路
    ↓          呼叫 API
AI 自我修正
    ↓
任務完成
```

---

<!-- _class: lead -->

# 1.3
## AI 能幫前端工程師做什麼？

---

# 你的日常工作，AI 插手哪些？

| 工作項目 | AI 能力 |
|----------|---------|
| 需求理解 | ████████░░ 80% |
| UI 元件開發 | █████████░ 90% |
| CSS / RWD | ████████░░ 80% |
| API 串接 | ████████░░ 80% |
| Debug | ███████░░░ 70% |
| Code Review | ████████░░ 80% |
| 文件撰寫 | █████████░ 90% |

---

# AI 做不好的事（誠實面對）

- ❌ 複雜的架構決策（它會說，但你要驗證）
- ❌ 你公司特有的業務邏輯
- ❌ 最新套件版本（訓練資料有截止日期）
- ❌ 需要「品味」的設計決策

> **心態調整**：AI 是超強的初稿機器，你是最終把關者

---

<!-- _class: lead -->

# 1.4
## 申請帳號與安裝

---

# 安裝清單

```bash
# 1. 確認 Node.js 版本（需要 18+）
node --version

# 2. 安裝 Claude Code CLI
npm install -g @anthropic-ai/claude-code

# 3. 初次登入
claude login

# 4. 確認版本
claude --version
```

VSCode 擴充：搜尋 **"Claude Code"** → 安裝 → 重啟

---

<!-- _class: lead -->

# 1.5
## Token / 額度是什麼？

---

# Token 的概念

Token = 語言模型的最小處理單位

```
"Hello, world!"  →  4 tokens
"你好世界"        →  約 4 tokens
```

**經驗法則**
- 1 個英文單字 ≈ 1.3 tokens
- 1 個中文字 ≈ 1~2 tokens
- 1000 tokens ≈ 750 英文字

**為什麼要在意？**
→ API 按 token 計費，context window 有上限

---

<!-- _class: lead -->

# 1.6
## 進行第一場與 AI 的對話

---

# 好的 Prompt vs. 差的 Prompt

❌ **差**
```
幫我寫一個網頁
```

✅ **好**
```
我需要一個 React 函式元件，顯示使用者個人資料卡片。
Props：name (string)、avatar (string, URL)、bio (string)。
使用 Tailwind CSS，風格簡潔現代，有 hover 效果。
請同時提供 TypeScript 型別定義。
```

---

# Prompt 框架：RICE

| 元素 | 說明 | 範例 |
|------|------|------|
| **R**ole | 告訴 AI 它的角色 | 「你是資深 React 工程師」 |
| **I**nstruction | 明確的指令 | 「幫我 review 這段程式碼」 |
| **C**ontext | 背景資訊 | 「這是 Next.js 14 電商前台」 |
| **E**xample | 範例或格式 | 「輸出格式如下：...」 |

---

# 三個練習對話

**練習 1：解釋程式碼**
貼複雜的 JS，問：「請逐行解釋，並指出可改進的地方」

**練習 2：找 Bug**
貼有 bug 的程式，問：「執行時出現 [error]，請找出問題並修正」

**練習 3：生成元件**
「用 React + TypeScript 寫一個搜尋輸入框，
有 debounce 500ms、loading 狀態、清空按鈕」

---

<!-- _class: lead -->

# 🎯 本章作業

---

# 本週作業

1. 完成 **Claude** 和 **Gemini** 帳號申請

2. 安裝 **Claude Code CLI**
   ```bash
   npm install -g @anthropic-ai/claude-code
   claude login
   ```

3. 在 **claude.ai** 用你最近遇到的前端問題問 AI

4. 同樣的問題問 **Gemini**，比較兩者差異

5. 記錄下來：哪個回答更有用？為什麼？

---

<!-- _class: lead -->

# 下週預告

## Chapter 2
### Claude Code in VSCode

我們將從零建立一個 **Next.js + MUI** 專案
並開發一個完整的寵物飼料品牌頁面 🐾

---

<!-- _class: lead -->

# Q & A

有什麼問題嗎？
