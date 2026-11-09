# 张天宇 · 个人视觉设计网站

基于 8B Design Studio 模板，采用橙色主题。

页面源文件与部署文件均为 `dist/index.html`，CSS 和 JavaScript 内嵌。图片位于 `dist/assets/`。无需安装依赖或构建。

本地预览：`python3 -m http.server 4173 --directory dist`

保留模板的滚动动画；首页模板配图为示意；作品案例页已导入网站所有者提供的作品素材。个人照片与标志同样由网站所有者提供。

模板来源：https://github.com/8bsite/design-studio-website-template
许可与图片来源见 LICENSE、CREDITS.md。

## 作品案例页

`dist/works.html` 为作品浏览页。样式和交互分别位于 `dist/assets/works.css`、`dist/assets/works.js`。

案例内容在 `dist/assets/projects.json` 中管理：id 为唯一英文标识，category 可选 poster / commerce / brand / local / packaging / illustration / social；title、image、focus、description 分别对应标题、图片、设计方向与案例说明。替换真实作品时，同时更新页面和弹窗中的示意声明，保留尚未替换素材的明确标注。

## 免费 GitHub Pages 托管

仓库为 tianyu319/uno，使用 GitHub Actions 部署 GitHub Pages。推送 main 分支后自动发布 dist/，同时保留根路径与 /tianyu/ 路径。网站地址：https://tianyu319.github.io/uno/。

该版本已将字体改为本地资源。不包含 Sites 内部项目配置、Git 历史、凭据或令牌。GitHub Pages 的大陆访问质量需上线后实测，不能保证所有运营商均稳定访问。

## 手机图片优化

首页与作品页在899px及以下屏幕宽度时通过picture/source加载640px宽的WebP版本（quality 68），桌面端继续使用原图；作品大图查看保留原始图片。资源位于dist/assets/mobile/，清单与体积统计在manifest.json。更新图片后运行python3 scripts/build-mobile-images.py，再运行python3 scripts/sync-preview.py。

## 音乐播放与管理

网站只提供右下角的播放、暂停与歌单控制，与顶部按钮右边缘对齐。打开页面时尝试有声自动播放；浏览器拦截时，在首次页面交互或点击播放按钮后开始。原music.html管理入口已关闭并返回首页；没有公开文件选择、试听或上传入口。

仅通过GitHub仓库管理歌曲：上传音频到dist/assets/music/并提交，Pages工作流运行scripts/build-music-library.py生成歌单。需要仓库编辑权限。删除对应音频并提交即可移除歌曲。

本地预览前运行python3 scripts/build-music-library.py同步内嵌歌单。HTTP/HTTPS 下的站内页面切换在独立内容层中完成，顶层播放器和音频元素持续保留，切页不重建播放器。支持分类深链接、返回首页锚点及浏览器前进后退。直接双击HTML时使用普通页面导航。

## 独立副本部署

本仓库发布到 https://tianyu319.github.io/uno/ 。页面、文案、作品目录与脚本独立保存；部署时从原站固定提交 a48a85dfe11f87eacaf41a2826b40fabf1098acf 只读补齐尚未单独上传的图片、字体和音乐。不会向 main 回写文件。后续新增到本仓库同名路径的素材优先保留。完整离线文件保存在本地同名项目目录。
