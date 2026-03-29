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

### Chapter 2：Claude Code in VSCode

---

# 本章學習目標

- 在 VSCode 裡完整設定 Claude Code
- 理解 `.claude/` 目錄的結構與用途
- **從零建立 Next.js + MUI 專案**
- **讓 AI 開發完整的寵物飼料品牌頁面**

---

<!-- _class: lead -->

# 2.1
## 安裝與設定

---

# 前置確認

```bash
# Node.js 版本需 18+
node --version    # v20.x.x ✅

# Claude Code 已安裝
claude --version

# 登入狀態
claude auth status
```

---

# VSCode 擴充安裝

1. `Cmd+Shift+X` 開啟擴充功能面板
2. 搜尋 **Claude Code**
3. 安裝 **Anthropic** 官方擴充
4. 重啟 VSCode

**三種啟動方式**

| 方式 | 說明 |
|------|------|
| `Cmd+Shift+P` → 輸入 `Claude` | 指令面板 |
| 左側 Activity Bar Claude 圖示 | 側邊面板 |
| 終端機輸入 `claude` | CLI 模式 |

---

<!-- _class: lead -->

# 2.2
## `.claude/` 設定結構

---

# 目錄結構

```
~/.claude/                    ← 全域設定（所有專案生效）
├── settings.json
├── CLAUDE.md
└── skills/

your-project/
└── .claude/                  ← 專案設定（此專案專用）
    ├── settings.json
    └── CLAUDE.md             ← 最重要！
```

---

# CLAUDE.md — 給 AI 的「專案說明書」

每次啟動 Claude Code，**第一件事**就是讀這個檔案

```markdown
## 專案背景
寵物飼料電商前台，Next.js 14 App Router。

## 技術棧
- Framework: Next.js 14（App Router）
- UI: MUI v6
- 語言: TypeScript

## 程式碼規範
- 所有元件使用 Function Component
- 不使用 any，遇到複雜型別先問我

## 禁止事項
- 不要修改 .env 檔案
- 不要直接 commit，讓我確認
```

---

# settings.json — 安全邊界設定

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
  }
}
```

> 控制 Agent **能執行哪些命令**，這是安全邊界，不是限制 AI 智慧

---

# Context 讀取順序

```
1. ~/.claude/CLAUDE.md        全域指令
        ↓
2. .claude/CLAUDE.md          專案指令
        ↓
3. 你在對話中說的話           即時指令
```

後面**優先級較高**，但是**疊加**的，不是取代

---

<!-- _class: lead -->

# 2.3
## 建立 Hello World 專案

---

# 任務：用 Claude Code 建立 Next.js + MUI

```bash
mkdir my-mui-app
cd my-mui-app
claude
```

**對 Claude Code 說：**
```
幫我建立一個 Next.js 14 專案，要求：
- TypeScript + App Router
- 安裝 MUI v6 和相關依賴
- 設定 MUI ThemeProvider
- 建立首頁顯示「Hello, World!」
- 確認 npm run dev 可正常啟動
```

---

# Agent 的工作循環

```
Plan  →  Execute  →  Observe  →  Plan  →  ...
規劃      執行         觀察        重新規劃
```

當 `npm run dev` 出現錯誤：

✅ Claude Code **自己讀取錯誤訊息**
✅ Claude Code **自己修正問題**
✅ **不需要你介入**

> 這就是 Agent 模式的核心價值

---

<!-- _class: lead -->

# 2.4
## 開發寵物飼料品牌形象頁

---

# 品牌：PawFeast 純鮮寵糧

**頁面區塊**

| 區塊 | 內容 |
|------|------|
| 導覽列 | Logo、連結、「立即購買」按鈕 |
| Hero | 大標題、副標題、兩個 CTA、佔位圖 |
| Features | 三個特色卡片 |
| Footer | 版權聲明 |

**主色調**：橙色 `#FF6B35`

---

# 給 AI 的需求

```
開發 PawFeast 寵物飼料品牌形象頁：

1. 導覽列：Logo、頁面連結、「立即購買」按鈕
2. Hero：「給你的毛孩，最純粹的愛」
         「100% 天然食材，獸醫師配方認證」
         兩個 CTA 按鈕
3. Features 三個卡片：
   - 天然食材：人食等級，無防腐劑
   - 獸醫認證：台灣執照獸醫設計配方
   - 新鮮直送：低溫冷鏈，保留最高營養
4. Footer：版權聲明

技術：MUI v6、sx prop、RWD、TypeScript
```

---

# 即時微調技巧

開發過程中，你可以隨時插入指令：

```
「Hero 區塊的標題字體太小，改成 h2 大小」
```

```
「CTA 按鈕改成 outlined 樣式」
```

```
「Features 區塊加上更多 padding，
  卡片之間的間距再大一點」
```

**你是設計師，AI 是執行者**

---

<!-- _class: lead -->

# 🎯 本章實戰練習

---

# 讓 Claude Code 分析專案並撰寫文件

```
請對這個專案進行完整分析，
生成分析文件儲存在 docs/project-analysis.md

包含：
1. 專案架構說明（目錄結構、各目錄用途）
2. 技術棧清單（版本號、用途）
3. 元件清單（Props 列表）
4. 已實作功能
5. 可改進的地方（至少 3 點）
6. 建議的下一步開發項目
```

---

# 加分題

```
再幫我分析這個專案的效能潛在問題，
特別是：
- Next.js Image 優化
- MUI 的 Bundle Size

附上改善建議，補充到
docs/project-analysis.md 的最後
```

**預期產出**：`docs/project-analysis.md`

一份讓下一個接手的工程師能快速理解專案的文件

---

<!-- _class: lead -->

# 下週預告

## Chapter 3
### Claude Code Agent 進階

Plan 模式 + Skill + 自動 GitHub Push 🚀

---

<!-- _class: lead -->

# Q & A
