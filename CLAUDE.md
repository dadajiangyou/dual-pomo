# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
此文件为 Claude Code 提供项目上下文，方便后续 AI 理解代码库。

## 语言规则

**必须永远使用中文回复。** 所有对话输出、代码注释、commit 信息、README 文档均使用中文。Never use English in responses.

## 项目概览 | Project overview

Dual-Pomo 是一个双形态番茄计时器：终端版（`pomodoro.py`）和网页版（`pomodoro.html`）。
两者都是单文件、零依赖、无需构建即可运行。

Dual-Pomo is a two-form Pomodoro timer: a terminal app (`pomodoro.py`) and a web app (`pomodoro.html`). Both are single-file, zero-dependency, and run without a build step.

## 运行方式 | How to run

```bash
python pomodoro.py            # 终端版 (Python 3.6+)
# pomodoro.html               # 网页版：直接用浏览器打开，无需服务器
python -m http.server 8080    # 可选：启动本地服务器访问网页版
```

无构建步骤，无需安装依赖，无测试。

No build step, no package installation, no tests.

## 架构 | Architecture

- **`pomodoro.py`** — 终端版。纯 Python 标准库实现。跨平台键盘输入：Windows 用 `msvcrt`，Unix 用 `tty` + `select`。ANSI 彩色界面 + 进度条。每日/累计番茄数存到脚本旁边的 `.pomodoro_data.json` 文件中。
- **`pomodoro.html`** — 网页版。HTML + CSS + 原生 JS (ES5)。暗色主题，SVG 环形进度条，任务列表（增删改完成），7 天柱状图统计。所有状态存 `localStorage`，键名前缀 `pomo_`。Web Audio API 合成完成提示音，Notifications API 桌面通知。任务列表使用事件委托，无前端框架。计时器基于 `Date.now()` 差值计算，不受浏览器后台节流影响。
- **数据流** — 两个版本完全独立，不共享数据。Both editions are fully independent; they do not share state.
