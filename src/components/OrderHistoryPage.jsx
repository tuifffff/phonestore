import React, { useState, useEffect } from 'react';
import { getMyOrders, cancelOrder } from '../api/api';

const OrderHistoryPage = ({ onBack, onViewDetail }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Map trạng thái backend → hiển thị tiếng Việt
  const statusMap = {
    'PENDING': 'Chờ xác nhận',
    'CONFIRMED': 'Đã xác nhận',
    'SHIPPING': 'Đang vận chuyển',
    'DELIVERED': 'Đã nhận hàng',
    'CANCELLED': 'Đã huỷ',
    'REJECTED': 'Bị từ chối',
  };

  const statusColor = {
    'PENDING': 'bg-orange-50 text-orange-600',
    'CONFIRMED': 'bg-blue-50 text-blue-600',
    'SHIPPING': 'bg-purple-50 text-purple-600',
    'DELIVERED': 'bg-green-50 text-green-600',
    'CANCELLED': 'bg-gray-100 text-gray-500',
    'REJECTED': 'bg-red-50 text-red-600',
  };

  // Tab filter → backend status
  const tabToStatus = {
    'Tất cả': null,
    'Chờ xác nhận': 'PENDING',
    'Đã xác nhận': 'CONFIRMED',
    'Đang vận chuyển': 'SHIPPING',
    'Đã nhận hàng': 'DELIVERED',
    'Đã huỷ': 'CANCELLED',
  };

  const loadOrders = async (page = 0) => {
    setLoading(true);
    try {
      const data = await getMyOrders(page, 10);
      const pageData = data.result;
      setOrders(pageData.content || []);
      setCurrentPage(pageData.page);
      setTotalPages(pageData.totalPages);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(0);
  }, []);

  // Lọc theo tab phía client (vì API my-orders không có param status)
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'Tất cả') return true;
    return order.status === tabToStatus[activeTab];
  });

  const handleCancel = async (orderId) => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    try {
      await cancelOrder(orderId);
      alert('Đã hủy đơn hàng thành công!');
      loadOrders(currentPage);
    } catch (err) {
      alert(err.message || 'Không thể hủy đơn hàng!');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const formatPrice = (price) => {
    if (!price) return '0₫';
    return Number(price).toLocaleString('vi-VN') + '₫';
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-4 md:p-10 font-sans">
      <button onClick={onBack} className="text-sm text-[#058a81] font-bold mb-4 flex items-center gap-2 hover:underline cursor-pointer">
        <span>←</span> Quay lại cửa hàng
      </button>

      <div className="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-sm border border-gray-100">
        
        {/* THANH TABS TRẠNG THÁI */}
        <div className="flex border-b overflow-x-auto bg-white rounded-t-[2rem] sticky top-0 z-10">
          {Object.keys(tabToStatus).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-fit px-6 py-5 text-xs font-black uppercase transition-all border-b-4 cursor-pointer
                ${activeTab === tab ? 'border-red-500 text-red-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-8 space-y-8 min-h-[600px]">
          <h2 className="text-2xl font-black text-gray-800 italic uppercase tracking-tighter">Lịch sử mua hàng</h2>

          {/* LOADING */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-8 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 pb-10">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <div key={order.orderID} className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all group hover:border-[#058a81]/10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Mã đơn hàng</span>
                        <span className="text-sm text-gray-800 font-black">#{order.orderID}</span>
                        <span className="text-[10px] text-gray-400 font-medium">Đặt ngày: {formatDate(order.createdAt)}</span>
                      </div>
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-sm ${statusColor[order.status] || 'bg-gray-50 text-gray-500'}`}>
                        {statusMap[order.status] || order.status}
                      </span>
                    </div>

                    {/* Hiển thị sản phẩm đầu tiên */}
                    {order.details && order.details.length > 0 && (
                      <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-3xl p-4 flex items-center justify-center border border-gray-100 group-hover:scale-105 transition-transform">
                          <img src={order.details[0].imageURL} alt="" className="max-h-full object-contain" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <h4 className="font-black text-gray-800 text-base line-clamp-1 group-hover:text-red-600 transition">
                            {order.details[0].productName}
                            {order.details[0].colour && ` - ${order.details[0].colour}`}
                            {order.details[0].storage && ` ${order.details[0].storage}`}
                          </h4>
                          <p className="text-xs font-bold text-gray-400 mt-2">
                            Đơn giá: {formatPrice(order.details[0].price)} × {order.details[0].quantity}
                          </p>
                          {order.details.length > 1 && (
                            <p className="text-xs text-gray-400 mt-1">+ {order.details.length - 1} sản phẩm khác</p>
                          )}
                        </div>
                        <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
                          <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Tổng tiền</p>
                          <p className="text-2xl font-black text-red-600 tracking-tighter">{formatPrice(order.total)}</p>
                          <div className="flex gap-2 mt-2 justify-center md:justify-end">
                            <button 
                              onClick={() => onViewDetail(order)}
                              className="text-[10px] font-black uppercase text-[#058a81] hover:underline cursor-pointer"
                            >
                              Xem chi tiết ›
                            </button>
                            {order.status === 'PENDING' && (
                              <button 
                                onClick={() => handleCancel(order.orderID)}
                                className="text-[10px] font-black uppercase text-red-500 hover:underline cursor-pointer"
                              >
                                Hủy đơn
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                  <div className="text-6xl mb-6 opacity-20 scale-125">📦</div>
                  <p className="text-gray-400 font-black uppercase text-xs tracking-[0.2em]">Không có đơn hàng nào</p>
                </div>
              )}
            </div>
          )}

          {/* PHÂN TRANG */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pb-6">
              <button onClick={() => loadOrders(currentPage - 1)} disabled={currentPage === 0}
                className="px-4 py-2 rounded-lg border text-sm font-bold disabled:opacity-30 cursor-pointer">← Trước</button>
              <span className="px-4 py-2 text-sm font-bold text-gray-500">Trang {currentPage + 1} / {totalPages}</span>
              <button onClick={() => loadOrders(currentPage + 1)} disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 rounded-lg border text-sm font-bold disabled:opacity-30 cursor-pointer">Sau →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;