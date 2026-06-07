#!/usr/bin/env python3
"""Terminal Pomodoro Timer — 终端番茄时钟

纯 Python 标准库，零依赖。
Windows: python3 pomodoro.py
Linux/Mac: python3 pomodoro.py

按键
  Space / Enter    开始 / 暂停
  R                重置
  1/2/3            切换模式 (专注/短休/长休)
  Q / Ctrl+C       退出
"""

import os
import sys
import time
import json
import datetime
import platform

# 强制 UTF-8 输出，解决 Windows GBK 终端 emoji 编码问题
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ── 跨平台按键输入 ──────────────────────────────
if platform.system() == 'Windows':
    import msvcrt
    def get_key():
        """非阻塞读键，无按键返回 None"""
        if msvcrt.kbhit():
            ch = msvcrt.getch()
            if ch == b'\r':
                return 'enter'
            if ch == b' ':
                return 'space'
            if ch == b'\x1b':
                return 'escape'
            if ch == b'\x03':
                raise KeyboardInterrupt
            try:
                return ch.decode('utf-8').lower()
            except:
                return None
        return None
else:
    import select
    import tty
    import termios
    def get_key():
        if select.select([sys.stdin], [], [], 0)[0]:
            ch = sys.stdin.read(1)
            if ch == '\x1b':
                return 'escape'
            if ch == '\n':
                return 'enter'
            if ch == ' ':
                return 'space'
            return ch.lower()
        return None

# ── 终端颜色 ────────────────────────────────────
C_RESET   = '\033[0m'
C_BOLD    = '\033[1m'
C_DIM     = '\033[2m'
C_RED     = '\033[91m'
C_GREEN   = '\033[92m'
C_YELLOW  = '\033[93m'
C_BLUE    = '\033[94m'
C_MAGENTA = '\033[95m'
C_CYAN    = '\033[96m'
C_WHITE   = '\033[97m'
C_BGRED   = '\033[41m'
C_BGGREEN = '\033[42m'
C_BGBLUE  = '\033[44m'

def color(c, s):
    return f'{c}{s}{C_RESET}'

# ── 数据持久化 ──────────────────────────────────
DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.pomodoro_data.json')

def load_data():
    try:
        with open(DATA_FILE) as f:
            return json.load(f)
    except:
        return {}

def save_data(data):
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f)
    except:
        pass

# ── 配置 ────────────────────────────────────────
DEFAULT = {
    'focus':       25 * 60,
    'short_break':  5 * 60,
    'long_break':  15 * 60,
    'long_interval': 4,
}

MODE_META = {
    'focus':       {'label': '专  注', 'emoji': '🍅', 'color': C_RED,   'bg': C_BGRED},
    'short_break': {'label': '短休息', 'emoji': '☕', 'color': C_GREEN, 'bg': C_BGGREEN},
    'long_break':  {'label': '长休息', 'emoji': '🎉', 'color': C_BLUE,  'bg': C_BGBLUE},
}

KEY_TO_MODE = {'1': 'focus', '2': 'short_break', '3': 'long_break'}

def bell():
    sys.stdout.write('\a')
    sys.stdout.flush()

# ── 格式化 ──────────────────────────────────────
def fmt_time(seconds):
    m, s = divmod(seconds, 60)
    return f'{m:02d}:{s:02d}'

def fmt_bar(fraction, width=30):
    filled = int(fraction * width)
    bar = '█' * filled + '░' * (width - filled)
    return bar

# ── 绘制界面 ────────────────────────────────────
def get_term_width():
    try:
        return os.get_terminal_size().columns
    except:
        return 80

def clear():
    os.system('cls' if platform.system() == 'Windows' else 'clear')

welcome_shown = False

def draw(frame, key_hint=''):
    global welcome_shown
    if not welcome_shown:
        clear()
        welcome_shown = True

    w = get_term_width()
    meta = MODE_META[frame['mode']]
    c = meta['color']
    bg = meta['bg']

    sys.stdout.write('\033[H\033[J')

    lines = []

    lines.append('')
    lines.append(f"  {meta['emoji']}  {color(C_BOLD, 'POMODORO')} {color(C_DIM, '番茄时钟')}")
    lines.append('')

    fraction = 1 - (frame['remaining'] / frame['total'])
    bar = fmt_bar(fraction, min(w - 10, 50))
    lines.append(f'  {color(c, bar)}  {fmt_time(frame["remaining"])}')
    lines.append('')

    label = meta['label']
    lines.append(f"  {color(bg + C_BOLD, f'  {label}  ')}")

    if frame['mode'] == 'focus':
        interval = frame['long_interval']
        seq = (frame['pomos_completed'] % interval) + 1
        lines.append(f"  {color(C_DIM, f'第 {seq}/{interval} 轮')}")
    else:
        lines.append('')

    lines.append('')

    if frame['running']:
        status = color(C_GREEN, '● 运行中')
    elif not frame['running'] and frame['remaining'] < frame['total']:
        status = color(C_YELLOW, '❚❚ 已暂停')
    else:
        status = color(C_DIM, '○ 待开始')
    lines.append(f'  {status}    已累计: {color(C_BOLD, str(frame["pomos_completed"]))} 个番茄' if frame['mode'] == 'focus' else f'  {status}')

    lines.append('')

    lines.append(f'  {color(C_DIM, key_hint)}')
    lines.append(f'  {color(C_DIM, "[空格]开始/暂停  [R]重置  [1]专注  [2]短休  [3]长休  [Q]退出")}')
    lines.append('')

    today = frame['today_count']
    total = frame['total_count']
    lines.append(f'  {color(C_DIM, f"📊  今日: {today}    总计: {total}")}')
    lines.append('')

    sys.stdout.write('\n'.join(lines))
    sys.stdout.flush()

