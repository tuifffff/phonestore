import React, { useState, useEffect } from 'react';
import { getOrderDetail as fetchOrderDetail, updateShippingInfo } from '../api/api';

const OrderDetailPage = ({ order, onBack }) => {
  const [orderData, setOrderData] = useState(order);
  const [loading, setLoading] = useState(false);
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [savingShipping, setSavingShipping] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    receiverName: '',
    phoneNumber: '',
    shippingAddress: '',
    note: '',
  });

  // Nếu được truyền order có orderID, gọi API lấy chi tiết đầy đủ
  useEffect(() => {
    if (order?.orderID && (!order.details || order.details.length === 0)) {
      setLoading(true);
      fetchOrderDetail(order.orderID)
        .then(data => setOrderData(data.result))
        .catch(err => console.error("Lỗi tải chi tiết đơn:", err))
        .finally(() => setLoading(false));
    } else {
      setOrderData(order);
    }
  }, [order]);

  // Sync form khi orderData có data
  useEffect(() => {
    if (orderData) {
      setShippingForm({
        receiverName: orderData.receiverName || '',
        phoneNumber: orderData.phoneNumber || '',
        shippingAddress: orderData.shippingAddress || '',
        note: orderData.note || '',
      });
    }
  }, [orderData]);

  const handleStartEdit = () => {
    setIsEditingShipping(true);
  };

  const handleSaveShipping = async () => {
    if (!shippingForm.receiverName.trim() || !shippingForm.phoneNumber.trim() || !shippingForm.shippingAddress.trim()) {
      return alert('Vui lòng nhập đầy đủ thông tin!');
    }
    setSavingShipping(true);
    try {
      const data = await updateShippingInfo(orderData.orderID, shippingForm);
      setOrderData(data.result);
      setIsEditingShipping(false);
      alert('Cập nhật thông tin nhận hàng thành công! ✅');
    } catch (err) {
      alert(err.message || 'Không thể cập nhật!');
    } finally {
      setSavingShipping(false);
    }
  };

  if (!orderData) return null;

  const formatPrice = (price) => {
    if (!price) return '0₫';
    return Number(price).toLocaleString('vi-VN') + '₫';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const statusMap = {
    'PENDING': 'Chờ xác nhận',
    'CONFIRMED': 'Đã xác nhận',
    'SHIPPING': 'Đang vận chuyển',
    'DELIVERED': 'Đã nhận hàng',
    'CANCELLED': 'Đã huỷ',
    'REJECTED': 'Bị từ chối',
  };

  const statusColor = {
    'PENDING': 'text-orange-600',
    'CONFIRMED': 'text-blue-600',
    'SHIPPING': 'text-purple-600',
    'DELIVERED': 'text-green-600',
    'CANCELLED': 'text-gray-500',
    'REJECTED': 'text-red-600',
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} className="mb-6 text-[#058a81] font-bold flex items-center gap-2 hover:underline cursor-pointer">
          <span>←</span> Quay lại lịch sử đơn hàng
        </button>

        {loading ? (
          <div className="bg-white rounded-3xl p-8 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* CỘT TRÁI: THÔNG TIN KHÁCH HÀNG */}
            <div className="space-y-6">
              <div className={`bg-white rounded-3xl p-8 shadow-sm border transition-all ${isEditingShipping ? 'border-[#058a81]/30 ring-4 ring-[#058a81]/5' : 'border-gray-100'}`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-gray-800 uppercase italic">Thông tin nhận hàng</h3>
                  {orderData.status === 'PENDING' && !isEditingShipping && (
                    <button onClick={handleStartEdit} className="text-[10px] font-black text-[#058a81] uppercase px-3 py-1.5 border border-[#058a81] rounded-lg hover:bg-[#058a81] hover:text-white transition cursor-pointer">
                      ✏️ Sửa thông tin
                    </button>
                  )}
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Mã đơn hàng:</span>
                    <span className="font-black text-gray-800">#{orderData.orderID}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Ngày đặt:</span>
                    <span className="font-black text-gray-800">{formatDate(orderData.createdAt)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Trạng thái:</span>
                    <span className={`font-black ${statusColor[orderData.status] || ''}`}>
                      {statusMap[orderData.status] || orderData.status}
                    </span>
                  </div>

                  {/* Họ tên - editable */}
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Họ và tên:</span>
                    {isEditingShipping ? (
                      <input type="text" value={shippingForm.receiverName}
                        onChange={(e) => setShippingForm({...shippingForm, receiverName: e.target.value})}
                        className="font-black text-gray-800 text-right bg-gray-50 border border-[#058a81] rounded-lg px-2 py-1 outline-none w-2/3" />
                    ) : (
                      <span className="font-black text-gray-800">{orderData.receiverName}</span>
                    )}
                  </div>

                  {/* SĐT - editable */}
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Số điện thoại:</span>
                    {isEditingShipping ? (
                      <input type="text" value={shippingForm.phoneNumber}
                        onChange={(e) => setShippingForm({...shippingForm, phoneNumber: e.target.value})}
                        className="font-black text-gray-800 text-right bg-gray-50 border border-[#058a81] rounded-lg px-2 py-1 outline-none w-2/3" />
                    ) : (
                      <span className="font-black text-gray-800">{orderData.phoneNumber}</span>
                    )}
                  </div>

                  {/* Địa chỉ - editable */}
                  <div className="flex flex-col gap-2 border-b pb-2">
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Địa chỉ:</span>
                    {isEditingShipping ? (
                      <input type="text" value={shippingForm.shippingAddress}
                        onChange={(e) => setShippingForm({...shippingForm, shippingAddress: e.target.value})}
                        className="font-black text-gray-800 bg-gray-50 border border-[#058a81] rounded-lg px-2 py-1 outline-none w-full" />
                    ) : (
                      <span className="font-black text-gray-800 leading-relaxed">{orderData.shippingAddress}</span>
                    )}
                  </div>

                  {/* Ghi chú - editable */}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Ghi chú:</span>
                    {isEditingShipping ? (
                      <input type="text" value={shippingForm.note}
                        onChange={(e) => setShippingForm({...shippingForm, note: e.target.value})}
                        placeholder="Ghi chú..."
                        className="text-gray-800 font-bold text-right bg-gray-50 border border-[#058a81] rounded-lg px-2 py-1 outline-none w-2/3" />
                    ) : (
                      <span className="text-gray-800 font-bold">{orderData.note || '-'}</span>
                    )}
                  </div>

                  {/* Nút Lưu / Hủy khi đang edit */}
                  {isEditingShipping && (
                    <div className="flex gap-3 pt-4 border-t">
                      <button onClick={handleSaveShipping} disabled={savingShipping}
                        className="flex-1 bg-[#058a81] text-white py-3 rounded-xl font-bold hover:bg-[#046e67] transition cursor-pointer">
                        {savingShipping ? '⏳ Đang lưu...' : '✅ Lưu thay đổi'}
                      </button>
                      <button onClick={() => setIsEditingShipping(false)}
                        className="px-4 py-3 text-gray-400 hover:text-red-500 font-bold transition cursor-pointer">
                        Hủy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: CHI TIẾT SẢN PHẨM & THANH TOÁN */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-fit">
              <h3 className="text-xl font-black text-gray-800 mb-6 uppercase italic">Chi tiết đơn hàng</h3>
              
              <div className="space-y-4 mb-6">
                {orderData.details && orderData.details.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-gray-50 rounded-2xl p-4">
                    <img src={item.imageURL} alt="" className="w-16 h-16 object-contain rounded-lg" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-800">{item.productName}</h4>
                      <div className="flex gap-2 mt-1">
                        {item.colour && <span className="text-[10px] bg-white px-2 py-0.5 rounded border">{item.colour}</span>}
                        {item.storage && <span className="text-[10px] bg-white px-2 py-0.5 rounded border">{item.storage}</span>}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-400">×{item.quantity}</span>
                        <span className="font-black text-red-600">{formatPrice(item.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* TỔNG KẾT */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500 font-bold uppercase">Phí vận chuyển:</span>
                  <span className="font-black text-green-600">Miễn phí</span>
                </div>
                <div className="flex justify-between items-end border-t pt-4">
                  <div>
                    <p className="text-xs font-black text-gray-800 uppercase">Tổng số tiền</p>
                    <p className="text-[10px] text-gray-400 font-medium italic">(Đã bao gồm VAT)</p>
                  </div>
                  <p className="text-2xl font-black text-red-600 tracking-tighter">{formatPrice(orderData.total)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailPage;