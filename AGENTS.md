# Portfolio editing preferences

- 新增上传的作品必须优先显示：在所属分类和“全部作品”中都排在已有作品前面；同批图片保留用户上传顺序。
- 新作品在 `dist/assets/projects.json` 中填写 `addedAt`（ISO 8601 时间），以新批次在前排序；同批时间相同以保留输入顺序。不要给旧作品批量补当前时间。
- 保留原图宽高比，生成桌面和手机 WebP 版本；新增案例保留旧案例，不能整类覆盖。
- 修改目录后运行 `python3 scripts/sync-preview.py`，同步网页与本地预览。
- 仅在用户授权发布时更新 GitHub；明确要求本地修改时不发布。

- 此目录是独立的郑州大学版本；发布目标仅为 tianyu319/uno319.github.io。不要覆盖原站 tianyu319/tianyu319.github.io。
