import React, { useState, useEffect } from 'react';
import { checkout, createVNPayUrl, getMyAddresses, getMyInfo } from '../api/api';

const PROVINCES_API = 'https://provinces.open-api.vn/api/v2';

// ========================
// Custom Hook: Địa chỉ 2 cấp (API v2 đã bỏ cấp quận/huyện từ 2025)
// Tỉnh/TP → Phường/Xã
// ========================
const useAddressData = () => {
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [loadingP, setLoadingP] = useState(false);
  const [loadingW, setLoadingW] = useState(false);

  // Load tỉnh/thành lúc mount
  useEffect(() => {
    setLoadingP(true);
    fetch(`${PROVINCES_API}/?depth=1`)
      .then(r => r.json())
      .then(data => setProvinces(Array.isArray(data) ? data : []))
      .catch(() => setProvinces([]))
      .finally(() => setLoadingP(false));
  }, []);

  // Load phường/xã thẳng khi đổi tỉnh (API v2 không còn districts)
  useEffect(() => {
    if (!selectedProvince) {
      setWards([]); setSelectedWard(null);
      return;
    }
    setLoadingW(true);
    setWards([]); setSelectedWard(null);
    fetch(`${PROVINCES_API}/p/${selectedProvince.code}?depth=2`)
      .then(r => r.json())
      .then(data => setWards(data.wards || []))
      .catch(() => setWards([]))
      .finally(() => setLoadingW(false));
  }, [selectedProvince]);

  return {
    provinces, wards,
    selectedProvince, selectedWard,
    setSelectedProvince, setSelectedWard,
    loadingP, loadingW,
  };
};


