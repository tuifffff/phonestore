import React, { useState } from 'react';

const OrderHistoryPage = ({ onBack }) => {
  // 1. State quản lý Tab đang chọn (Tất cả, Chờ xác nhận...)
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [showCalendar, setShowCalendar] = useState(false);
  const [startDate, setStartDate] = useState('01/12/2020');
  const [endDate, setEndDate] = useState('06/03/2026');
  const [viewMode, setViewMode] = useState('days'); // 'days', 'months', 'years'
  const [selecting, setSelecting] = useState('start'); // 'start' hoặc 'end'
  const [viewYear, setViewYear] = useState(2020);
  const handleHeaderClick = () => {
    if (viewMode === 'days') setViewMode('months');
    else if (viewMode === 'months') setViewMode('years');
    else setViewMode('days');
  };
  // 2. Dữ liệu mẫu đơn hàng (Dựa trên image_fa3a37.png)
  const orders = [
    { 
      id: '#00056S2311001375', 
      date: '24/11/2023', 
      status: 'Đã nhận hàng', 
      img: 'https://via.placeholder.com/80', // Thay bằng ảnh máy thật
      name: 'IPHONE 17 PRO MAX 256GB - TITAN TỰ NHIÊN', 
      price: '34.490.000đ', 
      total: '34.490.000đ' 
    },
    { 
      id: '#WB0301464032', 
      date: '24/11/2023', 
      status: 'Chờ xác nhận', 
      img: 'https://via.placeholder.com/80',
      name: 'SAMSUNG GALAXY S26 ULTRA 12GB 512GB', 
      price: '36.990.000đ', 
      total: '36.990.000đ' 
    }
  ];

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-4 md:p-10 font-sans">
        <button onClick={onBack} className="text-sm text-[#058a81] font-bold">← Quay lại cửa hàng</button>
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* THANH TABS (Dựa trên image_fa3a37.png) */}
        <div className="flex border-b overflow-x-auto bg-white sticky top-0 z-10">
          {['Tất cả', 'Chờ xác nhận', 'Đã xác nhận', 'Đang vận chuyển', 'Đã giao hàng', 'Đã huỷ'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-fit px-6 py-4 text-sm font-bold transition-all border-b-2 
                ${activeTab === tab ? 'border-red-500 text-red-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* NỘI DUNG LỊCH SỬ (image_fa3a37.png) */}
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-gray-800 italic uppercase tracking-tighter">Lịch sử mua hàng</h2>
          </div>

          {/* --- 2. BỘ CHỌN NGÀY NÂNG CẤP (image_f9d180.png) --- */}
          <div className="relative inline-block">
            <button 
              onClick={() => { setShowCalendar(!showCalendar); setViewMode('days'); }}
              className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-[#058a81] transition-all"
            >
              <div className="flex flex-col items-start leading-none">
                <span className="text-[9px] text-gray-400 font-black uppercase">Từ:</span>
                <span className="text-xs font-bold text-gray-700">{startDate}</span>
              </div>
              <span className="text-gray-300">→</span>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[9px] text-gray-400 font-black uppercase">Đến:</span>
                <span className="text-xs font-bold text-gray-700">{endDate}</span>
              </div>
              <span className="text-[#058a81] text-lg">📅</span>
            </button>

            {/* --- 3. Ô LỊCH NỔI LÊN (Calendar Modal) --- */}
            {showCalendar && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setShowCalendar(false)}></div>
                <div className="absolute top-16 left-0 w-80 bg-white shadow-2xl rounded-2xl border border-gray-100 z-[70] p-4 animate-in zoom-in-95 duration-200">
                  
                  {/* HEADER LỊCH: Ấn để đổi View (image_f9c921.png) */}
                  <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">‹</button>
                    <button 
                      onClick={handleHeaderClick}
                      className="text-sm font-black text-[#058a81] uppercase hover:underline transition"
                    >
                      {viewMode === 'days' && `Tháng 12 - ${viewYear}`}
                      {viewMode === 'months' && `${viewYear}`}
                      {viewMode === 'years' && `2020 - 2026`}
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">›</button>
                  </div>

                  {/* --- HIỂN THỊ THEO CHẾ ĐỘ (VIEW MODE) --- */}
                  
                  {/* A. VIEW CHỌN NGÀY (DAYS) */}
                  {viewMode === 'days' && (
                    <div className="animate-in fade-in">
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-gray-400 mb-2 uppercase">
                        {['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN'].map(d => <div key={d}>{d}</div>)}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                          const dStr = `${day < 10 ? '0'+day : day}/12/${viewYear}`;
                          const isPicked = startDate === dStr || endDate === dStr;
                          return (
                            <button 
                              key={day}
                              onClick={() => {
                                if (selecting === 'start') { setStartDate(dStr); setSelecting('end'); }
                                else { setEndDate(dStr); setSelecting('start'); setShowCalendar(false); }
                              }}
                              className={`py-2 text-xs rounded-lg transition font-bold ${isPicked ? 'bg-red-600 text-white shadow-md' : 'hover:bg-gray-50 text-gray-700'}`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* B. VIEW CHỌN THÁNG (MONTHS) */}
                  {viewMode === 'months' && (
                    <div className="grid grid-cols-3 gap-2 animate-in slide-in-from-bottom-2">
                      {['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'].map((m, idx) => (
                        <button key={m} onClick={() => setViewMode('days')} className="py-4 text-[10px] font-black uppercase hover:bg-[#058a81] hover:text-white rounded-xl transition">
                          {m}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* C. VIEW CHỌN NĂM (YEARS) */}
                  {viewMode === 'years' && (
                    <div className="grid grid-cols-3 gap-2 animate-in slide-in-from-bottom-2">
                      {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((y) => (
                        <button key={y} onClick={() => { setViewYear(y); setViewMode('months'); }} className="py-4 text-xs font-black hover:bg-[#058a81] hover:text-white rounded-xl transition">
                          {y}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <span className="text-[9px] text-gray-400 font-black uppercase italic">
                      Đang chọn ngày: <span className="text-[#058a81]">{selecting === 'start' ? 'BẮT ĐẦU' : 'KẾT THÚC'}</span>
                    </span>
                    <button onClick={() => setShowCalendar(false)} className="text-[10px] font-black text-gray-400 uppercase">Đóng</button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* DANH SÁCH ĐƠN HÀNG (image_fa3a37.png) */}
          <div className="space-y-4">
            {orders.map((order, idx) => (
              <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition group">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-xs text-gray-400 font-medium">
                    Đơn hàng: <span className="text-gray-800 font-black">{order.id}</span> • Ngày đặt hàng: <span className="font-bold">{order.date}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                    order.status === 'Đã nhận hàng' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex gap-6 items-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl p-2 flex items-center justify-center border">
                    <img src={order.img} alt="" className="max-h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-gray-800 text-sm line-clamp-1 group-hover:text-red-600 transition">{order.name}</h4>
                    <p className="text-xs font-bold text-gray-400 mt-1">{order.price}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-[#058a81] text-[10px] font-black rounded uppercase">Đã xuất VAT</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-medium">Tổng thanh toán:</p>
                    <p className="text-lg font-black text-red-600">{order.total}</p>
                    <button className="text-[10px] font-black uppercase text-[#058a81] mt-2 hover:underline">Xem chi tiết ›</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;