import React, { useState, useEffect, useRef } from 'react';
import { 
  getMyInfo, updateMyInfo, changePassword, uploadImage, 
  getMyAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress 
} from '../api/api';

const ProfilePage = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'address'

  // --- Profile States ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    fullName: '',
    gender: '',
    avatar: '',
  });
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const fileInputRef = useRef(null);

  // --- Address States ---
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressData, setAddressData] = useState({ street: '', district: '', city: '', isDefault: false });

  // Init fetch
  useEffect(() => {
    loadProfile();
    loadAddresses();
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
        fullName: info.fullName || '',
        gender: info.gender || '',
        avatar: info.avatar || '',
      });
    } catch (err) {
      console.error("Lỗi tải profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      const data = await getMyAddresses();
      setAddresses(data.result || []);
    } catch (err) {
      console.error("Lỗi tải danh sách địa chỉ:", err);
    }
  };

  // --- Profile Handlers ---
  const handleAvatarSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setSaving(true);
      const res = await uploadImage(file);
      const url = res.result;
      setFormData(prev => ({ ...prev, avatar: url }));
      
      // Auto save avatar if not in Edit mode
      if (!isEditing) {
        await updateMyInfo({ ...formData, avatar: url });
        alert('Cập nhật ảnh đại diện thành công!');
        loadProfile();
      }
    } catch (err) {
      alert(err.message || "Lỗi tải ảnh lên");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateMyInfo(formData);
      alert('Cập nhật thông tin thành công! ✅');
      setIsEditing(false);
      loadProfile();
    } catch (err) {
      alert(err.message || 'Cập nhật thất bại!');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword) return alert('Vui lòng nhập đầy đủ!');
    if (passwordData.newPassword !== passwordData.confirmPassword) return alert('Mật khẩu mới không khớp!');
    try {
      await changePassword({ oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword });
      alert('Đổi mật khẩu thành công! ✅');
      setShowPasswordForm(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert(err.message || 'Đổi mật khẩu thất bại!');
    }
  };

  // --- Address Handlers ---
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressData.street || !addressData.district || !addressData.city) return alert("Vui lòng nhập đầy đủ thông tin!");
    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, addressData);
        alert("Cập nhật địa chỉ thành công!");
      } else {
        await addAddress(addressData);
        alert("Thêm địa chỉ thành công!");
      }
      setShowAddressForm(false);
      loadAddresses();
    } catch (err) {
      alert(err.message || "Có lỗi xảy ra");
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await setDefaultAddress(id);
      loadAddresses();
    } catch (err) {
      alert(err.message || "Có lỗi xảy ra");
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    try {
      await deleteAddress(id);
      loadAddresses();
    } catch (err) {
      alert(err.message || "Lỗi xóa");
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
        <h1 className="text-3xl font-black text-gray-800 mb-6 uppercase tracking-tighter">Quản lý Tài khoản</h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-gray-200 mb-8">
          <button 
            className={`pb-4 px-4 font-black uppercase text-sm transition-all ${activeTab === 'profile' ? 'border-b-4 border-[#058a81] text-[#058a81]' : 'text-gray-400 hover:text-gray-800'}`}
            onClick={() => setActiveTab('profile')}
          >
            Hồ sơ cá nhân
          </button>
          <button 
            className={`pb-4 px-4 font-black uppercase text-sm transition-all ${activeTab === 'address' ? 'border-b-4 border-[#058a81] text-[#058a81]' : 'text-gray-400 hover:text-gray-800'}`}
            onClick={() => setActiveTab('address')}
          >
            Sổ địa chỉ
          </button>
        </div>

        {/* ===================== TAB: PROFILE ===================== */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`lg:col-span-2 space-y-6 bg-white p-8 rounded-[2rem] shadow-sm border transition-all duration-300 ${isEditing ? 'border-[#058a81]/30 ring-4 ring-[#058a81]/5' : 'border-gray-100'}`}>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* USERNAME */}
                <div>
                  <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">Tên đăng nhập</label>
                  <input type="text" value={userInfo?.username || ''} disabled className="w-full rounded-xl p-4 outline-none bg-gray-50 border-transparent text-gray-400 cursor-not-allowed" />
                </div>
                {/* FULLNAME */}
                <div>
                  <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">Họ và Tên</label>
                  <input type="text" value={formData.fullName} disabled={!isEditing} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className={`w-full rounded-xl p-4 outline-none transition-all ${isEditing ? 'bg-white border border-[#058a81] shadow-sm' : 'bg-gray-50 border-transparent text-gray-400 cursor-not-allowed'}`} placeholder="Chưa cập nhật" />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">Email</label>
                <input type="email" value={formData.email} disabled={!isEditing} onChange={(e) => setFormData({...formData, email: e.target.value})} className={`w-full rounded-xl p-4 outline-none transition-all ${isEditing ? 'bg-white border border-[#058a81] shadow-sm' : 'bg-gray-50 border-transparent text-gray-400 cursor-not-allowed'}`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* PHONE */}
                <div>
                  <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">Số điện thoại</label>
                  <input type="text" value={formData.phoneNumber} disabled={!isEditing} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} className={`w-full rounded-xl p-4 outline-none transition-all ${isEditing ? 'bg-white border border-[#058a81]' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`} />
                </div>
                {/* GENDER */}
                <div>
                  <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">Giới tính</label>
                  {isEditing ? (
                    <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full rounded-xl p-4 outline-none bg-white border border-[#058a81]">
                      <option value="">-- Chọn --</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  ) : (
                    <input type="text" value={formData.gender || 'Chưa cập nhật'} disabled className="w-full rounded-xl p-4 outline-none bg-gray-50 text-gray-400 cursor-not-allowed" />
                  )}
                </div>
              </div>

              {/* FORM PASSWORD */}
              {showPasswordForm && (
                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-black text-gray-800 uppercase text-sm">Đổi mật khẩu</h3>
                  <input type="password" placeholder="Mật khẩu cũ" value={passwordData.oldPassword} onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})} className="w-full rounded-xl p-4 outline-none bg-white border border-gray-200 focus:border-[#058a81]" />
                  <input type="password" placeholder="Mật khẩu mới" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full rounded-xl p-4 outline-none bg-white border border-gray-200 focus:border-[#058a81]" />
                  <input type="password" placeholder="Xác nhận mật khẩu mới" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="w-full rounded-xl p-4 outline-none bg-white border border-gray-200 focus:border-[#058a81]" />
                  <div className="flex gap-3">
                    <button onClick={handleChangePassword} className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition cursor-pointer">Xác nhận đổi</button>
                    <button onClick={() => setShowPasswordForm(false)} className="px-6 py-3 text-gray-400 hover:text-red-500 transition cursor-pointer">Hủy</button>
                  </div>
                </div>
              )}
            </div>

            {/* CONTROLS */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center gap-6 h-fit">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-md">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-5xl">👤</div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center rounded-full text-white text-xs font-bold uppercase tracking-widest">
                  Đổi ảnh
                </div>
                <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleAvatarSelect} />
              </div>
              <div className="text-center w-full">
                <p className="font-black text-gray-800 text-xl">{formData.fullName || userInfo?.username}</p>
                <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest text-[#058a81]">{userInfo?.roleName || 'USER'}</p>
              </div>
              
              <div className="w-full space-y-3 mt-4">
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="w-full bg-[#058a81] text-white py-4 rounded-2xl font-black shadow-lg shadow-[#058a81]/20 hover:bg-[#046e67] transition uppercase tracking-widest text-xs cursor-pointer">CẬP NHẬT THÔNG TIN</button>
                ) : (
                  <>
                    <button onClick={handleSaveProfile} disabled={saving} className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-orange-600 transition uppercase tracking-widest text-xs cursor-pointer">{saving ? 'ĐANG LƯU...' : 'LƯU THÔNG TIN'}</button>
                    <button onClick={() => { setIsEditing(false); loadProfile(); }} className="w-full text-gray-400 py-2 text-xs font-bold hover:text-red-500 transition cursor-pointer">Hủy bỏ</button>
                  </>
                )}
                <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="w-full border-2 border-gray-200 text-gray-600 py-4 rounded-2xl font-black transition uppercase tracking-widest text-xs hover:border-[#058a81] hover:text-[#058a81] cursor-pointer">🔐 ĐỔI MẬT KHẨU</button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: ADDRESS BOOK ===================== */}
        {activeTab === 'address' && (
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 min-h-[500px]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black uppercase text-gray-800">Danh sách địa chỉ</h2>
              <button 
                onClick={() => { setAddressData({ street: '', district: '', city: '', isDefault: false }); setEditingAddressId(null); setShowAddressForm(true); }}
                className="bg-[#058a81] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#046e67] transition cursor-pointer shadow-lg shadow-[#058a81]/20"
              >
                + THÊM ĐỊA CHỈ
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={handleSaveAddress} className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
                <h3 className="font-bold text-gray-800 mb-4">{editingAddressId ? 'Sửa địa chỉ' : 'Địa chỉ mới'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input required placeholder="Tỉnh / Thành phố" value={addressData.city} onChange={e => setAddressData({...addressData, city: e.target.value})} className="p-4 rounded-xl border border-gray-200 outline-none focus:border-[#058a81]" />
                  <input required placeholder="Quận / Huyện" value={addressData.district} onChange={e => setAddressData({...addressData, district: e.target.value})} className="p-4 rounded-xl border border-gray-200 outline-none focus:border-[#058a81]" />
                  <input required placeholder="Đường / Số nhà" value={addressData.street} onChange={e => setAddressData({...addressData, street: e.target.value})} className="p-4 rounded-xl border border-gray-200 outline-none focus:border-[#058a81]" />
                </div>
                {!editingAddressId && (
                  <label className="flex items-center gap-2 cursor-pointer mt-2 text-sm font-bold text-gray-600">
                    <input type="checkbox" checked={addressData.isDefault} onChange={e => setAddressData({...addressData, isDefault: e.target.checked})} className="w-5 h-5 accent-[#058a81]" />
                    Đặt làm địa chỉ mặc định
                  </label>
                )}
                <div className="flex gap-4 items-center">
                  <button type="submit" className="bg-orange-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-600">Lưu thông tin</button>
                  <button type="button" onClick={() => setShowAddressForm(false)} className="text-gray-400 font-bold hover:text-red-500">Hủy</button>
                </div>
              </form>
            )}

            {addresses.length === 0 ? (
              <div className="text-center py-20 text-gray-400 font-bold">Chưa có địa chỉ nào trong sổ!</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map(addr => (
                  <div key={addr.addressID} className={`p-6 rounded-2xl border-2 transition-all relative ${addr.isDefault ? 'border-[#058a81] bg-[#058a81]/5' : 'border-gray-200'}`}>
                    {addr.isDefault && (
                      <span className="absolute top-4 right-4 bg-[#058a81] text-white text-[10px] uppercase font-black px-3 py-1 rounded-full">Mặc định</span>
                    )}
                    <h3 className="font-black text-gray-800 text-lg mb-1">{addr.street}</h3>
                    <p className="text-gray-500">{addr.district}, {addr.city}</p>
                    <div className="mt-6 flex flex-wrap gap-4 items-center border-t border-gray-200 pt-4">
                      {!addr.isDefault && (
                        <button onClick={() => handleSetDefaultAddress(addr.addressID)} className="text-[#058a81] font-bold text-sm hover:underline">Thiết lập mặc định</button>
                      )}
                      <div className="flex-1"></div>
                      <button 
                        onClick={() => { setAddressData({ street: addr.street, district: addr.district, city: addr.city, isDefault: addr.isDefault }); setEditingAddressId(addr.addressID); setShowAddressForm(true); }}
                        className="text-orange-500 font-bold text-sm hover:underline"
                      >
                        Sửa
                      </button>
                      <button onClick={() => handleDeleteAddress(addr.addressID)} className="text-red-500 font-bold text-sm hover:underline">Xóa</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default ProfilePage;