// ========================
// Sub-component: Select box địa chỉ
// ========================
const AddressSelect = ({ label, value, onChange, options, placeholder, disabled, isLoading }) => (
  <div>
    <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">{label}</label>
    <div className="relative">
      <select
        value={value?.code || ''}
        onChange={onChange}
        disabled={disabled || isLoading}
        className={`w-full bg-gray-50 border border-gray-100 rounded-xl p-4 pr-10 outline-none appearance-none transition-all
          focus:bg-white focus:border-[#058a81]
          ${(disabled || isLoading) ? 'opacity-50 cursor-not-allowed text-gray-400' : 'cursor-pointer hover:border-gray-300 text-gray-700'}`}
      >
        <option value="">{isLoading ? '⏳ Đang tải...' : placeholder}</option>
        {options.map(opt => (
          <option key={opt.code} value={opt.code}>{opt.name}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
    </div>
  </div>
);

// ========================
// Main Component: CheckoutPage
// ========================
const CheckoutPage = ({ cartItems = [], onBack, onCheckoutSuccess }) => {
  const [formData, setFormData] = useState({
    receiverName: '',
    phoneNumber: '',
    streetAddress: '',
    note: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const addr = useAddressData();

  useEffect(() => { loadPreFillData(); }, []);

  const loadPreFillData = async () => {
    try {
      const [infoRes, addrRes] = await Promise.all([getMyInfo(), getMyAddresses()]);
      const user = infoRes.result;
      const addrList = addrRes.result || [];
      setAddresses(addrList);
      setFormData(prev => ({
        ...prev,
        receiverName: user?.fullName || user?.username || '',
        phoneNumber: user?.phoneNumber || '',
      }));
    } catch (err) {
      console.error('Lỗi tải thông tin Checkout', err);
    }
  };

  const parsePrice = (price) => {
    if (!price) return 0;
    return Number(price.toString().replace(/[^0-9]/g, ''));
  };

  const totalAmount = cartItems.reduce(
    (acc, item) => acc + parsePrice(item.price) * (item.quantity || 1),
    0
  );

  // Ghép địa chỉ hoàn chỉnh để gửi BE
  const getFullAddress = () => {
    return [
      formData.streetAddress.trim(),
      addr.selectedWard?.name,
      addr.selectedProvince?.name,
    ].filter(Boolean).join(', ');
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!formData.receiverName.trim()) return setError('Vui lòng nhập họ tên!');
    if (!formData.phoneNumber.trim()) return setError('Vui lòng nhập số điện thoại!');
    if (!addr.selectedProvince) return setError('Vui lòng chọn Tỉnh/Thành phố!');
    if (!addr.selectedWard) return setError('Vui lòng chọn Phường/Xã!');
    if (!formData.streetAddress.trim()) return setError('Vui lòng nhập số nhà, tên đường!');

    setLoading(true);
    setError('');
    const fullAddress = getFullAddress();

    try {
      const data = await checkout({
        receiverName: formData.receiverName,
        phoneNumber: formData.phoneNumber,
        shippingAddress: fullAddress,
        note: formData.note || '',
        versionIds: cartItems.map(item => item.id),
      });

      if (paymentMethod === 'VNPAY') {
        const orderId = data.result?.orderID;
        if (!orderId) { setError('Không lấy được mã đơn hàng để tạo thanh toán!'); setLoading(false); return; }
        const paymentData = await createVNPayUrl(totalAmount, orderId);
        if (paymentData.result) { window.location.href = paymentData.result; return; }
        setError('Không tạo được link thanh toán VNPay!');
        setLoading(false);
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

  const fullAddressPreview = getFullAddress();

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-10 px-4 md:px-20 font-sans">
      <div className="max-w-7xl mx-auto">
        <button onClick={onBack} className="text-gray-400 mb-8 hover:text-black transition flex items-center gap-2 cursor-pointer font-bold">
          <span>←</span> Quay lại
        </button>
        <h1 className="text-3xl font-black mb-10 text-gray-800 uppercase tracking-tighter">Xác nhận đơn hàng</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── CỘT TRÁI: FORM ── */}
          <div className="flex-1 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-bold shadow-sm">
                ⚠️ {error}
              </div>
            )}

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col gap-7">
              {/* Họ tên + SĐT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">Họ và tên người nhận *</label>
                  <input
                    type="text" name="receiverName" value={formData.receiverName} onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 outline-none focus:bg-white focus:border-[#058a81] transition-all"
                    placeholder="Nhập họ tên người nhận"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">Số điện thoại *</label>
                  <input
                    type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 outline-none focus:bg-white focus:border-[#058a81] transition-all"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              {/* Địa chỉ 3 cấp */}
              <div className="border-t border-dashed border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-5">
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">📍 Địa chỉ nhận hàng *</p>
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="text-[#058a81] text-[10px] font-black uppercase tracking-widest hover:underline cursor-pointer"
                  >
                    + Chọn từ Sổ địa chỉ
                  </button>
                </div>

                {/* 2 Dropdown: Tỉnh + Phường/Xã */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <AddressSelect
                    label="Tỉnh / Thành phố *"
                    value={addr.selectedProvince}
                    onChange={e => addr.setSelectedProvince(addr.provinces.find(x => x.code === Number(e.target.value)) || null)}
                    options={addr.provinces}
                    placeholder="-- Chọn Tỉnh/TP --"
                    isLoading={addr.loadingP}
                  />
                  <AddressSelect
                    label="Phường / Xã *"
                    value={addr.selectedWard}
                    onChange={e => addr.setSelectedWard(addr.wards.find(x => x.code === Number(e.target.value)) || null)}
                    options={addr.wards}
                    placeholder={addr.selectedProvince ? '-- Chọn Phường/Xã --' : '-- Chọn Tỉnh trước --'}
                    disabled={!addr.selectedProvince}
                    isLoading={addr.loadingW}
                  />
                </div>

                {/* Số nhà, đường */}
                <div>
                  <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">Số nhà, Tên đường *</label>
                  <input
                    type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 outline-none focus:bg-white focus:border-[#058a81] transition-all"
                    placeholder="VD: 123 Nguyễn Huệ"
                  />
                </div>

                {/* Preview địa chỉ */}
                {fullAddressPreview && (
                  <div className="mt-4 p-4 bg-[#058a81]/5 border border-[#058a81]/20 rounded-2xl flex items-start gap-3">
                    <span className="text-[#058a81] text-xl leading-tight">📍</span>
                    <div>
                      <p className="text-[10px] font-black text-[#058a81] uppercase tracking-widest mb-1">Địa chỉ giao hàng</p>
                      <p className="text-sm font-bold text-gray-700 leading-relaxed">{fullAddressPreview}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-gray-400 text-[10px] font-black uppercase mb-2">Ghi chú (tùy chọn)</label>
                <textarea
                  name="note" value={formData.note} onChange={handleChange} rows={3}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 outline-none focus:bg-white focus:border-[#058a81] transition-all resize-none"
                  placeholder="Giao giờ hành chính, gọi trước khi giao..."
                />
              </div>
            </div>
          </div>

          {/* ── CỘT PHẢI: TÓM TẮT ĐƠN HÀNG ── */}
          <div className="w-full lg:w-[450px]">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6 sticky top-8">
              <h3 className="font-black text-gray-800 text-lg uppercase tracking-tight">Sản phẩm trong giỏ</h3>

              <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
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

              <div className="border-t border-gray-100 pt-5 space-y-4">
                <div className="flex justify-between text-sm font-bold text-gray-500">
                  <span>Tạm tính:</span>
                  <span className="text-gray-800">{totalAmount.toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-500">
                  <span>Phí giao hàng:</span>
                  <span className="text-[#058a81] text-[10px] uppercase tracking-widest px-2 py-1 bg-[#058a81]/10 rounded-full">Miễn phí</span>
                </div>

                {/* Phương thức thanh toán */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-4">Phương thức thanh toán</p>
                  <div className="space-y-3">
                    {[
                      { value: 'COD', label: 'Tiền mặt (COD)', sub: 'Thanh toán khi nhận hàng', color: '#058a81' },
                      { value: 'VNPAY', label: 'Web VNPay / Quét mã QR', sub: 'ATM nội địa, Visa, MasterCard...', color: '#005BAA' },
                    ].map(opt => (
                      <label key={opt.value}
                        className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all
                          ${paymentMethod === opt.value
                            ? `border-[${opt.color}] bg-[${opt.color}]/5 ring-4 ring-[${opt.color}]/10`
                            : 'border-gray-100 hover:border-gray-200 bg-gray-50'}`}>
                        <input type="radio" name="paymentMethod" value={opt.value} checked={paymentMethod === opt.value}
                          onChange={e => setPaymentMethod(e.target.value)} className="hidden" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4
                          ${paymentMethod === opt.value ? `border-[${opt.color}]` : 'border-gray-300'}`}>
                          {paymentMethod === opt.value && <div className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: opt.color }} />}
                        </div>
                        <div className="flex-1">
                          <span className="block font-black text-sm text-gray-800">{opt.label}</span>
                          <span className="block text-[10px] font-bold text-gray-400 mt-0.5">{opt.sub}</span>
                        </div>
                        {opt.value === 'VNPAY' && (
                          <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png" alt="vnpay" className="h-4 object-contain ml-2 opacity-80" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-gray-100 pt-5">
                  <span className="font-black text-gray-800 text-lg uppercase tracking-tight">Tổng cộng</span>
                  <span className="text-3xl font-black text-orange-500 tracking-tighter">{totalAmount.toLocaleString()}₫</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black text-white text-sm uppercase tracking-widest shadow-lg transition-all cursor-pointer
                  ${loading ? 'bg-gray-400 shadow-none' : 'bg-orange-500 shadow-orange-500/30 hover:bg-orange-600 hover:shadow-orange-500/50 hover:-translate-y-1'}`}
              >
                {loading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL SỔ ĐỊA CHỈ ── */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] shadow-2xl animate-slideUp">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-black text-gray-800 uppercase tracking-tight text-lg">Sổ địa chỉ của bạn</h2>
              <button onClick={() => setShowAddressModal(false)}
                className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-gray-500 hover:bg-red-500 hover:text-white transition cursor-pointer font-bold">
                &times;
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-4 bg-gray-50/50">
              {addresses.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-4 opacity-50">📭</div>
                  <p className="text-gray-400 font-bold">Bạn chưa lưu địa chỉ nào trong sổ.</p>
                  <p className="text-xs text-gray-400 mt-2">Vui lòng vào Trang cá nhân để thêm mới.</p>
                </div>
              ) : (
                addresses.map(a => (
                  <div key={a.addressID}
                    className="p-5 bg-white border-2 border-gray-100 rounded-2xl hover:border-[#058a81] hover:shadow-lg transition-all cursor-pointer flex gap-4 items-center group"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, streetAddress: a.street || '' }));
                      setShowAddressModal(false);
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#058a81]/10 group-hover:text-[#058a81] transition-colors">📍</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-gray-800 line-clamp-1">{a.street}</p>
                        {a.isDefault && <span className="bg-[#058a81] text-white text-[8px] uppercase font-black px-2 py-0.5 rounded-full whitespace-nowrap">Mặc định</span>}
                      </div>
                      <p className="text-xs font-bold text-gray-500">{a.district}, {a.city}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        select option { background: white; color: #374151; }
      `}</style>
    </div>
  );
};

export default CheckoutPage;