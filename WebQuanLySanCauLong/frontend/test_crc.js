function getCRC16(payload) {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

const amount = "200000";
const original = "00020101021138620010A00000072701320006970454011899MM24170M266382310208QRIBFTTA53037045802VN62190515MOMOW2W26638231";
// We need to insert tag 54 (amount) before tag 58
// Original has: 53 03 704 then 58 02 VN
const amountTag = "54" + amount.length.toString().padStart(2, '0') + amount;
const baseStr = "00020101021138620010A00000072701320006970454011899MM24170M266382310208QRIBFTTA5303704" + amountTag + "5802VN62190515MOMOW2W26638231";
const payloadToHash = baseStr + "6304";
console.log(baseStr + "6304" + getCRC16(payloadToHash));
