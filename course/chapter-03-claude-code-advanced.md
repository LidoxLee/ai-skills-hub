# Chapter 3：Claude Code Agent 進階

> **時長**：約 2 小時 ｜ **週次**：Week 3

---

## 本章目標

- 掌握 Plan 模式，讓 AI 先想再做
- 理解 Skill 的概念與結構
- 建立「建立 Skill 的 Skill」，實現自我增殖的工具庫
- 用 Skill 建立 GitHub 推送工作流

---

## 3.1 使用 Plan 模式修改頁面與需求（理論 + 操作 · 25 min）

### 什麼是 Plan 模式？

一般模式下，Claude Code 收到需求就立刻開始動手。這在小任務很好，但遇到以下情況：

- 需求模糊，AI 可能走錯方向
- 改動範圍大，搞錯代價很高
- 你想在 AI 動手前先確認思路

這時候用 **Plan 模式**：**AI 先提交計畫，等你確認才執行**。

### 啟動 Plan 模式

**方法一：在指令中明確要求**
```
請先不要修改任何程式碼，
只告訴我你打算怎麼做，等我確認後再開始
```

**方法二：使用 `/plan` 指令**（如果有設定）
```
/plan 將 PawFeast 首頁改為深色主題
```

**方法三：在 VSCode Panel 中切換 Plan 模式**
- 在輸入框右側找到模式切換按鈕
- 選擇 "Plan" 而非 "Auto"

### 實際示範：改版首頁

**情境**：PM 說要把首頁改成深色主題，並新增一個「最新活動」區塊

先用 Plan 模式：
```
我想做以下修改，請先告訴我你的計畫，不要動程式碼：

1. 將整個首頁改為深色主題（背景 #1a1a2e，文字白色系）
2. 在 Features 下方新增一個「最新活動」區塊，
   包含三個活動卡片，每個有標題、日期、圖片佔位

請列出：
- 會修改哪些檔案
- 每個檔案的修改內容摘要
- 有沒有潛在問題需要先處理
```

Claude Code 會回傳計畫，你確認後再執行：
```
計畫看起來不錯，但我不想動 theme.ts，
請用 sx prop 的方式在 page.tsx 裡直接設定深色背景。
確認後開始執行。
```

### Plan 模式的價值

```
沒有 Plan 模式                    有 Plan 模式
─────────────────                 ─────────────────
AI 做了 → 你看到結果              AI 計畫 → 你確認 → AI 做
→ 發現方向不對                    → 更早發現問題
→ 要求重做（浪費 token）          → 減少返工
```

---

## 3.2 什麼是 Skill？（理論 · 15 min）

### Skill 的本質

Skill 是一個**可重複呼叫的 AI 指令模板**，讓你把複雜的工作流程封裝成一個指令。

類比：
- Shell Script = 把一堆命令包成一個腳本
- Skill = 把一堆 AI 對話流程包成一個指令

### Skill 的結構

一個 Skill 是一個 Markdown 檔案：

```markdown
---
name: commit
description: 建立一個結構良好的 git commit
---

請幫我建立一個 git commit，步驟如下：

1. 執行 git status 查看變更
2. 執行 git diff --staged 查看暫存的變更
3. 根據變更內容，起草符合 Conventional Commits 規範的 commit message
4. 詢問我是否確認，我確認後再執行 git commit
```

### Skill 的存放位置

```
~/.claude/skills/           # 全域 Skill（所有專案可用）
  └── commit.md
  └── create-component.md

.claude/skills/             # 專案 Skill（只有此專案可用）
  └── deploy.md
```

### 呼叫 Skill

```
/commit

# 或者

請執行 commit skill
```

---

## 3.3 建立第一個 Skill：建立 Skill 的 Skill（實操 · 25 min）

### 概念：元技能（Meta-Skill）

這是一個讓 AI 自己建立新 Skill 的 Skill。聽起來遞迴，但非常實用。

每次你想封裝一個新工作流，不需要自己寫 Markdown——讓 AI 替你寫。

### 建立 `create-skill.md`

對 Claude Code 說：
```
幫我建立一個全域 Skill，儲存在 ~/.claude/skills/create-skill.md

這個 Skill 的功能是：當我描述一個工作流程，
它會自動幫我生成一個符合 Skill 格式的 Markdown 檔案並儲存

Skill 的名稱：create-skill
```

Claude Code 應該生成類似這樣的 Skill：

