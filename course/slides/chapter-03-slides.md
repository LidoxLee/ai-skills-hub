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

### Chapter 3：Claude Code Agent 進階

---

# 本章學習目標

- 掌握 **Plan 模式**，讓 AI 先想再做
- 理解 **Skill** 的概念與結構
- 建立「建立 Skill 的 Skill」
- 用 Skill 完成 **GitHub Push 自動化**

---

<!-- _class: lead -->

# 3.1
## Plan 模式

---

# 為什麼需要 Plan 模式？

一般模式：AI 收到需求 → 立刻動手

**遇到這些情況，要先 Plan：**

- 需求模糊，AI 可能走錯方向
- 改動範圍大，搞錯代價很高
- 你想在 AI 動手前確認思路

---

# 沒有 Plan vs. 有 Plan

```
❌ 沒有 Plan
AI 做了 → 你看到結果 → 發現方向不對
→ 要求重做（浪費 token）

✅ 有 Plan
AI 計畫 → 你確認 → AI 做
→ 更早發現問題 → 減少返工
```

---

# 啟動 Plan 模式

**方法一：在指令中說清楚**
```
請先不要修改任何程式碼，
只告訴我你打算怎麼做，
等我確認後再開始
```

**方法二：VSCode Panel 切換**
在輸入框切換 "Plan" 模式

**方法三：前綴詞**
```
/plan 將 PawFeast 首頁改為深色主題
```

---

# Plan 模式示範

**需求**：首頁改深色主題 + 新增活動區塊

```
我想做以下修改，請先告訴我計畫，不要動程式碼：

1. 整個首頁改為深色主題（背景 #1a1a2e）
2. Features 下方新增「最新活動」區塊，三個活動卡片

請列出：
- 會修改哪些檔案
- 每個檔案的修改內容摘要
- 有沒有潛在問題
```

---

# 確認計畫後執行

```
計畫看起來不錯，但我不想動 theme.ts，
請用 sx prop 在 page.tsx 裡直接設定深色背景。

確認後開始執行。
```

> **你才是最終決策者，AI 只是超強的執行者**

---

<!-- _class: lead -->

# 3.2
## 什麼是 Skill？

---

# Skill 的本質

```
Shell Script = 把一堆命令包成一個腳本

Skill = 把一堆 AI 對話流程包成一個指令
```

重複的工作流程 → 封裝成 Skill → 一個指令搞定

---

# Skill 的結構

```markdown
---
name: commit
description: 建立一個結構良好的 git commit
---

請幫我建立一個 git commit，步驟如下：

1. 執行 git status 查看變更
2. 執行 git diff --staged 查看暫存變更
3. 根據變更起草 Conventional Commits commit message
4. 詢問我確認後再執行 git commit
```

---

# Skill 存放位置

```
~/.claude/skills/           ← 全域（所有專案可用）
  └── commit.md
  └── create-component.md

.claude/skills/             ← 專案（只有此專案）
  └── deploy.md
```

**呼叫方式**
```
/commit

或者：請執行 commit skill
```

---

<!-- _class: lead -->

# 3.3
## 建立「建立 Skill 的 Skill」

---

# 元技能（Meta-Skill）

讓 AI 自己建立新 Skill 的 Skill

**為什麼有用？**
→ 每次想封裝新工作流，不需要自己寫 Markdown
→ 告訴 AI 你要什麼流程，它替你生成 Skill 檔案

---

# 建立 create-skill

```
幫我建立一個全域 Skill：
~/.claude/skills/create-skill.md

功能：當我描述一個工作流程，
它自動生成符合格式的 Skill 檔案並儲存
```

---

# create-skill 內容

```markdown
---
name: create-skill
description: 根據使用者描述，建立新的 Skill 檔案
---

1. 詢問使用者：
   - Skill 的名稱（英文小寫 + 連字號）
   - 要解決的問題
   - 詳細工作流程步驟
   - 全域還是專案層級

2. 生成 Skill 的 Markdown 內容

3. 儲存到對應位置

4. 確認建立，說明如何呼叫
```

---

<!-- _class: lead -->

# 3.4
## GitHub Push Skill

---

# 目標：一個指令完成 Git Push 全流程

**使用 `/create-skill` 建立 `push-to-github`**

```
工作流程：
1. git status 查看變更
2. git diff 查看詳細差異
3. 起草 Conventional Commits message
4. 顯示給我確認，說 ok 才 commit
5. 詢問 push 到哪個 branch
6. 執行 push，遇到 upstream 錯誤自動加 --set-upstream
7. 顯示成功，附上 remote URL
```

---

# Conventional Commits 格式

```
<type>(<scope>): <description>

type 可選：
  feat     新功能
  fix      修 bug
  docs     文件
  style    格式（不影響程式碼邏輯）
  refactor 重構
  test     測試
  chore    其他雜項
```

**範例**
```
feat(hero): 新增 Hero 區塊 CTA 按鈕 hover 效果
fix(navbar): 修正手機版 menu 開啟後無法關閉的問題
```

---

# 測試 push-to-github

對頁面做修改後：
```
/push-to-github
```

觀察 AI 如何：
1. 分析你的改動
2. 起草 commit message
3. **等待你確認**
4. 完成 push

---

<!-- _class: lead -->

# 🎯 本章實戰練習

---

# 建立元件庫管理 Skill

**任務一：建立基礎 UI 元件**

```
在 src/components/ui/ 建立：
- Button.tsx（含 loading 狀態）
- Card.tsx（統一圓角和 shadow）
- Badge.tsx（多顏色變體）

每個元件需要：
- TypeScript Props 型別
- JSDoc 說明
- 使用範例（comment 中）
```

---

# 元件庫管理 Skill

**任務二：建立 `manage-component-library` Skill**

工作流程包含：

1. **新增元件**：在 `src/components/ui/` 建立符合規範的元件
2. **更新文件**：掃描所有元件，更新 `docs/components.md`
3. **健康檢查**：確認所有元件有型別、有 JSDoc、沒有 `any`

---

# 測試元件庫 Skill

```
/manage-component-library

選擇：新增元件
元件名稱：Tag
功能：顯示標籤，支援 color, size, onDelete
```

然後：
```
/manage-component-library

選擇：更新元件文件
```

**預期產出**：`src/components/ui/Tag.tsx` + `docs/components.md`

---

<!-- _class: lead -->

# 下週預告

## Chapter 4
### MCP — 讓 Agent 長出手腳

連接 GitHub、ai-skills-hub，讓 Gemini 也能用你的 Skill 🤝

---

<!-- _class: lead -->

# Q & A
