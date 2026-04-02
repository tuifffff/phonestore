import React, { useState, useEffect } from 'react';
import { checkout, createVNPayUrl, getMyAddresses, getMyInfo } from '../api/api';

const CheckoutPage = ({ cartItems = [], onBack, onCheckoutSuccess }) => {
  const [formData, setFormData] = useState({
    receiverName: '',
    phoneNumber: '',
    shippingAddress: '',
    note: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sổ địa chỉ
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);

  useEffect(() => {
    loadPreFillData();
  }, []);

  const loadPreFillData = async () => {
    try {
      const [infoRes, addrRes] = await Promise.all([getMyInfo(), getMyAddresses()]);
      
      const user = infoRes.result;
      const addrList = addrRes.result || [];
      
      setAddresses(addrList);
      
      let defaultAddr = addrList.find(a => a.isDefault);
      let addressStr = '';
      if (defaultAddr) {
        addressStr = `${defaultAddr.street}, ${defaultAddr.district}, ${defaultAddr.city}`;
      }

      setFormData({
        receiverName: user?.fullName || user?.username || '',
        phoneNumber: user?.phoneNumber || '',
        shippingAddress: addressStr,
        note: '',
      });
      
    } catch (err) {
      console.error("Lỗi tải thông tin cho Checkout", err);
    }
  };

  const parsePrice = (price) => {
    if (!price) return 0;
    return Number(price.toString().replace(/[^0-9]/g, ''));
  };

  const totalAmount = cartItems.reduce((acc, item) => {
    return acc + (parsePrice(item.price) * (item.quantity || 1));
  }, 0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // Validate
    if (!formData.receiverName.trim()) return setError('Vui lòng nhập họ tên!');
    if (!formData.phoneNumber.trim()) return setError('Vui lòng nhập số điện thoại!');
    if (!formData.shippingAddress.trim()) return setError('Vui lòng nhập địa chỉ!');

    setLoading(true);
    setError('');

    try {
      const data = await checkout({
        receiverName: formData.receiverName,
        phoneNumber: formData.phoneNumber,
        shippingAddress: formData.shippingAddress,
        note: formData.note || '',
        versionIds: cartItems.map(item => item.id),
      });

      if (paymentMethod === 'VNPAY') {
        const orderId = data.result?.orderID;
        if (!orderId) {
            setError('Không lấy được mã đơn hàng để tạo thanh toán!');
            return;
        }
        
        const paymentData = await createVNPayUrl(totalAmount, orderId);
        if (paymentData.result) {
            window.location.href = paymentData.result;
            return;
        } else {
            setError('Không tạo được link thanh toán VNPay!');
        }
      } else {
        alert(data.message || 'Đặt hàng thành công! Cảm ơn bạn đã mua sắm. 🎉');
        if (onCheckoutSuccess) onCheckoutSuccess();
      }
    } catch (err) {
      setError(err.message || 'Đặt hàng thất bại!');
    } finally {
      if (paymentMethod !== 'VNPAY') setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-10 px-4 md:px-20 font-sans">
      <div className="max-w-7xl mx-auto">
        <button onClick={onBack} className="text-gray-400 mb-8 hover:text-black transition flex items-center gap-2 cursor-pointer font-bold">
          <span>←</span> Quay lại
        </button>

        <h1 className="text-3xl font-black mb-10 text-gray-800 uppercase tracking-tighter">Xác nhận đơn hàng</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* CỘT TRÁI: FORM NHẬP LIỆU */}
          <div className="flex-1 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-bold shadow-sm">
                ⚠️ {error}
              </div>
            )}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">Họ và tên người nhận *</label>
                  <input 
                    type="text" name="receiverName" value={formData.receiverName}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 outline-none focus:bg-white focus:border-[#058a81] transition-all"
                    placeholder="Nhập họ tên người nhận"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">Số điện thoại *</label>
                  <input 
                    type="text" name="phoneNumber" value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 outline-none focus:bg-white focus:border-[#058a81] transition-all"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-400 text-[10px] font-black uppercase">Địa chỉ nhận hàng *</label>
                  <button 
                    type="button" 
                    onClick={() => setShowAddressModal(true)} 
                    className="text-[#058a81] text-[10px] font-black uppercase tracking-widest hover:underline cursor-pointer"
                  >
                    + Chọn từ Sổ địa chỉ
                  </button>
                </div>
                <input 
                  type="text" name="shippingAddress" value={formData.shippingAddress}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 outline-none focus:bg-white focus:border-[#058a81] transition-all"
                  placeholder="Số nhà, tên đường, quận/huyện, thành phố..."
                />
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">Ghi chú (tùy chọn)</label>
                <textarea 
                  name="note" value={formData.note}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 outline-none focus:bg-white focus:border-[#058a81] transition-all resize-none"
                  placeholder="Giao giờ hành chính, gọi trước khi giao..."
                />
              </div>

            </div>
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
          <div className="w-full lg:w-[450px]">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6 sticky top-8">
              <h3 className="font-black text-gray-800 text-lg uppercase tracking-tight">Sản phẩm trong giỏ</h3>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center gap-4 bg-gray-50 p-3 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white rounded-xl p-1 shadow-sm border border-gray-100 flex-shrink-0">
                        <img src={item.img || item.image} className="w-full h-full object-contain" alt="" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mt-1">SL: {item.quantity || 1}</span>
                      </div>
                    </div>
                    <span className="font-black text-[#058a81] whitespace-nowrap">{parsePrice(item.price).toLocaleString()}₫</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                  <span>Tạm tính:</span>
                  <span className="text-gray-800">{totalAmount.toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                  <span>Phí giao hàng:</span>
                  <span className="text-[#058a81] uppercase text-[10px] tracking-widest px-2 py-1 bg-[#058a81]/10 rounded-full">Miễn phí</span>
                </div>
                
                {/* Phương thức thanh toán */}
                <div className="pt-4 pb-2 border-t border-gray-100">
                  <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-4">Phương thức thanh toán</p>
                  <div className="space-y-3">
                    <label className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#058a81] bg-[#058a81]/5 ring-4 ring-[#058a81]/10' : 'border-gray-100 hover:border-gray-200 bg-gray-50'}`}>
                      <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${paymentMethod === 'COD' ? 'border-[#058a81]' : 'border-gray-300'}`}>
                        {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 bg-[#058a81] rounded-full"></div>}
                      </div>
                      <div className="flex-1">
                        <span className="block font-black text-sm text-gray-800">Tiền mặt (COD)</span>
                        <span className="block text-[10px] font-bold text-gray-400 mt-0.5">Thanh toán khi nhận hàng</span>
                      </div>
                    </label>

                    <label className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'VNPAY' ? 'border-[#005BAA] bg-[#005BAA]/5 ring-4 ring-[#005BAA]/10' : 'border-gray-100 hover:border-gray-200 bg-gray-50'}`}>
                      <input type="radio" name="paymentMethod" value="VNPAY" checked={paymentMethod === 'VNPAY'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${paymentMethod === 'VNPAY' ? 'border-[#005BAA]' : 'border-gray-300'}`}>
                        {paymentMethod === 'VNPAY' && <div className="w-2.5 h-2.5 bg-[#005BAA] rounded-full"></div>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                           <span className="font-black text-sm text-gray-800">Web VNPay / Quét mã QR</span>
                        </div>
                        <span className="block text-[10px] font-bold text-gray-400 mt-0.5">ATM nội địa, Visa, MasterCard...</span>
                      </div>
                      <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png" alt="vnpay" className="h-4 object-contain ml-2 opacity-80" />
                    </label>
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-gray-100 pt-6">
                  <span className="font-black text-gray-800 text-lg uppercase tracking-tight">Tổng cộng</span>
                  <span className="text-3xl font-black text-orange-500 tracking-tighter">{totalAmount.toLocaleString()}₫</span>
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black text-white text-sm uppercase tracking-widest shadow-lg transition-all cursor-pointer ${
                  loading ? 'bg-gray-400 shadow-none' : 'bg-orange-500 shadow-orange-500/30 hover:bg-orange-600 hover:shadow-orange-500/50 hover:-translate-y-1'
                }`}
              >
                {loading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Áo khoác Modal Sổ Địa Chỉ */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] shadow-2xl animate-slideUp">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-black text-gray-800 uppercase tracking-tight text-lg">Sổ địa chỉ của bạn</h2>
              <button onClick={() => setShowAddressModal(false)} className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-gray-500 hover:bg-red-500 hover:text-white transition cursor-pointer font-bold leading-none">&times;</button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-4 bg-gray-50/50">
              {addresses.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-4 opacity-50">📭</div>
                  <p className="text-gray-400 font-bold">Bạn chưa lưu địa chỉ nào trong sổ.</p>
                  <p className="text-xs text-gray-400 mt-2">Vui lòng quay lại Trang cá nhân để thêm mới.</p>
                </div>
              ) : (
                addresses.map(addr => (
                  <div 
                    key={addr.addressID} 
                    className="p-5 bg-white border-2 border-gray-100 rounded-2xl hover:border-[#058a81] hover:shadow-lg hover:shadow-[#058a81]/10 transition-all cursor-pointer flex gap-4 items-center group" 
                    onClick={() => {
                      setFormData({...formData, shippingAddress: `${addr.street}, ${addr.district}, ${addr.city}`});
                      setShowAddressModal(false);
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#058a81]/10 group-hover:text-[#058a81] transition-colors">
                      📍
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-gray-800 line-clamp-1">{addr.street}</p>
                        {addr.isDefault && <span className="bg-[#058a81] text-white text-[8px] uppercase font-black px-2 py-0.5 rounded-full whitespace-nowrap">Mặc định</span>}
                      </div>
                      <p className="text-xs font-bold text-gray-500">{addr.district}, {addr.city}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tailwind Custom Styles for Animations & Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
        
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
};
export default CheckoutPage;