// 生成 Dual-Pomo 应用图标的简单脚本
// 创建一个 256x256 番茄色圆形的 PNG 图标
// 运行: node scripts/generate-icon.js

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// PNG 编码器（纯 JS，无依赖）
function createPNG(width, height, pixels) {
  // PNG 签名
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR 块
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk('IHDR', ihdrData);

  // IDAT 块（图像数据）
  const rawData = Buffer.alloc(height * (1 + width * 4)); // 每行前加 filter byte
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    rawData[rowOffset] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const pixelOffset = y * width + x;
      const srcOff = pixelOffset * 4;
      const dstOff = rowOffset + 1 + x * 4;
      rawData[dstOff] = pixels[srcOff];     // R
      rawData[dstOff + 1] = pixels[srcOff + 1]; // G
      rawData[dstOff + 2] = pixels[srcOff + 2]; // B
      rawData[dstOff + 3] = pixels[srcOff + 3]; // A
    }
  }
  const compressed = zlib.deflateSync(rawData);
  const idat = createChunk('IDAT', compressed);

  // IEND 块
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = crc32(Buffer.concat([typeBuffer, data]));

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuf]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  const table = makeCRCTable();
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const CRC_TABLE = null;
function makeCRCTable() {
  if (CRC_TABLE) return CRC_TABLE;
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

// ── 绘制 ──
const SIZE = 256;
const pixels = Buffer.alloc(SIZE * SIZE * 4, 0);
const cx = SIZE / 2, cy = SIZE / 2, r = SIZE / 2 - 8;

for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const dx = x - cx, dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let rVal, gVal, bVal, alpha;
    if (dist <= r) {
      // 番茄色渐变
      const t = dist / r;
      rVal = 240 + Math.floor(15 * t);
      gVal = 130 - Math.floor(50 * t);
      bVal = 130 - Math.floor(30 * t);
      alpha = 255;
    } else if (dist <= r + 4) {
      // 抗锯齿边缘
      const edgeAlpha = Math.max(0, Math.round(255 * (1 - (dist - r) / 4)));
      const t = 1;
      rVal = 255; gVal = 80; bVal = 100;
      alpha = edgeAlpha;
    } else {
      alpha = 0;
      rVal = gVal = bVal = 0;
    }

    const off = (y * SIZE + x) * 4;
    pixels[off] = rVal;
    pixels[off + 1] = gVal;
    pixels[off + 2] = bVal;
    pixels[off + 3] = alpha;
  }
}

const png = createPNG(SIZE, SIZE, pixels);
const outPath = path.join(__dirname, '..', 'assets', 'icon.png');
fs.writeFileSync(outPath, png);
console.log('Icon generated:', outPath);
