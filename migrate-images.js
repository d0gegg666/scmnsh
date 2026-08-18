// migrate-images.js — 一次性迁移脚本
// 作用：把 data.js 里内嵌的 base64 图片提取成 images/ 目录下的独立文件，
//       并把数据里的 base64 字符串替换为相对路径 images/xxx.jpg。
// 用法：node migrate-images.js
// 说明：纯本地文件操作，不调用 GitHub API、无需 Token；
//       运行后自行 git add images/ data.js version.txt && git commit && git push。

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data.js');
const BACKUP_FILE = path.join(ROOT, 'data.js.bak');
const IMAGES_DIR = path.join(ROOT, 'images');
const VERSION_FILE = path.join(ROOT, 'version.txt');

function decodeBase64Image(b64) {
  // 形如 data:image/jpeg;base64,xxxx
  const comma = b64.indexOf(',');
  const header = b64.slice(0, comma);
  const payload = b64.slice(comma + 1);
  const m = header.match(/data:image\/([^;]+);/);
  let ext = m ? m[1].toLowerCase() : 'jpg';
  if (ext === 'jpeg') ext = 'jpg';
  if (ext === 'svg+xml') ext = 'svg';
  const buffer = Buffer.from(payload, 'base64');
  return { ext, buffer };
}

function walk(node, fn) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { node.forEach((n) => walk(n, fn)); return; }
  for (const k in node) {
    const v = node[k];
    if (typeof v === 'string') fn(node, k, v);
    else if (v && typeof v === 'object') walk(v, fn);
  }
}

function main() {
  // 1. 解析 data.js
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  const m = raw.match(/window\.__CMS_DATA__\s*=\s*(\{[\s\S]*\})/);
  if (!m) { console.error('✗ 无法从 data.js 解析 window.__CMS_DATA__'); process.exit(1); }
  const data = JSON.parse(m[1]);

  // 2. 收集去重后的 base64 图片（以完整 base64 字符串为键，等价于按内容去重）
  const unique = new Map(); // base64 -> true
  walk(data, (_node, _k, v) => {
    if (v.startsWith('data:image/')) unique.set(v, true);
  });
  const list = Array.from(unique.keys());
  console.log(`发现 ${list.length} 张唯一图片`);

  if (list.length === 0) { console.log('没有需要迁移的 base64 图片，退出'); return; }

  // 3. 写入 images/ 并建立 base64 -> 相对路径 映射
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR);
  const map = new Map();
  let written = 0;
  for (const b64 of list) {
    const { ext, buffer } = decodeBase64Image(b64);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
    const filename = `img_${hash}.${ext}`;
    fs.writeFileSync(path.join(IMAGES_DIR, filename), buffer);
    map.set(b64, `images/${filename}`);
    written++;
  }
  console.log(`已写入 ${written} 个图片文件到 images/`);

  // 4. 替换数据中的 base64
  let replaced = 0;
  walk(data, (node, k, v) => {
    if (map.has(v)) { node[k] = map.get(v); replaced++; }
  });
  console.log(`已替换 ${replaced} 处引用`);

  // 5. 备份原 data.js 并重写
  fs.writeFileSync(BACKUP_FILE, raw);
  const header = '// 四川省闽南商会 - 网站数据文件（由管理后台自动生成）\n// 上传此文件到服务器即可更新网站内容\nwindow.__CMS_DATA__ = ';
  const newJs = header + JSON.stringify(data, null, 2) + ';\n';
  fs.writeFileSync(DATA_FILE, newJs);

  // 6. 更新 version.txt（用于缓存破坏）
  fs.writeFileSync(VERSION_FILE, String(Date.now()));

  const beforeKb = Math.round(raw.length / 1024);
  const afterKb = Math.round(newJs.length / 1024);
  console.log('-----------------------------');
  console.log(`data.js 体积：${beforeKb} KB → ${afterKb} KB`);
  console.log(`原文件已备份到：${path.relative(ROOT, BACKUP_FILE)}`);
  console.log('迁移完成。接下来执行：');
  console.log('  git add images/ data.js version.txt');
  console.log('  git commit -m "图片迁移：base64 改为外链文件"');
  console.log('  git push origin main');
}

main();
