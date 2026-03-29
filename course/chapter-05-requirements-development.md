# Chapter 5：需求分析與開發

> **時長**：約 2 小時 ｜ **週次**：Week 5

---

## 本章目標

- 理解 OpenSpec 的概念與用途
- 用 AI 進行完整的需求分析
- 讓 Claude Code 根據 Spec 開發功能
- 使用 AI 建立 MR 並進行 Code Review

---

## 5.1 OpenSpec 介紹（理論 · 15 min）

### 傳統需求文件的問題

在沒有 AI 的年代，需求文件通常是：

```
Jira Ticket：「使用者可以輸入文字並提交」
↓
工程師自己猜：
- 輸入框要多長？
- 按鈕叫什麼？
- 成功後要做什麼？
- 錯誤狀態呢？
↓
開發完 → PM 說「不是這個意思」→ 重做
```

### OpenSpec 是什麼？

**OpenSpec** 是一種**結構化的需求規格格式**，讓 AI 能夠準確地理解並實作需求。

它的目標：**把模糊的需求轉化為無歧義的開發規格**。

一個好的 OpenSpec 應該包含：

```
1. 功能概述（What）
2. 使用者故事（Who & Why）
3. 互動流程（How - 正常流程）
4. 邊界條件（How - 異常流程）
5. UI 規格（樣式、版面）
6. 驗收標準（Definition of Done）
7. 技術約束（Technical Constraints）
```

### AI 是最好的 Spec 撰寫助手

你提供模糊的需求 → AI 提出澄清問題 → AI 生成完整 Spec → 你確認 → AI 開發

這樣的流程讓你：
- 提前發現需求漏洞
- 減少開發中途的返工
- 留下清楚的決策記錄

---

## 5.2 使用 OpenSpec 分析需求（操作 · 25 min）

### 示範需求：文字展示彈窗

**初始需求（模糊版）：**

```
使用者可以在輸入框輸入文字，
按下按鈕後，用彈窗顯示輸入的內容。
```

就這樣，就這樣而已。

### 讓 AI 生成 OpenSpec

**對 Claude Code 說：**

```
我有一個功能需求如下：

「使用者可以在輸入框輸入文字，按下按鈕後，用彈窗顯示輸入的內容。」

請先扮演資深 PM，提出 5~8 個需要釐清的問題，
然後根據合理的假設回答這些問題，
最後生成一份完整的 OpenSpec 文件，
儲存在 docs/specs/text-display-popup.md
```

**AI 可能提出的澄清問題：**

1. 輸入框有長度限制嗎？
2. 彈窗是 browser 原生 alert 還是自訂彈窗？
3. 輸入為空時，按鈕是 disabled 還是顯示提示？
4. 彈窗關閉後，輸入框要清空嗎？
5. 需要輸入驗證嗎（特殊字元、HTML 注入防護）？

### 生成的 OpenSpec 範例

```markdown
# OpenSpec：文字展示彈窗

## 功能概述
使用者在文字輸入框輸入內容，點擊「顯示」按鈕後，
以 Modal 彈窗呈現輸入的文字內容。

## 使用者故事
作為一位一般使用者，我希望能輸入一段文字並預覽它，
以便確認內容是否正確。

## 互動流程（正常流程）
1. 使用者看到一個文字輸入框和一個「顯示」按鈕
2. 使用者在輸入框輸入文字
3. 使用者點擊「顯示」按鈕
4. 畫面出現 Modal，中央顯示輸入的文字內容
5. Modal 有一個「關閉」按鈕（右上角 X）
6. 使用者點擊「關閉」或點擊 Modal 外部，Modal 消失
7. 輸入框內容保留，不清空

## 邊界條件（異常流程）
- 輸入框為空時：「顯示」按鈕 disabled，游標 hover 顯示 tooltip「請先輸入文字」
- 輸入超過 500 字：截斷顯示，Modal 中顯示「（內容已截斷）」提示
- 輸入含有 HTML 標籤：純文字顯示，不渲染 HTML（XSS 防護）

## UI 規格
- 輸入框：multiline，最小 3 行，最大 8 行，寬度 100%
- 按鈕：MUI Button，variant="contained"，文字「顯示文字」
- Modal：MUI Dialog，置中，最大寬度 sm（600px）
- Modal 標題：「預覽文字」
- Modal 內容：Typography，pre-wrap 保留換行

## 驗收標準
- [ ] 空白輸入時按鈕 disabled
- [ ] 點擊按鈕出現 Modal
- [ ] Modal 正確顯示輸入文字
- [ ] 換行符號正確保留
- [ ] HTML 輸入不渲染
- [ ] 關閉 Modal 後輸入框內容保留
- [ ] 超過 500 字有截斷提示

## 技術約束
- React 18 + TypeScript
- MUI v6 Dialog 元件
- 不使用 window.alert()
```

### 讓 AI 確認 Spec 的完整性

```
請 review 這份 Spec，指出有沒有遺漏的情境或模糊的描述
```

---

## 5.3 對分析完的 Spec 要求 Claude Code 進行開發（操作 · 20 min）

### 從 Spec 到程式碼

