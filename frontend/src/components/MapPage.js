import React from 'react';

export default function MapPage() {
  return (
    <section style={{ padding: '40px 10%' }}>
      <h2 style={{ color: 'var(--green)' }}>🗺️ BẢN ĐỒ SÂN CẦU LÔNG KON TUM</h2>
      <div className="map-container">
        <iframe
          title="Bản đồ Kon Tum"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15483.882351793313!2d107.98527014425697!3d14.34950071763078!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31682b1f4f4f4f4f%3A0x0!2zMTTCsDIwJzU4LjIiTiAxMDfCsDU5JzEwLjAiRQ!5e0!3m2!1svi!2s!4v1712345678901!5m2!1svi!2s"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>
      <p>📍 Các sân của chúng tôi nằm tại trung tâm TP Kon Tum. Hãy liên hệ để biết thêm chi tiết.</p>
    </section>
  );
}