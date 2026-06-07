# Dual-Pomo — 双端番茄工作法计时器

一个跨平台的番茄工作法（Pomodoro Technique）计时工具，提供 **终端** 和 **Web 网页** 两种使用形态。零依赖、单文件，开箱即用。

## 功能特性

### 核心计时
- **三种模式**：专注（25 分钟）、短休息（5 分钟）、长休息（15 分钟），时长可配置
- **自动切换**：完成专注后自动进入休息；每 4 轮专注触发一次长休息
- **精确计时**：基于 `Date.now()` 差值计算，不受浏览器节流或系统负载影响
- **最后 10 秒警告**：视觉脉冲动画 + 颜色变化（Web 版）

### 终端版 (`pomodoro.py`)
- 纯 Python 3 标准库实现，零第三方依赖
- 跨平台支持：Windows / Linux / macOS
- ANSI 彩色界面 + 进度条 + 实时倒计时
- 键盘控制：空格开始/暂停、R 重置、1/2/3 切换模式、Q 退出
- 数据持久化：JSON 文件记录每日/累计番茄数

### Web 版 (`pomodoro.html`)
- 纯前端单文件 HTML（HTML + CSS + JS），无需构建工具
- 暗色主题 + SVG 环形进度条 + iOS 风格分段控制器
- **任务管理**：添加/删除/完成待办事项，关联番茄计数
- **7 天统计图表**：柱状图展示每日番茄数 + 今日/本周/总计汇总
- **桌面通知**：计时结束浏览器弹窗提醒
- **音频提示**：Web Audio API 合成三连升调完成音效
- `localStorage` 持久化，刷新页面数据不丢失
- XSS 防护 + 事件委托架构

## 快速开始

### 终端版

```bash
# 要求 Python 3.6+
python pomodoro.py
```

| 按键 | 功能 |
|------|------|
| Space / Enter | 开始 / 暂停 |
| R | 重置当前计时 |
| 1 / 2 / 3 | 切换：专注 / 短休 / 长休 |
| Q / Ctrl+C | 退出 |

### Web 版

直接在浏览器中打开 `pomodoro.html` 即可使用，无需服务器。

```bash
# 或者用 Python 快速启动本地服务器
python -m http.server 8080
# 然后访问 http://localhost:8080/pomodoro.html
```

## 项目结构

```
dual-pomo/
├── pomodoro.py        # 终端版番茄钟 (Python)
├── pomodoro.html      # Web 版番茄钟 (HTML + CSS + JS)
└── .pomodoro_data.json  # 终端版使用数据 (自动生成)
```

## 技术要点

|  | 终端版 | Web 版 |
|------|------|------|
| 语言 | Python 3 (标准库) | HTML5 + CSS3 + Vanilla JS (ES5) |
| 依赖 | 无 | 无 |
| 持久化 | JSON 文件 | localStorage |
| 跨平台 | Windows / Linux / macOS | 所有现代浏览器 |
| 音频 | 终端响铃 (`\a`) | Web Audio API 合成音 |
| 通知 | — | Notifications API |

### 浏览器兼容性

所有现代浏览器均支持（Chrome 67+、Firefox 68+、Safari 12+、Edge 79+）。

## License

MIT
