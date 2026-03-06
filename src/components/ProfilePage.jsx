import React, { useState } from 'react';

const ProfileUpdatePage = ({ user, onBack }) => {
  // 1. State quản lý việc có đang được phép sửa hay không
  const [isEditing, setIsEditing] = useState(false);
  
  // 2. State lưu dữ liệu form (Lấy từ props user)
  const [formData, setFormData] = useState({
    name: user?.name || 'boboi',
    phone: user?.phone || '0987xxxxxx',
    address: user?.address || '123 Đường ABC',
    city: user?.city || 'Hà Nội'
  });

  // Hàm xử lý khi nhấn "Lưu thông tin"
  const handleSave = () => {
    // Giả lập gửi request về DB
    console.log("Đang gửi request về DB với dữ liệu:", formData);
    
    // Sau khi gửi xong thì khóa lại
    setIsEditing(false);
    alert("Hệ thống: Đã cập nhật dữ liệu thành công lên Database!");
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <button onClick={onBack} className="mb-6 text-gray-400 hover:text-black transition">← Quay lại trang chủ</button>
        <h1 className="text-3xl font-black text-gray-800 mb-10 uppercase tracking-tighter">Cập nhật thông tin cá nhân</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: FORM NHẬP LIỆU (Mặc định bị khóa) */}
          <div className={`lg:col-span-2 space-y-6 bg-white p-8 rounded-[2rem] shadow-sm border transition-all duration-300 ${isEditing ? 'border-[#058a81]/30 ring-4 ring-[#058a81]/5' : 'border-gray-100'}`}>
            
            {/* HỌ VÀ TÊN */}
            <div>
              <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">Họ và tên*</label>
              <input 
                type="text" 
                value={formData.name}
                disabled={!isEditing} // Khóa nếu không ở chế độ sửa
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full rounded-xl p-4 outline-none transition-all ${isEditing ? 'bg-white border border-[#058a81] shadow-sm' : 'bg-gray-50 border-transparent text-gray-400 cursor-not-allowed'}`} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* SỐ ĐIỆN THOẠI */}
              <div>
                <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">Số điện thoại*</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={`w-full rounded-xl p-4 outline-none transition-all ${isEditing ? 'bg-white border border-[#058a81]' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`} 
                />
              </div>
              {/* THÀNH PHỐ */}
              <div>
                <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">Thành phố*</label>
                <input 
                  type="text" 
                  value={formData.city}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className={`w-full rounded-xl p-4 outline-none transition-all ${isEditing ? 'bg-white border border-[#058a81]' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`} 
                />
              </div>
            </div>

            {/* ĐỊA CHỈ NHẬN HÀNG */}
            <div>
              <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">Địa chỉ nhận hàng*</label>
              <input 
                type="text" 
                value={formData.address}
                disabled={!isEditing}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className={`w-full rounded-xl p-4 outline-none transition-all ${isEditing ? 'bg-white border border-[#058a81]' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`} 
              />
            </div>
          </div>

          {/* CỘT PHẢI: NÚT ĐIỀU KHIỂN (Dựa trên image_fa459a.png) */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 h-fit space-y-4">
            <div className="p-6 bg-gray-50 rounded-2xl text-gray-400 text-xs italic border border-dashed border-gray-200">
              Bạn đang thực hiện cập nhật thông tin cá nhân. Vui lòng kiểm tra kỹ các thông tin trước khi lưu.
            </div>

            {/* NÚT 1: BẤM ĐỂ MỞ KHÓA FORM */}
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full bg-[#058a81] text-white py-4 rounded-2xl font-black shadow-lg shadow-[#058a81]/20 hover:bg-[#046e67] transition uppercase tracking-widest text-xs"
              >
                CẬP NHẬT THÔNG TIN
              </button>
            ) : (
              /* NÚT 2: BẤM ĐỂ LƯU VÀO DB */
              <button 
                onClick={handleSave}
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-100 hover:bg-orange-600 transition uppercase tracking-widest text-xs animate-pulse"
              >
                LƯU THÔNG TIN NGAY
              </button>
            )}

            {isEditing && (
              <button 
                onClick={() => setIsEditing(false)}
                className="w-full text-gray-400 py-2 text-xs font-bold hover:text-red-500 transition"
              >
                Hủy bỏ sửa đổi
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileUpdatePage;