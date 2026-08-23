import React, { useState, useEffect } from 'react';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getBrands, createBrand, deleteBrand,
  getAllOrders, updateOrderStatus, rejectOrder, confirmPayment, countPendingOrders, getOrderDetail, exportInvoice,
  getAllUsers, updateUserRole, revokeUserRole, getRoles, createRole, deleteRole, getPermissions, createPermission,
  getRevenue, getTopSelling, getYearlyRevenue, getDailyRevenue,
  uploadGallery, uploadImage, updateVersion, getProductDetail, deleteGalleryImage,
  getMyInfo, updateMyInfo, changePassword,
  getAllBanners, createBanner, deleteBanner, toggleBanner,
  getMembershipByUser,
  getHotProductsAnalytics, triggerHotUpdate,
} from '../api/api';

// ====================================================================
// ADMIN DASHBOARD - TOÀN BỘ DÙNG API THẬT
// ====================================================================
// ── Permissions theo DB (từ bảng role_permission):
// ADMIN: APPROVE_ORDER, CREATE_PRODUCT, DELETE_PRODUCT, UPDATE_PRODUCT, VIEW_ALL_ORDERS, VIEW_ORDER, VIEW_REPORT
// WAREHOUSE_STAFF: VIEW_ALL_ORDERS
// permission: null = LUÔN hiển thị (không cần quyền gì)
const MENU_CONFIG = [
  {
    id: 'dashboard', label: 'Tổng quan', icon: '📊',
    permission: 'VIEW_REPORT',                    // Chỉ ADMIN
  },
  {
    id: 'orders', label: 'Đơn hàng', icon: '🛒',
    permission: 'VIEW_ALL_ORDERS', badge: true,   // ADMIN + WAREHOUSE_STAFF
  },
  {
    id: 'products-group', label: 'Sản phẩm', icon: '📦',
    permission: null,
    children: [
      { id: 'product-list', label: 'Danh sách Sản Phẩm', permission: 'VIEW_ORDER' },      // ADMIN
      { id: 'product-upload', label: 'Thêm Sản Phẩm', permission: 'CREATE_PRODUCT' },  // ADMIN
      { id: 'brand-manage', label: 'Quản lý Hãng', permission: 'CREATE_PRODUCT' },  // ADMIN
      { id: 'banner-manage', label: 'Quản lý Banner', permission: 'CREATE_PRODUCT' },  // ADMIN
    ],
  },
  {
    id: 'users-group', label: 'Người dùng', icon: '👥',
    permission: null,
    children: [
      { id: 'customers', label: 'Danh sách Khách hàng', permission: 'VIEW_ORDER' }, // ADMIN + WAREHOUSE_STAFF
      { id: 'role-manage', label: 'Quản lý Quyền', permission: 'VIEW_REPORT' },    // Chỉ ADMIN
      { id: 'permission-manage', label: 'Quản lý Tính năng', permission: 'VIEW_REPORT' },    // Chỉ ADMIN
    ],
  },
  {
    id: 'admin-profile', label: 'Tài khoản', icon: '👤',
    permission: null, // Luôn hiện
  },
];