```
請根據 docs/specs/text-display-popup.md 的規格，
在 PawFeast 專案中實作這個功能，路徑：
- 主元件：src/components/features/TextDisplayPopup.tsx
- 在首頁加入這個元件，放在 Features 區塊下方

開始前請先確認你完整讀過 Spec，並說明你的實作計畫
```

### 觀察重點

- Claude Code 有沒有**根據 Spec 做完所有驗收標準**？
- 有沒有遺漏邊界條件（空白輸入、超長輸入）？
- 如果有遺漏，你如何讓它補齊？

### 逐一核對驗收標準

開發完成後：
```
請根據 Spec 的驗收標準，逐一確認這些功能是否已實作，
有缺失的請立即補齊
```

---

## 5.4 要求 AI 發送 MR 並進行 AI Code Review（操作 · 20 min）

### 步驟一：建立 Feature Branch

```
請幫我：
1. 建立一個新 branch：feature/text-display-popup
2. 將所有改動 commit，commit message 用 Conventional Commits 格式
3. Push 到 GitHub
```

### 步驟二：建立 Merge Request / Pull Request

透過 GitHub MCP：

```
使用 GitHub MCP，幫我為 feature/text-display-popup 建立一個 PR

PR 資訊：
- 標題：feat: 新增文字展示彈窗功能
- Target branch：main
- 描述要包含：
  - 功能說明
  - 改動的檔案清單
  - 測試方式
  - 螢幕截圖說明（告知 reviewer 要截哪些圖）
  - 對應的 Spec 文件路徑
```

### 步驟三：AI Code Review

讓 Claude Code 自己 Review 自己的程式碼：

```
請對這次 PR 的改動進行 Code Review，
以資深工程師的角度，從以下幾個面向評估：

1. 程式碼品質（可讀性、命名、結構）
2. TypeScript 使用（有無 any、型別是否準確）
3. React 最佳實踐（hooks 使用、re-render 考量）
4. 安全性（XSS 防護是否有效）
5. 可維護性（如果需求改變，容易修改嗎？）
6. 測試覆蓋（哪些情境沒有被測試？）

請用 GitHub PR comment 的格式輸出，
指出具體的行號和修改建議
```

### 步驟四：根據 Review 修正

選取至少一個 Review 意見，要求 Claude Code 修正：

```
根據上面的 Code Review，請修正「安全性」部分的問題，
並更新 PR 描述說明這次修正了什麼
```

---

## 🎯 本章實戰練習

### 題目：地址簿維護功能，從需求到上線

**需求描述（刻意模糊）：**

```
我需要一個地址簿功能，可以管理聯絡人資料。
聯絡人有基本的姓名、電話、地址等資訊。
要能新增、修改、刪除聯絡人。
最好有搜尋功能。
```

**任務流程：**

**Phase 1：需求分析（20 min）**

對 Claude Code 說：
```
我有一個地址簿維護的功能需求（如上），
請扮演 PM，提出 10 個澄清問題，
然後根據合理假設回答，
生成完整的 OpenSpec 儲存在 docs/specs/address-book.md
```

**Phase 2：開發（30 min）**

```
請根據 docs/specs/address-book.md 開發地址簿功能

技術規格：
- 使用 React + TypeScript
- 狀態管理：useState + useReducer（不需要 Redux）
- 資料儲存：localStorage（不需要後端）
- UI：MUI 元件庫
- 路徑：src/components/features/AddressBook/

開始前請先說明你的檔案結構規劃
```

**Phase 3：驗收與修正（10 min）**

```
請根據 OpenSpec 的驗收標準，逐一測試功能，
有缺失的立即修正
```

**Phase 4：MR 與 Code Review（10 min）**

```
1. 建立 branch：feature/address-book
2. Commit 並 Push
3. 建立 PR（附完整描述）
4. 進行 Code Review
5. 修正至少 2 個 Review 意見
```

**最終預期產出：**

- `docs/specs/address-book.md`（完整 OpenSpec）
- `src/components/features/AddressBook/` 目錄，包含：
  - `AddressBook.tsx`（主元件）
  - `ContactCard.tsx`（聯絡人卡片）
  - `ContactForm.tsx`（新增/編輯表單）
  - `SearchBar.tsx`（搜尋列）
  - `types.ts`（型別定義）
  - `useAddressBook.ts`（自訂 Hook）
- GitHub PR，有完整描述和 Code Review 記錄

---

## 課程總結

恭喜你完成「與AI共舞」的課程！

回顧你學到的能力：

```
Week 1  ✅  理解 AI 本質，完成第一次對話
Week 2  ✅  Claude Code + VSCode，建立完整 Next.js 專案
Week 3  ✅  Plan 模式 + Skill，建立可重複使用的工作流
Week 4  ✅  MCP，連接外部服務，讓 AI 真正動起來
Week 5  ✅  從需求分析到 Code Review，完整開發週期
```

### 下一步方向

1. **深化 Skill 庫**：把你重複做的事情都封裝成 Skill
2. **自建 MCP Server**：整合你公司的內部工具（Jira、Confluence、監控）
3. **多模型協作**：Claude 做程式，Gemini 做 Google 服務整合，各取所長
4. **AI-First 工作流**：從收到需求的那一刻開始，就讓 AI 參與

---

*上一章：[Chapter 4 — MCP](./chapter-04-mcp.md)*
*回到課程總覽：[README](./README.md)*