```markdown
---
name: create-skill
description: 根據使用者描述，建立新的 Skill 檔案
---

## 建立新 Skill 的流程

1. 詢問使用者：
   - Skill 的名稱（用英文小寫和連字號）
   - Skill 要解決的問題是什麼
   - 詳細的工作流程步驟
   - 要放在全域（~/.claude/skills/）還是專案（.claude/skills/）

2. 根據使用者描述，生成 Skill 的 Markdown 內容：
   - frontmatter 包含 name 和 description
   - 清楚的步驟說明
   - 必要時加入範例

3. 將檔案儲存到對應位置

4. 確認 Skill 已建立，並說明如何呼叫它
```

### 測試 create-skill

```
/create-skill

（跟著 AI 的引導，描述你想建立的 Skill）
```

---

## 3.4 使用 create-skill 建立 GitHub Push Skill（實操 · 30 min）

### 目標：一個指令完成 Git Push 全流程

這個 Skill 要做到：
1. 分析改動
2. 生成 commit message（Conventional Commits 格式）
3. 確認後 commit
4. push 到 GitHub
5. 如果是新分支，自動設定 upstream

**對 Claude Code 說：**

```
/create-skill

我要建立一個叫做 push-to-github 的 Skill，
存在全域 ~/.claude/skills/push-to-github.md

工作流程：
1. 執行 git status 查看未暫存的變更
2. 執行 git diff 查看詳細差異
3. 根據差異，用 Conventional Commits 格式起草 commit message
   格式：<type>(<scope>): <description>
   type 可選：feat, fix, docs, style, refactor, test, chore
4. 顯示給我確認，我說 ok 後才執行 git add -A && git commit
5. 詢問要 push 到哪個 branch（預設是當前 branch）
6. 執行 git push，如果有 upstream 錯誤，自動加 --set-upstream origin <branch>
7. 顯示 push 成功，附上 remote URL
```

### 設定 GitHub 連線

確保專案已連接 GitHub：

```bash
# 如果還沒有 remote
git remote add origin https://github.com/你的帳號/my-mui-app.git

# 確認
git remote -v
```

### 測試 push-to-github Skill

對頁面做一點修改，然後：
```
/push-to-github
```

觀察 AI 如何：
- 分析你的改動
- 起草 commit message
- 等待你確認
- 完成 push

---

## 🎯 本章實戰練習

### 題目：建立元件庫管理 Skill

**背景**：真實工作中，前端團隊需要維護一套元件庫，確保元件文件是最新的、元件可以被正確使用。

**任務一：建立一個 UI 元件**

先讓 Claude Code 建立一個可複用元件庫目錄：

```
請在 src/components/ui/ 目錄下建立以下元件：

1. Button.tsx — 擴充 MUI Button，加入 loading 狀態
2. Card.tsx — 擴充 MUI Card，統一圓角和 shadow
3. Badge.tsx — 一個顯示標籤的元件，支援不同顏色變體

每個元件需要：
- TypeScript Props 型別
- JSDoc 說明每個 prop
- 一個簡單的 Storybook-like 使用範例（放在元件檔案的底部 comment 中）
```

**任務二：建立元件庫管理 Skill**

使用 `/create-skill` 建立一個 `manage-component-library` Skill：

工作流程要包含：
1. **新增元件**：詢問元件名稱和功能，自動在 `src/components/ui/` 建立符合規範的元件
2. **更新元件文件**：掃描所有元件，更新 `docs/components.md`，記錄每個元件的 Props 和用法
3. **元件健康檢查**：確認所有元件有型別定義、有 JSDoc、沒有 `any`

**任務三：測試 Skill**

```
/manage-component-library

選擇：新增元件
元件名稱：Tag
功能：顯示標籤，支援 color, size, onDelete 等 props
```

確認元件被建立後：
```
/manage-component-library

選擇：更新元件文件
```

**預期產出**：
- `src/components/ui/Tag.tsx`
- `docs/components.md`（包含所有元件的說明）
- `~/.claude/skills/manage-component-library.md`（Skill 檔案）

---

## 延伸資源

- [Conventional Commits 規範](https://www.conventionalcommits.org/)
- [Claude Code Skills 文件](https://docs.anthropic.com/en/docs/claude-code/skills)

---

*上一章：[Chapter 2 — Claude Code in VSCode](./chapter-02-claude-code-vscode.md)*
*下一章：[Chapter 4 — MCP](./chapter-04-mcp.md)*
