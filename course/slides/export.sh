#!/bin/bash
# 匯出所有章節投影片

# 確認 Marp CLI 已安裝
if ! command -v marp &> /dev/null; then
  echo "安裝 Marp CLI..."
  npm install -g @marp-team/marp-cli
fi

mkdir -p pdf pptx

for i in 1 2 3 4 5; do
  FILE="chapter-0${i}-slides.md"
  echo "匯出 $FILE..."
  marp "$FILE" --pdf  -o "pdf/chapter-0${i}.pdf"
  marp "$FILE" --pptx -o "pptx/chapter-0${i}.pptx"
done

echo "✅ 匯出完成！PDF 在 pdf/，PPTX 在 pptx/"
