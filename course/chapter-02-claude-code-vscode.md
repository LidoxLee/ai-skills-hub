# Chapter 2：Claude Code in VSCode

> **時長**：約 2 小時 ｜ **週次**：Week 2

---

## 本章目標

- 在 VSCode 裡完整設定 Claude Code
- 理解 `.claude/` 的設定結構
- 用 Claude Code 從零建立 Next.js + MUI 專案
- 讓 AI 開發一個完整頁面

---

## 2.1 在 VSCode 裡安裝 Claude Code（操作 · 20 min）

### 前置確認

```bash
# 確認 Node.js 版本（需要 18+）
node --version   # v20.x.x 或以上

# 確認 Claude Code 已安裝
claude --version

# 確認登入狀態
claude auth status
```

### VSCode 擴充安裝

1. 開啟 VSCode
2. 快捷鍵：`Cmd+Shift+X`（Mac）/ `Ctrl+Shift+X`（Windows）
3. 搜尋：`Claude Code`
4. 安裝 **Anthropic** 官方出品的擴充
5. 重啟 VSCode

### 啟動 Claude Code Panel

安裝後，你有三種啟動方式：

| 方式 | 說明 |
|------|------|
| `Cmd+Shift+P` → 輸入 `Claude` | 指令面板開啟 |
| 左側 Activity Bar 的 Claude 圖示 | 側邊面板 |
| 終端機輸入 `claude` | CLI 模式 |

> **建議**：平時用 VSCode Panel，需要執行長時間任務時用 Terminal 的 CLI 模式，方便看到完整 log。

---

## 2.2 Claude Code 的設定結構（理論 · 20 min）

### `.claude/` 目錄結構

Claude Code 在你的專案根目錄和家目錄分別讀取設定：

```
~/.claude/                    # 全域設定（對所有專案生效）
├── settings.json             # 全域行為設定
├── CLAUDE.md                 # 全域 AI 指令
└── skills/                   # 全域 Skill 工具庫（第3章介紹）

your-project/
└── .claude/                  # 專案設定（覆蓋全域）
    ├── settings.json          # 專案行為設定
    └── CLAUDE.md              # 專案 AI 指令（最重要！）
```

### CLAUDE.md — 給 AI 的「專案說明書」

這是最關鍵的設定檔。每次 Claude Code 啟動，它**第一件事**就是讀這個檔案。

```markdown
# CLAUDE.md 範例

## 專案背景
這是一個寵物飼料電商的前台，使用 Next.js 14 App Router。

## 技術棧
- Framework: Next.js 14（App Router）
- UI: MUI v6
- 語言: TypeScript
- 樣式: CSS Modules + MUI sx prop

## 程式碼規範
- 所有元件使用 Function Component
- 型別定義放在 types/ 目錄
- 不使用 any，遇到複雜型別先問我

## 禁止事項
- 不要修改 .env 檔案
- 不要直接 commit，讓我確認後再提交
```

### settings.json 重要設定

```json
{
  "permissions": {
    "allow": [
      "Bash(npm:*)",
      "Bash(npx:*)",
      "Bash(git:*)"
    ],
    "deny": [
      "Bash(rm -rf:*)"
    ]
  },
  "env": {
    "CLAUDE_MODEL": "claude-opus-4-6"
  }
}
```

> **重點**：`permissions.allow` 讓你控制 Agent 能執行哪些命令。這是安全邊界，不是限制 AI 的智慧。

### Context 的讀取順序

```
1. ~/.claude/CLAUDE.md        （全域指令）
2. .claude/CLAUDE.md          （專案指令）
3. 你在對話中說的話           （即時指令）
```

後面的優先級較高，但它們是**疊加**的，不是取代。

---

## 2.3 建立 Hello World 專案（實操 · 30 min）

### 任務：用 Claude Code 建立 Next.js + MUI 專案

**在終端機啟動 Claude Code：**

```bash
mkdir my-mui-app
cd my-mui-app
claude
```

**對 Claude Code 說：**

```
幫我建立一個 Next.js 14 專案，要求如下：
- 使用 TypeScript
- App Router 架構
- 安裝 MUI v6 和相關依賴
- 設定 MUI 的 ThemeProvider
- 建立一個乾淨的首頁，顯示「Hello, World!」
- 確認 npm run dev 可以正常啟動
```

### Claude Code 會做的事（你觀察）

```
📋 Claude 規劃：
  1. 執行 npx create-next-app@latest
  2. 安裝 MUI 套件
  3. 建立 theme.ts
  4. 修改 layout.tsx 加入 ThemeProvider
  5. 修改 page.tsx 顯示 Hello World
  6. 執行 npm run dev 驗證
```

