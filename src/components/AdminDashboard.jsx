import React, { useState, useEffect } from 'react';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getBrands, createBrand, deleteBrand,
  getAllOrders, updateOrderStatus, rejectOrder, confirmPayment, countPendingOrders, getOrderDetail, exportInvoice,
  getAllUsers, updateUserRole, revokeUserRole, getRoles, createRole, deleteRole, getPermissions, createPermission,
  getRevenue, getTopSelling,
  uploadGallery, uploadImage,
  getMyInfo, updateMyInfo, changePassword,
  getAllBanners, createBanner, deleteBanner, toggleBanner,
} from '../api/api';

// ====================================================================
// ADMIN DASHBOARD - TOÀN BỘ DÙNG API THẬT
// ====================================================================
const AdminDashboard = ({ onLogout, user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(true);
  const [isUsersMenuOpen, setIsUsersMenuOpen] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  // Load badge đơn chờ duyệt
  useEffect(() => {
    countPendingOrders().then(data => setPendingCount(data.result || 0)).catch(() => { });
  }, [activeTab]);

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans text-[#2b3674]">
      {/* SIDEBAR */}
      <aside className="w-62 bg-white shadow-xl flex flex-col p-8 z-20">
        <div className="text-2xl font-black text-[#058a81] mb-12 flex items-center gap-2">
          <span className="bg-[#058a81] text-white p-1 rounded px-3">PH</span> Dashboard
        </div>

        <nav className="flex-1 space-y-2">
          <div onClick={() => setActiveTab('dashboard')}
            className={`p-4 rounded-2xl cursor-pointer flex items-center gap-4 transition-all ${activeTab === 'dashboard' ? 'bg-[#4318FF] text-white font-bold shadow-lg shadow-indigo-100' : 'text-[#A3AED0] hover:bg-gray-50'}`}>
            <span className="text-xl">📊</span> Tổng quan
          </div>

          <div onClick={() => setActiveTab('orders')}
            className={`p-4 rounded-2xl cursor-pointer flex items-center gap-4 transition-all ${activeTab === 'orders' ? 'bg-[#4318FF] text-white font-bold shadow-lg shadow-indigo-100' : 'text-[#A3AED0] hover:bg-gray-50'}`}>
            <span className="text-xl">🛒</span> Đơn hàng
            {pendingCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </div>

          {/* Menu Products dropdown */}
          <div>
            <div onClick={() => setIsProductsMenuOpen(!isProductsMenuOpen)}
              className={`p-4 rounded-2xl cursor-pointer flex items-center justify-between transition-all ${activeTab.includes('product') || activeTab.includes('brand') ? 'text-[#4318FF] font-bold' : 'text-[#A3AED0] hover:bg-gray-50'}`}>
              <div className="flex items-center gap-4"><span className="text-xl">📦</span> Sản phẩm</div>
              <span className={`text-xs transition-transform ${isProductsMenuOpen ? 'rotate-180' : ''}`}>▼</span>
            </div>
            {isProductsMenuOpen && (
              <div className="ml-12 mt-2 space-y-2 border-l-2 border-gray-100 pl-4">
                <p onClick={() => setActiveTab('product-list')} className={`cursor-pointer py-2 text-sm ${activeTab === 'product-list' ? 'text-[#4318FF] font-bold' : 'text-[#A3AED0] hover:text-[#4318FF]'}`}>Danh sách Sản Phẩm</p>
                <p onClick={() => setActiveTab('product-upload')} className={`cursor-pointer py-2 text-sm ${activeTab === 'product-upload' ? 'text-[#4318FF] font-bold' : 'text-[#A3AED0] hover:text-[#4318FF]'}`}>Thêm Sản Phẩm</p>
                <p onClick={() => setActiveTab('brand-manage')} className={`cursor-pointer py-2 text-sm ${activeTab === 'brand-manage' ? 'text-[#4318FF] font-bold' : 'text-[#A3AED0] hover:text-[#4318FF]'}`}>Quản lý Hãng</p>
                <p onClick={() => setActiveTab('banner-manage')} className={`cursor-pointer py-2 text-sm ${activeTab === 'banner-manage' ? 'text-[#4318FF] font-bold' : 'text-[#A3AED0] hover:text-[#4318FF]'}`}>Quản lý Banner</p>
              </div>
            )}
          </div>

          {/* Menu Users dropdown */}
          <div>
            <div onClick={() => setIsUsersMenuOpen(!isUsersMenuOpen)}
              className={`p-4 rounded-2xl cursor-pointer flex items-center justify-between transition-all ${activeTab.includes('customer') || activeTab.includes('role') ? 'text-[#4318FF] font-bold' : 'text-[#A3AED0] hover:bg-gray-50'}`}>
              <div className="flex items-center gap-4"><span className="text-xl">👥</span> Người dùng</div>
              <span className={`text-xs transition-transform ${isUsersMenuOpen ? 'rotate-180' : ''}`}>▼</span>
            </div>
            {isUsersMenuOpen && (
              <div className="ml-12 mt-2 space-y-2 border-l-2 border-gray-100 pl-4">
                <p onClick={() => setActiveTab('customers')} className={`cursor-pointer py-2 text-sm ${activeTab === 'customers' ? 'text-[#4318FF] font-bold' : 'text-[#A3AED0] hover:text-[#4318FF]'}`}>Danh sách Khách hàng</p>
                <p onClick={() => setActiveTab('role-manage')} className={`cursor-pointer py-2 text-sm ${activeTab === 'role-manage' ? 'text-[#4318FF] font-bold' : 'text-[#A3AED0] hover:text-[#4318FF]'}`}>Quản lý Quyền</p>
                <p onClick={() => setActiveTab('permission-manage')} className={`cursor-pointer py-2 text-sm ${activeTab === 'permission-manage' ? 'text-[#4318FF] font-bold' : 'text-[#A3AED0] hover:text-[#4318FF]'}`}>Quản lý Tính năng</p>
              </div>
            )}
          </div>

          <div onClick={() => setActiveTab('admin-profile')}
            className={`p-4 rounded-2xl cursor-pointer flex items-center gap-4 transition-all ${activeTab === 'admin-profile' ? 'bg-[#4318FF] text-white font-bold shadow-lg shadow-indigo-100' : 'text-[#A3AED0] hover:bg-gray-50'}`}>
            <span className="text-xl">👤</span> Tài khoản
          </div>
        </nav>

        <button onClick={onLogout} className="mt-auto bg-red-50 text-red-600 font-bold p-4 rounded-2xl hover:bg-red-100 transition cursor-pointer">Đăng xuất</button>
      </aside>

      {/* NỘI DUNG CHÍNH */}
      <main className="flex-1 p-10 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <p className="text-sm text-[#707EAE]">Admin / {activeTab.replace('-', ' ')}</p>
            <h2 className="text-3xl font-bold capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>
        </header>

        {activeTab === 'dashboard' && <DashboardOverview />}
        {activeTab === 'orders' && <OrderManagement />}
        {activeTab === 'product-list' && <ProductList onNavigateToUpload={() => setActiveTab('product-upload')} />}
        {activeTab === 'product-upload' && <ProductUpload onSuccess={() => setActiveTab('product-list')} />}
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
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => { loadData(); }, [month, year]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [revData, topData, pendData] = await Promise.all([
        getRevenue(month, year),
        getTopSelling(),
        countPendingOrders(),
      ]);
      setRevenue(revData.result);
      setTopSelling(topData.result || []);
      setPendingCount(pendData.result || 0);
    } catch (err) {
      console.error("Lỗi load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (val) => val ? Number(val).toLocaleString('vi-VN') + '₫' : '0₫';

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
            <h3 className="text-2xl font-black text-purple-600">{loading ? '...' : topSelling[0]?.productName || '-'}</h3>
          </div>
        </div>
      </div>

      {/* Bảng Top bán chạy */}
      <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-50">
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
const ProductList = ({ onNavigateToUpload }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', image: '', brandId: '' });
  const [brands, setBrands] = useState([]);
  const [saving, setSaving] = useState(false);
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

  const handleSelect = async (product) => {
    setSelectedProduct(product);
    // Load chi tiết đầy đủ
    try {
      const { getProductDetail } = await import('../api/api');
      const data = await getProductDetail(product.id);
      const detail = data.result;
      setEditForm({
        name: detail.name || '',
        description: detail.description || '',
        image: product.image || '',
        brandId: brands.find(b => b.name === product.brandName)?.id || '',
      });
    } catch {
      setEditForm({ name: product.name || '', description: '', image: product.image || '', brandId: '' });
    }
  };

  const handleSave = async () => {
    if (!selectedProduct) return;
    setSaving(true);
    try {
      await updateProduct(selectedProduct.id, {
        name: editForm.name,
        description: editForm.description,
        image: editForm.image,
        brandId: editForm.brandId ? Number(editForm.brandId) : undefined,
      });
      alert('Cập nhật sản phẩm thành công! ✅');
      setSelectedProduct(null);
      loadProducts();
    } catch (err) { alert(err.message || 'Lỗi cập nhật!'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await deleteProduct(id);
      alert('Đã xóa sản phẩm! 🗑️');
      setSelectedProduct(null);
      loadProducts();
    } catch (err) { alert(err.message || 'Lỗi xóa!'); }
  };

  return (
    <div className="flex gap-8">
      <div className={`transition-all duration-500 bg-white rounded-3xl shadow-sm p-8 border border-gray-50 ${selectedProduct ? 'w-2/3' : 'w-full'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Kho sản phẩm ({products.length})</h3>
          <button onClick={onNavigateToUpload}
            className="bg-[#4318FF] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition cursor-pointer">
            + Thêm SP mới
          </button>
        </div>

        {/* Thanh lọc theo hãng + tìm kiếm */}
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
                <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 transition group ${selectedProduct?.id === p.id ? 'bg-blue-50/50' : ''}`}>
                  <td className="py-4 flex items-center gap-4 cursor-pointer" onClick={() => handleSelect(p)}>
                    <img src={p.image} className="w-12 h-12 object-contain bg-gray-50 rounded-lg p-1" alt="" />
                    <span className="font-bold text-[#2b3674] group-hover:text-[#4318FF] transition line-clamp-1">{p.name}</span>
                  </td>
                  <td className="py-4 text-gray-500">{p.brandName}</td>
                  <td className="py-4 font-bold text-right text-red-600">{p.minPrice ? Number(p.minPrice).toLocaleString('vi-VN') + '₫' : '-'}</td>
                  <td className="py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => handleSelect(p)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition cursor-pointer">📝</button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition cursor-pointer">🗑️</button>
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

      {/* Panel sửa SP */}
      {selectedProduct && (
        <div className="w-1/3 bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-0 h-fit space-y-5">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <img src={selectedProduct.image} className="w-16 h-16 object-contain bg-gray-50 rounded-2xl p-2 border" alt="" />
              <div>
                <h4 className="text-lg font-black leading-tight line-clamp-2">{selectedProduct.name}</h4>
                <p className="text-xs text-gray-400">ID: {selectedProduct.id}</p>
              </div>
            </div>
            <button onClick={() => setSelectedProduct(null)} className="text-gray-300 hover:text-black text-xl cursor-pointer">✕</button>
          </div>

          <div>
            <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-1">Tên sản phẩm</label>
            <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none font-bold border border-transparent focus:border-[#4318FF]" />
          </div>

          <div>
            <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-1">Hãng</label>
            <select value={editForm.brandId} onChange={(e) => setEditForm({ ...editForm, brandId: e.target.value })}
              className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none font-bold">
              <option value="">-- Chọn hãng --</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-1">Ảnh đại diện (Upload)</label>
            <input type="file" accept="image/*" onChange={async (e) => {
              if (e.target.files[0]) {
                const res = await uploadImage(e.target.files[0]);
                setEditForm({ ...editForm, image: res.result });
              }
            }} className="w-full bg-[#f4f7fe] rounded-xl p-2 outline-none text-sm" />
            {editForm.image && <p className="text-[10px] text-green-600 mt-1">Đã cấp: {String(editForm.image).substring(0, 30)}...</p>}
          </div>

          <div>
            <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-1">Mô tả</label>
            <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none text-sm h-24 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-[#4318FF] text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition cursor-pointer">
              {saving ? '⏳ Đang lưu...' : 'LƯU THAY ĐỔI'}
            </button>
            <button onClick={() => handleDelete(selectedProduct.id)}
              className="p-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 cursor-pointer">🗑️</button>
          </div>
        </div>
      )}
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

  const handleSearch = () => { setPage(0); loadUsers(); };

  const handleUpdateRole = async () => {
    if (!selectedUser || !selectedRole) return alert('Vui lòng chọn role!');
    if (!confirm(`Cấp quyền "${selectedRole}" cho "${selectedUser.username}"?`)) return;
    setUpdatingRole(true);
    try {
      const data = await updateUserRole(selectedUser.username, selectedRole);
      alert(`Cấp quyền ${selectedRole} cho ${selectedUser.username} thành công! ✅`);
      // Cập nhật selectedUser với data mới từ response
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
              {users.map(u => (
                <tr key={u.userID} className={`border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer ${selectedUser?.userID === u.userID ? 'bg-blue-50/50' : ''}`}
                  onClick={() => { setSelectedUser(u); setSelectedRole(u.roleName || 'USER'); }}>
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
                    <button onClick={(e) => { e.stopPropagation(); setSelectedUser(u); setSelectedRole(u.roleName || 'USER'); }}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition cursor-pointer">👁️</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-gray-400">Không có user nào</td></tr>}
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
            <button onClick={() => setSelectedUser(null)} className="text-gray-300 hover:text-black text-xl cursor-pointer">✕</button>
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