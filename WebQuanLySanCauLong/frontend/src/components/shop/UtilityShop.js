import React, { useState, useMemo, useEffect } from 'react';
import API from '../../api';

const initialServices = [
  { id: 1, name: "Revive Chanh Muối 500ml", category: "Nước uống", price: 15000, stock: 150, desc: "Nước bù khoáng Revive hương chanh muối giúp tiếp thêm sinh lực tức thì.", image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=80" },
  { id: 2, name: "Nước suối Aquafina 500ml", category: "Nước uống", price: 8000, stock: 220, desc: "Nước uống đóng chai tinh khiết Aquafina tốt cho sức khỏe.", image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500&auto=format&fit=crop&q=80" },
  { id: 3, name: "Thuê vợt Yonex Astrox 99", category: "Thuê dụng cụ", price: 50000, stock: 10, desc: "Vợt Yonex Astrox 99 cao cấp dành cho người chơi tấn công mạnh mẽ.", image: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=500&auto=format&fit=crop&q=80" },
  { id: 4, name: "Thuê giày Victor Auraspeed", category: "Thuê dụng cụ", price: 40000, stock: 8, desc: "Giày cầu lông Victor êm ái, bám sân cực tốt đầy đủ size.", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&auto=format&fit=crop&q=80" },
  { id: 5, name: "Hộp cầu lông Thành Công", category: "Phụ kiện", price: 230000, stock: 45, desc: "Hộp 12 quả cầu lông Thành Công chuẩn thi đấu câu lạc bộ.", image: "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=500&auto=format&fit=crop&q=80" },
  { id: 6, name: "Cuốn cán vợt Yonex chống trơn", category: "Phụ kiện", price: 20000, stock: 120, desc: "Cuốn cán vợt cao su non giúp cầm vợt êm tay và thấm hút mồ hôi.", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&auto=format&fit=crop&q=80" },
  { id: 7, name: "Bánh mì xúc xích kẹp phô mai", category: "Đồ ăn", price: 25000, stock: 0, desc: "Bánh mì nướng nóng hổi ăn nhẹ phục hồi năng lượng giữa các set đấu.", image: "https://images.unsplash.com/photo-1541214113241-21578d2d9b62?w=500&auto=format&fit=crop&q=80" }
];

export default function UtilityShop({ user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('shop_cart');
    return stored ? JSON.parse(stored) : [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  
  // Checkout Form State
  const [linkedBookingId, setLinkedBookingId] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || user?.username || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerNote, setCustomerNote] = useState('');

  const categories = ["Nước uống", "Đồ ăn", "Thuê dụng cụ", "Phụ kiện"];

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/services');
      const raw = res.data.data ?? res.data ?? [];
      const formatted = raw.map(s => ({
        id: s._id || s.id,
        name: s.name,
        category: s.category,
        price: s.price,
        stock: s.stock,
        desc: s.desc || '',
        image: s.image || ''
      }));
      setProducts(formatted);
    } catch (err) {
      console.error('Lỗi lấy sản phẩm từ API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Save cart
  useEffect(() => {
    localStorage.setItem('shop_cart', JSON.stringify(cart));
  }, [cart]);

  // Listen to open-cart custom event
  useEffect(() => {
    const handleOpenCart = () => {
      setCartOpen(true);
    };
    window.addEventListener('open-cart', handleOpenCart);
    return () => {
      window.removeEventListener('open-cart', handleOpenCart);
    };
  }, []);

  // Load user bookings to link to order
  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      try {
        const res = await API.get('/bookings/my-bookings');
        if (res.data && Array.isArray(res.data.data)) {
          // Chỉ lấy các booking sắp diễn ra hoặc chưa bị hủy
          const activeBookings = res.data.data.filter(b => b.status === 'approved' || b.status === 'pending');
          setUserBookings(activeBookings);
        }
      } catch (err) {
        console.error('Lỗi lấy danh sách đặt sân của user:', err);
      }
    };
    fetchBookings();
  }, [user]);

  // Sync details if user updates profile
  useEffect(() => {
    if (user) {
      setCustomerName(user.name || user.username || '');
      setCustomerPhone(user.phone || '');
    }
  }, [user]);

  // Cart operations
  const addToCart = (product) => {
    if (product.stock === 0) return alert('Sản phẩm đã hết hàng!');
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Chỉ còn tối đa ${product.stock} sản phẩm trong kho!`);
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (id, amount) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const product = products.find(p => p.id === id);
          const newQty = item.quantity + amount;
          if (newQty <= 0) return null;
          if (product && newQty > product.stock) {
            alert(`Chỉ còn tối đa ${product.stock} sản phẩm trong kho!`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Calculations
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const filteredProducts = useMemo(() => {
    return products.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      // Cập nhật tồn kho thật lên Database!
      for (const item of cart) {
        const product = products.find(p => p.id === item.id);
        if (product) {
          const nextStock = Math.max(0, product.stock - item.quantity);
          await API.put(`/services/${item.id}`, { stock: nextStock });
        }
      }
      // Load lại sản phẩm sau khi trừ kho
      await fetchProducts();
    } catch (err) {
      console.error('Lỗi trừ kho:', err);
    }

    // Tạo notification đẩy lên hệ thống cho người dùng
    try {
      const selectedBooking = userBookings.find(b => String(b._id || b.id) === String(linkedBookingId));
      let message = `🛒 Đơn hàng dịch vụ tiện ích mới giá trị ${cartTotal.toLocaleString()}đ đã được đặt thành công!`;
      if (selectedBooking) {
        message += ` (Liên kết với sân: ${selectedBooking.courtName} - ${selectedBooking.date} lúc ${selectedBooking.hour}:00)`;
      }
      
      const notifyMessage = {
        title: "🛒 Đơn hàng dịch vụ",
        message: message,
        type: "promotion"
      };
      
      await API.post('/notifications', notifyMessage).catch(() => {});
    } catch (e) {
      console.error(e);
    }

    setCart([]);
    setCheckoutOpen(false);
    setOrderSuccess(true);
  };

  return (
    <section className="shop-section" style={{
      padding: '40px 24px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: "'Outfit', 'Inter', sans-serif"
    }}>
      {/* Banner */}
      <div className="shop-banner" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '32px',
        padding: '40px',
        color: '#ffffff',
        marginBottom: '40px',
        boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />

        <div className="banner-content" style={{ position: 'relative', zIndex: 2 }}>
          <span style={{
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: '#fff',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            🛒 LTV SPORT SHOP
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '16px 0 8px 0', color: '#fff' }}>
            Cửa Hàng Tiện Ích Cầu Lông
          </h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '1rem', maxWidth: '600px', lineHeight: '1.6' }}>
            Cung cấp nước giải khát, đồ ăn nhẹ phục hồi năng lượng, dịch vụ thuê vợt/giày cao cấp chuẩn thi đấu và các phụ kiện chính hãng.
          </p>
        </div>
      </div>


      {/* Toolbar / Filters */}
      <div className="shop-toolbar" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '24px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          <input 
            type="text"
            placeholder="Tìm nước uống, phụ kiện, dụng cụ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              borderRadius: '16px',
              border: '1.5px solid #cbd5e1',
              padding: '12px 16px 12px 42px',
              fontSize: '0.9rem',
              color: '#1e293b',
              outline: 'none',
              transition: 'all 0.2s',
              backgroundColor: '#f8fafc'
            }}
            className="search-input"
          />
          <svg style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button 
            onClick={() => setSelectedCategory('All')}
            style={{
              padding: '10px 18px',
              borderRadius: '14px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: 'none',
              background: selectedCategory === 'All' ? '#1e293b' : '#f1f5f9',
              color: selectedCategory === 'All' ? '#ffffff' : '#475569'
            }}
          >
            Tất cả
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '10px 18px',
                borderRadius: '14px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: 'none',
                background: selectedCategory === cat ? '#1e293b' : '#f1f5f9',
                color: selectedCategory === cat ? '#ffffff' : '#475569',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="product-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '24px'
      }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              width: '40px', height: '40px', border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%',
              animation: 'spin 1s linear infinite', margin: '0 auto 16px auto'
            }}></div>
            <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.9rem' }}>Đang tải cửa hàng tiện ích...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{
            gridColumn: '1/-1',
            textAlign: 'center',
            padding: '60px 20px',
            color: '#64748b',
            background: '#f8fafc',
            borderRadius: '24px',
            border: '2px dashed #e2e8f0'
          }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Không tìm thấy sản phẩm nào</p>
            <p style={{ fontSize: '0.85rem', margin: '4px 0 0 0' }}>Vui lòng thay đổi từ khóa hoặc bộ lọc danh mục.</p>
          </div>
        ) : (
          filteredProducts.map(product => {
            const isOutOfStock = product.stock === 0;
            const isLowStock = product.stock > 0 && product.stock <= 10;
            return (
              <div key={product.id} className="product-card" style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '24px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                transition: 'all 0.3s ease'
              }}>
                {/* Image Wrap */}
                <div style={{ position: 'relative', height: '180px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500';
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backdropFilter: 'blur(4px)'
                  }}>
                    {product.category}
                  </span>

                  {isOutOfStock && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(15, 23, 42, 0.65)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(2px)'
                    }}>
                      <span style={{
                        backgroundColor: '#ef4444',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '8px 16px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                      }}>
                        🚫 HẾT HÀNG
                      </span>
                    </div>
                  )}

                  {isLowStock && (
                    <span style={{
                      position: 'absolute',
                      right: '12px',
                      top: '12px',
                      backgroundColor: '#f59e0b',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      boxShadow: '0 2px 6px rgba(245, 158, 11, 0.2)'
                    }}>
                      ⚠️ CHỈ CÒN: {product.stock}
                    </span>
                  )}
                </div>

                {/* Body Details */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                    {product.name}
                  </h4>
                  <p style={{
                    margin: '0 0 16px 0',
                    fontSize: '0.82rem',
                    color: '#64748b',
                    lineHeight: '1.5',
                    height: '52px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {product.desc}
                  </p>

                  {/* Price and Add button */}
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Đơn giá</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2563eb' }}>
                        {product.price.toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    <button 
                      onClick={() => addToCart(product)}
                      disabled={isOutOfStock}
                      style={{
                        backgroundColor: isOutOfStock ? '#e2e8f0' : '#eff6ff',
                        color: isOutOfStock ? '#94a3b8' : '#2563eb',
                        border: 'none',
                        borderRadius: '12px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isOutOfStock ? 'none' : '0 2px 6px rgba(37, 99, 235, 0.08)'
                      }}
                      className="add-to-cart-btn"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Drawer Sidebar overlay */}
      {cartOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 99990,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease'
        }} onClick={() => setCartOpen(false)}>
          <div style={{
            width: '100%',
            maxWidth: '440px',
            height: '100%',
            backgroundColor: '#ffffff',
            boxShadow: '-10px 0 40px rgba(15, 23, 42, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideLeft 0.3s ease',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>🛒 Giỏ Hàng Của Bạn</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{cartCount} sản phẩm đã chọn</span>
              </div>
              <button 
                onClick={() => setCartOpen(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Cart list items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {cart.length === 0 ? (
                <div style={{
                  margin: 'auto',
                  textAlign: 'center',
                  color: '#94a3b8'
                }}>
                  <svg style={{ margin: '0 auto 16px auto', display: 'block' }} xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <p style={{ margin: 0, fontWeight: 700 }}>Giỏ hàng còn trống</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem' }}>Vui lòng thêm sản phẩm từ cửa hàng.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} style={{
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'center',
                    borderBottom: '1px solid #f1f5f9',
                    paddingBottom: '14px'
                  }}>
                    {/* Img */}
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      style={{ width: '64px', height: '64px', borderRadius: '14px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500';
                      }}
                    />
                    {/* Mid info */}
                    <div style={{ flex: 1 }}>
                      <h5 style={{ margin: '0 0 4px 0', fontSize: '0.88rem', fontWeight: 800 }}>{item.name}</h5>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2563eb' }}>
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    {/* Qty controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '10px',
                        padding: '2px',
                        border: '1px solid #cbd5e1'
                      }}>
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px 8px', fontWeight: 'bold' }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '12px', fontWeight: 800, width: '20px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px 8px', fontWeight: 'bold' }}
                        >
                          +
                        </button>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Xóa sản phẩm
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Bill checkout */}
            {cart.length > 0 && (
              <div style={{
                padding: '24px',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Tổng tiền:</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2563eb' }}>
                    {cartTotal.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <button 
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutOpen(true);
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '14px',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                    transition: 'all 0.2s'
                  }}
                >
                  Tiến hành thanh toán
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Payment Modal */}
      {checkoutOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 99990,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '680px',
            backgroundColor: '#ffffff',
            borderRadius: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #f1f5f9',
            overflow: 'hidden',
            animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1)'
          }}>
            {/* Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>💳 Thanh toán hóa đơn</h3>
              <button 
                onClick={() => setCheckoutOpen(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Split Form & QR code */}
            <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '24px' }} className="checkout-split-layout">
              {/* Form Info details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  Thông tin giao hàng
                </h4>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Họ tên</label>
                  <input 
                    type="text" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    style={{ width: '100%', borderRadius: '12px', border: '1.5px solid #e2e8f0', padding: '10px 14px', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Số điện thoại</label>
                  <input 
                    type="text" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    placeholder="0xxxxxxxxx"
                    style={{ width: '100%', borderRadius: '12px', border: '1.5px solid #e2e8f0', padding: '10px 14px', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                {userBookings.length > 0 && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Liên kết lịch đặt sân của bạn</label>
                    <select
                      value={linkedBookingId}
                      onChange={(e) => setLinkedBookingId(e.target.value)}
                      style={{ width: '100%', borderRadius: '12px', border: '1.5px solid #e2e8f0', padding: '10px 14px', fontSize: '0.85rem', outline: 'none', backgroundColor: '#fff' }}
                    >
                      <option value="">-- Chọn lịch sân (Chuẩn bị tại quầy) --</option>
                      {userBookings.map(b => (
                        <option key={b._id || b.id} value={b._id || b.id}>
                          {b.courtName} - {b.date} ({b.hour}:00)
                        </option>
                      ))}
                    </select>
                    <small style={{ color: '#64748b', fontSize: '10px', display: 'block', marginTop: '4px' }}>
                      💡 Nhân viên sẽ chuẩn bị nước uống/vợt/giày ngay tại quầy của sân bạn chọn!
                    </small>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Ghi chú đơn hàng</label>
                  <textarea 
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    rows="2"
                    placeholder="Ví dụ: Lấy nước lạnh, size giày 41,..."
                    style={{ width: '100%', borderRadius: '12px', border: '1.5px solid #e2e8f0', padding: '10px 14px', fontSize: '0.85rem', outline: 'none', resize: 'none' }}
                  />
                </div>
              </div>

              {/* QR payment panel */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '24px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  Quét Mã Thanh Toán
                </h4>

                <div style={{
                  padding: '12px',
                  background: '#ffffff',
                  borderRadius: '20px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
                  border: '1.5px solid #e2e8f0',
                  marginBottom: '14px'
                }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`2563eb-Pay-LTV-Shop-${cartTotal}`)}`} 
                    alt="momo qr code" 
                    style={{ width: '150px', height: '150px', display: 'block' }}
                  />
                </div>

                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <p style={{ margin: '0 0 2px 0', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Tài khoản: **LTV BADMINTON GROUP**</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#ef4444', fontWeight: 800 }}>Số tiền: {cartTotal.toLocaleString('vi-VN')} đ</p>
                </div>

                <button 
                  type="submit"
                  style={{
                    width: '100%',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Xác Nhận Đã Thanh Toán
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {orderSuccess && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 99995,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: '#ffffff',
            borderRadius: '32px',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #f1f5f9',
            animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1)'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              margin: '0 auto 24px auto',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.15)'
            }}>
              ✓
            </div>

            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              Đặt Hàng Thành Công!
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.88rem', color: '#64748b', lineHeight: '1.6' }}>
              Cảm ơn bạn đã ủng hộ! Đơn hàng của bạn đã được tiếp nhận và xử lý. Nếu bạn có liên kết với lịch đặt sân, nhân viên sẽ đem nước/dụng cụ ra tận sân cho bạn nhé! 🏸
            </p>

            <button 
              onClick={() => setOrderSuccess(false)}
              style={{
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '16px',
                padding: '12px 32px',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
              }}
            >
              Tiếp Tục Mua Sắm
            </button>
          </div>
        </div>
      )}

      {/* Embedded CSS */}
      <style>{`
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(15, 23, 42, 0.08) !important;
          border-color: #cbd5e1 !important;
        }

        .add-to-cart-btn:hover:not(:disabled) {
          background-color: #2563eb !important;
          color: #ffffff !important;
          transform: scale(1.05);
        }

        .floating-cart-bubble:hover {
          transform: scale(1.08) translateY(-3px);
          box-shadow: 0 15px 30px rgba(37, 99, 235, 0.5) !important;
        }

        .floating-cart-bubble.active {
          transform: rotate(360deg) scale(0.95);
        }

        .search-input:focus {
          border-color: #2563eb !important;
          background-color: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1) !important;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 560px) {
          .checkout-split-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