# ── 主循环 ──────────────────────────────────────
def make_frame(mode, total, remaining, running, pomos_completed, long_interval, today_count, total_count):
    return {
        'mode': mode,
        'total': total,
        'remaining': remaining,
        'running': running,
        'pomos_completed': pomos_completed,
        'long_interval': long_interval,
        'today_count': today_count,
        'total_count': total_count,
    }

def compute_counts(records):
    today = datetime.date.today().isoformat()
    today_count = sum(r.get('count', 0) for r in records if r.get('date') == today)
    total_count = sum(r.get('count', 0) for r in records)
    return today_count, total_count

def main():
    data = load_data()
    settings = data.get('settings', DEFAULT)
    records = data.get('records', [])
    pomos_completed = data.get('pomos_completed', 0)
    today_count, total_count = compute_counts(records)

    mode = 'focus'
    total = settings['focus']
    remaining = total
    running = False
    tick_start = 0.0
    elapsed_before = 0.0

    orig_settings = None
    if platform.system() != 'Windows':
        orig_settings = termios.tcgetattr(sys.stdin)
        tty.setcbreak(sys.stdin)

    try:
        sys.stdout.write('\033[?25l')
        sys.stdout.flush()

        while True:
            frame = make_frame(mode, total, remaining, running,
                               pomos_completed, settings['long_interval'],
                               today_count, total_count)
            draw(frame)

            key = get_key()

            if key:
                if key in ('q', 'escape'):
                    break
                elif key == 'r':
                    running = False
                    remaining = total
                    elapsed_before = 0.0
                elif key in ('space', 'enter'):
                    if running:
                        running = False
                        elapsed_before += time.time() - tick_start
                    else:
                        if remaining <= 0:
                            remaining = total
                        running = True
                        tick_start = time.time()
                elif key in KEY_TO_MODE:
                    mode = KEY_TO_MODE[key]
                    total = settings[mode]
                    remaining = total
                    running = False
                    elapsed_before = 0.0

            if running:
                elapsed = elapsed_before + (time.time() - tick_start)
                new_remaining = max(0, total - int(elapsed))
                if new_remaining != remaining:
                    remaining = new_remaining
                    if remaining <= 0:
                        running = False
                        elapsed_before = 0

                        if mode == 'focus':
                            pomos_completed += 1
                            today = datetime.date.today().isoformat()
                            found = False
                            for r in records:
                                if r['date'] == today:
                                    r['count'] += 1
                                    found = True
                                    break
                            if not found:
                                records.append({'date': today, 'count': 1})
                            data['records'] = records
                            data['pomos_completed'] = pomos_completed
                            save_data(data)
                            today_count, total_count = compute_counts(records)

                            if pomos_completed % settings['long_interval'] == 0:
                                mode = 'long_break'
                                total = settings['long_break']
                            else:
                                mode = 'short_break'
                                total = settings['short_break']
                        else:
                            mode = 'focus'
                            total = settings['focus']

                        remaining = total
                        bell()
                        clear()
                        frame = make_frame(mode, total, remaining, running,
                                           pomos_completed, settings['long_interval'],
                                           today_count, total_count)
                        draw(frame, color(C_YELLOW, '⏰ 时间到! ') + '按空格开始下一轮')

            else:
                time.sleep(0.05)

    except KeyboardInterrupt:
        pass
    finally:
        sys.stdout.write('\033[?25h')
        if orig_settings:
            termios.tcsetattr(sys.stdin, termios.TCSADRAIN, orig_settings)
        clear()
        print(f'{color(C_GREEN, "👋 再见！")}今日完成 {color(C_BOLD, str(today_count))} 个番茄 🍅')
        print()

if __name__ == '__main__':
    main()
