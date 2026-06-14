# 資產 bundle 重複問題 — 收斂 runbook

> 這是 **stopgap**，不是根治。根因在來源 build/部署管線（見最後一節）。

## 症狀
- `assets/` 出現同一邏輯 chunk 的多個變體，檔名把 hash 片段不斷往後疊加，例如：
  - `main-C6k6dQLZ-Dfs4FkN3-biPipN6g-ZuL6FTWX-biPipN6g-ZuL6FTWX-biPipN6g-…js`
  - `modulepreload-polyfill-B5Qt9EMX-ulV_1b7r-…js`（內容其實是 polyfill 被串接重複 5 次）
  - `arsenal-BxbEqz2_-BxbEqz2_-…css`（`BxbEqz2_` 重複 7 次）
- 同一個 `.html` 同時 `<link rel="modulepreload">` / `import` 多個變體 → 重複下載、多份 bundle 各自開機跑 i18n → **切換頁面 / 點功能選單時語系亂跳**（與 `se()` 預設語系未持久化的 bug 疊加，後者已在 bundle 內補上 `localStorage.setItem("9sec_lang",t)` 止血）。

## 受影響的家族與正版（canonical）
每類只保留一個正版，其餘視為孤兒刪除。變體之間多半只差 minifier 變數名（邏輯相同），polyfill 的肥大變體是重複串接、無獨有程式碼，故收斂安全。

| 家族 | 保留的正版檔 |
|---|---|
| `main-*.js` | `main-C6k6dQLZ-Dfs4FkN3-biPipN6g-ZuL6FTWX-biPipN6g-ZuL6FTWX-biPipN6g-ZuL6FTWX-biPipN6g.js` |
| `styles-BxbEqz2*.js` | `styles-BxbEqz2_-Bw8gVkgQ-DBteQM0S-CppWhsn4-DBteQM0S-CppWhsn4-DBteQM0S-CppWhsn4.js` |
| `modulepreload-polyfill*.js` | `modulepreload-polyfill-B5Qt9EMX.js`（乾淨 711B） |
| `arsenal-*.css` | 只有一個檔，名字醜但無重複引用 → 不動 |

## 收斂步驟（部署後若重複檔再生，重跑這套）

1. **盤點**：列出各家族變體、md5/大小，確認哪些是「同內容、不同檔名」、哪些是「內容不同」。內容不同者先 diff 確認只差 minifier 變數名再收斂。
2. **找出內部引用**（關鍵安全步驟）：entry chunk 會在「自己的 JS 內」`import` polyfill/main 的特定變體 URL，例如 `arsenal-DUa3Catr.js`、`services-DUa3Catr.js`、`dmarc-BJIpjZaP.js`、`portal-HITBqz88.js`、`governance-BO6APXLn.js`。**直接刪檔會 404**，必須先把引用全部改成正版。
   ```bash
   for F in assets/*.js; do grep -oE '(main|styles-BxbEqz2|modulepreload-polyfill)[A-Za-z0-9_-]*\.(js)' "$F" | sort -u; done
   ```
3. **字面替換 變體→正版**：在 **所有 `*.html`、`assets/*.js`、`scripts/apply_veris_i18n.py`** 裡，把每個變體檔名整串換成對應正版（用「字面字串」取代，不要用會誤傷的寬鬆 regex）。
   - ⚠️ 一定要包含 `apply_veris_i18n.py`：它**硬編了 6 個 main/styles 變體檔名**，漏改會在下次跑時 `FileNotFoundError`。
4. **去除重複標籤**：替換後 HTML 會出現完全相同的 `<link rel="modulepreload">` / `<link rel="stylesheet">` 行，刪除完全相同的重複行（保留第一個）。
5. **確認無殘留引用再刪檔**：對每個要刪的孤兒檔，`grep -rl <basename> .`（排除 `.git/`）必須為空，才 `rm`。
6. **驗證**：
   - 每頁每家族只剩單一變體（`services.html` 出現 main=2/uniq=1 屬正常：preload 提示 + 實際 `import` 同一 URL）。
   - 無 dangling：所有 `/assets/*.js|css` 都對得到實體檔。
   - 正版與各 entry chunk `node --check` 全過。

## 每次收斂的結果（典型）
- 替換 54 處檔名（10 個 html + 5 個 entry chunk + `apply_veris_i18n.py`）。
- 移除 40 行重複資產標籤。
- 刪除 6 個孤兒檔：main ×2、styles ×2、modulepreload-polyfill ×2。

## 根因（待根治，不在本 repo）
`core/frontend` 只是 build 產物；做 hash/改名/注入的工具在來源 repo 或 CI，**沒有 check in 到這裡**。它每跑一次就：
1. 對已 hash 過的共用 chunk **再 hash，並把新片段接在舊檔名後面**（而非取代）→ 檔名無限疊加；
2. 在 HTML / entry chunk **注入新引用卻不移除舊的** → 同一頁載入多份。

**根治方向**：build 步驟改為冪等——輸出到乾淨目錄、讓 Vite 自己出 hash 與 HTML 引用、不要對已 hash 檔再 hash、以「取代」而非「插入」改寫引用、並清掉舊檔。同時讓 `apply_veris_i18n.py`、`patch-autocti-frontend.js` 這兩個硬編檔名的 post-build patcher 改為動態尋找當前檔名（glob），不要寫死。
