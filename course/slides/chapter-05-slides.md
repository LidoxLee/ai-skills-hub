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

### Chapter 5：需求分析與開發

---

# 本章學習目標

- 理解 **OpenSpec** 的概念與用途
- 用 AI 進行**完整的需求分析**
- 讓 Claude Code 根據 Spec **開發功能**
- 使用 AI **建立 MR 並進行 Code Review**

---

<!-- _class: lead -->

# 5.1
## OpenSpec 是什麼？

---

# 傳統需求文件的問題

```
Jira Ticket：「使用者可以輸入文字並提交」

工程師自己猜：
  - 輸入框要多長？
  - 按鈕叫什麼？
  - 成功後要做什麼？
  - 錯誤狀態呢？

開發完 → PM 說「不是這個意思」→ 重做 😭
```

---

# OpenSpec 的目標

把**模糊的需求**轉化為**無歧義的開發規格**

```
一個好的 OpenSpec 包含：

1. 功能概述（What）
2. 使用者故事（Who & Why）
3. 互動流程（How - 正常流程）
4. 邊界條件（How - 異常流程）
5. UI 規格
6. 驗收標準（Definition of Done）
7. 技術約束
```

---

# AI 是最好的 Spec 撰寫助手

```
你提供模糊需求
    ↓
AI 提出澄清問題
    ↓
AI 生成完整 Spec
    ↓
你確認
    ↓
AI 開發
```

**提前發現需求漏洞，減少開發中途返工**

---

<!-- _class: lead -->

# 5.2
## 使用 OpenSpec 分析需求

---

# 示範需求（刻意模糊版）

```
使用者可以在輸入框輸入文字，
按下按鈕後，用彈窗顯示輸入的內容。
```

就這樣。就這樣而已。

---

# 讓 AI 生成 OpenSpec

```
我有一個功能需求：

「使用者可以在輸入框輸入文字，
  按下按鈕後，用彈窗顯示輸入的內容。」

請先扮演資深 PM，提出 5~8 個澄清問題，
然後根據合理假設回答，
最後生成完整的 OpenSpec，
儲存在 docs/specs/text-display-popup.md
```

---

# AI 會問的澄清問題

1. 輸入框有長度限制嗎？
2. 彈窗是 browser 原生 alert 還是自訂 Modal？
3. 輸入為空時，按鈕 disabled 還是顯示提示？
4. 彈窗關閉後，輸入框要清空嗎？
5. 需要防止 HTML 注入嗎？
6. 要支援換行符號嗎？
7. 手機版有特殊需求嗎？

---

# 生成的 OpenSpec

```markdown
## 邊界條件
- 輸入為空：按鈕 disabled，hover 顯示 tooltip
- 超過 500 字：截斷顯示，附上提示
- 含有 HTML 標籤：純文字顯示（XSS 防護）

## 驗收標準
- [ ] 空白輸入時按鈕 disabled
- [ ] 點擊按鈕出現 Modal
- [ ] Modal 正確顯示輸入文字
- [ ] 換行符號正確保留
- [ ] HTML 輸入不渲染
- [ ] 關閉 Modal 後輸入框內容保留
- [ ] 超過 500 字有截斷提示
```

---

<!-- _class: lead -->

# 5.3
## 根據 Spec 開發

---

# 從 Spec 到程式碼

```
請根據 docs/specs/text-display-popup.md 的規格，
實作這個功能：

- 主元件：src/components/features/TextDisplayPopup.tsx
- 在首頁的 Features 下方加入此元件

開始前請確認你完整讀過 Spec，
並說明你的實作計畫
```

---

# 觀察重點

- Claude Code 有沒有**根據 Spec 做完所有驗收標準**？
- 有沒有遺漏邊界條件？
- 如果有遺漏，你如何讓它補齊？

**開發完成後：**
```
請根據 Spec 的驗收標準，逐一確認功能是否實作，
有缺失的請立即補齊
```

---

<!-- _class: lead -->

