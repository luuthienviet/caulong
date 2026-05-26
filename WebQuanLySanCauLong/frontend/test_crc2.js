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

function generateMoMoQR(amount, message) {
  const amtStr = String(amount);
  const amtTag = "54" + String(amtStr.length).padStart(2, '0') + amtStr;
  
  const msgStr = message.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 50); 
  const msgTag = "08" + String(msgStr.length).padStart(2, '0') + msgStr;
  const originalTag05 = "0515MOMOW2W26638231";
  
  const tag62Content = originalTag05 + msgTag;
  const tag62 = "62" + String(tag62Content.length).padStart(2, '0') + tag62Content;
  
  const baseStr = "00020101021138620010A00000072701320006970454011899MM24170M266382310208QRIBFTTA5303704" + amtTag + "5802VN" + tag62;
  const payloadToHash = baseStr + "6304";
  return payloadToHash + getCRC16(payloadToHash);
}

console.log(generateMoMoQR(200000, "THANHTOAN SAN 07"));
