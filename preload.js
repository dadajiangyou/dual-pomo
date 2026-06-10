// Dual-Pomo 预加载脚本 - 安全的 IPC 桥接
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ── 托盘状态同步 ──
  // 渲染进程每 1 秒推送当前计时状态到主进程（用于托盘显示）
  updateTray: (data) => {
    ipcRenderer.send('tray-update', {
      running: data.running,
      timeText: data.timeText,
      mode: data.mode
    });
  },

  // ── 原生通知 ──
  // 使用 Electron 原生 Notification API（比 Web Notification 更可靠）
  notify: (title, body) => {
    ipcRenderer.send('notification', { title, body });
  },

  // ── 快捷键事件 ──
  // 主进程全局快捷键触发时，通知渲染进程执行对应操作
  onShortcut: (callback) => {
    ipcRenderer.on('shortcut', (_event, key) => callback(key));
  },

  // ── 应用配置读写 ──
  getConfig: (key) => ipcRenderer.invoke('get-config', key),
  setConfig: (key, val) => ipcRenderer.invoke('set-config', key, val),

  // ── 开机启动 ──
  setAutoLaunch: (enable) => ipcRenderer.invoke('set-auto-launch', enable),
  getAutoLaunch: () => ipcRenderer.invoke('get-auto-launch'),

  // ── 环境检测 ──
  // 渲染进程可据此判断是否在 Electron 环境运行
  isElectron: true
});
