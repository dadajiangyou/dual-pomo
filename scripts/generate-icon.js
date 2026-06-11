// Dual-Pomo 粉色主题图标生成器
// 用法: node scripts/generate-icon.js [size] [output-name]
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; ihdrData[9] = 6; ihdrData[10] = 0; ihdrData[11] = 0; ihdrData[12] = 0;
  const ihdr = createChunk('IHDR', ihdrData);

  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOff = y * (1 + width * 4);
    rawData[rowOff] = 0;
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = rowOff + 1 + x * 4;
      rawData[dst] = pixels[src];
      rawData[dst + 1] = pixels[src + 1];
      rawData[dst + 2] = pixels[src + 2];
      rawData[dst + 3] = pixels[src + 3];
    }
  }
  return Buffer.concat([signature, ihdr, createChunk('IDAT', zlib.deflateSync(rawData)), createChunk('IEND', Buffer.alloc(0))]);
}

function createChunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const tb = Buffer.from(type, 'ascii');
  const crc = crc32(Buffer.concat([tb, data]));
  const cb = Buffer.alloc(4); cb.writeUInt32BE(crc >>> 0, 0);
  return Buffer.concat([len, tb, data, cb]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  const table = makeTable();
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

let _table = null;
function makeTable() {
  if (_table) return _table;
  _table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) { let c = i; for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1); _table[i] = c; }
  return _table;
}

function blend(r1, g1, b1, a1, r2, g2, b2, a2) {
  const a = a1 + a2 * (1 - a1 / 255);
  if (a === 0) return [0, 0, 0, 0];
  return [
    Math.round((r1 * a1 / 255 + r2 * a2 / 255 * (1 - a1 / 255)) / (a / 255)),
    Math.round((g1 * a1 / 255 + g2 * a2 / 255 * (1 - a1 / 255)) / (a / 255)),
    Math.round((b1 * a1 / 255 + b2 * a2 / 255 * (1 - a1 / 255)) / (a / 255)),
    Math.round(a)
  ];
}

// ── 绘制粉色番茄图标 ──
const SIZE = parseInt(process.argv[2]) || 256;
const OUTNAME = process.argv[3] || 'icon';
const pixels = Buffer.alloc(SIZE * SIZE * 4, 0);
const cx = SIZE / 2, cy = SIZE / 2;
const r = SIZE / 2 * 0.82; // 主体半径
const padding = SIZE * 0.04;

// 颜色定义（匹配 Dual-Pomo 主题）
const bgR = 0xf0, bgG = 0x98, bgB = 0x98;       // 主粉 #f09898
const bgR2 = 0xe0, bgG2 = 0x78, bgB2 = 0x78;     // 深粉 #e07878
const leafR = 0x7e, leafG = 0xc0, leafB = 0x9a;   // 薄荷绿 #7ec09a
const whiteR = 0xff, whiteG = 0xff, whiteB = 0xff;

for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const dx = x - cx, dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const off = (y * SIZE + x) * 4;

    if (dist <= r - padding) {
      // 主体的渐变：从上到下由浅粉到深粉
      const t = (dy / r + 1) / 2; // 0(上) → 1(下)
      const rr = Math.round(bgR + (bgR2 - bgR) * t * 0.6);
      const gg = Math.round(bgG + (bgG2 - bgG) * t * 0.6);
      const bb = Math.round(bgB + (bgB2 - bgB) * t * 0.6);
      pixels[off] = rr; pixels[off + 1] = gg; pixels[off + 2] = bb; pixels[off + 3] = 255;
    } else if (dist <= r + 3) {
      // 抗锯齿边缘
      const edgeT = Math.max(0, Math.min(1, (dist - (r - padding)) / (padding + 3)));
      const alpha = Math.round(255 * (1 - edgeT));
      const t = (dy / r + 1) / 2;
      const rr = Math.round(bgR + (bgR2 - bgR) * t * 0.6);
      const gg = Math.round(bgG + (bgG2 - bgG) * t * 0.6);
      const bb = Math.round(bgB + (bgB2 - bgB) * t * 0.6);
      pixels[off] = rr; pixels[off + 1] = gg; pixels[off + 2] = bb; pixels[off + 3] = alpha;
    }
  }
}

// ── 画"P"字母（白色，居中）──
const fontSize = SIZE * 0.45;
const charW = fontSize * 0.58;
const charH = fontSize;
const startX = Math.round(cx - charW / 2);
const startY = Math.round(cy - charH / 2);

// 简单的P字母位图（描到像素格）
const pData = [
  " ███  ",
  " █  █ ",
  " █  █ ",
  " ███  ",
  " █    ",
  " █    ",
  " █    ",
];

const cellW = Math.round(charW / 6);
const cellH = Math.round(charH / 7);

for (let py = 0; py < 7; py++) {
  for (let px = 0; px < 6; px++) {
    if (pData[py][px] === '█') {
      const px0 = startX + px * cellW;
      const py0 = startY + py * cellH;
      for (let y = py0; y < py0 + cellH && y < SIZE; y++) {
        for (let x = px0; x < px0 + cellW && x < SIZE; x++) {
          if (x >= 0 && y >= 0) {
            const off = (y * SIZE + x) * 4;
            // 只在圆形内部画
            const dx2 = x - cx, dy2 = y - cy;
            if (Math.sqrt(dx2 * dx2 + dy2 * dy2) <= r - padding) {
              // 白色半透明
              pixels[off] = 255;
              pixels[off + 1] = 255;
              pixels[off + 2] = 255;
              pixels[off + 3] = 210;
            }
          }
        }
      }
    }
  }
}

// ── 顶部小叶子 ──
const leafSize = SIZE * 0.22;
const leafCx = cx + SIZE * 0.02;
const leafCy = cy - r + SIZE * 0.08;
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const dx = x - leafCx, dy = y - leafCy;
    // 椭圆叶子
    const ex = dx / (leafSize * 0.5), ey = dy / (leafSize * 0.6);
    const eDist = Math.sqrt(ex * ex + ey * ey);
    if (eDist <= 1.1 && dy < leafSize * 0.2) {
      const off = (y * SIZE + x) * 4;
      const alpha = eDist > 1 ? Math.round(255 * (1 - (eDist - 1) / 0.1)) : 255;
      const [cr, cg, cb, ca] = blend(
        pixels[off], pixels[off + 1], pixels[off + 2], pixels[off + 3],
        leafR, leafG, leafB, Math.min(alpha, 230)
      );
      pixels[off] = cr; pixels[off + 1] = cg; pixels[off + 2] = cb; pixels[off + 3] = ca;
    }
  }
}

// 输出
const png = createPNG(SIZE, SIZE, pixels);
const outPath = path.join(__dirname, '..', 'assets', OUTNAME + '.png');
fs.writeFileSync(outPath, png);
console.log('✓ ' + OUTNAME + '.png (' + SIZE + 'x' + SIZE + ')');
