import React, { useState, useEffect } from 'react';
import { getMyInfo, updateMyInfo, changePassword } from '../api/api';

const ProfileUpdatePage = ({ user, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    address: '',
    gender: '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [userInfo, setUserInfo] = useState(null);

  // Load thông tin từ API khi mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getMyInfo();
      const info = data.result;
      setUserInfo(info);
      setFormData({
        email: info.email || '',
        phoneNumber: info.phoneNumber || '',
        address: info.address || '',
        gender: info.gender || '',
      });
    } catch (err) {
      console.error("Lỗi tải profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMyInfo(formData);
      alert('Cập nhật thông tin thành công! ✅');
      setIsEditing(false);
      loadProfile(); // Refresh data
    } catch (err) {
      alert(err.message || 'Cập nhật thất bại!');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      return alert('Vui lòng nhập đầy đủ!');
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return alert('Mật khẩu mới không khớp!');
    }

    try {
      await changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      alert('Đổi mật khẩu thành công! ✅');
      setShowPasswordForm(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert(err.message || 'Đổi mật khẩu thất bại!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">⏳</div>
          <p className="text-gray-400 font-bold">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <button onClick={onBack} className="mb-6 text-gray-400 hover:text-black transition cursor-pointer">← Quay lại trang chủ</button>
        <h1 className="text-3xl font-black text-gray-800 mb-10 uppercase tracking-tighter">Thông tin tài khoản</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: THÔNG TIN TÀI KHOẢN */}
          <div className={`lg:col-span-2 space-y-6 bg-white p-8 rounded-[2rem] shadow-sm border transition-all duration-300 ${isEditing ? 'border-[#058a81]/30 ring-4 ring-[#058a81]/5' : 'border-gray-100'}`}>
            
            {/* USERNAME (không thể sửa) */}
            <div>
              <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">Tên đăng nhập</label>
              <input 
                type="text" value={userInfo?.username || ''} disabled
                className="w-full rounded-xl p-4 outline-none bg-gray-50 border-transparent text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">Email</label>
              <input 
                type="email" value={formData.email} disabled={!isEditing}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full rounded-xl p-4 outline-none transition-all ${isEditing ? 'bg-white border border-[#058a81] shadow-sm' : 'bg-gray-50 border-transparent text-gray-400 cursor-not-allowed'}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* SỐ ĐIỆN THOẠI */}
              <div>
                <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">Số điện thoại</label>
                <input 
                  type="text" value={formData.phoneNumber} disabled={!isEditing}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className={`w-full rounded-xl p-4 outline-none transition-all ${isEditing ? 'bg-white border border-[#058a81]' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
                />
              </div>
              {/* GIỚI TÍNH */}
              <div>
                <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">Giới tính</label>
                {isEditing ? (
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full rounded-xl p-4 outline-none bg-white border border-[#058a81]"
                  >
                    <option value="">-- Chọn --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                ) : (
                  <input type="text" value={formData.gender || 'Chưa cập nhật'} disabled
                    className="w-full rounded-xl p-4 outline-none bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                )}
              </div>
            </div>

            {/* ĐỊA CHỈ */}
            <div>
              <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">Địa chỉ</label>
              <input 
                type="text" value={formData.address} disabled={!isEditing}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className={`w-full rounded-xl p-4 outline-none transition-all ${isEditing ? 'bg-white border border-[#058a81]' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
              />
            </div>

            {/* FORM ĐỔI MẬT KHẨU */}
            {showPasswordForm && (
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-black text-gray-800 uppercase text-sm">Đổi mật khẩu</h3>
                <input type="password" placeholder="Mật khẩu cũ" value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                  className="w-full rounded-xl p-4 outline-none bg-white border border-gray-200 focus:border-[#058a81]"
                />
                <input type="password" placeholder="Mật khẩu mới" value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full rounded-xl p-4 outline-none bg-white border border-gray-200 focus:border-[#058a81]"
                />
                <input type="password" placeholder="Xác nhận mật khẩu mới" value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full rounded-xl p-4 outline-none bg-white border border-gray-200 focus:border-[#058a81]"
                />
                <div className="flex gap-3">
                  <button onClick={handleChangePassword}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition cursor-pointer">
                    Xác nhận đổi mật khẩu
                  </button>
                  <button onClick={() => setShowPasswordForm(false)}
                    className="px-6 py-3 text-gray-400 hover:text-red-500 transition cursor-pointer">
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CỘT PHẢI: NÚT ĐIỀU KHIỂN */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 h-fit space-y-4">
            {/* THÔNG TIN ROLE */}
            <div className="p-4 bg-gray-50 rounded-2xl text-center border border-dashed border-gray-200">
              <div className="text-3xl mb-2">👤</div>
              <p className="font-black text-gray-800">{userInfo?.username}</p>
              <p className="text-xs text-gray-400 mt-1">Vai trò: <span className="text-[#058a81] font-bold">{userInfo?.roleName || 'USER'}</span></p>
            </div>

            {/* NÚT CẬP NHẬT / LƯU */}
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full bg-[#058a81] text-white py-4 rounded-2xl font-black shadow-lg shadow-[#058a81]/20 hover:bg-[#046e67] transition uppercase tracking-widest text-xs cursor-pointer"
              >
                CẬP NHẬT THÔNG TIN
              </button>
            ) : (
              <button 
                onClick={handleSave} disabled={saving}
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-100 hover:bg-orange-600 transition uppercase tracking-widest text-xs cursor-pointer"
              >
                {saving ? '⏳ ĐANG LƯU...' : 'LƯU THÔNG TIN NGAY'}
              </button>
            )}

            {isEditing && (
              <button onClick={() => { setIsEditing(false); loadProfile(); }}
                className="w-full text-gray-400 py-2 text-xs font-bold hover:text-red-500 transition cursor-pointer">
                Hủy bỏ sửa đổi
              </button>
            )}

            {/* NÚT ĐỔI MẬT KHẨU */}
            <button 
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="w-full border-2 border-gray-200 text-gray-600 py-4 rounded-2xl font-black transition uppercase tracking-widest text-xs hover:border-[#058a81] hover:text-[#058a81] cursor-pointer"
            >
              🔐 ĐỔI MẬT KHẨU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdatePage;