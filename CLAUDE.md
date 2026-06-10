# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
此文件为 Claude Code 提供项目上下文，方便后续 AI 理解代码库。

## 语言规则

**必须永远使用中文回复。** 所有对话输出、代码注释、commit 信息、README 文档均使用中文。Never use English in responses.

## 输出格式

**每条回复的开头必须带一个 emoji 表情。** 用与内容相关的 emoji，让对话更生动。

## 项目概览 | Project overview

Dual-Pomo 是一个双形态番茄计时器：终端版（`pomodoro.py`）和网页版（`pomodoro.html`）。
两者都是单文件、零依赖、无需构建即可运行。

Dual-Pomo is a two-form Pomodoro timer: a terminal app (`pomodoro.py`) and a web app (`pomodoro.html`). Both are single-file, zero-dependency, and run without a build step.

## 运行方式 | How to run

```bash
# ── 终端版 ──
python pomodoro.py            # Python 3.6+

# ── 网页版 ──
# pomodoro.html               # 直接用浏览器打开，无需服务器
python -m http.server 8080    # 可选：本地服务器

# ── 桌面版（Electron）──
npm install                   # 首次：安装依赖
npm start                     # 开发运行
npm run build                 # 打包为桌面安装程序
npm run build:win             # 仅 Windows
npm run build:mac             # 仅 macOS
```

安装依赖仅桌面版需要（`npm install`）。终端版和网页版零依赖。

Only the desktop app requires `npm install`. Terminal and web editions are zero-dependency.

## 架构 | Architecture

- **`pomodoro.py`** — 终端版。纯 Python 标准库实现。跨平台键盘输入：Windows 用 `msvcrt`，Unix 用 `tty` + `select`。ANSI 彩色界面 + 进度条。每日/累计番茄数存到脚本旁边的 `.pomodoro_data.json` 文件中。
- **`pomodoro.html`** — 网页版 / 桌面版渲染进程。HTML + CSS + 原生 JS (ES5)。软萌粉色主题 + 玻璃拟态卡片 + 圆点纹理背景，SVG 环形进度条（带外发光 + 呼吸动画），任务列表（增删改完成），7 天柱状图统计。Google Fonts 排版（Cormorant Garamond + JetBrains Mono），入场错落动画。所有状态存 `localStorage`，键名前缀 `pomo_`。Web Audio API 合成完成提示音，Notifications API 桌面通知。任务列表使用事件委托，无前端框架。计时器基于 `Date.now()` 差值计算，不受浏览器后台节流影响。**同时兼容浏览器直接打开和 Electron 环境**（通过 `window.electronAPI` 检测）。
- **`main.js`** — Electron 主进程。窗口管理（800x600，关闭时隐藏到托盘），系统托盘（右键菜单+Tooltip），单实例锁，原生通知（IPC 桥接），全局快捷键（Ctrl+Shift+Space 开始/暂停、Ctrl+Shift+R 重置、Ctrl+Shift+D 显示/隐藏），应用菜单，开机启动支持。
- **`preload.js`** — Electron 预加载脚本。通过 `contextBridge` 暴露 `window.electronAPI`：`updateTray()`、`notify()`、`onShortcut()`、`getConfig()`/`setConfig()`、`setAutoLaunch()`/`getAutoLaunch()`。
- **`package.json`** — Electron 项目配置。electron 33.x + electron-builder 25.x 打包，NSIS (Windows) / DMG (macOS) 安装包，electron-updater 自动更新（GitHub Releases）。
- **数据流** — 三个版本完全独立，不共享数据。All editions are fully independent; they do not share state.
