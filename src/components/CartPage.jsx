import React, { useEffect, useState } from 'react';

const CartPage = ({ cartItems = [], onBack, onUpdateQty, onRemove, onNavigateToCheckout }) => {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  // Chọn tất cả / Bỏ chọn tất cả
  const toggleSelectAll = () => {
    if (selectedIds.length === cartItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cartItems.map(item => item.id));
    }
  };

  const parsePrice = (priceStr) => {
    if (typeof priceStr === 'number') return priceStr;
    return Number(priceStr?.toString().replace(/[^0-9]/g, '') || 0);
  };

  const totalAmount = cartItems.reduce((sum, item) => {
    if (selectedIds.includes(item.id)) {
      return sum + (parsePrice(item.price) * (item.quantity || 1));
    }
    return sum;
  }, 0);

  // Xử lý khi nhấn Mua Ngay
  const handleCheckout = () => {
    const itemsToBuy = cartItems.filter(item => selectedIds.includes(item.id));
    onNavigateToCheckout(itemsToBuy);
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] pb-32">
      {/* Header */}
      <div className="bg-white p-4 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={onBack} className="text-2xl mr-4 cursor-pointer">←</button>
        <h1 className="flex-1 text-center font-bold text-lg">Giỏ hàng ({cartItems.length})</h1>
      </div>

      {/* Danh sách món hàng */}
      <div className="max-w-xl mx-auto p-4 space-y-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-30">🛒</div>
            <p className="text-gray-500 font-bold">Giỏ hàng trống trơn à!</p>
            <button onClick={onBack} className="mt-4 text-[#058a81] font-bold hover:underline">
              ← Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <>
            {/* Nút chọn tất cả */}
            <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
              <input 
                type="checkbox" 
                checked={selectedIds.length === cartItems.length && cartItems.length > 0}
                onChange={toggleSelectAll}
                className="w-5 h-5 accent-red-600 cursor-pointer"
              />
              <span className="text-sm font-bold text-gray-600">Chọn tất cả ({cartItems.length} sản phẩm)</span>
            </div>

            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm relative">
                <div className="flex gap-4">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="mt-2 w-5 h-5 accent-red-600 cursor-pointer" 
                  />
                  
                  <img src={item.img || item.image} className="w-20 h-20 object-contain" alt="product" />
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-bold text-sm leading-tight pr-4">{item.name}</h3>
                      <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-600 transition cursor-pointer">Xóa</button>
                    </div>
                    
                    {/* Hiển thị màu/dung lượng nếu có */}
                    {(item.selectedColor || item.selectedStorage) && (
                      <div className="flex gap-2 mt-1">
                        {item.selectedColor && (
                          <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded">{item.selectedColor}</span>
                        )}
                        {item.selectedStorage && (
                          <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded">{item.selectedStorage}</span>
                        )}
                      </div>
                    )}

                    <div className="mt-2 text-red-600 font-bold">
                      {parsePrice(item.price).toLocaleString()}₫
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button onClick={() => onUpdateQty(item.id, -1)} className="px-3 py-1 bg-gray-50 cursor-pointer hover:bg-gray-100 transition">-</button>
                        <span className="px-4 font-bold text-sm">{item.quantity || 1}</span>
                        <button onClick={() => onUpdateQty(item.id, 1)} className="px-3 bg-gray-50 border-l cursor-pointer hover:bg-gray-100 transition">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer thanh toán */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-lg z-20">
          <div className="max-w-xl mx-auto flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Tổng thanh toán</p>
              <p className="text-red-600 font-bold text-xl">{totalAmount.toLocaleString()}₫</p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={selectedIds.length === 0}
              className={`px-10 py-3 rounded-xl font-bold text-white transition-all cursor-pointer ${
                selectedIds.length > 0 ? 'bg-red-600 shadow-red-200 shadow-lg hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Mua ngay ({selectedIds.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;