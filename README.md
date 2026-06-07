<h1 align="center">
  🍅 Dual-Pomo
</h1>

<p align="center">
  <b>Dual-Pomo</b> — 双端番茄工作法计时器
</p>

<p align="center">
  <i>A cross-platform Pomodoro Technique timer. Terminal (Python) + Web (HTML/JS). Zero dependencies. Single file. Ready to run.</i>
</p>

<p align="center">
  <i>跨平台番茄工作法计时工具，终端版 (Python) + Web 版 (HTML/JS)，零依赖，单文件，开箱即用。</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/python-3.6+-blue?logo=python" alt="Python">
  <img src="https://img.shields.io/badge/javascript-ES5-yellow?logo=javascript" alt="JavaScript">
  <img src="https://img.shields.io/badge/html-5-orange?logo=html5" alt="HTML5">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/dependencies-zero-brightgreen" alt="Dependencies">
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
- Dark theme + SVG ring progress — 暗色主题 + SVG 环形进度
- iOS-style segmented control — iOS 风格分段控制器
- **Task Manager** — add / complete / delete tasks, each tracks pomodoro count — 任务管理，关联番茄数
- **Statistics** — 7-day bar chart + today / week / total summary — 7 天柱状图统计
- **Desktop Notification** — browser push notification — 桌面通知
- **Audio Cue** — Web Audio API synthesized finish chime — 合成音效
- **localStorage** persistence — 刷新不丢数据
- XSS-safe rendering + event delegation — XSS 防护 + 事件委托

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

---

## 📁 Project Structure | 项目结构

```
dual-pomo/
├── pomodoro.py          # Terminal edition 终端版
├── pomodoro.html        # Web edition 网页版
└── .pomodoro_data.json  # User data (auto-generated) 使用数据（自动生成）
```

---

## 🔧 Tech Stack | 技术栈

| Layer | Terminal 终端版 | Web 网页版 |
|:---|:---|:---|
| Language 语言 | Python 3 | HTML5 + CSS3 + JavaScript (ES5) |
| Dependencies 依赖 | **Zero** (stdlib only) | **Zero** (no framework) |
| Persistence 持久化 | JSON file | `localStorage` |
| Platform 平台 | Windows / Linux / macOS | All modern browsers |
| Audio 音频 | Terminal bell (`\a`) | Web Audio API |
| Notification 通知 | — | Notifications API |

### Browser Compatibility 浏览器兼容性

Chrome 67+ · Firefox 68+ · Safari 12+ · Edge 79+

---

## 📜 License | 许可证

MIT
