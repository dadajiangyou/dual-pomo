// Dual-Pomo Electron 主进程
const { app, BrowserWindow, Tray, Menu, ipcMain, Notification, globalShortcut, nativeImage, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// ── 配置 ──
const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');
const WINDOW_STATE_PATH = path.join(app.getPath('userData'), 'window-state.json');
const isMac = process.platform === 'darwin';

function loadConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')); } catch(e) { return {}; }
}
function saveConfig(cfg) {
  try { fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), 'utf-8'); } catch(e) {}
}
function loadWindowState() {
  try { return JSON.parse(fs.readFileSync(WINDOW_STATE_PATH, 'utf-8')); } catch(e) { return {}; }
}
function saveWindowState(state) {
  try { fs.writeFileSync(WINDOW_STATE_PATH, JSON.stringify(state, null, 2), 'utf-8'); } catch(e) {}
}

// ── 全局引用 ──
let mainWindow = null;
let tray = null;
let isQuitting = false;

// ── 创建主窗口 ──
function createWindow() {
  const winState = loadWindowState();

  mainWindow = new BrowserWindow({
    width: winState.width || 460,
    height: winState.height || 720,
    x: winState.x,
    y: winState.y,
    minWidth: 400,
    minHeight: 600,
    title: 'Dual-Pomo 番茄时钟',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    show: false,
    frame: true,
    autoHideMenuBar: !isMac,
    backgroundColor: '#fff0f3'
  });

  // 加载应用页面
  mainWindow.loadFile('pomodoro.html');

  // 窗口准备好后再显示（避免白屏闪烁）
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 关闭窗口时隐藏到托盘（而非退出）
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // 记录窗口状态
  mainWindow.on('resize', () => {
    const bounds = mainWindow.getBounds();
    saveWindowState({
      x: bounds.x, y: bounds.y,
      width: bounds.width, height: bounds.height
    });
  });
  mainWindow.on('move', () => {
    const bounds = mainWindow.getBounds();
    saveWindowState({
      x: bounds.x, y: bounds.y,
      width: bounds.width, height: bounds.height
    });
  });

  // 窗口关闭后清理引用
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ── 系统托盘 ──
function createTray() {
  // 创建托盘图标（16x16 小图）
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  let trayIcon;
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      // 回退：创建一个简单的像素图
      trayIcon = nativeImage.createEmpty();
    }
  } catch(e) {
    trayIcon = nativeImage.createEmpty();
  }
  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
  tray.setToolTip('Dual-Pomo 番茄时钟 - 已就绪');

  // 托盘点击：显示/隐藏窗口
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.focus() : mainWindow.show();
    }
  });

  updateTrayMenu(false, '--:--', 'focus');
}

function updateTrayMenu(running, timeText, mode) {
  if (!tray) return;

  const modeLabel = {
    'focus': '专注中',
    'shortBreak': '短休中',
    'longBreak': '长休中'
  };

  const contextMenu = Menu.buildFromTemplate([
    {
      label: running ? `⏱ ${timeText} - ${modeLabel[mode] || '计时中'}` : `🍅 ${timeText} - 就绪`,
      enabled: false
    },
    { type: 'separator' },
    {
      label: running ? '⏸ 暂停' : '▶ 开始',
      click: () => { mainWindow && mainWindow.webContents.send('shortcut', 'Space'); }
    },
    {
      label: '↺ 重置',
      click: () => { mainWindow && mainWindow.webContents.send('shortcut', 'KeyR'); }
    },
    { type: 'separator' },
    {
      label: '显示窗口',
      click: () => { mainWindow && mainWindow.show(); }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip(running ? `Dual-Pomo - ${timeText} ${modeLabel[mode] || ''}` : 'Dual-Pomo 番茄时钟');
}

// ── 应用菜单 ──
function createMenu() {
  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about', label: '关于 Dual-Pomo' },
        { type: 'separator' },
        { role: 'quit', label: '退出' }
      ]
    }] : []),
    {
      label: '文件',
      submenu: isMac
        ? [{ role: 'close', label: '关闭窗口' }]
        : [{ role: 'quit', label: '退出' }]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '刷新' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于 Dual-Pomo',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于 Dual-Pomo',
              message: 'Dual-Pomo 番茄时钟',
              detail: `版本: ${app.getVersion()}\n\n双形态番茄计时器\n🍅 终端版 + 网页版 / 桌面版\n\n专注每一刻，番茄伴你行。`
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ── 单实例锁 ──
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// ── IPC 处理 ──
ipcMain.on('tray-update', (_event, data) => {
  updateTrayMenu(data.running, data.timeText, data.mode);
});

ipcMain.on('notification', (_event, data) => {
  if (Notification.isSupported()) {
    const notif = new Notification({
      title: data.title,
      body: data.body,
      icon: path.join(__dirname, 'assets', 'icon.png'),
      silent: false
    });
    notif.show();
    // 点击通知显示窗口
    notif.on('click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  }
});

ipcMain.handle('get-config', (_event, key) => {
  const config = loadConfig();
  return config[key];
});

ipcMain.handle('set-config', (_event, key, val) => {
  const config = loadConfig();
  config[key] = val;
  saveConfig(config);
  return true;
});

// ── 全局快捷键 ──
function registerShortcuts() {
  // Ctrl+Shift+Space: 开始/暂停
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    if (mainWindow) {
      mainWindow.webContents.send('shortcut', 'Space');
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Ctrl+Shift+R: 重置
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    if (mainWindow) {
      mainWindow.webContents.send('shortcut', 'KeyR');
    }
  });

  // Ctrl+Shift+D: 显示/隐藏窗口
  globalShortcut.register('CommandOrControl+Shift+D', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });
}

// ── 开机启动 ──
function setAutoLaunch(enable) {
  app.setLoginItemSettings({
    openAtLogin: enable,
    path: app.getPath('exe')
  });
}

// 接收渲染进程的自动启动设置
ipcMain.handle('set-auto-launch', (_event, enable) => {
  setAutoLaunch(enable);
  return true;
});
ipcMain.handle('get-auto-launch', () => {
  return app.getLoginItemSettings().openAtLogin;
});

// ── 应用生命周期 ──
app.whenReady().then(() => {
  createWindow();
  createTray();
  createMenu();
  registerShortcuts();

  // macOS: 点击 dock 图标重新创建窗口
  app.on('activate', () => {
    if (!mainWindow) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
});

// 所有窗口关闭时（macOS 不会触发，因为上面监听了 activate）
app.on('window-all-closed', () => {
  if (!isMac) {
    // Windows: 不退出，继续在托盘运行
    // 只有显式退出才会触发 isQuitting
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  globalShortcut.unregisterAll();
});

// 退出前确保完全退出
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
