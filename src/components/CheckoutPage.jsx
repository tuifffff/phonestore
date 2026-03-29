import React, { useState } from 'react';
import { checkout, createVNPayUrl } from '../api/api';

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
      });

      if (paymentMethod === 'VNPAY') {
        const orderId = data.result?.orderID; // Cần BE map đúng tên trường này
        if (!orderId) {
            setError('Không lấy được mã đơn hàng để tạo thanh toán!');
            return;
        }
        
        // Gọi API tạo link VNPay
        const paymentData = await createVNPayUrl(totalAmount, orderId);
        if (paymentData.result) {
            // Redirect đi VNPay
            window.location.href = paymentData.result;
            return; // Dừng luôn để trình duyệt tự chuyển hướng
        } else {
            setError('Không tạo được link thanh toán VNPay!');
        }
      } else {
        // Nếu là COD
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
    <div className="min-h-screen bg-white py-10 px-4 md:px-20">
      <button onClick={onBack} className="text-gray-400 mb-8 hover:text-black transition flex items-center gap-2 cursor-pointer">
        <span>←</span> Quay lại
      </button>

      <h1 className="text-3xl font-bold mb-10">Xác nhận đơn hàng</h1>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* CỘT TRÁI: FORM NHẬP LIỆU */}
        <div className="flex-1 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-bold">
              ⚠️ {error}
            </div>
          )}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Họ và tên người nhận*</label>
              <input 
                type="text" name="receiverName" value={formData.receiverName}
                onChange={handleChange}
                className="w-full bg-[#F5F5F5] rounded p-3 outline-none focus:ring-2 focus:ring-[#058a81]"
                placeholder="Nhập họ tên người nhận"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Số điện thoại*</label>
              <input 
                type="text" name="phoneNumber" value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full bg-[#F5F5F5] rounded p-3 outline-none focus:ring-2 focus:ring-[#058a81]"
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Địa chỉ nhận hàng*</label>
              <input 
                type="text" name="shippingAddress" value={formData.shippingAddress}
                onChange={handleChange}
                className="w-full bg-[#F5F5F5] rounded p-3 outline-none focus:ring-2 focus:ring-[#058a81]"
                placeholder="Số nhà, tên đường, quận/huyện, thành phố..."
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Ghi chú (tùy chọn)</label>
              <textarea 
                name="note" value={formData.note}
                onChange={handleChange}
                rows={3}
                className="w-full bg-[#F5F5F5] rounded p-3 outline-none focus:ring-2 focus:ring-[#058a81] resize-none"
                placeholder="Giao giờ hành chính, gọi trước khi giao..."
              />
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
        <div className="w-full lg:w-[400px]">
          <div className="space-y-6">
            <h3 className="font-bold text-lg">Sản phẩm trong giỏ</h3>
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <img src={item.img || item.image} className="w-12 h-12 object-contain rounded" alt="" />
                  <div>
                    <span className="text-sm font-medium line-clamp-1">{item.name}</span>
                    <span className="text-xs text-gray-400 block">x{item.quantity || 1}</span>
                  </div>
                </div>
                <span className="font-bold whitespace-nowrap">{parsePrice(item.price).toLocaleString()}₫</span>
              </div>
            ))}

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between"><span>Tạm tính:</span><span>{totalAmount.toLocaleString()}₫</span></div>
              <div className="flex justify-between"><span>Giao hàng:</span><span className="text-green-600">Miễn phí</span></div>
              
              {/* Payment Methods */}
              <div className="pt-4 pb-2">
                <p className="font-bold mb-3">Phương thức thanh toán:</p>
                <div className="space-y-3">
                  <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition ${paymentMethod === 'COD' ? 'border-[#058a81] bg-teal-50/50' : 'hover:bg-gray-50'}`}>
                    <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-[#058a81] cursor-pointer" />
                    <div className="ml-3">
                      <span className="block font-bold mt-1 text-sm text-gray-800">Thanh toán khi nhận hàng</span>
                      <span className="block text-xs text-gray-500">Thanh toán tiền mặt hoặc quẹt thẻ khi giao tới nơi</span>
                    </div>
                  </label>

                  <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition ${paymentMethod === 'VNPAY' ? 'border-blue-500 bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                    <input type="radio" name="paymentMethod" value="VNPAY" checked={paymentMethod === 'VNPAY'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-[#058a81] cursor-pointer" />
                    <div className="ml-3">
                      <div className="flex items-center gap-2">
                         <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png" alt="vnpay" className="h-4 object-contain" />
                         <span className="font-bold text-sm text-gray-800">Thanh toán qua VNPay</span>
                      </div>
                      <span className="block text-xs mt-1 text-gray-500">Quét mã QR, Thẻ ATM nội địa, Thẻ quốc tế Visa/MasterCard...</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg border-t pt-3">
                <span>Tổng cộng:</span>
                <span className="text-red-600">{totalAmount.toLocaleString()}₫</span>
              </div>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white transition cursor-pointer ${
                loading ? 'bg-gray-400 cursor-wait' : 'bg-[#DB4444] hover:bg-red-700'
              }`}
            >
              {loading ? '⏳ ĐANG XỬ LÝ...' : 'ĐẶT HÀNG'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;