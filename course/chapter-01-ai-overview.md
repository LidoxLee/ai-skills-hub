# Chapter 1：AI 概述

> **時長**：約 1.5 小時 ｜ **週次**：Week 1

---

## 本章目標

- 理解生成式 AI 的本質，消除「黑盒子」的恐懼
- 知道有哪些使用方式，找到最適合自己工作流的入口
- 申請帳號、完成安裝，進行第一場對話

---

## 1.1 生成式 AI 是什麼？（理論 · 15 min）

### 和你想的不一樣

生成式 AI（Generative AI）不是「搜尋引擎升級版」，也不是「if-else 的大型資料庫」。

它的本質是：**在海量文字中學習語言的統計規律，並以此推斷「下一個最可能的 token」**。

```
你輸入：「台北最好吃的」
AI 推斷：「牛肉麵...」「珍珠奶茶...」「夜市小吃...」
```

### 關鍵概念：LLM（大型語言模型）

| 概念 | 白話說明 |
|------|----------|
| **訓練資料** | 餵給 AI 看的書、文章、程式碼 |
| **參數（Parameters）** | AI「記住」知識的方式，GPT-4 約有 1.8 兆個 |
| **Context Window** | AI 一次能「看到」的文字量，越大越能理解長對話 |
| **Hallucination（幻覺）** | AI 一本正經說出的錯誤資訊，必須人工驗證 |

### 主流模型比較（2024~2025）

| 模型 | 公司 | 強項 |
|------|------|------|
| **Claude 3.5/4** | Anthropic | 程式碼、長文推理、安全性 |
| **GPT-4o** | OpenAI | 多模態、生態豐富 |
| **Gemini 2.0** | Google | 整合 Google 服務、免費額度多 |
| **Llama 3** | Meta | 開源、可自架 |

> **本課程以 Claude 為主**，因為它有最完整的 coding agent 工具鏈（Claude Code），且在程式碼生成品質上表現穩定。

---

## 1.2 有哪些使用方式？（功能介紹 · 20 min）

### 使用模式全覽

```
┌─────────────────────────────────────────────────────┐
│                   AI 使用方式                        │
├───────────────┬─────────────────────────────────────┤
│  🌐 Web UI    │  直接在瀏覽器對話，零安裝，最直覺    │
│  📱 App       │  手機隨時可用                        │
│  🔌 API       │  自己整合進產品                      │
│  🤖 Agent     │ ⭐ 能自主規劃、呼叫工具、完成任務    │
│  💻 CLI Agent │ ⭐ 在終端機/IDE 中直接操控你的程式碼 │
└───────────────┴─────────────────────────────────────┘
```

### Web UI（最入門）

- **claude.ai** — 直接對話，適合文案、問答、分析
- **gemini.google.com** — 免費、連結 Google Drive/Docs
- **chatgpt.com** — 最廣為人知，Plugin 生態豐富

**使用場景**：快速查資料、寫 email、解釋錯誤訊息

### API 整合（工程師熟悉路）

```javascript
// 你以前可能這樣用過
const response = await anthropic.messages.create({
  model: "claude-opus-4-6",
  messages: [{ role: "user", content: "幫我 review 這段 code" }]
});
```

**使用場景**：把 AI 嵌入自己的產品、自動化流程

### ⭐ Agent 模式（本課程重點）

Agent 的概念：**給它目標，它自己想辦法達到**

傳統 AI 問答：你問 → AI 答 → 結束
Agent：你說目標 → AI 規劃步驟 → AI 執行工具 → AI 自我修正 → 完成任務

```
你說：「幫我建一個 Next.js 專案，有首頁和關於頁」

Claude Code Agent：
  Step 1: 執行 npx create-next-app
  Step 2: 建立 /app/about/page.tsx
  Step 3: 修改 /app/page.tsx 首頁
  Step 4: 確認 npm run dev 可以正常啟動
  Step 5: 回報完成
```

**關鍵差異**：Agent 可以**讀寫檔案、執行命令、搜尋網路、呼叫外部服務**

---

## 1.3 AI 能幫你什麼？（以前端工程師視角）

### 你的日常工作，AI 能插手哪些？

```
需求理解    ████████░░  80% — 幫你釐清模糊需求、提出澄清問題
UI 元件     █████████░  90% — 給設計稿或描述，直接生成元件
CSS/樣式    ████████░░  80% — RWD、動畫、主題切換
API 串接    ████████░░  80% — 自動產生 type、fetch 封裝、error handling
Debug       ███████░░░  70% — 貼 error log，AI 找到根因
Code Review ████████░░  80% — 找潛在 bug、建議最佳實踐
文件撰寫    █████████░  90% — JSDoc、README、API 文件
測試撰寫    ███████░░░  70% — Unit test、E2E test 骨架
```

