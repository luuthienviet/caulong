import { useMemo, useState } from 'react';
import API from '../../api';

const fmtCurrency = (v) => (v || 0).toLocaleString('vi-VN') + ' VNĐ';
const fmtDateTime = (v) => { if (!v) return '—'; const d = new Date(v); return isNaN(d) ? v : d.toLocaleString('vi-VN', { hour12: false }); };
const fmtDate = (v) => { if (!v) return ''; const d = new Date(v); return isNaN(d) ? v : d.toISOString().slice(0, 10); };
const methodLabel = (m) => { if (!m) return 'Chưa rõ'; const l = m.toLowerCase(); if (l.includes('cash') || l.includes('tại sân') || l.includes('tiền mặt')) return 'Tiền mặt'; return 'Chuyển khoản'; };
const mapStatus = (b) => { if (b.status === 'rejected') return 'failed'; if (b.paymentStatus === 'paid' || b.paymentStatus === 'remaining_paid') return 'success'; if (b.paymentStatus === 'deposit_sent') return 'bill_sent'; return 'processing'; };
const STATUS_CFG = {
  success:    { label: 'Đã thanh toán', bg: '#dcfce7', color: '#15803d' },
  bill_sent:  { label: 'Có ảnh bill',   bg: '#dbeafe', color: '#1d4ed8' },
  processing: { label: 'Chờ xử lý',    bg: '#fef9c3', color: '#a16207' },
  failed:     { label: 'Thất bại',      bg: '#fee2e2', color: '#b91c1c' },
};

const printInvoice = (b) => {
  const html = `<html><head><title>Hóa đơn</title><style>body{font-family:Arial;padding:32px}table{width:100%;border-collapse:collapse;margin-top:20px}td,th{padding:10px 0;border-bottom:1px solid #e5e7eb}</style></head><body>
  <h1>Hóa đơn thanh toán</h1><div>Mã: ${b._id}</div><div>Khách: ${b.userId?.username||b.customerName||'Khách'}</div><div>SĐT: ${b.userId?.phone||b.customerPhone||'—'}</div>
  <table><tr><th>Thông tin</th><th>Giá trị</th></tr><tr><td>Sân</td><td>${b.courtName||'—'}</td></tr><tr><td>Ngày</td><td>${b.date||'—'}</td></tr><tr><td>Giờ</td><td>${b.hour?b.hour+':00':'—'} (${b.duration||1}h)</td></tr><tr><td><b>Tổng</b></td><td><b>${fmtCurrency(b.total)}</b></td></tr></table>
  </body></html>`;
  const w = window.open('', '_blank'); if (!w) return;
  w.document.write(html); w.document.close(); w.focus(); w.print();
};

function BillModal({ src, onClose }) {
  if (!src) return null;
  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,.75)',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#fff',borderRadius:20,padding:20,maxWidth:'90vw',maxHeight:'90vh',overflow:'auto',position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute',top:10,right:10,background:'#ef4444',color:'#fff',border:'none',borderRadius:'50%',width:30,height:30,cursor:'pointer',fontWeight:900,fontSize:16 }}>✕</button>
        <div style={{ fontWeight:700,marginBottom:12 }}>🧾 Ảnh bill thanh toán</div>
        <img src={src} alt="Ảnh bill" style={{ maxWidth:480,maxHeight:680,borderRadius:12,display:'block' }} />
        <div style={{ marginTop:10,textAlign:'center' }}>
          <a href={src} download="anh-bill.png" style={{ display:'inline-block',background:'#4361ee',color:'#fff',padding:'8px 20px',borderRadius:10,fontWeight:700,textDecoration:'none',fontSize:'0.85rem' }}>⬇ Tải ảnh</a>
        </div>
      </div>
    </div>
  );
}