const AdminDashboard = ({ onLogout, user }) => {
  const [activeTab, setActiveTab] = useState('');
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(true);
  const [isUsersMenuOpen, setIsUsersMenuOpen] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedAdminProductId, setSelectedAdminProductId] = useState(null);

  // Lấy permissions từ user object (đã lưu trong localStorage lúc login)
  const permissions = user?.permissions || [];
  const hasPermission = (perm) => !perm || permissions.includes(perm);

  // Tính menu con hiển thị được
  const visibleChildren = (children) => children?.filter(c => hasPermission(c.permission)) || [];

  // Tab mặc định: chạy mỗi khi user thay đổi
  // Chọn tab đầu tiên user có quyền. Không override nếu đang ở tab hợp lệ.
  useEffect(() => {
    const perms = user?.permissions || [];
    if (!perms.length) return; // Chưa có permissions → đợi

    const check = (perm) => !perm || perms.includes(perm);

    // Kiểm tra tab hiện tại còn hợp lệ không (ngoại trừ admin-profile là fallback)
    if (activeTab && activeTab !== 'admin-profile') {
      const stillValid = MENU_CONFIG.some(item =>
        item.children
          ? item.children.some(c => c.id === activeTab && check(c.permission))
          : item.id === activeTab && check(item.permission)
      );
      if (stillValid) return; // Tab hiện tại ok, giữ nguyên
    }

    // Tìm tab đầu tiên có quyền (bỏ qua admin-profile — đó là fallback cuối)
    for (const item of MENU_CONFIG) {
      if (item.id === 'admin-profile') continue;
      if (item.children) {
        const first = item.children.find(c => check(c.permission));
        if (first) { setActiveTab(first.id); return; }
      } else if (check(item.permission)) {
        setActiveTab(item.id); return;
      }
    }
    // Không có tab nào khác → fallback về Tài khoản
    setActiveTab('admin-profile');
  }, [user]);

  useEffect(() => {
    if (hasPermission('VIEW_ALL_ORDERS')) {
      countPendingOrders().then(data => setPendingCount(data.result || 0)).catch(() => { });
    }
  }, [activeTab]);

  const handleViewProductDetail = (productId) => {
    setSelectedAdminProductId(productId);
    setActiveTab('product-detail');
  };

  const NavItem = ({ id, label, icon, badge }) => {
    const active = activeTab === id;
    return (
      <div onClick={() => setActiveTab(id)}
        className={`p-4 rounded-2xl cursor-pointer flex items-center gap-4 transition-all ${active ? 'bg-[#4318FF] text-white font-bold shadow-lg shadow-indigo-100' : 'text-[#A3AED0] hover:bg-gray-50'}`}>
        <span className="text-xl">{icon}</span>
        <span className="flex-1">{label}</span>
        {badge && pendingCount > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{pendingCount}</span>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans text-[#2b3674]">
      {/* SIDEBAR */}
      <aside className="w-62 bg-white shadow-xl flex flex-col p-8 z-20">
        <div className="text-2xl font-black text-[#058a81] mb-12 flex items-center gap-2">
          <span className="bg-[#058a81] text-white p-1 rounded px-3">PH</span> Dashboard
        </div>

        {/* User badge */}
        <div className="mb-6 px-4 py-3 bg-gray-50 rounded-2xl">
          <p className="text-xs text-[#A3AED0] font-bold uppercase">Đăng nhập với tư cách</p>
          <p className="font-black text-sm text-[#2b3674] mt-0.5">{user?.username}</p>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full mt-1 inline-block ${user?.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-600' :
            user?.role === 'WAREHOUSE_STAFF' ? 'bg-orange-100 text-orange-600' :
              'bg-gray-100 text-gray-500'
            }`}>{user?.role}</span>
        </div>

        <nav className="flex-1 space-y-2">
          {MENU_CONFIG.map(item => {
            // Nhóm dropdown có children
            if (item.children) {
              const visible = visibleChildren(item.children);
              if (visible.length === 0) return null;
              const isGroupOpen = item.id === 'products-group' ? isProductsMenuOpen : isUsersMenuOpen;
              const setGroupOpen = item.id === 'products-group' ? setIsProductsMenuOpen : setIsUsersMenuOpen;
              const isGroupActive = visible.some(c => activeTab === c.id || activeTab === 'product-detail');
              return (
                <div key={item.id}>
                  <div onClick={() => setGroupOpen(!isGroupOpen)}
                    className={`p-4 rounded-2xl cursor-pointer flex items-center justify-between transition-all ${isGroupActive ? 'text-[#4318FF] font-bold' : 'text-[#A3AED0] hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-4"><span className="text-xl">{item.icon}</span>{item.label}</div>
                    <span className={`text-xs transition-transform ${isGroupOpen ? 'rotate-180' : ''}`}>▼</span>
                  </div>
                  {isGroupOpen && (
                    <div className="ml-12 mt-2 space-y-2 border-l-2 border-gray-100 pl-4">
                      {visible.map(child => (
                        <p key={child.id} onClick={() => setActiveTab(child.id)}
                          className={`cursor-pointer py-2 text-sm ${activeTab === child.id ? 'text-[#4318FF] font-bold' : 'text-[#A3AED0] hover:text-[#4318FF]'}`}>
                          {child.label}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            // Menu đơn
            if (!hasPermission(item.permission)) return null;
            return <NavItem key={item.id} {...item} />;
          })}
        </nav>

        <button onClick={onLogout} className="mt-auto bg-red-50 text-red-600 font-bold p-4 rounded-2xl hover:bg-red-100 transition cursor-pointer">Đăng xuất</button>
      </aside>

      {/* NỘI DUNG CHÍNH */}
      <main className="flex-1 p-10 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <p className="text-sm text-[#707EAE]">Admin / {activeTab.replace(/-/g, ' ')}</p>
            <h2 className="text-3xl font-bold capitalize">{activeTab.replace(/-/g, ' ')}</h2>
          </div>
        </header>

        {activeTab === 'dashboard' && <DashboardOverview />}
        {activeTab === 'orders' && <OrderManagement />}
        {activeTab === 'product-list' && <ProductList onNavigateToUpload={() => setActiveTab('product-upload')} onViewDetail={handleViewProductDetail} />}
        {activeTab === 'product-upload' && <ProductUpload onSuccess={() => setActiveTab('product-list')} />}
        {activeTab === 'product-detail' && selectedAdminProductId && (
          <ProductDetailAdmin
            productId={selectedAdminProductId}
            onBack={() => { setSelectedAdminProductId(null); setActiveTab('product-list'); }}
            onDeleted={() => { setSelectedAdminProductId(null); setActiveTab('product-list'); }}
          />
        )}
        {activeTab === 'customers' && <CustomerManagement />}
        {activeTab === 'role-manage' && <RoleManagement />}
        {activeTab === 'permission-manage' && <PermissionManagement />}
        {activeTab === 'brand-manage' && <BrandManagement />}
        {activeTab === 'banner-manage' && <BannerManagement />}
        {activeTab === 'admin-profile' && <AdminProfile />}
      </main>
    </div>
  );
};

// ====================================================================
// 1. DASHBOARD OVERVIEW - Thống kê thực từ API
// ====================================================================
const DashboardOverview = () => {
  const [revenue, setRevenue] = useState(null);
  const [topSelling, setTopSelling] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [yearlyData, setYearlyData] = useState({});
  const [dailyData, setDailyData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [hotData, setHotData] = useState(null);
  const [loadingHot, setLoadingHot] = useState(false);
  const [triggeringHot, setTriggeringHot] = useState(false);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => { loadData(); }, [month, year]);
  useEffect(() => { loadDailyData(); }, [month, year]);
  useEffect(() => { loadHotData(); }, []);

  const loadHotData = async () => {
    setLoadingHot(true);
    try {
      const data = await getHotProductsAnalytics();
      setHotData(data.result);
    } catch (err) {
      console.error('Lỗi load hot products:', err);
    } finally {
      setLoadingHot(false);
    }
  };

  const handleTriggerHot = async () => {
    if (!confirm('Bạn có chắc muốn cập nhật lại Top 5 sản phẩm Hot ngay bây giờ?')) return;
    setTriggeringHot(true);
    try {
      await triggerHotUpdate();
      alert('✅ Đã cập nhật sản phẩm Hot thành công!');
      await loadHotData();
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật!');
    } finally {
      setTriggeringHot(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [revData, topData, pendData, yearData] = await Promise.all([
        getRevenue(month, year),
        getTopSelling(),
        countPendingOrders(),
        getYearlyRevenue(year),
      ]);
      setRevenue(revData.result);
      setTopSelling(topData.result || []);
      setPendingCount(pendData.result || 0);
      setYearlyData(yearData.result || {});
    } catch (err) {
      console.error("Lỗi load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyData = async () => {
    setLoadingDaily(true);
    try {
      const data = await getDailyRevenue(month, year);
      setDailyData(data.result || {});
    } catch (err) {
      console.error("Lỗi load daily revenue:", err);
    } finally {
      setLoadingDaily(false);
    }
  };

  const formatVND = (val) => val ? Number(val).toLocaleString('vi-VN') + '₫' : '0₫';
  const formatVNDShort = (val) => {
    const n = Number(val);
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'T';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + 'Tr';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
    return n.toString();
  };

  // ── Biểu đồ năm ──
  const MONTHS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  const chartValues = MONTHS.map((_, i) => Number(yearlyData[i + 1] || 0));
  const maxVal = Math.max(...chartValues, 1);

  const SVG_W = 700, SVG_H = 200, PAD_L = 55, PAD_B = 30, PAD_T = 20, PAD_R = 20;
  const plotW = SVG_W - PAD_L - PAD_R;
  const plotH = SVG_H - PAD_T - PAD_B;
  const barW = plotW / 12;

  const points = chartValues.map((v, i) => {
    const x = PAD_L + i * barW + barW / 2;
    const y = PAD_T + plotH - (v / maxVal) * plotH;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = [
    `${PAD_L + barW / 2},${PAD_T + plotH}`,
    ...chartValues.map((v, i) => {
      const x = PAD_L + i * barW + barW / 2;
      const y = PAD_T + plotH - (v / maxVal) * plotH;
      return `${x},${y}`;
    }),
    `${PAD_L + 11 * barW + barW / 2},${PAD_T + plotH}`,
  ].join(' ');

  // ── Biểu đồ ngày ──
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyValues = Array.from({ length: daysInMonth }, (_, i) => Number(dailyData[i + 1] || 0));
  const maxDailyVal = Math.max(...dailyValues, 1);
  const D_SVG_W = 800, D_SVG_H = 200, D_PAD_L = 55, D_PAD_B = 30, D_PAD_T = 20, D_PAD_R = 10;
  const dPlotW = D_SVG_W - D_PAD_L - D_PAD_R;
  const dPlotH = D_SVG_H - D_PAD_T - D_PAD_B;
  const dBarW = dPlotW / daysInMonth;

  const dPoints = dailyValues.map((v, i) => {
    const x = D_PAD_L + i * dBarW + dBarW / 2;
    const y = D_PAD_T + dPlotH - (v / maxDailyVal) * dPlotH;
    return `${x},${y}`;
  }).join(' ');

  const dAreaPoints = [
    `${D_PAD_L + dBarW / 2},${D_PAD_T + dPlotH}`,
    ...dailyValues.map((v, i) => {
      const x = D_PAD_L + i * dBarW + dBarW / 2;
      const y = D_PAD_T + dPlotH - (v / maxDailyVal) * dPlotH;
      return `${x},${y}`;
    }),
    `${D_PAD_L + (daysInMonth - 1) * dBarW + dBarW / 2},${D_PAD_T + dPlotH}`,
  ].join(' ');

  const today = now.getDate();

  return (
    <div className="space-y-8">
      {/* Chọn tháng/năm */}
      <div className="flex items-center gap-4">
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
          className="bg-white border rounded-xl px-4 py-2 font-bold outline-none">
          {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}
          className="bg-white border rounded-xl px-4 py-2 font-bold outline-none">
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* 3 Card thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-2xl">💰</div>
          <div>
            <p className="text-sm text-[#A3AED0]">Doanh thu tháng {month}</p>
            <h3 className="text-2xl font-black text-green-600">{loading ? '...' : formatVND(revenue?.totalRevenue)}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-2xl">⏳</div>
          <div>
            <p className="text-sm text-[#A3AED0]">Đơn chờ duyệt</p>
            <h3 className="text-2xl font-black text-orange-600">{loading ? '...' : pendingCount}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center text-2xl">🏆</div>
          <div>
            <p className="text-sm text-[#A3AED0]">Top SP bán chạy</p>
            <h3 className="text-lg font-black text-purple-600 truncate max-w-[160px]">{loading ? '...' : topSelling[0]?.productName || '-'}</h3>
          </div>
        </div>
      </div>

      {/* ── BIỂU ĐỒ DOANH THU TỪNG NGÀY TRONG THÁNG ── */}
      <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">📅 Doanh thu từng ngày — Tháng {month}/{year}</h3>
          <span className="text-sm text-gray-400 font-bold">Đơn vị: VNĐ</span>
        </div>
        {loadingDaily ? (
          <div className="animate-pulse h-[230px] bg-gray-50 rounded-2xl" />
        ) : (
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${D_SVG_W} ${D_SVG_H}`} className="w-full min-w-[600px]" style={{ height: 220 }}>
              <defs>
                <linearGradient id="gradDay" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#058a81" />
                  <stop offset="100%" stopColor="#058a81" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = D_PAD_T + dPlotH - ratio * dPlotH;
                return (
                  <g key={i}>
                    <line x1={D_PAD_L} y1={y} x2={D_SVG_W - D_PAD_R} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                    <text x={D_PAD_L - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
                      {formatVNDShort(maxDailyVal * ratio)}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              <polygon points={dAreaPoints} fill="url(#gradDay)" opacity="0.18" />
              {/* Line */}
              <polyline points={dPoints} fill="none" stroke="#058a81" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

              {/* Dots + labels */}
              {dailyValues.map((v, i) => {
                const x = D_PAD_L + i * dBarW + dBarW / 2;
                const y = D_PAD_T + dPlotH - (v / maxDailyVal) * dPlotH;
                const isToday = (i + 1) === today && month === (now.getMonth() + 1) && year === now.getFullYear();
                const showLabel = daysInMonth <= 15 || (i + 1) % 2 === 1; // Hiện label ngày lẻ nếu tháng dài
                return (
                  <g key={i}>
                    {showLabel && (
                      <text x={x} y={D_SVG_H - 8} textAnchor="middle" fontSize="8"
                        fill={isToday ? '#058a81' : '#9ca3af'} fontWeight={isToday ? 'bold' : 'normal'}>
                        {i + 1}
                      </text>
                    )}
                    {v > 0 && (
                      <circle cx={x} cy={y} r={isToday ? 5 : 3} fill={isToday ? '#058a81' : 'white'} stroke="#058a81" strokeWidth="2" />
                    )}
                    {/* Tooltip cho ngày hôm nay hoặc ngày có doanh thu cao nhất */}
                    {isToday && v > 0 && (
                      <g>
                        <rect x={x - 28} y={y - 28} width={56} height={18} rx={5} fill="#058a81" />
                        <text x={x} y={y - 15} textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">
                          {formatVNDShort(v)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
              {/* Đường đáy */}
              <line x1={D_PAD_L} y1={D_PAD_T + dPlotH} x2={D_SVG_W - D_PAD_R} y2={D_PAD_T + dPlotH} stroke="#e5e7eb" strokeWidth="1" />
            </svg>
          </div>
        )}
        {/* Tổng kết ngày */}
        {!loadingDaily && (
          <div className="mt-4 flex gap-6 text-sm text-gray-500">
            <span>Tổng ngày có doanh thu: <b className="text-[#058a81]">{dailyValues.filter(v => v > 0).length} ngày</b></span>
            <span>Ngày cao nhất: <b className="text-[#058a81]">{formatVND(Math.max(...dailyValues))}</b></span>
          </div>
        )}
      </div>

      {/* ── BIỂU ĐỒ DOANH THU 12 THÁNG ── */}
      <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">📈 Doanh thu theo tháng — Năm {year}</h3>
          <span className="text-sm text-gray-400 font-bold">Đơn vị: VNĐ</span>
        </div>
        {loading ? (
          <div className="animate-pulse h-[230px] bg-gray-50 rounded-2xl" />
        ) : (
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full min-w-[500px]" style={{ height: 220 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4318FF" />
                  <stop offset="100%" stopColor="#4318FF" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = PAD_T + plotH - ratio * plotH;
                return (
                  <g key={i}>
                    <line x1={PAD_L} y1={y} x2={SVG_W - PAD_R} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                    <text x={PAD_L - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
                      {formatVNDShort(maxVal * ratio)}
                    </text>
                  </g>
                );
              })}
              {/* Area fill */}
              <polygon points={areaPoints} fill="url(#grad)" opacity="0.15" />
              {/* Line */}
              <polyline points={points} fill="none" stroke="#4318FF" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {/* Dots + tháng labels */}
              {chartValues.map((v, i) => {
                const x = PAD_L + i * barW + barW / 2;
                const y = PAD_T + plotH - (v / maxVal) * plotH;
                const isCurrent = (i + 1) === month;
                return (
                  <g key={i}>
                    <text x={x} y={SVG_H - 8} textAnchor="middle" fontSize="10" fill={isCurrent ? '#4318FF' : '#9ca3af'} fontWeight={isCurrent ? 'bold' : 'normal'}>
                      {MONTHS[i]}
                    </text>
                    <circle cx={x} cy={y} r={isCurrent ? 5 : 3.5} fill={isCurrent ? '#4318FF' : 'white'} stroke="#4318FF" strokeWidth="2" />
                    {isCurrent && v > 0 && (
                      <g>
                        <rect x={x - 28} y={y - 28} width={56} height={18} rx={6} fill="#4318FF" />
                        <text x={x} y={y - 15} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">
                          {formatVNDShort(v)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
              <line x1={PAD_L} y1={PAD_T + plotH} x2={SVG_W - PAD_R} y2={PAD_T + plotH} stroke="#e5e7eb" strokeWidth="1" />
            </svg>
          </div>
        )}
      </div>

      {/* Bảng Top bán chạy */}
      {/*<div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-50">
        <h3 className="text-xl font-bold mb-6">🏆 Top sản phẩm bán chạy</h3>
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded"></div>)}
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[#A3AED0] text-xs uppercase border-b">
                <th className="pb-3 font-medium">Hạng</th>
                <th className="pb-3 font-medium">Sản phẩm</th>
                <th className="pb-3 font-medium text-right">Đã bán</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {topSelling.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-50">
                  <td className="py-4">
                    <span className={`w-8 h-8 inline-flex items-center justify-center rounded-full font-black text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-600' : idx === 1 ? 'bg-gray-100 text-gray-600' : idx === 2 ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-4 font-bold">{item.productName}</td>
                  <td className="py-4 text-right font-black text-[#058a81]">{item.totalSold} chiếc</td>
                </tr>
              ))}
              {topSelling.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-gray-400">Chưa có dữ liệu bán hàng</td></tr>}
            </tbody>
          </table>
        )}
      </div>*/}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 🔥 PHÂN TÍCH SẢN PHẨM HOT                              */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">🔥 Phân tích sản phẩm Hot <span className="text-sm font-normal text-gray-400">(30 ngày gần nhất)</span></h3>
          <button
            onClick={handleTriggerHot}
            disabled={triggeringHot}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {triggeringHot ? '⏳ Đang cập nhật...' : '🔄 Cập nhật Hot ngay'}
          </button>
        </div>

        {loadingHot ? (
          <div className="animate-pulse space-y-6">
            <div className="h-[250px] bg-gray-50 rounded-2xl" />
            <div className="h-[250px] bg-gray-50 rounded-2xl" />
          </div>
        ) : !hotData || !hotData.products || hotData.products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">📊</div>
            <p className="font-bold">Chưa có dữ liệu sản phẩm Hot</p>
            <p className="text-sm mt-2">Nhấn nút "Cập nhật Hot ngay" để quét dữ liệu bán hàng và gán nhãn Hot.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* ── DONUT CHART: Tỷ lệ doanh thu ── */}
            {(() => {
              const hotRev = Number(hotData.hotRevenue) || 0;
              const otherRev = Number(hotData.otherRevenue) || 0;
              const totalRev = hotRev + otherRev;
              const hotPct = totalRev > 0 ? (hotRev / totalRev) * 100 : 0;
              const otherPct = totalRev > 0 ? (otherRev / totalRev) * 100 : 0;

              // SVG Donut params
              const cx = 140, cy = 130, R = 90, r = 55;
              const hotAngle = (hotPct / 100) * 360;
              const toRad = (deg) => (deg - 90) * (Math.PI / 180);

              const hotArcEnd = toRad(hotAngle);
              const hotLargeArc = hotAngle > 180 ? 1 : 0;

              const ox1 = cx + R * Math.cos(toRad(0));
              const oy1 = cy + R * Math.sin(toRad(0));
              const ox2 = cx + R * Math.cos(hotArcEnd);
              const oy2 = cy + R * Math.sin(hotArcEnd);
              const ix1 = cx + r * Math.cos(hotArcEnd);
              const iy1 = cy + r * Math.sin(hotArcEnd);
              const ix2 = cx + r * Math.cos(toRad(0));
              const iy2 = cy + r * Math.sin(toRad(0));

              const hotPath = hotPct >= 100
                ? `M ${cx - R},${cy} A ${R},${R} 0 1,1 ${cx + R},${cy} A ${R},${R} 0 1,1 ${cx - R},${cy} Z M ${cx - r},${cy} A ${r},${r} 0 1,0 ${cx + r},${cy} A ${r},${r} 0 1,0 ${cx - r},${cy} Z`
                : hotPct <= 0 ? '' :
                  `M ${ox1},${oy1} A ${R},${R} 0 ${hotLargeArc},1 ${ox2},${oy2} L ${ix1},${iy1} A ${r},${r} 0 ${hotLargeArc},0 ${ix2},${iy2} Z`;

              return (
                <div>
                  <h4 className="text-base font-bold text-gray-700 mb-4">📊 Tỷ lệ đóng góp doanh thu</h4>
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <svg width="280" height="260" viewBox="0 0 280 260" className="flex-shrink-0">
                      <defs>
                        <linearGradient id="hotGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                        <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#ef4444" floodOpacity="0.2" />
                        </filter>
                      </defs>
                      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f3f4f6" strokeWidth={R - r} />
                      {hotPct > 0 && (
                        <path d={hotPath} fill="url(#hotGrad)" filter="url(#donutShadow)" />
                      )}
                      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="900" fill="#2b3674">{hotPct.toFixed(1)}%</text>
                      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#A3AED0">Top 5 Hot</text>
                    </svg>

                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-2xl">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-700">Top 5 sản phẩm Hot</p>
                          <p className="text-lg font-black text-red-600">{hotRev.toLocaleString('vi-VN')}₫</p>
                        </div>
                        <span className="text-sm font-black text-red-500">{hotPct.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                        <div className="w-4 h-4 rounded-full bg-gray-300 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-700">Các sản phẩm khác</p>
                          <p className="text-lg font-black text-gray-600">{otherRev.toLocaleString('vi-VN')}₫</p>
                        </div>
                        <span className="text-sm font-black text-gray-400">{otherPct.toFixed(1)}%</span>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-xl text-center">
                        <p className="text-xs text-blue-400 font-bold">Tổng doanh thu 30 ngày</p>
                        <p className="text-base font-black text-blue-600">{totalRev.toLocaleString('vi-VN')}₫</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── GROUPED BAR CHART: Đã bán vs Tồn kho vs Doanh thu ── */}
            {(() => {
              const products = hotData.products || [];
              const maxVal = Math.max(
                ...products.map(p => Math.max(
                  Number(p.totalSold) || 0,
                  Number(p.currentStock) || 0,
                  (Number(p.revenue) || 0) / 1000000
                )),
                1
              );

              const BAR_W = 700, BAR_H = 280, B_PAD_L = 50, B_PAD_B = 80, B_PAD_T = 30, B_PAD_R = 20;
              const plotW = BAR_W - B_PAD_L - B_PAD_R;
              const plotH = BAR_H - B_PAD_T - B_PAD_B;
              const groupW = plotW / products.length;
              const barWidth = Math.min(groupW * 0.2, 25);
              const barGap = 4;

              return (
                <div>
                  <h4 className="text-base font-bold text-gray-700 mb-4">📦 Số lượng đã bán vs Tồn kho vs Doanh thu — Top 5 Hot</h4>
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-[#058a81]" />
                      <span className="text-xs text-gray-500 font-bold">Đã bán (30 ngày)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-[#7c3aed]" />
                      <span className="text-xs text-gray-500 font-bold">Tồn kho hiện tại</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-[#eab308]" />
                      <span className="text-xs text-gray-500 font-bold">Doanh thu (Tr. VNĐ)</span>
                    </div>
                  </div>
                  <div className="w-full overflow-x-auto">
                    <svg viewBox={`0 0 ${BAR_W} ${BAR_H}`} className="w-full min-w-[500px]" style={{ height: 300 }}>
                      <defs>
                        <linearGradient id="soldGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#058a81" />
                          <stop offset="100%" stopColor="#0d9488" />
                        </linearGradient>
                        <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7c3aed" />
                          <stop offset="100%" stopColor="#a78bfa" />
                        </linearGradient>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#eab308" />
                          <stop offset="100%" stopColor="#ca8a04" />
                        </linearGradient>
                      </defs>

                      {/* Grid lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const y = B_PAD_T + plotH - ratio * plotH;
                        return (
                          <g key={i}>
                            <line x1={B_PAD_L} y1={y} x2={BAR_W - B_PAD_R} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                            <text x={B_PAD_L - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
                              {Math.round(maxVal * ratio)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Bars */}
                      {products.map((p, i) => {
                        const sold = Number(p.totalSold) || 0;
                        const stock = Number(p.currentStock) || 0;
                        const rev = (Number(p.revenue) || 0) / 1000000;
                        const revDisplay = Math.round(rev);
                        const groupX = B_PAD_L + i * groupW;
                        const centerX = groupX + groupW / 2;

                        const soldH = (sold / maxVal) * plotH;
                        const stockH = (stock / maxVal) * plotH;
                        const revH = (rev / maxVal) * plotH;

                        const bar1X = centerX - barWidth * 1.5 - barGap;
                        const bar2X = centerX - barWidth * 0.5;
                        const bar3X = centerX + barWidth * 0.5 + barGap;
                        const baseY = B_PAD_T + plotH;

                        const maxChars = 12;
                        const displayName = p.productName.length > maxChars ? p.productName.substring(0, maxChars) + '…' : p.productName;

                        return (
                          <g key={i}>
                            <rect x={bar1X} y={baseY - soldH} width={barWidth} height={soldH} fill="url(#soldGrad)" rx="4" />
                            <rect x={bar2X} y={baseY - stockH} width={barWidth} height={stockH} fill="url(#stockGrad)" rx="4" />
                            <rect x={bar3X} y={baseY - revH} width={barWidth} height={revH} fill="url(#revGrad)" rx="4" />

                            {sold > 0 && (
                              <text x={bar1X + barWidth / 2} y={baseY - soldH - 6} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#058a81">{sold}</text>
                            )}
                            {stock > 0 && (
                              <text x={bar2X + barWidth / 2} y={baseY - stockH - 6} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#7c3aed">{stock}</text>
                            )}
                            {revDisplay > 0 && (
                              <text x={bar3X + barWidth / 2} y={baseY - revH - 6} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ca8a04">{revDisplay}</text>
                            )}

                            <text x={centerX} y={baseY + 16} textAnchor="middle" fontSize="9" fill="#6b7280" fontWeight="bold">
                              {displayName}
                            </text>
                            <text x={centerX} y={baseY + 30} textAnchor="middle" fontSize="8" fill="#f97316" fontWeight="bold">
                              #{i + 1}
                            </text>
                          </g>
                        );
                      })}

                      <line x1={B_PAD_L} y1={B_PAD_T + plotH} x2={BAR_W - B_PAD_R} y2={B_PAD_T + plotH} stroke="#e5e7eb" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
              );
            })()}

            {/* ── BẢNG CHI TIẾT TOP 5 HOT ── */}
            <div>
              <h4 className="text-base font-bold text-gray-700 mb-4">📋 Chi tiết Top 5 sản phẩm Hot</h4>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[#A3AED0] text-xs uppercase border-b">
                    <th className="pb-3 font-medium">#</th>
                    <th className="pb-3 font-medium">Sản phẩm</th>
                    <th className="pb-3 font-medium text-right">Đã bán</th>
                    <th className="pb-3 font-medium text-right">Tồn kho</th>
                    <th className="pb-3 font-medium text-right">Doanh thu</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {hotData.products.map((p, idx) => (
                    <tr key={idx} className="border-b border-gray-50">
                      <td className="py-4">
                        <span className="w-8 h-8 inline-flex items-center justify-center rounded-full font-black text-sm bg-gradient-to-r from-red-100 to-orange-100 text-orange-600">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          {p.image && <img src={p.image} alt="" className="w-10 h-10 object-contain rounded-lg bg-gray-50" />}
                          <span className="font-bold">{p.productName}</span>
                        </div>
                      </td>
                      <td className="py-4 text-right font-black text-[#058a81]">{p.totalSold} chiếc</td>
                      <td className="py-4 text-right font-black text-[#7c3aed]">{p.currentStock}</td>
                      <td className="py-4 text-right font-black text-red-600">{Number(p.revenue).toLocaleString('vi-VN')}₫</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// ====================================================================
// 2. QUẢN LÝ ĐƠN HÀNG - API thực
// ====================================================================
const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const statusTabs = [
    { label: 'Tất cả', value: '' },
    { label: 'Chờ duyệt', value: 'PENDING' },
    { label: 'Đã thanh toán', value: 'PAID' },
    { label: 'Đang giao', value: 'SHIPPING' },
    { label: 'Đã giao', value: 'DELIVERED' },
    { label: 'Đã hủy', value: 'CANCELLED' },
    { label: 'Bị từ chối', value: 'REJECTED' },
  ];

  const statusColor = {
    'PENDING': 'bg-orange-100 text-orange-600',
    'PAID': 'bg-blue-100 text-blue-600',
    'SHIPPING': 'bg-purple-100 text-purple-600',
    'DELIVERED': 'bg-green-100 text-green-600',
    'CANCELLED': 'bg-gray-100 text-gray-500',
    'REJECTED': 'bg-red-100 text-red-600',
  };

  const statusLabel = {
    'PENDING': 'Chờ duyệt', 'SHIPPING': 'Đang giao',
    'DELIVERED': 'Đã giao', 'CANCELLED': 'Đã hủy', 'REJECTED': 'Bị từ chối',
  };

  useEffect(() => { loadOrders(); }, [filterStatus, page]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders({ status: filterStatus || undefined, keyword: keyword || undefined, page, size: 10, sortBy: 'createdAt', sortDir: 'desc' });
      const pageData = data.result;
      setOrders(pageData.content || []);
      setTotalPages(pageData.totalPages);
    } catch (err) {
      console.error("Lỗi load đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportInvoice = async (orderId) => {
    try {
      const data = await exportInvoice(orderId);
      console.log('Invoice data:', data.result);
      alert('Đã lấy dữ liệu hóa đơn thành công! (Mở F12 Console để xem)');
    } catch (err) {
      alert(err.message || 'Lỗi xuất hóa đơn!');
    }
  };

  const handleSearch = () => { setPage(0); loadOrders(); };

  const handleUpdateStatus = async (orderId, status) => {
    if (!confirm(`Xác nhận chuyển trạng thái sang "${statusLabel[status]}"?`)) return;
    try {
      await updateOrderStatus(orderId, status);
      alert('Cập nhật thành công! ✅');
      loadOrders();
      setSelectedOrder(null);
    } catch (err) { alert(err.message || 'Lỗi cập nhật!'); }
  };

  const handleReject = async (orderId) => {
    if (!rejectReason.trim()) return alert('Vui lòng nhập lý do từ chối!');
    try {
      await rejectOrder(orderId, rejectReason);
      alert('Đã từ chối đơn hàng!');
      setShowRejectModal(false);
      setRejectReason('');
      loadOrders();
      setSelectedOrder(null);
    } catch (err) { alert(err.message || 'Lỗi!'); }
  };

  const handleConfirmPayment = async (orderId) => {
    try {
      await confirmPayment(orderId);
      alert('Xác nhận thanh toán thành công! ✅');
      loadOrders();
    } catch (err) { alert(err.message || 'Lỗi!'); }
  };

  const formatDate = (d) => { if (!d) return ''; const dt = new Date(d); return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`; };
  const formatVND = (v) => v ? Number(v).toLocaleString('vi-VN') + '₫' : '0₫';

  const handleViewDetail = async (order) => {
    try {
      const data = await getOrderDetail(order.orderID);
      setSelectedOrder(data.result);
    } catch {
      setSelectedOrder(order);
    }
  };

  return (
    <div className="flex gap-8">
      {/* DANH SÁCH ĐƠN */}
      <div className={`transition-all duration-500 bg-white rounded-3xl shadow-sm p-8 border border-gray-50 ${selectedOrder ? 'w-2/3' : 'w-full'}`}>
        {/* Tabs trạng thái */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {statusTabs.map(tab => (
            <button key={tab.value} onClick={() => { setFilterStatus(tab.value); setPage(0); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${filterStatus === tab.value ? 'bg-[#4318FF] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Thanh search */}
        <div className="flex gap-2 mb-6">
          <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Tìm theo tên khách, SĐT..." className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-[#4318FF]" />
          <button onClick={handleSearch} className="bg-[#4318FF] text-white px-6 rounded-xl font-bold text-sm cursor-pointer">🔍</button>
        </div>

        {/* Bảng đơn hàng */}
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse"></div>)}</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[#A3AED0] text-xs uppercase border-b border-gray-100">
                <th className="pb-4 font-medium">Mã đơn</th>
                <th className="pb-4 font-medium">Người nhận</th>
                <th className="pb-4 font-medium">Ngày đặt</th>
                <th className="pb-4 font-medium text-right">Tổng tiền</th>
                <th className="pb-4 font-medium text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {orders.map(order => (
                <tr key={order.orderID} onClick={() => handleViewDetail(order)}
                  className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition ${selectedOrder?.orderID === order.orderID ? 'bg-blue-50/50' : ''}`}>
                  <td className="py-4 font-black">#{order.orderID}</td>
                  <td className="py-4 font-bold text-[#058a81]">{order.receiverName}</td>
                  <td className="py-4 text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="py-4 font-black text-right text-red-600">{formatVND(order.total)}</td>
                  <td className="py-4 text-center">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${statusColor[order.status] || 'bg-gray-100'}`}>
                      {statusLabel[order.status] || order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-gray-400">Không có đơn hàng nào</td></tr>}
            </tbody>
          </table>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
              className="px-4 py-2 rounded-lg border text-sm font-bold disabled:opacity-30 cursor-pointer">← Trước</button>
            <span className="px-4 py-2 text-sm font-bold text-gray-500">Trang {page + 1} / {totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}
              className="px-4 py-2 rounded-lg border text-sm font-bold disabled:opacity-30 cursor-pointer">Sau →</button>
          </div>
        )}
      </div>

      {/* PANEL CHI TIẾT + HÀNH ĐỘNG */}
      {selectedOrder && (
        <div className="w-1/3 bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-0 h-fit space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-xl font-black">Đơn #{selectedOrder.orderID}</h4>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase mt-2 inline-block ${statusColor[selectedOrder.status]}`}>
                {statusLabel[selectedOrder.status]}
              </span>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="text-gray-300 hover:text-black text-xl cursor-pointer">✕</button>
          </div>

          {/* Thông tin khách */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Người nhận:</span><span className="font-bold">{selectedOrder.receiverName}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">SĐT:</span><span className="font-bold">{selectedOrder.phoneNumber}</span></div>
            <div className="flex flex-col gap-1"><span className="text-gray-400">Địa chỉ:</span><span className="font-bold">{selectedOrder.shippingAddress}</span></div>
            {selectedOrder.note && <div className="flex justify-between"><span className="text-gray-400">Ghi chú:</span><span className="font-bold">{selectedOrder.note}</span></div>}
            <div className="flex justify-between border-t pt-3"><span className="text-gray-400">Tổng tiền:</span><span className="font-black text-red-600 text-lg">{formatVND(selectedOrder.total)}</span></div>
          </div>

          {/* Sản phẩm trong đơn */}
          {selectedOrder.details && selectedOrder.details.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400 font-bold uppercase">Sản phẩm ({selectedOrder.details.length})</p>
              {selectedOrder.details.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-center bg-gray-50 rounded-xl p-3">
                  <img src={item.imageURL} alt="" className="w-10 h-10 object-contain rounded" />
                  <div className="flex-1">
                    <p className="text-xs font-bold line-clamp-1">{item.productName}</p>
                    <p className="text-[10px] text-gray-400">{item.colour} {item.storage} × {item.quantity}</p>
                  </div>
                  <span className="text-xs font-black text-red-600">{formatVND(item.price)}</span>
                </div>
              ))}
            </div>
          )}

          {/* NÚT HÀNH ĐỘNG theo trạng thái */}
          <div className="space-y-2 border-t pt-4">
            {selectedOrder.status === 'PENDING' && (
              <>
                <button onClick={() => handleUpdateStatus(selectedOrder.orderID, 'SHIPPING')}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition cursor-pointer">🚚 Duyệt & Chuyển giao hàng</button>
                <div className="flex gap-2">
                  <button onClick={() => handleExportInvoice(selectedOrder.orderID)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition cursor-pointer">🖨️ Xuất HĐ</button>
                  <button onClick={() => setShowRejectModal(true)}
                    className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition cursor-pointer">❌ Từ chối</button>
                </div>
              </>
            )}
            {selectedOrder.status === 'PAID' && (
              <button onClick={() => handleUpdateStatus(selectedOrder.orderID, 'SHIPPING')}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition cursor-pointer">🚚 Chuyển giao hàng</button>
            )}
            {selectedOrder.status === 'SHIPPING' && (
              <button onClick={() => handleUpdateStatus(selectedOrder.orderID, 'DELIVERED')}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition cursor-pointer">📦 Xác nhận đã giao</button>
            )}
            {/* Xuất hóa đơn cho đơn đã xử lý */}
            {selectedOrder.status !== 'PENDING' && (
              <button onClick={() => handleExportInvoice(selectedOrder.orderID)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition cursor-pointer">🖨️ Xuất Hóa đơn</button>
            )}
          </div>

          {/* Modal từ chối */}
          {showRejectModal && (
            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-bold text-red-600">Lý do từ chối:</p>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do..." className="w-full bg-gray-50 rounded-xl p-3 text-sm outline-none border focus:border-red-400 resize-none" rows={3} />
              <div className="flex gap-2">
                <button onClick={() => handleReject(selectedOrder.orderID)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-xl font-bold cursor-pointer">Xác nhận từ chối</button>
                <button onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-gray-400 font-bold cursor-pointer">Hủy</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ====================================================================
// 3. DANH SÁCH SẢN PHẨM - API thực
// ====================================================================
const ProductList = ({ onNavigateToUpload, onViewDetail }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [brands, setBrands] = useState([]);
  const [brandFilter, setBrandFilter] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => { loadProducts(); loadBrands(); }, [page, brandFilter]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts({ page, size: 15, brandId: brandFilter || undefined, keyword: searchKeyword || undefined });
      const pageData = data.result;
      setProducts(pageData.content || []);
      setTotalPages(pageData.totalPages);
    } catch (err) { console.error("Lỗi load SP:", err); }
    finally { setLoading(false); }
  };

  const handleSearchProducts = () => { setPage(0); loadProducts(); };

  const loadBrands = async () => {
    try {
      const data = await getBrands();
      setBrands(data.result || []);
    } catch { }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await deleteProduct(id);
      alert('Đã xóa sản phẩm! 🗑️');
      loadProducts();
    } catch (err) { alert(err.message || 'Lỗi xóa!'); }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Kho sản phẩm ({products.length})</h3>
        <button onClick={onNavigateToUpload}
          className="bg-[#4318FF] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition cursor-pointer">
          + Thêm SP mới
        </button>
      </div>

      {/* Thanh lọc */}
      <div className="flex gap-2 mb-6">
        <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchProducts()}
          placeholder="Tìm sản phẩm..." className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-[#4318FF]" />
        <select value={brandFilter} onChange={(e) => { setBrandFilter(e.target.value); setPage(0); }}
          className="bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none font-bold">
          <option value="">Tất cả hãng</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <button onClick={handleSearchProducts} className="bg-[#4318FF] text-white px-6 rounded-xl font-bold text-sm cursor-pointer">🔍</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse"></div>)}</div>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="text-[#A3AED0] text-xs uppercase border-b border-gray-100">
              <th className="pb-4 font-medium">Sản phẩm</th>
              <th className="pb-4 font-medium">Hãng</th>
              <th className="pb-4 font-medium text-right">Giá từ</th>
              <th className="pb-4 font-medium text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {products.map(p => (
              <tr key={p.id} onClick={() => onViewDetail(p.id)}
                className="border-b border-gray-50 hover:bg-indigo-50/40 transition group cursor-pointer">
                <td className="py-4 flex items-center gap-4">
                  <img src={p.image} className="w-12 h-12 object-contain bg-gray-50 rounded-lg p-1" alt="" />
                  <span className="font-bold text-[#2b3674] group-hover:text-[#4318FF] transition line-clamp-1">{p.name}</span>
                </td>
                <td className="py-4 text-gray-500">{p.brandName}</td>
                <td className="py-4 font-bold text-right text-red-600">{p.minPrice ? Number(p.minPrice).toLocaleString('vi-VN') + '₫' : '-'}</td>
                <td className="py-4 text-center">
                  <div className="flex gap-2 justify-center">
                    <button onClick={(e) => { e.stopPropagation(); onViewDetail(p.id); }} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition cursor-pointer" title="Xem chi tiết">🔍</button>
                    <button onClick={(e) => handleDelete(p.id, e)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition cursor-pointer" title="Xóa">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-4 py-2 rounded-lg border text-sm font-bold disabled:opacity-30 cursor-pointer">←</button>
          <span className="px-4 py-2 text-sm font-bold text-gray-500">{page + 1} / {totalPages}</span>
          <button onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1} className="px-4 py-2 rounded-lg border text-sm font-bold disabled:opacity-30 cursor-pointer">→</button>
        </div>
      )}
    </div>
  );
};

// ====================================================================
// 3b. CHI TIẾT SẢN PHẨM ADMIN - Đầy đủ thông số + sửa version
// ====================================================================
const ProductDetailAdmin = ({ productId, onBack, onDeleted }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', image: '', brandId: '' });
  const [mainImage, setMainImage] = useState('');
  const [versionEdits, setVersionEdits] = useState({}); // { versionId: { price, stock } }
  const [savingVersions, setSavingVersions] = useState({});
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [deletingGallery, setDeletingGallery] = useState({});
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'versions' | 'specs'
  const [specsEdit, setSpecsEdit] = useState({
    screenSize: '', screenTech: '', rearCamera: '', frontCamera: '',
    chipset: '', ram: '', rom: '', battery: '', os: '',
  });
  const [savingSpecs, setSavingSpecs] = useState(false);

  useEffect(() => {
    loadDetail();
    getBrands().then(d => setBrands(d.result || [])).catch(() => { });
  }, [productId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await getProductDetail(productId);
      const p = data.result;
      setProduct(p);
      setEditForm({
        name: p.name || '',
        description: p.description || '',
        image: p.image || '',
        brandId: p.brandId ? String(p.brandId) : '',
      });
      setMainImage(p.image || '');
      // Khởi tạo versionEdits từ data thực
      const initEdits = {};
      (p.versions || []).forEach(v => {
        initEdits[v.versionID] = { price: v.price || '', stock: v.stock ?? '' };
      });
      setVersionEdits(initEdits);
      // Khởi tạo specsEdit
      const s = p.specs || {};
      setSpecsEdit({
        screenSize: s.screenSize || '',
        screenTech: s.screenTech || '',
        rearCamera: s.rearCamera || '',
        frontCamera: s.frontCamera || '',
        chipset: s.chipset || '',
        ram: s.ram || '',
        rom: s.rom || '',
        battery: s.battery || '',
        os: s.os || '',
      });
    } catch (err) { console.error('Lỗi load chi tiết SP:', err); }
    finally { setLoading(false); }
  };

  const handleSaveInfo = async () => {
    setSaving(true);
    try {
      await updateProduct(productId, {
        name: editForm.name,
        description: editForm.description,
        image: editForm.image,
        brandId: editForm.brandId ? Number(editForm.brandId) : undefined,
      });
      alert('Cập nhật thông tin thành công! ✅');
      loadDetail();
    } catch (err) { alert(err.message || 'Lỗi cập nhật!'); }
    finally { setSaving(false); }
  };

  const handleSaveSpecs = async () => {
    setSavingSpecs(true);
    try {
      await updateProduct(productId, { specifications: specsEdit });
      alert('Cập nhật thông số kỹ thuật thành công! ✅');
      loadDetail();
    } catch (err) { alert(err.message || 'Lỗi cập nhật thông số!'); }
    finally { setSavingSpecs(false); }
  };

  const handleRemoveCoverImage = async () => {
    if (!confirm('Xóa ảnh đại diện hiện tại?')) return;
    try {
      await updateProduct(productId, { image: '' });
      setEditForm(prev => ({ ...prev, image: '' }));
      setMainImage('');
      alert('Đã xóa ảnh đại diện! ✅');
      loadDetail();
    } catch (err) { alert(err.message || 'Lỗi xóa ảnh!'); }
  };

  const handleSaveVersion = async (versionId) => {
    setSavingVersions(prev => ({ ...prev, [versionId]: true }));
    try {
      const edit = versionEdits[versionId];
      // Truyền ĐẦY ĐỦ các field để backend không overwrite bằng null
      const origVersion = (product?.versions || []).find(v => v.versionID === versionId);
      await updateVersion(versionId, {
        price: Number(edit.price),
        stock: Number(edit.stock),
        colour: origVersion?.colour || '',
        storage: origVersion?.storage || '',
        material: origVersion?.material || '',
        imageURL: origVersion?.imageURL || '',
      });
      alert('Cập nhật phiên bản thành công! ✅');
      loadDetail();
    } catch (err) { alert(err.message || 'Lỗi cập nhật version!'); }
    finally { setSavingVersions(prev => ({ ...prev, [versionId]: false })); }
  };

  const handleDelete = async () => {
    if (!confirm('Xóa sản phẩm này? Thao tác không thể hoàn tác!')) return;
    try {
      await deleteProduct(productId);
      alert('Đã xóa sản phẩm!');
      onDeleted();
    } catch (err) { alert(err.message || 'Lỗi xóa!'); }
  };

  const handleGallerySelect = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles(prev => [...prev, ...files]);
    setGalleryPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const handleUploadGallery = async () => {
    if (!galleryFiles.length) return;
    setUploadingGallery(true);
    try {
      await uploadGallery(productId, galleryFiles);
      alert('Upload gallery thành công! 📸');
      setGalleryFiles([]);
      setGalleryPreviews([]);
      loadDetail();
    } catch (err) { alert(err.message || 'Lỗi upload!'); }
    finally { setUploadingGallery(false); }
  };

  const handleDeleteGalleryImage = async (imageUrl) => {
    if (!confirm('Xóa ảnh gallery này?')) return;
    setDeletingGallery(prev => ({ ...prev, [imageUrl]: true }));
    try {
      await deleteGalleryImage(productId, imageUrl);
      alert('Đã xóa ảnh gallery! ✅');
      loadDetail();
    } catch (err) { alert(err.message || 'Lỗi xóa ảnh gallery!'); }
    finally { setDeletingGallery(prev => ({ ...prev, [imageUrl]: false })); }
  };

  const formatVND = (v) => v ? Number(v).toLocaleString('vi-VN') + '₫' : '-';


  if (loading) return (
    <div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
  );
  if (!product) return <div className="text-center py-20 text-gray-400">Không tìm thấy sản phẩm</div>;

  const specs = product.specs || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#4318FF] font-bold cursor-pointer transition">
          ← Quay lại danh sách
        </button>
        <div className="flex-1" />
        <button onClick={handleDelete} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 cursor-pointer transition">
          🗑️ Xóa sản phẩm
        </button>
      </div>

      {/* Hero block */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-50 p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Ảnh + Gallery */}
          <div className="lg:w-2/5 space-y-4">
            <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center min-h-[280px] border border-gray-100">
              <img src={mainImage || product.image} alt={product.name} className="max-h-[260px] object-contain" />
            </div>
            {/* Thumbnail gallery với nút xóa */}
            {product.imageUrls?.length > 0 && (
              <div>
                <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-2">Gallery hiện tại ({product.imageUrls.length} ảnh)</label>
                <div className="flex gap-2 flex-wrap">
                  {product.imageUrls.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <div onClick={() => setMainImage(url)}
                        className={`w-16 h-16 border-2 rounded-xl p-1 cursor-pointer transition-all ${mainImage === url ? 'border-[#4318FF]' : 'border-gray-100 hover:border-gray-300'}`}>
                        <img src={url} alt="" className="w-full h-full object-contain" />
                      </div>
                      <button
                        onClick={() => handleDeleteGalleryImage(url)}
                        disabled={deletingGallery[url]}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[9px] font-black opacity-0 group-hover:opacity-100 transition cursor-pointer flex items-center justify-center shadow-md hover:bg-red-600 disabled:opacity-50"
                        title="Xóa ảnh này"
                      >
                        {deletingGallery[url] ? '⏳' : '✕'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Upload gallery */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#A3AED0] uppercase block">Thêm ảnh Gallery</label>
              <input type="file" accept="image/*" multiple onChange={handleGallerySelect}
                className="w-full bg-gray-50 rounded-xl p-2 outline-none text-xs border" />
              {galleryPreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {galleryPreviews.map((url, idx) => (
                    <img key={idx} src={url} className="w-12 h-12 object-cover rounded-lg border" alt="" />
                  ))}
                </div>
              )}
              {galleryFiles.length > 0 && (
                <button onClick={handleUploadGallery} disabled={uploadingGallery}
                  className="w-full bg-[#058a81] text-white py-2 rounded-xl text-sm font-bold hover:bg-teal-700 transition cursor-pointer">
                  {uploadingGallery ? '⏳ Đang upload...' : `📸 Upload ${galleryFiles.length} ảnh`}
                </button>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl font-black text-[#2b3674]">{product.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-400">ID: {product.id}</span>
                {product.brandName && <span className="bg-indigo-50 text-[#4318FF] text-xs px-3 py-1 rounded-full font-bold">{product.brandName}</span>}
              </div>
            </div>

            {/* Giá hiển thị nhanh */}
            <div className="flex gap-4 py-2 border-y border-gray-100">
              <div>
                <p className="text-xs text-gray-400">Giá thấp nhất</p>
                <p className="text-xl font-black text-red-600">{formatVND(product.minPrice)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Số phiên bản</p>
                <p className="text-xl font-black text-[#4318FF]">{product.versions?.length || 0}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              {['info', 'versions', 'specs'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${activeTab === tab ? 'bg-[#4318FF] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {tab === 'info' ? '✏️ Thông tin' : tab === 'versions' ? '📦 Phiên bản' : '📋 Thông số'}
                </button>
              ))}
            </div>

            {/* Tab: Thông tin cơ bản */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-1">Tên sản phẩm</label>
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none font-bold border border-transparent focus:border-[#4318FF]" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-1">Hãng</label>
                  <select value={editForm.brandId} onChange={(e) => setEditForm({ ...editForm, brandId: e.target.value })}
                    className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none font-bold border border-transparent focus:border-[#4318FF]">
                    <option value="">-- Chọn hãng --</option>
                    {brands.map(b => <option key={b.id} value={String(b.id)}>{b.name}</option>)}
                  </select>
                  {product.brandName && (
                    <p className="text-[10px] text-gray-400 mt-1">Hãng hiện tại: <span className="font-bold text-[#4318FF]">{product.brandName}</span></p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-1">Ảnh đại diện</label>
                  {/* Xem ảnh hiện tại và xóa */}
                  {editForm.image && (
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border mb-2">
                      <img src={editForm.image} alt="Ảnh đại diện" className="w-16 h-16 object-contain rounded-lg border bg-white" />
                      <div>
                        <p className="text-[10px] text-gray-400 mb-1">Ảnh đại diện hiện tại</p>
                        <button onClick={handleRemoveCoverImage}
                          className="text-[10px] bg-red-50 text-red-500 px-2 py-1 rounded-lg font-bold hover:bg-red-100 cursor-pointer transition">
                          🗑️ Xóa ảnh này
                        </button>
                      </div>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={async (e) => {
                    if (e.target.files[0]) {
                      const res = await uploadImage(e.target.files[0]);
                      setEditForm({ ...editForm, image: res.result });
                      setMainImage(res.result);
                    }
                  }} className="w-full bg-[#f4f7fe] rounded-xl p-2 outline-none text-sm border" />
                  <p className="text-[10px] text-gray-400 mt-1">↑ Chọn ảnh mới để thay thế</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-1">Mô tả</label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none text-sm h-28 resize-none" />
                </div>
                <button onClick={handleSaveInfo} disabled={saving}
                  className="w-full bg-[#4318FF] text-white py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition cursor-pointer">
                  {saving ? '⏳ Đang lưu...' : '💾 LƯU THÔNG TIN'}
                </button>
              </div>
            )}

            {/* Tab: Phiên bản */}
            {activeTab === 'versions' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 font-bold uppercase">Cập nhật giá & kho từng phiên bản</p>
                {(product.versions || []).length === 0 && <p className="text-gray-400 text-sm">Chưa có phiên bản nào</p>}
                {(product.versions || []).map(v => {
                  const edit = versionEdits[v.versionID] || { price: v.price, stock: v.stock };
                  const isSaving = savingVersions[v.versionID];
                  return (
                    <div key={v.versionID} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        {v.imageURL && <img src={v.imageURL} className="w-10 h-10 object-contain rounded-lg bg-white border" alt="" />}
                        <div>
                          <p className="font-bold text-sm">{v.colour} / {v.storage}</p>
                          {v.material && <p className="text-xs text-gray-400">{v.material}</p>}
                          <p className="text-[10px] text-gray-300">Version ID: {v.versionID}</p>
                        </div>
                        <div className={`ml-auto px-2 py-1 rounded-lg text-[10px] font-black ${v.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                          {v.stock > 0 ? `Còn ${v.stock} máy` : 'Hết hàng'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-1">Giá (₫)</label>
                          <input type="number" value={edit.price}
                            onChange={(e) => setVersionEdits(prev => ({ ...prev, [v.versionID]: { ...edit, price: e.target.value } }))}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-[#4318FF]" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-1">Tồn kho</label>
                          <input type="number" value={edit.stock}
                            onChange={(e) => setVersionEdits(prev => ({ ...prev, [v.versionID]: { ...edit, stock: e.target.value } }))}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-[#4318FF]" />
                        </div>
                      </div>
                      <button onClick={() => handleSaveVersion(v.versionID)} disabled={isSaving}
                        className="mt-3 w-full bg-[#058a81] text-white py-2 rounded-xl text-sm font-bold hover:bg-teal-700 transition cursor-pointer">
                        {isSaving ? '⏳ Đang lưu...' : '💾 Lưu phiên bản này'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab: Thông số kỹ thuật - CÓ CHỈNH SỬA */}
            {activeTab === 'specs' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 font-bold uppercase">Chỉnh sửa thông số kỹ thuật</p>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                  {[
                    { key: 'screenSize', label: 'Màn hình', placeholder: 'VD: 6.9 inches' },
                    { key: 'screenTech', label: 'Công nghệ màn hình', placeholder: 'VD: Super Retina XDR OLED' },
                    { key: 'rearCamera', label: 'Camera sau', placeholder: 'VD: 48MP + 12MP' },
                    { key: 'frontCamera', label: 'Camera trước', placeholder: 'VD: 12MP TrueDepth' },
                    { key: 'chipset', label: 'Chip xử lý', placeholder: 'VD: Apple A18 Pro' },
                    { key: 'ram', label: 'RAM', placeholder: 'VD: 12GB' },
                    { key: 'rom', label: 'ROM', placeholder: 'VD: 256GB / 512GB' },
                    { key: 'battery', label: 'Pin', placeholder: 'VD: 4685 mAh' },
                    { key: 'os', label: 'Hệ điều hành', placeholder: 'VD: iOS 18' },
                  ].map(field => (
                    <div key={field.key} className="flex items-center gap-3">
                      <label className="text-xs font-black text-[#A3AED0] uppercase w-36 shrink-0">{field.label}</label>
                      <input
                        type="text"
                        value={specsEdit[field.key] || ''}
                        onChange={(e) => setSpecsEdit(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:border-[#4318FF] text-[#2b3674]"
                      />
                    </div>
                  ))}
                </div>
                <button onClick={handleSaveSpecs} disabled={savingSpecs}
                  className="w-full bg-[#4318FF] text-white py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition cursor-pointer">
                  {savingSpecs ? '⏳ Đang lưu...' : '💾 LƯU THÔNG SỐ KỸ THUẬT'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ====================================================================
// 4. THÊM SẢN PHẨM MỚI - API thực
// ====================================================================
const ProductUpload = ({ onSuccess }) => {
  const [brands, setBrands] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', image: '', brandId: '', categoryId: 1,
  });
  const [specs, setSpecs] = useState({
    screenSize: '', screenTech: '', rearCamera: '', frontCamera: '',
    chipset: '', ram: '', rom: '', battery: '', os: '',
  });
  const [versions, setVersions] = useState([
    { colour: '', storage: '', price: '', stock: '', imageURL: '', material: '' }
  ]);
  // Gallery states
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [createdProductId, setCreatedProductId] = useState(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    getBrands().then(data => setBrands(data.result || [])).catch(() => { });
  }, []);

  const addVersion = () => {
    setVersions([...versions, { colour: '', storage: '', price: '', stock: '', imageURL: '', material: '' }]);
  };

  const removeVersion = (idx) => {
    if (versions.length <= 1) return;
    setVersions(versions.filter((_, i) => i !== idx));
  };

  const updateVersion = (idx, field, value) => {
    const updated = [...versions];
    updated[idx] = { ...updated[idx], [field]: value };
    setVersions(updated);
  };

  const handleGallerySelect = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles(prev => [...prev, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setGalleryPreviews(prev => [...prev, ...previews]);
  };

  const removeGalleryFile = (idx) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== idx));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUploadGallery = async (productId) => {
    if (galleryFiles.length === 0) return;
    setUploadingGallery(true);
    try {
      await uploadGallery(productId, galleryFiles);
      alert('Upload ảnh gallery thành công! 📸');
    } catch (err) {
      alert(err.message || 'Lỗi upload gallery!');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return alert('Tên SP không được trống!');
    if (!form.brandId) return alert('Vui lòng chọn hãng!');
    if (versions.some(v => !v.colour || !v.storage || !v.price)) return alert('Vui lòng điền đủ thông tin version!');

    setSaving(true);
    try {
      const result = await createProduct({
        name: form.name,
        description: form.description,
        image: form.image,
        brandId: Number(form.brandId),
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        specifications: specs,
        versions: versions.map(v => ({
          ...v,
          price: Number(v.price),
          stock: Number(v.stock) || 0,
        })),
      });
      const newProductId = result.result?.id;
      // Nếu có ảnh gallery đã chọn → upload luôn
      if (galleryFiles.length > 0 && newProductId) {
        await handleUploadGallery(newProductId);
      }
      alert('Thêm sản phẩm thành công! 🎉');
      onSuccess();
    } catch (err) {
      alert(err.message || 'Lỗi tạo SP!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* CỘT TRÁI: ẢNH & VERSIONS */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
          <h4 className="font-bold mb-4">Ảnh đại diện (Upload)</h4>
          <input type="file" accept="image/*" onChange={async (e) => {
            if (e.target.files[0]) {
              const res = await uploadImage(e.target.files[0]);
              setForm({ ...form, image: res.result });
            }
          }} className="w-full bg-[#f4f7fe] rounded-xl p-2 outline-none text-sm mb-4" />
          {form.image && <img src={form.image} className="w-full h-40 object-contain bg-gray-50 rounded-2xl" alt="preview" />}
        </div>

        {/* Ảnh gallery (các góc) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
          <h4 className="font-bold mb-4">📸 Ảnh các góc (Gallery 360°)</h4>
          <p className="text-xs text-gray-400 mb-4">Chọn nhiều ảnh từ các góc khác nhau của sản phẩm. Ảnh sẽ được upload lên Cloudinary.</p>
          <label className="block w-full border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-[#4318FF] hover:bg-[#f4f7fe] transition">
            <input type="file" multiple accept="image/*" onChange={handleGallerySelect} className="hidden" />
            <span className="text-3xl block mb-2">📁</span>
            <span className="text-sm font-bold text-gray-500">Nhấn để chọn ảnh (có thể chọn nhiều)</span>
          </label>
          {galleryPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {galleryPreviews.map((src, idx) => (
                <div key={idx} className="relative group">
                  <img src={src} className="w-full h-24 object-cover rounded-xl border" alt={`gallery-${idx}`} />
                  <button onClick={() => removeGalleryFile(idx)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold opacity-0 group-hover:opacity-100 transition cursor-pointer">✕</button>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-gray-400 mt-2">{galleryFiles.length} ảnh đã chọn</p>
        </div>

        {/* Versions */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold">Phiên bản ({versions.length})</h4>
            <button onClick={addVersion} className="text-[#4318FF] text-sm font-bold cursor-pointer">+ Thêm</button>
          </div>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {versions.map((v, idx) => (
              <div key={idx} className="bg-[#f4f7fe] rounded-2xl p-4 space-y-3 relative">
                {versions.length > 1 && (
                  <button onClick={() => removeVersion(idx)} className="absolute top-2 right-3 text-red-400 hover:text-red-600 cursor-pointer text-sm">✕</button>
                )}
                <p className="text-[10px] font-black text-gray-400 uppercase">Version #{idx + 1}</p>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={v.colour} onChange={(e) => updateVersion(idx, 'colour', e.target.value)}
                    placeholder="Màu sắc" className="bg-white rounded-lg p-2 text-xs outline-none border" />
                  <input type="text" value={v.storage} onChange={(e) => updateVersion(idx, 'storage', e.target.value)}
                    placeholder="Dung lượng" className="bg-white rounded-lg p-2 text-xs outline-none border" />
                  <input type="number" value={v.price} onChange={(e) => updateVersion(idx, 'price', e.target.value)}
                    placeholder="Giá (VND)" className="bg-white rounded-lg p-2 text-xs outline-none border" />
                  <input type="number" value={v.stock} onChange={(e) => updateVersion(idx, 'stock', e.target.value)}
                    placeholder="Tồn kho" className="bg-white rounded-lg p-2 text-xs outline-none border" />
                </div>
                <input type="file" accept="image/*" onChange={async (e) => {
                  if (e.target.files[0]) {
                    const res = await uploadImage(e.target.files[0]);
                    updateVersion(idx, 'imageURL', res.result);
                  }
                }} className="w-full bg-white rounded-lg p-1 text-xs outline-none border text-gray-400" />
                {v.imageURL && <p className="text-[9px] text-green-600 truncate">Ảnh: {String(v.imageURL).substring(0, 30)}...</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CỘT PHẢI: THÔNG TIN CHUNG + THÔNG SỐ */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 space-y-6">
          <h4 className="font-bold">Thông tin chung</h4>
          <div>
            <label className="text-sm font-bold block mb-2">Tên sản phẩm *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VD: iPhone 17 Pro Max" className="w-full bg-[#f4f7fe] rounded-2xl p-4 outline-none border border-transparent focus:border-[#4318FF]" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-bold block mb-2">Hãng *</label>
              <select value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                className="w-full bg-[#f4f7fe] rounded-2xl p-4 outline-none">
                <option value="">-- Chọn hãng --</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold block mb-2">Category ID</label>
              <input type="number" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full bg-[#f4f7fe] rounded-2xl p-4 outline-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold block mb-2">Mô tả sản phẩm</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4} placeholder="Mô tả đặc điểm nổi bật..."
              className="w-full bg-[#f4f7fe] rounded-2xl p-4 outline-none resize-none" />
          </div>
        </div>

        {/* Thông số kỹ thuật */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 space-y-6">
          <h4 className="font-bold">Thông số kỹ thuật</h4>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'screenSize', label: 'Kích thước màn hình', placeholder: '6.9 inches' },
              { key: 'screenTech', label: 'Công nghệ màn hình', placeholder: 'Super Retina XDR OLED' },
              { key: 'rearCamera', label: 'Camera sau', placeholder: '48MP + 12MP + 12MP' },
              { key: 'frontCamera', label: 'Camera trước', placeholder: '12MP TrueDepth' },
              { key: 'chipset', label: 'Chipset', placeholder: 'Apple A19 Pro' },
              { key: 'ram', label: 'RAM', placeholder: '12GB' },
              { key: 'rom', label: 'Bộ nhớ trong', placeholder: '256GB / 512GB / 1TB' },
              { key: 'battery', label: 'Pin', placeholder: '4685 mAh' },
              { key: 'os', label: 'Hệ điều hành', placeholder: 'iOS 19' },
            ].map(field => (
              <div key={field.key}>
                <label className="text-xs font-bold text-gray-400 block mb-1">{field.label}</label>
                <input type="text" value={specs[field.key]} onChange={(e) => setSpecs({ ...specs, [field.key]: e.target.value })}
                  placeholder={field.placeholder} className="w-full bg-[#f4f7fe] rounded-xl p-3 text-sm outline-none" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 bg-[#4318FF] text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition cursor-pointer">
            {saving ? '⏳ ĐANG TẠO...' : '🚀 TẠO SẢN PHẨM'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ====================================================================
// 5. QUẢN LÝ KHÁCH HÀNG - API thực + CẤP QUYỀN
// ====================================================================
const CustomerManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [updatingRole, setUpdatingRole] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState(null);

  const TIER_STYLES = {
    REGULAR: { label: 'Thành viên', icon: '🙂', bg: 'bg-gray-100', text: 'text-gray-500' },
    SILVER: { label: 'Bạc', icon: '🥈', bg: 'bg-slate-100', text: 'text-slate-500' },
    GOLD: { label: 'Vàng', icon: '🥇', bg: 'bg-yellow-100', text: 'text-yellow-600' },
    PLATINUM: { label: 'Bạch Kim', icon: '💎', bg: 'bg-indigo-100', text: 'text-indigo-600' },
  };

  useEffect(() => { loadUsers(); loadRoles(); }, [page, roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers({ keyword: keyword || undefined, role: roleFilter || undefined, page, size: 15 });
      const pageData = data.result;
      setUsers(pageData.content || []);
      setTotalPages(pageData.totalPages);
    } catch (err) { console.error("Lỗi load users:", err); }
    finally { setLoading(false); }
  };

  const loadRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data.result || []);
    } catch (err) { console.error("Lỗi load roles:", err); }
  };

  const handleSelectUser = async (u) => {
    setSelectedUser(u);
    setSelectedRole(u.roleName || 'USER');
    setSelectedMembership(null);
    try {
      const data = await getMembershipByUser(u.userID);
      setSelectedMembership(data.result);
    } catch { }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !selectedRole) return alert('Vui lòng chọn role!');
    if (!confirm(`Cấp quyền "${selectedRole}" cho "${selectedUser.username}"?`)) return;
    setUpdatingRole(true);
    try {
      const data = await updateUserRole(selectedUser.username, selectedRole);
      alert(`Cấp quyền ${selectedRole} cho ${selectedUser.username} thành công! ✅`);
      if (data.result) setSelectedUser(data.result);
      loadUsers();
    } catch (err) { alert(err.message || 'Lỗi cấp quyền!'); }
    finally { setUpdatingRole(false); }
  };

  const handleRevokeRole = async () => {
    if (!selectedUser) return;
    if (!confirm(`Thu hồi quyền của "${selectedUser.username}"? User sẽ trở về role mặc định.`)) return;
    setUpdatingRole(true);
    try {
      await revokeUserRole(selectedUser.username);
      alert(`Đã thu hồi quyền của ${selectedUser.username}! ✅`);
      setSelectedUser(null);
      loadUsers();
    } catch (err) { alert(err.message || 'Lỗi thu hồi quyền!'); }
    finally { setUpdatingRole(false); }
  };

  const handleSearch = () => { setPage(0); loadUsers(); };


  return (
    <div className="flex gap-8">
      <div className={`transition-all duration-500 bg-white rounded-3xl shadow-sm p-8 border border-gray-50 ${selectedUser ? 'w-2/3' : 'w-full'}`}>
        <h3 className="text-xl font-bold mb-6">Danh sách khách hàng</h3>

        {/* Search + Filter */}
        <div className="flex gap-2 mb-6">
          <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Tìm username..." className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-[#4318FF]" />
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
            className="bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none font-bold">
            <option value="">Tất cả roles</option>
            {roles.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
          </select>
          <button onClick={handleSearch} className="bg-[#4318FF] text-white px-6 rounded-xl font-bold text-sm cursor-pointer">🔍</button>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse"></div>)}</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[#A3AED0] text-xs uppercase border-b border-gray-100">
                <th className="pb-4 font-medium">Username</th>
                <th className="pb-4 font-medium">Họ & Tên</th>
                <th className="pb-4 font-medium">Email</th>
                <th className="pb-4 font-medium">SĐT</th>
                <th className="pb-4 font-medium text-center">Vai trò</th>
                <th className="pb-4 font-medium text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.map(u => {
                const tier = u.membershipTier || 'REGULAR';
                const ts = TIER_STYLES[tier] || TIER_STYLES.REGULAR;
                return (
                  <tr key={u.userID} className={`border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer ${selectedUser?.userID === u.userID ? 'bg-blue-50/50' : ''}`}
                    onClick={() => handleSelectUser(u)}>
                    <td className="py-4 font-bold text-[#058a81]">{u.username}</td>
                    <td className="py-4 text-gray-800 font-bold">{u.fullName || '-'}</td>
                    <td className="py-4 text-gray-500">{u.email || '-'}</td>
                    <td className="py-4 text-gray-500">{u.phoneNumber || '-'}</td>
                    <td className="py-4 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${u.roleName === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                        {u.roleName || 'USER'}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${ts.bg} ${ts.text}`}>
                        {ts.icon} {ts.label}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <button onClick={(e) => { e.stopPropagation(); handleSelectUser(u); }}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition cursor-pointer">👁️</button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-gray-400">Không có user nào</td></tr>}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-4 py-2 rounded-lg border text-sm font-bold disabled:opacity-30 cursor-pointer">←</button>
            <span className="px-4 py-2 text-sm font-bold text-gray-500">{page + 1} / {totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1} className="px-4 py-2 rounded-lg border text-sm font-bold disabled:opacity-30 cursor-pointer">→</button>
          </div>
        )}
      </div>

      {/* Panel chi tiết user + CẤP QUYỀN */}
      {selectedUser && (
        <div className="w-1/3 bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-0 h-fit space-y-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl font-black text-blue-600">
                {selectedUser.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xl font-black">{selectedUser.username}</h4>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${selectedUser.roleName === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                  {selectedUser.roleName || 'USER'}
                </span>
              </div>
            </div>
            <button onClick={() => { setSelectedUser(null); setSelectedMembership(null); }} className="text-gray-300 hover:text-black text-xl cursor-pointer">✕</button>
          </div>

          <div className="space-y-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
              <span>📧</span> <span className="font-bold">{selectedUser.email || 'Chưa cập nhật'}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
              <span>📞</span> <span className="font-bold">{selectedUser.phoneNumber || 'Chưa cập nhật'}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
              <span>📍</span> <span className="font-bold">{selectedUser.address || 'Chưa cập nhật'}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
              <span>⚧</span> <span className="font-bold">{selectedUser.gender || 'Chưa cập nhật'}</span>
            </div>
          </div>

          {/* MEMBERSHIP BLOCK */}
          {selectedMembership ? (() => {
            const m = selectedMembership;
            const ts = TIER_STYLES[m.tier] || TIER_STYLES.REGULAR;
            const formatVND = (v) => v ? Number(v).toLocaleString('vi-VN') + '₫' : '0₫';
            return (
              <div className={`border rounded-2xl p-4 ${ts.bg} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-black ${ts.text}`}>{ts.icon} {m.tierLabel || ts.label}</span>
                  {m.tier !== 'REGULAR' && <span className="text-[10px] text-gray-400">Từ {m.since ? new Date(m.since).toLocaleDateString('vi-VN') : '—'}</span>}
                </div>
                <div className="text-xs text-gray-500">Tổng chi tiêu: <span className="font-black text-gray-700">{formatVND(m.totalSpent)}</span></div>
                {m.tier !== 'PLATINUM' && (
                  <>
                    <div className="w-full bg-white rounded-full h-2">
                      <div className={`h-2 rounded-full ${m.tier === 'GOLD' ? 'bg-yellow-400' : m.tier === 'SILVER' ? 'bg-slate-400' : 'bg-gray-300'} transition-all`}
                        style={{ width: `${Math.min(Number(m.progressPercent) || 0, 100)}%` }} />
                    </div>
                    <div className="text-[10px] text-gray-400 text-right">{m.progressPercent}% → {formatVND(m.nextThreshold)}</div>
                  </>
                )}
                {m.tier === 'PLATINUM' && <p className="text-[10px] font-black text-indigo-500">💎 Hạng tối đa — Cảm ơn khách hàng thân thiết!</p>}
              </div>
            );
          })() : (
            <div className="text-xs text-gray-400 text-center py-2">Đang tải thông tin hạng...</div>
          )}

          {/* QUẢN LÝ QUYỀN */}
          <div className="border-t pt-4 space-y-4">
            <h5 className="text-sm font-black text-[#2b3674] uppercase">Quản lý quyền</h5>
            <div>
              <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-2">Chọn Role</label>
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none font-bold text-sm">
                {roles.map(r => <option key={r.name} value={r.name}>{r.name} {r.description ? `- ${r.description}` : ''}</option>)}
                {roles.length === 0 && <>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </>}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleUpdateRole} disabled={updatingRole}
                className="flex-1 bg-[#4318FF] text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50">
                {updatingRole ? '⏳...' : 'Cấp quyền'}
              </button>
              <button onClick={handleRevokeRole} disabled={updatingRole}
                className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition cursor-pointer disabled:opacity-50">
                {updatingRole ? '⏳...' : 'Thu hồi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ====================================================================
// 6. THÔNG TIN TÀI KHOẢN ADMIN
// ====================================================================
const AdminProfile = () => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ email: '', phoneNumber: '', address: '', gender: '' });
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => { loadInfo(); }, []);

  const loadInfo = async () => {
    setLoading(true);
    try {
      const data = await getMyInfo();
      const u = data.result;
      setInfo(u);
      setForm({ email: u.email || '', phoneNumber: u.phoneNumber || '', address: u.address || '', gender: u.gender || '' });
    } catch (err) { console.error("Lỗi load info:", err); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMyInfo(form);
      alert('Cập nhật thông tin thành công! ✅');
      loadInfo();
    } catch (err) { alert(err.message || 'Lỗi cập nhật!'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!pwForm.oldPassword || !pwForm.newPassword) return alert('Vui lòng điền đầy đủ!');
    if (pwForm.newPassword !== pwForm.confirmPassword) return alert('Mật khẩu mới không khớp!');
    setChangingPw(true);
    try {
      await changePassword({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      alert('Đổi mật khẩu thành công! ✅');
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { alert(err.message || 'Lỗi đổi mật khẩu!'); }
    finally { setChangingPw(false); }
  };

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse"></div>)}</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Thông tin cá nhân */}
      <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-50 space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 bg-[#4318FF] rounded-2xl flex items-center justify-center text-2xl font-black text-white">
            {info?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-black">{info?.username}</h3>
            <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase bg-purple-100 text-purple-600">{info?.roleName || 'ADMIN'}</span>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-2">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none font-bold border border-transparent focus:border-[#4318FF]" />
        </div>
        <div>
          <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-2">Số điện thoại</label>
          <input type="text" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none font-bold border border-transparent focus:border-[#4318FF]" />
        </div>
        <div>
          <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-2">Địa chỉ</label>
          <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none font-bold border border-transparent focus:border-[#4318FF]" />
        </div>
        <div>
          <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-2">Giới tính</label>
          <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none font-bold">
            <option value="">-- Chọn --</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="w-full bg-[#4318FF] text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50">
          {saving ? '⏳ Đang lưu...' : 'LƯU THAY ĐỔI'}
        </button>
      </div>

      {/* Đổi mật khẩu */}
      <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-50 space-y-6 h-fit">
        <h3 className="text-xl font-bold">Đổi mật khẩu</h3>
        <div>
          <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-2">Mật khẩu hiện tại</label>
          <input type="password" value={pwForm.oldPassword} onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })}
            className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none border border-transparent focus:border-[#4318FF]" />
        </div>
        <div>
          <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-2">Mật khẩu mới</label>
          <input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
            className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none border border-transparent focus:border-[#4318FF]" />
        </div>
        <div>
          <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-2">Xác nhận mật khẩu mới</label>
          <input type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
            className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none border border-transparent focus:border-[#4318FF]" />
        </div>
        <button onClick={handleChangePassword} disabled={changingPw}
          className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black hover:bg-orange-600 transition cursor-pointer disabled:opacity-50">
          {changingPw ? '⏳...' : 'ĐỔI MẬT KHẨU'}
        </button>
      </div>
    </div>
  );
};

// ====================================================================
// 7. QUẢN LÝ QUYỀN (ROLES)
// ====================================================================
const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [allPerms, setAllPerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', permissions: [] });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { loadRoles(); loadPermissions(); }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await getRoles();
      setRoles(data.result || []);
    } catch (err) { console.error("Lỗi:", err); }
    finally { setLoading(false); }
  };

  const loadPermissions = async () => {
    try {
      const data = await getPermissions();
      setAllPerms(data.result || []);
    } catch (err) { console.error("Lỗi tải perms:", err); }
  };

  const togglePermission = (permName) => {
    setForm(prev => {
      const has = prev.permissions.includes(permName);
      if (has) return { ...prev, permissions: prev.permissions.filter(p => p !== permName) };
      return { ...prev, permissions: [...prev.permissions, permName] };
    });
  };

  const handleCreate = async () => {
    if (!form.name || form.name.trim().length === 0) return alert('Nhập mã quyền!');
    try {
      await createRole({ name: form.name.toUpperCase(), description: form.description, permissions: form.permissions });
      alert(isEditing ? 'Cập nhật quyền thành công!' : 'Tạo quyền thành công!');
      handleCancelEdit();
      loadRoles();
    } catch (err) { alert(err.message || 'Lỗi lưu quyền!'); }
  };

  const handleEditRole = (role) => {
    setForm({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions ? role.permissions.map(p => p.name) : []
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setForm({ name: '', description: '', permissions: [] });
    setIsEditing(false);
  };

  const handleDelete = async (e, name) => {
    e.stopPropagation();
    if (!confirm(`Xóa quyền ${name}?`)) return;
    try {
      await deleteRole(name);
      alert('Đã xóa!');
      loadRoles();
    } catch (err) { alert(err.message || 'Lỗi xóa!'); }
  };

  return (
    <div className="flex gap-8">
      <div className="w-2/3 bg-white rounded-3xl shadow-sm p-8">
        <h3 className="text-xl font-bold mb-6">Danh sách Quyền (Roles)</h3>
        {loading ? <p>Đang tải...</p> : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[#A3AED0] text-xs uppercase border-b border-gray-100">
                <th className="pb-4 font-medium">Role</th>
                <th className="pb-4 font-medium">Mô tả</th>
                <th className="pb-4 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {roles.map(r => (
                <tr key={r.name} onClick={() => handleEditRole(r)} className={`border-b border-gray-50 hover:bg-blue-50 transition cursor-pointer ${form.name === r.name ? 'bg-blue-50/50' : ''}`}>
                  <td className="py-4 font-black">
                    <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-lg text-xs uppercase">{r.name}</span>
                  </td>
                  <td className="py-4 font-bold text-gray-600">{r.description || '-'}</td>
                  <td className="py-4 text-right">
                    <button onClick={(e) => handleDelete(e, r.name)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition cursor-pointer">🗑️</button>
                  </td>
                </tr>
              ))}
              {roles.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-gray-400">Trống</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <div className="w-1/3 bg-white rounded-3xl shadow-sm p-8 h-fit">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{isEditing ? 'Chỉnh Sửa Quyền' : 'Thêm Quyền Mới'}</h3>
          {isEditing && <button onClick={handleCancelEdit} className="text-xs font-bold text-gray-400 hover:text-red-500 cursor-pointer">✕ Hủy</button>}
        </div>
        <input type="text" placeholder="Mã Role (VD: STAFF)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value.toUpperCase() })} disabled={isEditing}
          className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none mb-4 font-bold border border-transparent focus:border-[#4318FF] disabled:opacity-50" />
        <textarea placeholder="Mô tả quyền..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none mb-4 text-sm h-20 resize-none border border-transparent focus:border-[#4318FF]" />

        <div className="mb-6">
          <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Gán danh sách Tính năng (Permissions)</p>
          <div className="space-y-2 max-h-40 overflow-y-auto bg-[#f4f7fe] p-3 rounded-xl border">
            {allPerms.map(p => (
              <label key={p.name} className="flex items-center gap-2 text-xs font-bold cursor-pointer hover:bg-gray-200 p-1 rounded transition select-none">
                <input type="checkbox" checked={form.permissions.includes(p.name)} onChange={() => togglePermission(p.name)} className="accent-[#4318FF] cursor-pointer" />
                <span className="text-gray-700">{p.name}</span>
              </label>
            ))}
            {allPerms.length === 0 && <span className="text-xs text-gray-500 block">Chưa có tính năng. Hãy sang tab Tính năng để tạo thêm.</span>}
          </div>
        </div>

        <button onClick={handleCreate} className="w-full bg-[#4318FF] text-white font-black py-4 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition cursor-pointer">
          {isEditing ? 'LƯU THAY ĐỔI' : 'THÊM ROLE'}
        </button>
      </div>
    </div>
  );
};

// ====================================================================
// 7.1 QUẢN LÝ TÍNH NĂNG (PERMISSIONS)
// ====================================================================
const PermissionManagement = () => {
  const [perms, setPerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => { loadPermissions(); }, []);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const data = await getPermissions();
      setPerms(data.result || []);
    } catch (err) { console.error("Lỗi tải perms:", err); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.name || form.name.trim().length === 0) return alert('Nhập mã tính năng!');
    try {
      const pName = form.name.trim().toUpperCase().replace(/\s+/g, '_');
      await createPermission({ name: pName, description: form.description });
      alert('Tạo tính năng thành công!');
      setForm({ name: '', description: '' });
      loadPermissions();
    } catch (err) { alert(err.message || 'Lỗi tạo tính năng!'); }
  };

  const handleDelete = async (name) => {
    if (!confirm(`Xóa tính năng ${name}?`)) return;
    try {
      await deletePermission(name);
      alert('Đã xóa tính năng!');
      loadPermissions();
    } catch (err) { alert(err.message || 'Lỗi xóa!'); }
  };

  return (
    <div className="flex gap-8">
      <div className="w-2/3 bg-white rounded-3xl shadow-sm p-8">
        <h3 className="text-xl font-bold mb-6">Danh sách Tính năng Hệ thống (Permissions)</h3>
        {loading ? <p>Đang tải...</p> : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[#A3AED0] text-xs uppercase border-b border-gray-100">
                <th className="pb-4 font-medium">Quy tắc (Code)</th>
                <th className="pb-4 font-medium">Mô tả chi tiết</th>
                <th className="pb-4 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {perms.map(p => (
                <tr key={p.name} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="py-4 font-black">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs uppercase border">{p.name}</span>
                  </td>
                  <td className="py-4 font-bold text-gray-500">{p.description || '-'}</td>
                  <td className="py-4 text-right">
                    <button onClick={() => handleDelete(p.name)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition cursor-pointer">🗑️</button>
                  </td>
                </tr>
              ))}
              {perms.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-gray-400">Trống</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <div className="w-1/3 bg-white rounded-3xl shadow-sm p-8 h-fit">
        <h3 className="text-xl font-bold mb-6">Khai báo Tính năng</h3>
        <input type="text" placeholder="Mã tính năng (VD: EXPORT_DATA)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none mb-4 font-bold border border-transparent focus:border-[#4318FF]" />
        <textarea placeholder="Mô tả chức năng chi tiết..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none mb-6 text-sm h-24 resize-none border border-transparent focus:border-[#4318FF]" />

        <button onClick={handleCreate} className="w-full bg-[#4318FF] text-white font-black py-4 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition cursor-pointer">
          THÊM TÍNH NĂNG
        </button>
      </div>
    </div>
  );
};


// ====================================================================
// 8. QUẢN LÝ HÃNG KÈM LOGO
// ====================================================================
const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', logo: '' });

  useEffect(() => { loadBrands(); }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const data = await getBrands();
      setBrands(data.result || []);
    } catch (err) { console.error("Lỗi:", err); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return alert('Nhập tên hãng!');
    try {
      await createBrand({ name: form.name.trim(), logo: form.logo.trim() });
      alert('Tạo hãng thành công!');
      setForm({ name: '', logo: '' });
      loadBrands();
    } catch (err) { alert(err.message || 'Lỗi!'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa hãng này?')) return;
    try {
      await deleteBrand(id);
      alert('Đã xóa!');
      loadBrands();
    } catch (err) { alert(err.message || 'Lỗi xóa!'); }
  };

  return (
    <div className="flex gap-8">
      <div className="w-2/3 bg-white rounded-3xl shadow-sm p-8">
        <h3 className="text-xl font-bold mb-6">Danh sách Hãng</h3>
        {loading ? <p>Đang tải...</p> : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[#A3AED0] text-xs uppercase border-b border-gray-100">
                <th className="pb-4 font-medium w-20">ID</th>
                <th className="pb-4 font-medium">Logo</th>
                <th className="pb-4 font-medium">Tên hãng</th>
                <th className="pb-4 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {brands.map(b => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="py-4 text-[#A3AED0] font-black">#{b.id}</td>
                  <td className="py-4">
                    {b.logo ? <img src={b.logo} alt={b.name} className="h-8 object-contain" /> : <span className="text-xs text-gray-400">Không có</span>}
                  </td>
                  <td className="py-4 font-bold text-[#058a81] text-lg">{b.name}</td>
                  <td className="py-4 text-right">
                    <button onClick={() => handleDelete(b.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition cursor-pointer">🗑️</button>
                  </td>
                </tr>
              ))}
              {brands.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-400">Không có dữ liệu</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <div className="w-1/3 bg-white rounded-3xl shadow-sm p-8 h-fit">
        <h3 className="text-xl font-bold mb-6">Thêm Hãng Mới</h3>
        <input type="text" placeholder="Tên hãng (VD: Samsung, Apple)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none mb-4 font-bold border border-transparent focus:border-[#4318FF]" />
        <input type="text" placeholder="URL biểu tượng (Logo)..." value={form.logo} onChange={e => setForm({ ...form, logo: e.target.value })}
          className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none mb-4 text-sm border border-transparent focus:border-[#4318FF]" />
        {form.logo && <img src={form.logo} alt="Preview" className="h-12 object-contain bg-gray-50 rounded-xl mb-4 border" />}
        <button onClick={handleCreate} className="w-full bg-[#4318FF] text-white font-black py-4 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition cursor-pointer">
          THÊM HÃNG
        </button>
      </div>
    </div>
  );
};

// ====================================================================
// 9. QUẢN LÝ BANNER (SLIDER)
// ====================================================================
const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ imageUrl: '', linkUrl: '', isActive: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { loadBanners(); }, []);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await getAllBanners();
      setBanners(data.result || []);
    } catch (err) { console.error("Lỗi:", err); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.imageUrl) return alert('Hãy tải ảnh Banner lên!');
    setIsSubmitting(true);
    try {
      await createBanner({ imageUrl: form.imageUrl, linkUrl: form.linkUrl, isActive: form.isActive });
      alert('Tạo banner thành công!');
      setForm({ imageUrl: '', linkUrl: '', isActive: true });
      loadBanners();
    } catch (err) { alert(err.message || 'Lỗi!'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa banner này vĩnh viễn?')) return;
    try {
      await deleteBanner(id);
      loadBanners();
    } catch (err) { alert(err.message || 'Lỗi xóa!'); }
  };

  const handleToggle = async (id) => {
    try {
      await toggleBanner(id);
      loadBanners();
    } catch (err) { alert(err.message || 'Lỗi toggle!'); }
  };

  return (
    <div className="flex gap-8">
      <div className="w-2/3 bg-white rounded-3xl shadow-sm p-8">
        <h3 className="text-xl font-bold mb-6">Tất cả Banner hiện tại</h3>
        {loading ? <p>Đang tải...</p> : (
          <div className="space-y-4">
            {banners.map(b => (
              <div key={b.id} className="border border-gray-100 rounded-2xl p-4 flex gap-6 items-center">
                <div className="w-48 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0 border relative">
                  <img src={b.imageUrl} alt="banner" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">ID: #{b.id} • Tới link: <span className="text-blue-500">{b.linkUrl || 'Không'}</span></p>
                  <p className="text-[10px] text-gray-400">Đã tạo: {new Date(b.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => handleDelete(b.id)} className="text-xs font-bold text-red-500 hover:underline">Xóa vĩnh viễn</button>
                </div>
              </div>
            ))}
            {banners.length === 0 && <p className="text-center text-gray-400 py-8">Chưa có banner nào được tạo.</p>}
          </div>
        )}
      </div>

      <div className="w-1/3 bg-white rounded-3xl shadow-sm p-8 h-fit">
        <h3 className="text-xl font-bold mb-6">Thêm Banner thiết kế</h3>

        <div>
          <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-1">Upload Ảnh (25:9)</label>
          <input type="file" accept="image/*" onChange={async (e) => {
            if (e.target.files[0]) {
              setIsSubmitting(true);
              const res = await uploadImage(e.target.files[0]);
              setForm({ ...form, imageUrl: res.result });
              setIsSubmitting(false);
            }
          }} className="w-full bg-[#f4f7fe] rounded-xl p-2 outline-none text-sm mb-2" />
        </div>
        {form.imageUrl && <img src={form.imageUrl} alt="Preview" className="w-full aspect-[25/9] object-cover rounded-xl mb-4 border" />}

        <div>
          <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-1">Đích đến khi click (Tùy chọn)</label>
          <input type="text" placeholder="ID Sản phẩm (VD: 15) hoặc Link (http...)" value={form.linkUrl} onChange={e => setForm({ ...form, linkUrl: e.target.value })}
            className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none mb-4 font-bold border border-transparent focus:border-[#4318FF]" />
        </div>


        <button disabled={isSubmitting} onClick={handleCreate} className="w-full bg-[#4318FF] text-white font-black py-4 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition cursor-pointer disabled:opacity-50">
          {isSubmitting ? 'ĐANG XỬ LÝ...' : 'THÊM BANNER'}
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;