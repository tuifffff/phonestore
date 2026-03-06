import { useState } from 'react';

// Giữ lại hàm này để tính toán nếu cần, hoặc bỏ nếu đã xử lý ở App.jsx
const parsePrice = (priceStr) => Number(priceStr.replace(/[^0-9]/g, ''));

const ProductDetailPage = ({ product, onBack, onAddToCart, onBuyNow }) => {
  // Lấy dữ liệu từ file product.js truyền xuống qua prop 'product'
  const colors = product?.colors || []; 
  const storageOptions = product?.storageOptions || ['Tiêu chuẩn'];

  // Khởi tạo state dựa trên dữ liệu thật của từng sản phẩm
  const [selectedColor, setSelectedColor] = useState(colors[0]?.id || '');
  const [selectedStorage, setSelectedStorage] = useState(storageOptions[0] || '');
  const [quantity, setQuantity] = useState(1);

  // Chống crash nếu product chưa kịp load
  if (!product) return <div className="p-20 text-center text-xl">Đang tải sản phẩm...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 bg-white">
      <button onClick={onBack} className="mb-6 text-gray-500 hover:text-black transition">← Quay lại trang chủ</button>
      
      <div className="flex flex-col md:flex-row gap-12">
        {/* Gallery ảnh */}
        <div className="w-full md:w-1/2 bg-[#F5F5F5] rounded-xl p-10 flex items-center justify-center">
          <img src={product.img} alt={product.name} className="max-h-[400px] object-contain" />
        </div>

        {/* Thông tin lựa chọn */}
        <div className="w-full md:w-1/2 space-y-6">
          <h1 className="text-3xl font-bold uppercase">{product.name}</h1>
          <div className="text-2xl font-medium text-red-600 ">{product.price}</div>
          <div className="flex items-center gap-4">
            <span className="text-xl">Màu sắc</span>
            <div className="flex gap-3">
              {colors.length > 0 ? colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c.id)}
                  className={`w-6 h-6 rounded-full border-2 ${c.class} ${selectedColor === c.id ? 'border-black' : 'border-transparent shadow-sm'}`}
                />
              )) : (
                <>
                  <button onClick={() => setSelectedColor('blue')} className={`w-6 h-6 rounded-full border-2 bg-blue-200 ${selectedColor === 'blue' ? 'border-black' : ''}`} />
                  <button onClick={() => setSelectedColor('red')} className={`w-6 h-6 rounded-full border-2 bg-red-400 ${selectedColor === 'red' ? 'border-black' : ''}`} />
                </>
              )}
            </div>
          </div>
          {/* Render Dung lượng động từ file data */}
          <div className="flex items-center gap-4">
            <span className="font-bold">Dung lượng:</span>
            <div className="flex gap-2">
              {storageOptions.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedStorage(size)}
                  className={`px-4 py-2 border rounded-lg transition ${selectedStorage === size ? 'bg-[#DB4444] text-white border-[#DB4444]' : 'hover:border-black'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
              
          {/* Bộ đếm và nút Mua */}
          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center border rounded-lg overflow-hidden h-12">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 hover:bg-gray-100">-</button>
              <span className="px-6 font-bold">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-4 bg-[#DB4444] text-white">+</button>
            </div>

            <button 
              onClick={() => onBuyNow(product, quantity, selectedColor, selectedStorage)}
              className="flex-1 bg-[#DB4444] text-white py-4 rounded-xl font-bold hover:bg-red-700 transition"
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
      {/* === CHÈN CODE MỚI VÀO ĐÂY === */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 border-t pt-10">
        
        {/* BẢNG 1: MÔ TẢ SẢN PHẨM (Nội dung chính - Bên trái) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-[#058a81] text-white p-2 rounded-xl text-lg"></span>
            <h3 className="text-xl font-black text-gray-800 uppercase">Đặc điểm nổi bật</h3>
          </div>
          
          <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
            <p className="font-bold text-gray-800 underline decoration-[#058a81] decoration-2">
              Đánh giá chi tiết về {product.name}:
            </p>
            <ul className="list-disc pl-5 space-y-3">
              <li>Thiết kế nguyên khối sang trọng, bền bỉ với khả năng kháng nước IP68.</li>
              <li>Màn hình Super Retina XDR 6.9 inch siêu mượt, tần số quét 120Hz.</li>
              <li>Chip A19 Pro mạnh mẽ nhất thế giới, xử lý mượt mà mọi tác vụ nặng.</li>
              <li>Hệ thống camera 48MP Pro Fusion hỗ trợ quay chụp chuẩn điện ảnh.</li>
            </ul>
            <p className="leading-relaxed italic">
              Đây là sự lựa chọn hoàn hảo cho những ai đang tìm kiếm một thiết bị không chỉ mạnh mẽ về hiệu năng mà còn đẳng cấp về thiết kế.
            </p>
            <button className="w-full mt-4 py-3 bg-gray-50 text-[#058a81] font-bold rounded-xl border border-dashed border-[#058a81]/30 hover:bg-gray-100 transition">
              Xem toàn bộ bài viết ▼
            </button>
          </div>
        </div>

        {/* BẢNG 2: THÔNG SỐ KỸ THUẬT (Bên phải) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-fit sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-[#058a81] text-white p-2 rounded-xl text-lg"></span>
              <h3 className="text-xl font-black text-gray-800 uppercase ">Thông số kỹ thuật</h3>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-50">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    { label: "Màn hình", value: "6.9 inch, Super Retina XDR" },
                    { label: "Chipset", value: "Apple A19 Pro (3nm)" },
                    { label: "RAM", value: "12GB" },
                    { label: "Camera", value: "48MP / 12MP / 48MP" },
                    { label: "Pin", value: "5000 mAh, Sạc nhanh 45W" },
                    { label: "Mạng", value: "5G, Wi-Fi 7" }
                  ].map((spec, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"}>
                      <td className="py-3 px-4 text-gray-400 font-medium">{spec.label}</td>
                      <td className="py-3 px-4 text-gray-800 font-bold">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <button className="w-full mt-6 py-3 bg-[#058a81] text-white rounded-xl font-bold shadow-lg shadow-[#058a81]/20 hover:bg-[#046e67] transition">
              Cấu hình chi tiết
            </button>
          </div>
        </div>

      </div>
      {/* === KẾT THÚC PHẦN CHÈN === */}
    </div>
    
  );
};

export default ProductDetailPage;