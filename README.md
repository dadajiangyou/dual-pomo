<h1 align="center">
  🍅 Dual-Pomo
</h1>

<p align="center">
  <b>Dual-Pomo</b> — 双端番茄工作法计时器
</p>

<p align="center">
  <i>A three-form Pomodoro timer — Terminal (Python) + Web (HTML/JS) + Desktop (Electron). Cross-platform. Ready to run.</i>
</p>

<p align="center">
  <i>三形态番茄工作法计时器 — 终端版 (Python) + 网页版 (HTML/JS) + 桌面版 (Electron)。跨平台，开箱即用。</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/python-3.6+-blue?logo=python" alt="Python">
  <img src="https://img.shields.io/badge/javascript-ES5-yellow?logo=javascript" alt="JavaScript">
  <img src="https://img.shields.io/badge/html-5-orange?logo=html5" alt="HTML5">
  <img src="https://img.shields.io/badge/electron-33.x-47848f?logo=electron" alt="Electron">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/platform-Win%20%7C%20Linux%20%7C%20macOS-lightgrey" alt="Platform">
</p>

---

## ✨ Features | 功能特性

### ⏱️ Core Timer | 核心计时

| Feature 功能 | Description 说明 |
|:---|:---|
| **Three Modes** 三种模式 | Focus (25 min) / Short Break (5 min) / Long Break (15 min) — 专注 / 短休 / 长休 |
| **Auto-Switch** 自动切换 | After focus → break; every 4th focus → long break — 专注完成自动休息，每 4 轮一次长休 |
| **Precise Timing** 精确计时 | Based on `Date.now()` deltas, immune to browser throttling — 基于时间戳差值，不受浏览器节流影响 |
| **Urgency Warning** 倒计时警告 | Last 10s visual pulse animation + color shift (Web) — 最后 10 秒脉冲动画 + 变红警告 |

### 🖥️ Terminal Edition | 终端版 (`pomodoro.py`)

- Pure Python 3 stdlib — 纯标准库实现
- ANSI color UI with progress bar — 彩色界面 + 进度条
- Keyboard-driven controls — 全键盘操作
- JSON-based data persistence — JSON 文件记录统计数据

### 🌐 Web Edition | Web 版 (`pomodoro.html`)

- Single-file HTML, no build step — 单 HTML 文件，无需构建
- Soft pink/coral theme + glass-morphism cards + SVG ring glow — 软萌粉色主题 + 玻璃拟态卡片 + SVG 环形光晕
- Refined typography (Cormorant Garamond + JetBrains Mono via Google Fonts) — 优雅排版
- Smooth entrance animations + breathing ring effect — 入场动画 + 呼吸光环
- **Task Manager** — add / complete / delete tasks, each tracks pomodoro count — 任务管理，关联番茄数
- **Statistics** — 7-day bar chart + today / week / total summary — 7 天柱状图统计
- **Desktop Notification** — browser push notification — 桌面通知
- **Audio Cue** — Web Audio API synthesized finish chime — 合成音效
- **localStorage** persistence — 刷新不丢数据
- XSS-safe rendering + event delegation — XSS 防护 + 事件委托
- **Browser & Electron compatible** — 同一文件兼容浏览器和桌面端
- 📱 **PWA Support** — Install to Android home screen, full-screen + offline — 支持添加到手机主屏幕，全屏离线运行

### 📱 Mobile PWA | 移动版 (`manifest.json` + `sw.js`)

- Open `pomodoro.html` in Android Chrome → "Add to Home Screen" → native-like app
- Android Chrome 打开 → 点击"添加到主屏幕" → 类原生 App 体验
- Full-screen standalone mode + offline support via Service Worker
- iOS Safari also supports "Add to Home Screen"

### 🖥️ Desktop Edition | 桌面版 (`main.js` + `pomodoro.html`)

- Electron-powered native app — Electron 原生桌面应用
- **System Tray** — minimize to tray, timer status in tooltip + right-click menu — 系统托盘，右键菜单控制
- **Global Shortcuts** — `Ctrl+Shift+Space` toggle, `Ctrl+Shift+R` reset, `Ctrl+Shift+D` show/hide — 全局快捷键
- **Native Notifications** — more reliable than browser notifications — 原生通知，比浏览器通知更可靠
- **Single Instance Lock** — prevents duplicate app windows — 单实例锁
- **Auto-launch** — optional start on system boot — 开机启动
- **Offline Support** — fonts cached after first run — 离线可用
- Same core engine as Web edition (shared `pomodoro.html`) — 与网页版共用核心

---

## 🚀 Quick Start | 快速开始

### Terminal | 终端

```bash
# Requires Python 3.6+
python pomodoro.py
```

| Key | Action |
|:---|:---|
| Space / Enter | Start / Pause 开始/暂停 |
| R | Reset 重置 |
| 1 / 2 / 3 | Switch mode: Focus / Short Break / Long Break 切换模式 |
| Q / Ctrl+C | Quit 退出 |

### Web | 网页

Open `pomodoro.html` directly in any modern browser. No server required.

直接在浏览器中打开即可，无需服务器。

```bash
# Optional: local dev server
python -m http.server 8080
# → http://localhost:8080/pomodoro.html
```

### Desktop | 桌面

```bash
npm install          # First time only 首次安装依赖
npm start            # Run in development 开发运行
npm run build        # Package for distribution 打包安装程序
npm run build:win    # Windows only 仅 Windows
npm run build:mac    # macOS only 仅 macOS
```

| Shortcut | Action |
|:---|:---|
| `Ctrl+Shift+Space` | Start / Pause 开始/暂停 |
| `Ctrl+Shift+R` | Reset 重置 |
| `Ctrl+Shift+D` | Show / Hide window 显示/隐藏 |
| Space / R | In-window shortcuts 窗口内快捷键 |

---

## 📁 Project Structure | 项目结构

```
dual-pomo/
├── pomodoro.py              # Terminal edition 终端版
├── pomodoro.html            # Web / Desktop renderer 网页版 & 桌面版渲染进程
├── manifest.json            # PWA manifest PWA 应用清单
├── sw.js                    # Service Worker 离线缓存
├── main.js                  # Electron main process 桌面版主进程
├── preload.js               # Electron preload script IPC 桥接
├── package.json             # Electron dependencies & build config 依赖与打包配置
├── assets/
│   ├── icon.png             # App icon 桌面图标 (256px)
│   ├── icon-192.png         # PWA icon PWA 图标 (192px)
│   └── icon-512.png         # PWA icon PWA 图标 (512px)
├── scripts/
│   └── generate-icon.js     # Icon generation script 图标生成脚本
└── .pomodoro_data.json      # User data (auto-generated) 终端版使用数据
```

---

## 🔧 Tech Stack | 技术栈

| Layer | Terminal 终端版 | Web 网页版 | Desktop 桌面版 |
|:---|:---|:---|:---|
| Language 语言 | Python 3 | HTML5 + CSS3 + JS (ES5) | Node.js + HTML5 + CSS3 + JS |
| Dependencies 依赖 | **Zero** (stdlib only) | **Zero** (no framework) | Electron + electron-builder |
| Persistence 持久化 | JSON file | `localStorage` | `localStorage` + config file |
| Platform 平台 | Windows / Linux / macOS | All modern browsers | Windows / macOS / Linux |
| Audio 音频 | Terminal bell (`\a`) | Web Audio API | Web Audio API |
| Notification 通知 | — | Notifications API | Native Notification API |

### Browser Compatibility 浏览器兼容性

Chrome 67+ · Firefox 68+ · Safari 12+ · Edge 79+

---

## 📜 License | 许可证

MIT
