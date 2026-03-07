import React from 'react';

const OrderDetailPage = ({ order, onBack }) => {
  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} className="mb-6 text-[#058a81] font-bold flex items-center gap-2 hover:underline">
          <span>←</span> Quay lại lịch sử đơn hàng
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CỘT TRÁI: THÔNG TIN KHÁCH HÀNG & HỖ TRỢ */}
          <div className="space-y-6">
            {/* THẺ 1: THÔNG TIN KHÁCH HÀNG (image_9af1a7.png) */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-800 mb-6 uppercase italic">Thông tin khách hàng</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Họ và tên:</span>
                  <span className="font-black text-gray-800">Anh Quốc Triệu</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Số điện thoại:</span>
                  <span className="font-black text-gray-800">0917838873</span>
                </div>
                <div className="flex flex-col gap-2 border-b pb-2">
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Địa chỉ:</span>
                  <span className="font-black text-gray-800 text-right leading-relaxed">
                    số 26 ngõ 217 đường trần phú, Phường Văn Quán, Quận Hà Đông, Hà Nội
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Ghi chú:</span>
                  <span className="text-gray-800 font-bold">-</span>
                </div>
              </div>
            </div>

            {/* THẺ 2: THÔNG TIN HỖ TRỢ (image_9af1a7.png) */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-800 mb-6 uppercase italic">Thông tin hỗ trợ</h3>
              <div className="space-y-6 text-sm">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    <span className="text-red-500 text-lg">📍</span>
                    <div>
                      <p className="text-gray-400 font-black uppercase text-[10px] mb-1">Địa chỉ cửa hàng:</p>
                      <p className="font-black text-gray-800 leading-tight">543 Nguyễn Trãi, P. Thanh Xuân Nam, Q. Thanh Xuân, Hà Nội</p>
                    </div>
                  </div>
                  <button className="whitespace-nowrap px-3 py-1 bg-red-50 text-red-500 rounded-full text-[10px] font-black border border-red-100">🚩 Chỉ đường</button>
                </div>

                <div className="flex justify-between items-center border-t pt-4">
                  <div className="flex items-center gap-3">
                    <span className="text-red-500 text-lg">📞</span>
                    <div>
                      <p className="text-gray-400 font-black uppercase text-[10px] mb-1">Số điện thoại:</p>
                      <p className="font-black text-gray-800">02471085543</p>
                    </div>
                  </div>
                  <button className="px-4 py-1 bg-red-50 text-red-500 rounded-full text-[10px] font-black border border-red-100">📞 Liên hệ</button>
                </div>

                <div className="flex items-center gap-3 border-t pt-4 text-[#0068ff] font-bold">
                   <img src="https://img.icons8.com/color/48/zalo.png" className="w-6 h-6" alt="zalo" />
                   <span className="text-[11px] uppercase tracking-tighter">Liên hệ qua Zalo ↗</span>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN THANH TOÁN (image_9af1a7.png) */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-fit">
            <h3 className="text-xl font-black text-gray-800 mb-6 uppercase italic">Thông tin thanh toán</h3>
            
            {/* PHẦN SẢN PHẨM */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-black text-gray-800 uppercase text-xs">Sản phẩm</span>
                <span className="text-xs text-gray-400">Trạng thái: <span className="text-green-600 font-bold uppercase">Thành công</span></span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-xs text-gray-500 font-bold">{order.name}</span>
                <span className="font-black text-gray-800">1</span>
              </div>
              <div className="flex justify-between py-4">
                <span className="text-xs text-gray-500 font-bold uppercase">Tổng tiền hàng:</span>
                <span className="font-black text-gray-800">{order.price}</span>
              </div>
              <div className="flex justify-between py-2 text-green-600">
                <span className="text-xs font-bold uppercase">Giảm giá:</span>
                <span className="font-black">-270.000đ</span>
              </div>
              <div className="flex justify-between py-2 text-green-600 border-b border-gray-200 pb-4">
                <span className="text-xs font-bold uppercase">Phí vận chuyển:</span>
                <span className="font-black">Miễn phí</span>
              </div>
            </div>

            {/* PHẦN TỔNG KẾT THANH TOÁN */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs font-black text-gray-800 uppercase">Tổng số tiền</p>
                  <p className="text-[10px] text-gray-400 font-medium italic">(Đã bao gồm VAT và được làm tròn)</p>
                </div>
                <p className="text-2xl font-black text-red-600 tracking-tighter">{order.total}</p>
              </div>

              <div className="flex justify-between items-center border-t pt-4">
                <p className="text-xs font-black text-gray-800 uppercase">Số tiền đã thanh toán</p>
                <p className="font-black text-gray-800 text-lg">{order.total}</p>
              </div>

              <div className="flex justify-between items-center border-t pt-4 text-red-600">
                <div>
                  <p className="text-xs font-black uppercase tracking-tighter">Tổng số tiền còn lại</p>
                  <p className="text-[10px] text-gray-400 font-medium italic">(Cần phải thanh toán thêm)</p>
                </div>
                <p className="text-xl font-black italic">0đ</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;