### 關鍵觀念：Agent 的工作循環

```
Plan → Execute → Observe → Plan → Execute → ...
（規劃）  （執行）  （觀察）  （重新規劃）
```

當 `npm run dev` 出現錯誤，Claude Code 會**自己讀取錯誤訊息、自己修正**，不需要你介入。

### 建立 CLAUDE.md

專案建立後，立刻建立 `.claude/CLAUDE.md`：

```bash
mkdir .claude
```

對 Claude Code 說：
```
根據這個專案的技術棧，幫我自動生成 .claude/CLAUDE.md，
內容包含：專案說明、技術棧、元件規範、禁止事項
```

---

## 2.4 讓 Claude Code 進行頁面開發（實操 · 30 min）

### 任務：開發寵物飼料品牌形象頁

這是一個模擬真實工作的任務。你是 PM，Claude Code 是你的工程師。

**給 Claude Code 的需求說明：**

```
幫我開發一個寵物飼料品牌的形象頁面，路徑是 /app/page.tsx

品牌名稱：PawFeast 純鮮寵糧

頁面包含以下區塊：

1. 導覽列（Navbar）
   - Logo（文字即可）
   - 連結：首頁、產品、關於我們、聯絡
   - 右上角「立即購買」按鈕

2. Hero 區塊
   - 大標題：「給你的毛孩，最純粹的愛」
   - 副標題：「100% 天然食材，獸醫師配方認證」
   - 兩個 CTA 按鈕：「查看產品」、「了解更多」
   - 右側放一個佔位圖片（使用 MUI Box 做一個灰色方塊代替）

3. 特色區塊（Features）
   - 三個特色卡片，使用 MUI Card
   - 特色一：天然食材 — 精選人食等級食材，無防腐劑
   - 特色二：獸醫認證 — 由台灣執照獸醫師設計配方
   - 特色三：新鮮直送 — 低溫冷鏈配送，保留最高營養

4. 頁尾（Footer）
   - 版權聲明：© 2025 PawFeast. All rights reserved.

技術要求：
- 使用 MUI 元件（Button, Card, Container, Typography, Grid2）
- 使用 MUI 的 sx prop 做樣式
- 主色調：橙色（#FF6B35）
- RWD：手機版隱藏 Hero 圖片區，保留文字
- TypeScript，不使用 any
```

### 觀察重點

開發過程中注意觀察：

1. **Claude Code 如何拆解任務** — 它會把大需求切成小步驟
2. **遇到 TypeScript 錯誤** — 它能自己修正嗎？
3. **樣式調整** — 你能用自然語言要求微調嗎？

### 即時微調（重要技巧）

在 Claude Code 開發過程中，你可以隨時插入：

```
「Hero 區塊的標題字體太小，改成 h2 大小」
「CTA 按鈕改成 outlined 樣式」
「Features 區塊加上一點 padding」
```

這就是和 AI 協作的真實感受：**你是設計師，它是執行者**。

---

## 🎯 本章實戰練習

### 題目：讓 Claude Code 對專案進行分析並撰寫分析文件

**目標**：訓練你用 AI 做「文件化」的工作——這在實際工作中非常有用，特別是接手別人的專案時。

**步驟**：

1. 在剛建好的 PawFeast 專案中啟動 Claude Code

2. 對 Claude Code 說：
```
請對這個專案進行完整分析，並生成一份分析文件儲存在 docs/project-analysis.md

分析內容要包含：
1. 專案架構說明（目錄結構、各目錄用途）
2. 技術棧清單（版本號、用途）
3. 元件清單（列出所有自訂元件、它們的 Props）
4. 已實作功能列表
5. 可改進的地方（至少 3 點）
6. 建議的下一步開發項目
```

3. 閱讀生成的文件，檢查：
   - AI 的分析是否準確？
   - 有沒有遺漏的元件或功能？
   - 建議的改進點你同不同意？

4. 如果有錯誤，告訴 Claude Code 修正，觀察它如何更新文件。

**加分題**：
```
再幫我分析這個專案的效能潛在問題，
特別是 Next.js Image 優化和 MUI 的 Bundle Size，
附上改善建議，補充到 docs/project-analysis.md 的最後
```

**預期產出**：`docs/project-analysis.md`，一份有深度的技術文件。

---

## 延伸資源

- [Claude Code 官方文件](https://docs.anthropic.com/en/docs/claude-code)
- [MUI 元件庫](https://mui.com/material-ui/)
- [Next.js App Router 文件](https://nextjs.org/docs/app)

---

*上一章：[Chapter 1 — AI 概述](./chapter-01-ai-overview.md)*
*下一章：[Chapter 3 — Claude Code Agent 進階](./chapter-03-claude-code-advanced.md)*