# 5.4
## AI 建立 MR 與 Code Review

---

# 步驟一：建立 Feature Branch

```
請幫我：
1. 建立新 branch：feature/text-display-popup
2. 將所有改動 commit（Conventional Commits 格式）
3. Push 到 GitHub
```

---

# 步驟二：建立 PR

透過 GitHub MCP：

```
使用 GitHub MCP，幫我建立一個 PR：

標題：feat: 新增文字展示彈窗功能
Target branch：main

PR 描述包含：
- 功能說明
- 改動的檔案清單
- 測試方式
- 對應的 Spec 文件路徑
```

---

# 步驟三：AI Code Review

```
請對這次 PR 進行 Code Review，
以資深工程師角度評估：

1. 程式碼品質（可讀性、命名、結構）
2. TypeScript 使用（有無 any）
3. React 最佳實踐（hooks、re-render）
4. 安全性（XSS 防護是否有效）
5. 可維護性
6. 測試覆蓋

請用 GitHub PR comment 格式輸出，
指出具體行號和修改建議
```

---

# 步驟四：根據 Review 修正

選取至少一個 Review 意見：

```
根據 Code Review，
請修正「安全性」部分的問題，
並更新 PR 描述說明這次修正了什麼
```

---

<!-- _class: lead -->

# 🎯 本章實戰練習

---

# 地址簿維護功能

**需求（刻意模糊）：**

```
我需要一個地址簿功能，可以管理聯絡人資料。
聯絡人有基本的姓名、電話、地址等資訊。
要能新增、修改、刪除聯絡人。
最好有搜尋功能。
```

---

# Phase 1：需求分析

```
我有一個地址簿維護需求（如上），
請扮演 PM，提出 10 個澄清問題，
根據合理假設回答，
生成完整 OpenSpec 到
docs/specs/address-book.md
```

---

# Phase 2：開發

```
請根據 OpenSpec 開發地址簿功能

技術規格：
- React + TypeScript
- 狀態：useState + useReducer
- 資料：localStorage（不需後端）
- UI：MUI 元件庫
- 路徑：src/components/features/AddressBook/

開始前請說明你的檔案結構規劃
```

---

# 預期檔案結構

```
src/components/features/AddressBook/
├── AddressBook.tsx     主元件
├── ContactCard.tsx     聯絡人卡片
├── ContactForm.tsx     新增/編輯表單
├── SearchBar.tsx       搜尋列
├── types.ts            型別定義
└── useAddressBook.ts   自訂 Hook
```

---

# Phase 3 + 4：驗收與 MR

**Phase 3：驗收**
```
根據 OpenSpec 驗收標準逐一測試，
有缺失立即修正
```

**Phase 4：MR 與 Code Review**
```
1. 建立 branch：feature/address-book
2. Commit + Push
3. 建立 PR（附完整描述）
4. 進行 Code Review
5. 修正至少 2 個 Review 意見
```

---

<!-- _class: lead -->

# 課程總結

---

# 五週學習成果

| 週 | 成就 |
|----|------|
| Week 1 | 理解 AI 本質，完成第一次對話 ✅ |
| Week 2 | Claude Code + VSCode，完整 Next.js 專案 ✅ |
| Week 3 | Plan 模式 + Skill，可重複工作流 ✅ |
| Week 4 | MCP，連接外部服務 ✅ |
| Week 5 | 完整開發週期，從需求到 Code Review ✅ |

---

# 下一步方向

1. **深化 Skill 庫** — 把重複的事都封裝成 Skill
2. **自建 MCP Server** — 整合公司內部工具
3. **多模型協作** — Claude 做程式，Gemini 做 Google 服務
4. **AI-First 工作流** — 從需求開始就讓 AI 參與

> 歡迎回來，浪就在這裡 🌊

---

<!-- _class: lead -->

# 恭喜完成課程！

## 與 AI 共舞 — 萬能的小幫手

你已經準備好和 AI 一起工作了 🎉

---

<!-- _class: lead -->

# Q & A
