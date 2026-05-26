import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import API from '../api';
// Fix leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const BRANCH_COORDINATES = {
  'hn': { name: 'Chi nhánh Hà Nội', lat: 21.0285, lng: 105.8542 },
  'hcm': { name: 'Chi nhánh TP.HCM', lat: 10.8231, lng: 106.6297 },
  'dn': { name: 'Chi nhánh Đà Nẵng', lat: 16.0544, lng: 108.2022 },
  'ct': { name: 'Chi nhánh Cần Thơ', lat: 10.0452, lng: 105.7469 },
  'hp': { name: 'Chi nhánh Hải Phòng', lat: 20.8449, lng: 106.6881 },
  'qn': { name: 'Chi nhánh Quảng Ninh', lat: 20.9500, lng: 107.0500 },
  'nt': { name: 'Chi nhánh Nha Trang', lat: 12.2458, lng: 109.1944 },
  'dl': { name: 'Chi nhánh Đà Lạt', lat: 11.9404, lng: 108.4384 },
  'vt': { name: 'Chi nhánh Vũng Tàu', lat: 10.3460, lng: 107.0843 },
  'bd': { name: 'Chi nhánh Bình Dương', lat: 11.1342, lng: 106.6548 },
  'dni': { name: 'Chi nhánh Đồng Nai', lat: 10.9416, lng: 106.8202 },
  'bn': { name: 'Chi nhánh Bắc Ninh', lat: 21.1861, lng: 106.0763 },
  'th': { name: 'Chi nhánh Thanh Hóa', lat: 19.8070, lng: 105.7766 },
  'na': { name: 'Chi nhánh Nghệ An', lat: 18.6738, lng: 105.6813 },
  'hue': { name: 'Chi nhánh Huế', lat: 16.4637, lng: 107.5909 },
  'pq': { name: 'Chi nhánh Phú Quốc', lat: 10.2899, lng: 103.9840 },
  'kt': { name: 'Chi nhánh Kon Tum', lat: 14.3495, lng: 107.9853 },
};

function MapUpdater({ center, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapPage() {
  const [courtsOnMap, setCourtsOnMap] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedBranch, setSelectedBranch] = React.useState('all');

  React.useEffect(() => {
    const fetchCourts = async () => {
      try {
        const res = await API.get('/courts');
        const courts = res.data.data ?? res.data;
        
        const courtsWithCoords = courts.map((court, index) => {
          const branchId = court.branch || 'kt';
          const info = BRANCH_COORDINATES[branchId];
          if (info) {
            const offsetLat = (Math.random() - 0.5) * 0.1;
            const offsetLng = (Math.random() - 0.5) * 0.1;
            
            return {
              ...court,
              lat: info.lat + offsetLat,
              lng: info.lng + offsetLng,
              branchName: info.name
            };
          }
          return null;
        }).filter(Boolean);

        setCourtsOnMap(courtsWithCoords);
      } catch (err) {
        console.error("Failed to fetch courts for map:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourts();
  }, []);

  const mapCenter = selectedBranch === 'all' 
    ? [16.0544, 108.2022] 
    : [BRANCH_COORDINATES[selectedBranch].lat, BRANCH_COORDINATES[selectedBranch].lng];
  const mapZoom = selectedBranch === 'all' ? 6 : 11;

  return (
    <section style={{ padding: '40px 5%', background: '#f8fafc', minHeight: 'calc(100vh - 80px)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#1e293b', fontSize: '2rem', fontWeight: 800, margin: '0 0 10px 0' }}>🗺️ BẢN ĐỒ HỆ THỐNG SÂN TOÀN QUỐC</h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Hệ thống hàng chục cụm sân thể thao chất lượng cao trải dài khắp Việt Nam</p>
        </div>

        <div className="map-container" style={{ 
          position: 'relative',
          height: '600px', 
          width: '100%', 
          borderRadius: '24px', 
          overflow: 'hidden',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
          border: '4px solid #fff'
        }}>
          {/* Lớp phủ chọn chi nhánh */}
          <div style={{ 
            position: 'absolute', 
            top: '20px', 
            right: '20px', 
            zIndex: 1000, 
            background: 'white', 
            padding: '16px', 
            borderRadius: '12px', 
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)' 
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#1e293b', fontWeight: 700 }}>📍 Tìm sân theo chi nhánh</h4>
            <select 
              value={selectedBranch} 
              onChange={e => setSelectedBranch(e.target.value)}
              style={{ 
                padding: '10px 14px', 
                borderRadius: '8px', 
                border: '1px solid #cbd5e1', 
                width: '220px',
                outline: 'none',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              <option value="all">Tất cả chi nhánh</option>
              {Object.entries(BRANCH_COORDINATES).map(([key, info]) => (
                <option key={key} value={key}>📍 LTV {info.name.replace('Chi nhánh ', '')}</option>
              ))}
            </select>
          </div>

          <MapContainer 
            center={mapCenter}
            zoom={mapZoom} 
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <MapUpdater center={mapCenter} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {!loading && courtsOnMap.map((court, i) => (
              <Marker key={court._id || court.id || i} position={[court.lat, court.lng]}>
                <Popup>
                  <div style={{ padding: '5px', textAlign: 'center', minWidth: '150px' }}>
                    <img src={court.image} alt={court.name} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
                    <h3 style={{ margin: '0 0 5px 0', color: '#2563eb', fontSize: '1rem', fontWeight: 700 }}>{court.name}</h3>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 600, color: '#64748b', fontSize: '0.8rem' }}>📍 {court.branchName}</p>
                    <p style={{ margin: 0, fontWeight: 700, color: '#059669' }}>💰 {court.price?.toLocaleString()}đ/h</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </section>
  );
}