function CancelModal({ bookingId, customerName, onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    if (!reason.trim()) { alert('Vui lòng nhập lý do hủy!'); return; }
    setLoading(true);
    await onConfirm(bookingId, reason.trim());
    setLoading(false);
    onClose();
  };
  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,.55)',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#fff',borderRadius:20,padding:'28px 32px',width:440,maxWidth:'90vw',boxShadow:'0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ fontSize:'1.5rem',marginBottom:8 }}>❌</div>
        <h3 style={{ margin:'0 0 4px',fontWeight:800,color:'#0f172a' }}>Hủy yêu cầu thanh toán</h3>
        <p style={{ color:'#64748b',fontSize:'0.85rem',margin:'0 0 18px' }}>
          Khách hàng <strong style={{ color:'#0f172a' }}>{customerName}</strong> sẽ nhận thông báo với lý do bên dưới.
        </p>
        <label style={{ fontWeight:700,fontSize:'0.82rem',color:'#334155',display:'block',marginBottom:6 }}>Lý do từ chối *</label>
        <textarea
          value={reason} onChange={e=>setReason(e.target.value)} autoFocus rows={3}
          placeholder="Ví dụ: Ảnh bill không hợp lệ, số tiền không khớp, ảnh mờ không rõ..."
          style={{ width:'100%',border:'1.5px solid #e2e8f0',borderRadius:12,padding:'10px 14px',fontSize:'0.85rem',fontFamily:'inherit',resize:'vertical',outline:'none',boxSizing:'border-box' }}
          onFocus={e=>e.target.style.borderColor='#ef4444'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}
        />
        <div style={{ display:'flex',gap:10,marginTop:18 }}>
          <button onClick={onClose} style={{ flex:1,background:'#f1f5f9',color:'#64748b',border:'none',borderRadius:10,padding:'10px',fontWeight:700,cursor:'pointer' }}>Quay lại</button>
          <button onClick={handleSubmit} disabled={loading||!reason.trim()}
            style={{ flex:1,background:loading||!reason.trim()?'#fca5a5':'linear-gradient(135deg,#ef4444,#b91c1c)',color:'#fff',border:'none',borderRadius:10,padding:'10px',fontWeight:700,cursor:'pointer',boxShadow:'0 4px 12px rgba(239,68,68,.3)' }}>
            {loading ? '⏳ Đang xử lý...' : '❌ Xác nhận hủy'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ b, onApprove, onViewBill, onCancel }) {
  const st = mapStatus(b);
  const cfg = STATUS_CFG[st];
  const customerName = b.userId?.username || b.customerName || 'Khách';
  const row = (k, v) => (
    <div key={k} style={{ display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid #e2e8f0',fontSize:'0.85rem',alignItems:'center' }}>
      <span style={{ color:'#64748b' }}>{k}</span>
      <span style={{ fontWeight:600,color:'#0f172a' }}>{v}</span>
    </div>
  );
  return (
    <div style={{ background:'#f8faff',borderRadius:16,padding:'18px 20px',marginTop:10,border:'1.5px solid #e0e7ff' }}>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px 32px' }}>
        <div>
          <div style={{ fontWeight:800,color:'#4361ee',fontSize:'0.75rem',textTransform:'uppercase',marginBottom:8 }}>📋 Chi tiết đặt sân</div>
          {[['Tên sân',b.courtName||'—'],['Ngày chơi',b.date||'—'],['Khung giờ',b.hour?`${b.hour}:00 (${b.duration||1}h)`:'—'],['Ghi chú',b.customerNote||'Không có']].map(([k,v])=>row(k,v))}
        </div>
        <div>
          <div style={{ fontWeight:800,color:'#4361ee',fontSize:'0.75rem',textTransform:'uppercase',marginBottom:8 }}>💳 Chi tiết giao dịch</div>
          {[
            ['Mã đơn', <span style={{ fontFamily:'monospace',fontSize:'0.78rem' }}>{b._id}</span>],
            ['Khách hàng', customerName],
            ['Số điện thoại', b.userId?.phone||b.customerPhone||'—'],
            ['Tổng tiền', <span style={{ color:'#16a34a',fontWeight:800 }}>{fmtCurrency(b.total)}</span>],
            ['Phương thức', methodLabel(b.paymentMethod)],
            ['Trạng thái TT', <span style={{ background:cfg.bg,color:cfg.color,borderRadius:99,padding:'2px 10px',fontWeight:700,fontSize:'0.75rem' }}>{cfg.label}</span>],
          ].map(([k,v])=>row(k,v))}
        </div>
      </div>

      <div style={{ marginTop:14,paddingTop:12,borderTop:'1.5px solid #e2e8f0',display:'flex',gap:10,flexWrap:'wrap',alignItems:'center' }}>
        {b.paymentImage ? (
          <>
            <img src={b.paymentImage} alt="Ảnh bill" onClick={()=>onViewBill(b.paymentImage)}
              style={{ width:80,height:80,objectFit:'cover',borderRadius:10,border:'2px solid #86efac',cursor:'pointer' }} title="Click để xem to" />
            <div>
              <div style={{ fontWeight:700,color:'#15803d',fontSize:'0.82rem' }}>✅ Khách đã gửi ảnh bill</div>
              <button onClick={()=>onViewBill(b.paymentImage)}
                style={{ marginTop:6,background:'#4361ee',color:'#fff',border:'none',borderRadius:8,padding:'6px 16px',fontWeight:700,fontSize:'0.8rem',cursor:'pointer' }}>
                🔍 Xem ảnh bill đầy đủ
              </button>
            </div>
          </>
        ) : (
          <div style={{ color:'#94a3b8',fontSize:'0.82rem',fontStyle:'italic' }}>📎 Chưa có ảnh bill đính kèm</div>
        )}

        <div style={{ marginLeft:'auto',display:'flex',gap:8,flexWrap:'wrap' }}>
          {(st === 'bill_sent' || st === 'processing') && (
            <button onClick={()=>onCancel(b._id||b.id, customerName)}
              style={{ background:'linear-gradient(135deg,#ef4444,#b91c1c)',color:'#fff',border:'none',borderRadius:10,padding:'8px 18px',fontWeight:700,fontSize:'0.82rem',cursor:'pointer',boxShadow:'0 4px 12px rgba(239,68,68,.25)' }}>
              ❌ Hủy yêu cầu
            </button>
          )}
          {st === 'bill_sent' && (
            <button onClick={()=>onApprove(b._id||b.id)}
              style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)',color:'#fff',border:'none',borderRadius:10,padding:'8px 18px',fontWeight:700,fontSize:'0.82rem',cursor:'pointer',boxShadow:'0 4px 12px rgba(22,163,74,.3)' }}>
              ✅ Duyệt thanh toán
            </button>
          )}
          <button onClick={()=>printInvoice(b)}
            style={{ background:'#1e293b',color:'#fff',border:'none',borderRadius:10,padding:'8px 18px',fontWeight:700,fontSize:'0.82rem',cursor:'pointer' }}>
            🖨 Xuất PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function TxRow({ b, expanded, onToggle, onApprove, onViewBill, onCancel }) {
  const st = mapStatus(b);
  const cfg = STATUS_CFG[st];
  const id = b._id || b.id;
  const customer = b.userId?.username || b.customerName || 'Khách';
  return (
    <div style={{ background:'#fff',borderRadius:16,border:`1.5px solid ${expanded?'#4361ee':'#e8ecf6'}`,boxShadow:expanded?'0 0 0 3px rgba(67,97,238,.1)':'0 2px 8px rgba(0,0,0,.04)',overflow:'hidden',transition:'all .15s' }}>
      <div onClick={onToggle} style={{ display:'grid',gridTemplateColumns:'1fr auto auto auto auto',gap:'10px 14px',padding:'14px 18px',cursor:'pointer',alignItems:'center' }}>
        <div>
          <div style={{ fontWeight:700,color:'#0f172a',fontSize:'0.92rem' }}>{customer}</div>
          <div style={{ fontFamily:'monospace',fontSize:'0.72rem',color:'#94a3b8',marginTop:2 }}>{id}</div>
          <div style={{ fontSize:'0.78rem',color:'#64748b',marginTop:2 }}>🏸 {b.courtName||'—'} | 📅 {b.date||'—'} | ⏱ {b.hour}:00 ({b.duration||1}h)</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontWeight:800,fontSize:'1rem',color:'#0f172a' }}>{fmtCurrency(b.total)}</div>
          <div style={{ fontSize:'0.75rem',color:'#64748b' }}>{methodLabel(b.paymentMethod)}</div>
        </div>
        {b.paymentImage && (
          <div onClick={e=>{e.stopPropagation();onViewBill(b.paymentImage);}}
            style={{ background:'#dbeafe',color:'#1d4ed8',borderRadius:8,padding:'4px 10px',fontSize:'0.72rem',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap' }}>
            🧾 Ảnh bill
          </div>
        )}
        <div style={{ background:cfg.bg,color:cfg.color,borderRadius:99,padding:'4px 12px',fontSize:'0.73rem',fontWeight:700,whiteSpace:'nowrap' }}>{cfg.label}</div>
        <div style={{ color:'#94a3b8',fontSize:'0.75rem',whiteSpace:'nowrap' }}>{expanded?'▲':'▼'}</div>
      </div>
      {expanded && (
        <div style={{ padding:'0 18px 16px' }}>
          <DetailPanel b={b} onApprove={onApprove} onViewBill={onViewBill} onCancel={onCancel} />
        </div>
      )}
    </div>
  );
}

export default function AdminPaymentManagement({ bookingRequests = [], refreshBookings, courts = [] }) {
  const [tab, setTab] = useState('pending');
  const [filterDate, setFilterDate] = useState('');
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

  const branchOptions = [
    { value: 'all', label: 'Tất cả chi nhánh' },
    { value: 'kt', label: '📍 LTV Kon Tum' },
    { value: 'hn', label: '📍 LTV Hà Nội' },
    { value: 'hcm', label: '📍 LTV TP.HCM' },
    { value: 'dn', label: '📍 LTV Đà Nẵng' },
    { value: 'ct', label: '📍 LTV Cần Thơ' },
    { value: 'hp', label: '📍 LTV Hải Phòng' },
    { value: 'qn', label: '📍 LTV Quảng Ninh' },
    { value: 'nt', label: '📍 LTV Nha Trang' },
    { value: 'dl', label: '📍 LTV Đà Lạt' },
    { value: 'vt', label: '📍 LTV Vũng Tàu' },
    { value: 'bd', label: '📍 LTV Bình Dương' },
    { value: 'dni', label: '📍 LTV Đồng Nai' },
    { value: 'bn', label: '📍 LTV Bắc Ninh' },
    { value: 'th', label: '📍 LTV Thanh Hóa' },
    { value: 'na', label: '📍 LTV Nghệ An' },
    { value: 'hue', label: '📍 LTV Huế' },
    { value: 'pq', label: '📍 LTV Phú Quốc' }
  ];
  const [expandedId, setExpandedId] = useState(null);
  const [billSrc, setBillSrc] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null); // { id, customerName }

  const handleApprove = async (id) => {
    if (!window.confirm('Xác nhận duyệt thanh toán này?')) return;
    try {
      await API.put(`/bookings/${id}/payment`, { paymentStatus: 'paid' });
      if (refreshBookings) refreshBookings();
    } catch (err) { alert(err.response?.data?.message || 'Duyệt thất bại!'); }
  };

  const handleCancel = async (id, reason) => {
    try {
      await API.put(`/bookings/${id}/status`, { status: 'rejected', reason });
      if (refreshBookings) refreshBookings();
    } catch (err) { alert(err.response?.data?.message || 'Hủy thất bại!'); }
  };

  const pending = useMemo(() =>
    bookingRequests.filter(b => {
      if (!(b.status === 'approved' && (b.paymentStatus === 'deposit_sent' || b.paymentStatus === 'pending'))) return false;
      const court = courts.find(c => String(c.id || c._id) === String(b.courtId)) || {};
      const cBranch = court.branch || 'kt';
      if (branchFilter !== 'all' && cBranch !== branchFilter) return false;
      return true;
    }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
  , [bookingRequests, branchFilter, courts]);

  const history = useMemo(() => {
    let list = bookingRequests.filter(b => {
      if (!(b.paymentStatus === 'paid' || b.paymentStatus === 'remaining_paid' || b.status === 'rejected')) return false;
      const court = courts.find(c => String(c.id || c._id) === String(b.courtId)) || {};
      const cBranch = court.branch || 'kt';
      if (branchFilter !== 'all' && cBranch !== branchFilter) return false;
      return true;
    });
    if (filterDate) list = list.filter(b => fmtDate(b.createdAt) === filterDate || b.date === filterDate);
    if (search.trim()) { const s = search.trim().toLowerCase(); list = list.filter(b => String(b._id).toLowerCase().includes(s) || (b.userId?.username||b.customerName||'').toLowerCase().includes(s) || (b.customerPhone||'').includes(s) || (b.courtName||'').toLowerCase().includes(s)); }
    
    if (paymentMethodFilter !== 'all') {
      list = list.filter(b => {
        const method = methodLabel(b.paymentMethod);
        if (paymentMethodFilter === 'cash' && method === 'Tiền mặt') return true;
        if (paymentMethodFilter === 'online' && method === 'Chuyển khoản') return true;
        return false;
      });
    }

    return list.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [bookingRequests, filterDate, search, branchFilter, paymentMethodFilter, courts]);

  const displayed = tab === 'pending' ? pending : history;

  const stats = useMemo(() => {
    const branchFilteredAll = bookingRequests.filter(b => {
      const court = courts.find(c => String(c.id || c._id) === String(b.courtId)) || {};
      const cBranch = court.branch || 'kt';
      if (branchFilter !== 'all' && cBranch !== branchFilter) return false;
      return true;
    });
    return {
      pendingCount: pending.length,
      billCount: pending.filter(b => b.paymentStatus === 'deposit_sent').length,
      todayPaid: branchFilteredAll.filter(b => b.paymentStatus === 'paid' && fmtDate(b.updatedAt) === fmtDate(new Date().toISOString())).length,
      totalPaid: branchFilteredAll.filter(b => b.paymentStatus === 'paid').reduce((s,b) => s+(b.total||0), 0),
    };
  }, [pending, bookingRequests, branchFilter, courts]);

  const TABS = [
    { key:'pending', label:'⏳ Chờ duyệt', count:stats.pendingCount, color:'#f59e0b' },
    { key:'history', label:'📋 Lịch sử thanh toán', count:history.length, color:'#4361ee' },
  ];

  return (
    <section style={{ marginTop:48 }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:'0.72rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.2em',marginBottom:6 }}>Quản lý</div>
        <h2 style={{ fontSize:'1.6rem',fontWeight:800,color:'#0f172a',margin:0 }}>💳 Quản lý thanh toán</h2>
        <p style={{ color:'#64748b',marginTop:6,fontSize:'0.88rem' }}>Duyệt ảnh bill, xem lịch sử và xuất hóa đơn.</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:28 }}>
        {[
          { icon:'⏳',label:'Chờ duyệt',value:stats.pendingCount,bg:'#fffbeb',color:'#d97706' },
          { icon:'🧾',label:'Có ảnh bill',value:stats.billCount,bg:'#dbeafe',color:'#1d4ed8' },
          { icon:'✅',label:'Duyệt hôm nay',value:stats.todayPaid,bg:'#dcfce7',color:'#16a34a' },
          { icon:'💰',label:'Tổng đã thu',value:stats.totalPaid?`${Math.round(stats.totalPaid/1000)}k`:'0đ',bg:'#f3e8ff',color:'#7c3aed' },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg,borderRadius:16,padding:'14px 18px',border:`1.5px solid ${s.color}22` }}>
            <div style={{ fontSize:'1.5rem',marginBottom:4 }}>{s.icon}</div>
            <div style={{ fontSize:'1.4rem',fontWeight:800,color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'0.74rem',color:'#64748b',fontWeight:600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex',gap:16,marginBottom:20,flexWrap:'wrap',alignItems:'center',justifyContent:'space-between' }}>
        <div style={{ display:'flex',gap:8 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={()=>{setTab(t.key);setExpandedId(null);}}
              style={{ display:'flex',alignItems:'center',gap:8,padding:'9px 20px',borderRadius:99,border:'1.5px solid',borderColor:tab===t.key?t.color:'#e2e8f0',background:tab===t.key?t.color:'#fff',color:tab===t.key?'#fff':'#64748b',fontWeight:700,fontSize:'0.85rem',cursor:'pointer',transition:'all .15s' }}>
              {t.label}
              {t.count > 0 && <span style={{ background:tab===t.key?'rgba(255,255,255,.25)':'#f1f5f9',color:tab===t.key?'#fff':'#475569',borderRadius:99,padding:'1px 7px',fontSize:'0.72rem',fontWeight:800 }}>{t.count}</span>}
            </button>
          ))}
        </div>
        <select value={branchFilter} onChange={e=>setBranchFilter(e.target.value)}
          style={{ padding:'10px 18px',borderRadius:99,border:'1.5px solid #e2e8f0',background:'#fff',color:'#0f172a',fontWeight:700,fontSize:'0.85rem',outline:'none',cursor:'pointer',minWidth:200 }}>
          {branchOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* History filters */}
      {tab === 'history' && (
        <div style={{ display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center' }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,background:'#f8faff',border:'1.5px solid #c7d2fe',borderRadius:12,padding:'8px 14px' }}>
            <span style={{ fontSize:'0.8rem',color:'#4361ee',fontWeight:700 }}>📅 Lọc ngày:</span>
            <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)}
              style={{ border:'none',background:'transparent',fontWeight:700,color:'#0f172a',fontSize:'0.85rem',outline:'none',cursor:'pointer' }} />
            {filterDate && <button onClick={()=>setFilterDate('')} style={{ background:'none',border:'none',color:'#94a3b8',cursor:'pointer',fontWeight:900 }}>✕</button>}
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:8,background:'#f8faff',border:'1.5px solid #c7d2fe',borderRadius:12,padding:'8px 14px',flex:1,minWidth:200 }}>
            <span style={{ fontSize:'0.8rem',color:'#4361ee',fontWeight:700 }}>🔍</span>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm theo khách, sân, SĐT, mã đơn..."
              style={{ border:'none',background:'transparent',fontWeight:600,color:'#0f172a',fontSize:'0.85rem',outline:'none',width:'100%' }} />
            {search && <button onClick={()=>setSearch('')} style={{ background:'none',border:'none',color:'#94a3b8',cursor:'pointer',fontWeight:900 }}>✕</button>}
          </div>
          <div style={{ display:'flex',alignItems:'center',background:'#f8faff',border:'1.5px solid #c7d2fe',borderRadius:12,padding:'8px 14px' }}>
            <select value={paymentMethodFilter} onChange={e=>setPaymentMethodFilter(e.target.value)}
              style={{ border:'none',background:'transparent',fontWeight:700,color:'#0f172a',fontSize:'0.85rem',outline:'none',cursor:'pointer' }}>
              <option value="all">Tất cả thanh toán</option>
              <option value="online">💳 Chuyển khoản online</option>
              <option value="cash">💵 Tiền mặt</option>
            </select>
          </div>
          {filterDate && (
            <div style={{ background:'#f0fdf4',border:'1.5px solid #86efac',borderRadius:10,padding:'8px 16px',fontSize:'0.82rem',fontWeight:700,color:'#16a34a' }}>
              📅 {new Date(filterDate).toLocaleDateString('vi-VN')}: {displayed.length} giao dịch
            </div>
          )}
        </div>
      )}

      {/* Bill notice */}
      {tab === 'pending' && stats.billCount > 0 && (
        <div style={{ display:'flex',alignItems:'center',gap:10,padding:'12px 18px',background:'#dbeafe',border:'1.5px solid #93c5fd',borderRadius:14,marginBottom:16,fontWeight:700,color:'#1d4ed8',fontSize:'0.88rem' }}>
          🧾 Có <strong style={{ margin:'0 4px' }}>{stats.billCount}</strong> đơn đã gửi ảnh bill — cần xem và duyệt!
        </div>
      )}

      {/* List */}
      <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
        {displayed.length === 0 ? (
          <div style={{ textAlign:'center',padding:'60px 20px',background:'#f8faff',borderRadius:18,border:'1.5px dashed #c7d2fe' }}>
            <div style={{ fontSize:'2.5rem',marginBottom:12 }}>💳</div>
            <div style={{ fontWeight:700,color:'#475569' }}>
              {tab === 'pending' ? 'Không có đơn nào chờ duyệt' : filterDate ? `Không có giao dịch ngày ${new Date(filterDate).toLocaleDateString('vi-VN')}` : 'Chưa có lịch sử thanh toán'}
            </div>
          </div>
        ) : (
          displayed.map(b => {
            const id = b._id || b.id;
            return (
              <TxRow key={id} b={b} expanded={expandedId===id}
                onToggle={()=>setExpandedId(expandedId===id?null:id)}
                onApprove={handleApprove} onViewBill={setBillSrc}
                onCancel={(bid, name) => setCancelTarget({ id: bid, customerName: name })}
              />
            );
          })
        )}
      </div>

      {billSrc && <BillModal src={billSrc} onClose={()=>setBillSrc(null)} />}
      {cancelTarget && (
        <CancelModal
          bookingId={cancelTarget.id}
          customerName={cancelTarget.customerName}
          onConfirm={handleCancel}
          onClose={()=>setCancelTarget(null)}
        />
      )}
    </section>
  );
}
