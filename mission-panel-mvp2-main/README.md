# 任務面板 MVP｜修正版 v1.1（可直接佈署到 GitHub Pages）

## 結構
```
api/
assets/
scripts/
  util.js
styles/
  main.css
tasks/
  core.json
  daily.json
app.js
index.html
README.md
```

## 本地啟動（或 GitHub Pages）
- 直接打開 `index.html`（Chrome 建議以本機伺服器開啟以避免部分瀏覽器阻擋 `fetch` 檔案）。
- 也可推到 GitHub，開啟 GitHub Pages（Branch: `main`、資料夾：`/`）。
- 所有資料（玩家進度、語言、金幣、卡片）都存於 `localStorage`（鍵：`one_prof_mvp_v04_math_fix`）。

## 功能說明
- 「角色介面」已合併上傳功能；可選擇圖片套用或清除。
- 任務資料從 `tasks/core.json`（核心任務）與 `tasks/daily.json`（日常任務）載入。
- 支援中/英文切換。
- 雷達圖已向右位移，避免英文覆蓋。