import { useState } from 'react';

const CartPage = ({ cartItems, onBack, onUpdateQty, onRemove,onNavigateToCheckout }) => {
  // QUAN TRỌNG: Lưu danh sách các ID được chọn vào mảng
  const [selectedIds, setSelectedIds] = useState([]);

  // Hàm xử lý tích chọn từng món
  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      // Nếu đã có trong mảng thì bỏ đi (Uncheck)
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      // Nếu chưa có thì thêm vào (Check)
      setSelectedIds([...selectedIds, id]);
    }
  };

  const parsePrice = (priceStr) => Number(priceStr?.replace(/[^0-9]/g, '') || 0);

  // Tính tổng tiền CHỈ cho những món có ID nằm trong mảng selectedIds
  const totalAmount = cartItems.reduce((sum, item) => {
    if (selectedIds.includes(item.id)) {
      return sum + (parsePrice(item.price) * (item.quantity || 1));
    }
    return sum;
  }, 0);

  return (
    <div className="min-h-screen bg-[#f4f4f4] pb-32">
      <div className="bg-white p-4 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={onBack} className="text-2xl mr-4 cursor-pointer">←</button>
        <h1 className="flex-1 text-center font-bold text-lg">Giỏ hàng ({cartItems.length})</h1>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm relative">
            <div className="flex gap-4">
              {/* LỖI TÍCH CHỌN ĐÃ ĐƯỢC SỬA Ở ĐÂY */}
              <input 
                type="checkbox" 
                checked={selectedIds.includes(item.id)} // Chỉ tích nếu ID nằm trong mảng chọn
                onChange={() => toggleSelect(item.id)}
                className="mt-2 w-5 h-5 accent-red-600 cursor-pointer" 
              />
              
              <img src={item.img} className="w-20 h-20 object-contain" alt="product" />
              
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-bold text-sm leading-tight pr-4">{item.name}</h3>
                  {/* NÚT XÓA SẢN PHẨM */}
                  <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-600">Xóa</button>
                </div>
                
                <div className="mt-2 text-red-600 font-bold">{item.price}</div>

                <div className="mt-4 flex items-center justify-between">
                  {/* NÚT TĂNG GIẢM SỐ LƯỢNG */}
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button onClick={() => onUpdateQty(item.id, -1)} className="px-3 py-1 bg-gray-50">-</button>
                    <span className="px-4 font-bold text-sm">{item.quantity || 1}</span>
                    <button onClick={() => onUpdateQty(item.id, 1)} className="px-3 bg-gray-50 border-l">+</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER THANH TOÁN */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-lg z-20">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-sm">Tổng: <span className="text-red-600 font-bold text-lg">{totalAmount.toLocaleString()}₫</span></p>
          </div>
          <button
            onClick={onNavigateToCheckout}
            disabled={selectedIds.length === 0}
            className={`px-10 py-3 rounded-xl font-bold text-white transition-all ${
              selectedIds.length > 0 ? 'bg-red-600 shadow-red-200 shadow-lg' : 'bg-gray-300'
            }`}
          >
            Mua ngay ({selectedIds.length})
          </button>
        </div>
      </div>
    </div>
  );
};
export default CartPage;