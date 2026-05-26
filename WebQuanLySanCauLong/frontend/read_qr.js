const fs = require('fs');
const PNG = require('pngjs').PNG;
const jsQR = require('jsqr');

const buffer = fs.readFileSync('public/momo-qr.png');
const png = PNG.sync.read(buffer);
const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);

if (code) {
  console.log("Found QR code", code.data);
} else {
  console.log("No QR code found.");
}