### AI 做不好的事（誠實面對）

- ❌ 複雜的架構決策（它會說，但你要驗證）
- ❌ 你的公司特有業務邏輯（它不知道你的 domain）
- ❌ 最新的套件版本（訓練資料有截止日期）
- ❌ 需要「品味」的設計決策

> **心態調整**：AI 是超強的初稿機器，你是最終把關者。

---

## 1.4 申請帳號與安裝（操作 · 20 min）

### 申請 Claude 帳號

1. 前往 **claude.ai**
2. 使用 Google/Email 註冊
3. 免費方案：有使用限制，適合體驗
4. **Pro 方案**（$20/月）：建議訂閱，有 Claude Code 完整功能

### 申請 Gemini 帳號

1. 前往 **gemini.google.com**
2. 使用 Google 帳號登入（幾乎零門檻）
3. Gemini Advanced：整合 Google Workspace

### 安裝 Claude Code（CLI Agent）

```bash
# 需要 Node.js 18+
node --version

# 全域安裝
npm install -g @anthropic-ai/claude-code

# 驗證安裝
claude --version

# 初次登入（會開啟瀏覽器授權）
claude login
```

### 安裝 VSCode 擴充

1. 打開 VSCode
2. `Cmd+Shift+X` 開啟擴充功能
3. 搜尋 **"Claude Code"**
4. 點擊安裝
5. 重新啟動 VSCode

---

## 1.5 Token / 額度是什麼？（理論 · 10 min）

### Token 的概念

Token 不是字，也不是詞，而是**語言模型的最小處理單位**。

```
"Hello, world!"  →  ["Hello", ",", " world", "!"]  →  4 tokens
"你好世界"        →  ["你好", "世界"]              →  約 4 tokens
```

**經驗法則**：
- 1 個英文單字 ≈ 1.3 tokens
- 1 個中文字 ≈ 1~2 tokens
- 1000 tokens ≈ 750 英文字

### 為什麼要在意 Token？

| 面向 | 說明 |
|------|------|
| **費用** | API 按 token 計費（input + output 分開算）|
| **Context 限制** | Claude 的 context window 約 200K tokens |
| **速度** | Output token 越多，等待時間越長 |

### Claude Pro 方案的使用限制

- 不是無限，有每日/每小時上限
- 超過上限後需等待重置或升級 API 方案
- Claude Code 使用 API，消耗的是你的 API 額度

---

## 1.6 進行第一場與 AI 的對話（實操 · 25 min）

### 好的提示（Prompt）vs. 差的提示

```
❌ 差的提示：「幫我寫一個網頁」

✅ 好的提示：
「我需要一個 React 函式元件，功能是顯示使用者的個人資料卡片。
 Props 包含：name (string)、avatar (string, URL)、bio (string)。
 使用 Tailwind CSS，風格簡潔現代，包含 hover 效果。
 請同時提供 TypeScript 型別定義。」
```

### Prompt 框架：RICE

| 元素 | 說明 | 範例 |
|------|------|------|
| **R**ole | 告訴 AI 它的角色 | 「你是一位資深 React 工程師」 |
| **I**nstruction | 明確的指令 | 「幫我 review 這段程式碼」 |
| **C**ontext | 背景資訊 | 「這是一個電商前台，使用 Next.js 14」 |
| **E**xample | 範例或格式 | 「輸出格式如下：...」 |

### 動手試試：三個練習對話

**練習 1：解釋程式碼**
```
貼一段你覺得複雜的 JavaScript，問 AI：
「請逐行解釋這段程式碼的功能，並說明有沒有可以改進的地方」
```

**練習 2：找 Bug**
```
把一段有 bug 的程式貼給 AI：
「這段程式執行時出現 [error message]，請幫我找出問題並修正」
```

**練習 3：生成元件**
```
「幫我用 React + TypeScript 寫一個搜尋輸入框元件，
 需要有 debounce 功能（500ms），輸入時顯示 loading 狀態，
 清空按鈕（輸入有內容才顯示）」
```

---

## 🎯 本章實戰練習

> 這不是本章的實戰題，而是暖身——下週開始我們直接在 VSCode 裡用 Claude Code 幹活。

**作業**：
1. 完成 Claude 和 Gemini 帳號申請
2. 安裝 Claude Code CLI
3. 在 claude.ai 上，用你最近遇到的一個前端問題問 AI，記錄它的回答品質
4. 試著用 Gemini 做同樣的問題，比較兩者差異

---

## 延伸資源

- [Claude 官方文件](https://docs.anthropic.com)
- [Prompt Engineering 指南](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering)
- [Gemini API 文件](https://ai.google.dev/docs)

---

*下一章：[Chapter 2 — Claude Code in VSCode](./chapter-02-claude-code-vscode.md)*
