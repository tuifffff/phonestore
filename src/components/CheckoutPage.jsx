import React from 'react'; // Đảm bảo đã import React

const CheckoutPage = ({ cartItems = [], user, onBack, mode }) => {
  // 1. Kiểm tra mode để hiển thị giao diện phù hợp
  const isCheckout = mode === "checkout";

  // 2. Hàm xử lý giá tiền (Phòng trường hợp giá là chuỗi hoặc số)
  const parsePrice = (price) => {
    if (!price) return 0;
    return Number(price.toString().replace(/[^0-9]/g, ''));
  };

  // 3. Tính tổng tiền
  const totalAmount = cartItems.reduce((acc, item) => {
    return acc + (parsePrice(item.price) * (item.quantity || 1));
  }, 0);

  return (
    <div className="min-h-screen bg-white py-10 px-4 md:px-20">
      {/* Nút quay lại */}
      <button onClick={onBack} className="text-gray-400 mb-8 hover:text-black transition flex items-center gap-2">
        <span>←</span> Quay lại trang chủ
      </button>

      {/* Tiêu đề Động */}
      <h1 className="text-3xl font-bold mb-10">
        {isCheckout ? "Chi tiết đơn hàng" : "Cập nhật thông tin cá nhân"}
      </h1>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* CỘT TRÁI: FORM NHẬP LIỆU */}
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Họ và tên*</label>
              <input type="text" defaultValue={user?.name || ""} className="w-full bg-[#F5F5F5] rounded p-3 outline-none focus:ring-1 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Số điện thoại*</label>
              <input type="text" className="w-full bg-[#F5F5F5] rounded p-3 outline-none" placeholder="Nhập số điện thoại" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Địa chỉ nhận hàng*</label>
              <input type="text" className="w-full bg-[#F5F5F5] rounded p-3 outline-none" placeholder="Số nhà, tên đường..." />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Thành phố*</label>
              <input type="text" className="w-full bg-[#F5F5F5] rounded p-3 outline-none" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Phương thức</label>
              <button 
                className="w-1/2 bg-[#17c582] text-white py-3 border border-black rounded font-bold hover:bg-red-700 transition"
              >
                Chuyển khoản
              </button>
              <button 
                className="w-1/2 bg-[#17c582] text-white py-3 border border-black rounded font-bold hover:bg-red-700 transition"
              >
                Tiền mặt
              </button>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: TÓM TẮT (Chỉ hiện khi Mua hàng) */}
        <div className="w-full lg:w-[400px]">
          {isCheckout ? (
            <div className="space-y-6">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <img src={item.img} className="w-12 h-12 object-contain" alt="" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold">{item.price}</span>
                </div>
              ))}

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between"><span>Tạm tính:</span><span>{totalAmount.toLocaleString()}₫</span></div>
                <div className="flex justify-between"><span>Giao hàng:</span><span className="text-green-600">Miễn phí</span></div>
                <div className="flex justify-between font-bold text-lg border-t pt-3">
                  <span>Tổng cộng:</span>
                  <span className="text-red-600">{totalAmount.toLocaleString()}₫</span>
                </div>
              </div>

              <button 
                onClick={() => alert("Đặt hàng thành công!")}
                className="w-full bg-[#DB4444] text-white py-4 rounded font-bold hover:bg-red-700 transition"
              >
                ĐẶT HÀNG
              </button>
            </div>
          ) : (
            /* Giao diện khi Cập nhật thông tin */
            <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300">
              <p className="text-sm text-gray-500 mb-6 italic">
                Bạn đang thực hiện cập nhật thông tin cá nhân. Vui lòng kiểm tra kỹ các thông tin trước khi lưu.
              </p>
              <button 
                onClick={() => alert("Cập nhật thông tin thành công!")}
                className="w-full bg-[#058a81] text-white py-4 rounded font-bold hover:bg-opacity-90 transition"
              >
                LƯU THÔNG TIN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- DÒNG QUAN TRỌNG NHẤT: PHẢI CÓ DÒNG NÀY ---
export default CheckoutPage;