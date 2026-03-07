import React, { useState } from 'react';

const OrderHistoryPage = ({ onBack,onViewDetail }) => {
  // --- 1. DỮ LIỆU GỐC (Phải khai báo đầu tiên) ---
  const orders = [
    { 
      id: '#00056S2311001375', 
      date: '24/11/2023', 
      status: 'Đã nhận hàng', 
      img: 'https://via.placeholder.com/80', 
      name: 'IPHONE 17 PRO MAX 256GB - TITAN TỰ NHIÊN', 
      price: '34.490.000đ', 
      total: '34.490.000đ' 
    },
    { 
      id: '#WB0301464032', 
      date: '06/03/2026', 
      status: 'Chờ xác nhận', 
      img: 'https://via.placeholder.com/80',
      name: 'CHUỘT CHƠI GAME KHÔNG DÂY LOGITECH G304 LIGHTSPEED ĐEN', 
      price: '679.000đ', 
      total: '679.000đ' 
    }
  ];

  // --- 2. XỬ LÝ THỜI GIAN THỰC ---
  const today = new Date();
  const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  // --- 3. STATES ---
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [showCalendar, setShowCalendar] = useState(false);
  const [startDate, setStartDate] = useState('01/12/2020');
  const [endDate, setEndDate] = useState(todayStr); // Đồng bộ ngày hôm nay
  const [viewMode, setViewMode] = useState('days'); // 'days', 'months', 'years'
  const [selecting, setSelecting] = useState('start'); 
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // --- 4. LOGIC ĐIỀU HƯỚNG LỊCH THÔNG MINH ---
  const handleHeaderClick = () => {
    if (viewMode === 'days') setViewMode('months');
    else if (viewMode === 'months') setViewMode('years');
    else setViewMode('days');
  };

  const handlePrev = () => {
    if (viewMode === 'days') {
      if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
      else setViewMonth(viewMonth - 1);
    } else if (viewMode === 'months') setViewYear(viewYear - 1);
    else setViewYear(viewYear - 10);
  };

  const handleNext = () => {
    if (viewMode === 'days') {
      if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
      else setViewMonth(viewMonth + 1);
    } else if (viewMode === 'months') setViewYear(viewYear + 1);
    else setViewYear(viewYear + 10);
  };

  // --- 5. LOGIC LỌC DỮ LIỆU ---
  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const filteredOrders = orders.filter(order => {
    const orderDate = parseDate(order.date);
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const matchesTab = activeTab === 'Tất cả' || order.status === activeTab;
    const matchesDate = orderDate >= start && orderDate <= end;
    return matchesTab && matchesDate;
  });

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-4 md:p-10 font-sans">
      <button onClick={onBack} className="text-sm text-[#058a81] font-bold mb-4 flex items-center gap-2 hover:underline">
        <span>←</span> Quay lại cửa hàng
      </button>

      <div className="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-sm border border-gray-100">
        
        {/* THANH TABS TRẠNG THÁI */}
        <div className="flex border-b overflow-x-auto bg-white rounded-t-[2rem] sticky top-0 z-10">
          {['Tất cả', 'Chờ xác nhận', 'Đã xác nhận', 'Đang vận chuyển', 'Đã nhận hàng', 'Đã huỷ'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-fit px-6 py-5 text-xs font-black uppercase transition-all border-b-4 
                ${activeTab === tab ? 'border-red-500 text-red-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-8 space-y-8 min-h-[600px] relative">
          <h2 className="text-2xl font-black text-gray-800 italic uppercase tracking-tighter">Lịch sử mua hàng</h2>

          {/* BỘ CHỌN KHOẢNG NGÀY (DATE RANGE PICKER) */}
          <div className="relative inline-block">
            <button 
              onClick={() => { setShowCalendar(!showCalendar); setViewMode('days'); }}
              className="flex items-center gap-6 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-[#058a81] transition-all group"
            >
              <div className="flex flex-col items-start">
                <span className="text-[9px] text-gray-400 font-black uppercase">Từ ngày:</span>
                <span className="text-sm font-bold text-gray-700">{startDate}</span>
              </div>
              <span className="text-gray-300 font-light">→</span>
              <div className="flex flex-col items-start">
                <span className="text-[9px] text-gray-400 font-black uppercase">Đến ngày:</span>
                <span className="text-sm font-bold text-gray-700">{endDate}</span>
              </div>
              <span className="text-[#058a81] text-xl group-hover:scale-110 transition-transform">📅</span>
            </button>

            {/* MODAL LỊCH ĐA TẦNG */}
            {showCalendar && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setShowCalendar(false)}></div>
                <div className="absolute top-20 left-0 w-80 bg-white shadow-2xl rounded-3xl border border-gray-100 z-[70] p-5 animate-in zoom-in-95 duration-200">
                  
                  {/* HEADER LỊCH */}
                  <div className="flex justify-between items-center mb-5 border-b pb-4">
                    <button className="p-2 hover:bg-gray-100 rounded-xl text-[#058a81] font-bold" onClick={handlePrev}>‹</button>
                    <button onClick={handleHeaderClick} className="text-xs font-black text-[#058a81] uppercase hover:underline tracking-widest">
                      {viewMode === 'days' && `Tháng ${viewMonth + 1} - ${viewYear}`}
                      {viewMode === 'months' && `Năm ${viewYear}`}
                      {viewMode === 'years' && `${viewYear - 5} - ${viewYear + 6}`}
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-xl text-[#058a81] font-bold" onClick={handleNext}>›</button>
                  </div>

                  {/* CÁC CHẾ ĐỘ XEM (DAYS / MONTHS / YEARS) */}
                  {viewMode === 'days' && (
                    <div className="animate-in fade-in">
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-gray-300 mb-3 uppercase">
                        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => <div key={d}>{d}</div>)}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: new Date(viewYear, viewMonth + 1, 0).getDate() }, (_, i) => i + 1).map(day => {
                          const dStr = `${String(day).padStart(2, '0')}/${String(viewMonth + 1).padStart(2, '0')}/${viewYear}`;
                          const isPicked = startDate === dStr || endDate === dStr;
                          const isToday = dStr === todayStr;
                          return (
                            <button 
                              key={day}
                              onClick={() => {
                                if (selecting === 'start') { setStartDate(dStr); setSelecting('end'); }
                                else { setEndDate(dStr); setSelecting('start'); setShowCalendar(false); }
                              }}
                              className={`py-2 text-[11px] rounded-xl transition font-bold 
                                ${isPicked ? 'bg-red-600 text-white shadow-lg scale-110 z-10' : isToday ? 'bg-blue-50 text-[#058a81] border border-[#058a81]/20' : 'hover:bg-gray-50 text-gray-700'}`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {viewMode === 'months' && (
                    <div className="grid grid-cols-3 gap-2 animate-in slide-in-from-bottom-2">
                      {['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'].map((m, idx) => (
                        <button key={m} onClick={() => { setViewMonth(idx); setViewMode('days'); }} className="py-4 text-[10px] font-black uppercase hover:bg-[#058a81] hover:text-white rounded-2xl transition">
                          {m}
                        </button>
                      ))}
                    </div>
                  )}

                  {viewMode === 'years' && (
                    <div className="grid grid-cols-3 gap-2 animate-in slide-in-from-bottom-2">
                      {[2021, 2022, 2023, 2024, 2025, 2026].map((y) => (
                        <button key={y} onClick={() => { setViewYear(y); setViewMode('months'); }} className="py-4 text-xs font-black hover:bg-[#058a81] hover:text-white rounded-2xl transition">
                          {y}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 pt-4 border-t flex justify-between items-center">
                    <span className="text-[9px] text-gray-400 font-black uppercase italic">
                      Đang chọn: <span className="text-red-600">{selecting === 'start' ? 'Bắt đầu' : 'Kết thúc'}</span>
                    </span>
                    <button onClick={() => { setStartDate('01/12/2020'); setEndDate(todayStr); setShowCalendar(false); }} className="text-[9px] font-black text-[#058a81] uppercase hover:underline">Reset</button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* DANH SÁCH ĐƠN HÀNG ĐÃ LỌC */}
          <div className="space-y-4 pb-10">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, idx) => (
                <div key={idx} className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all group border-transparent hover:border-[#058a81]/10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Mã đơn hàng</span>
                      <span className="text-sm text-gray-800 font-black">{order.id}</span>
                      <span className="text-[10px] text-gray-400 font-medium">Đặt ngày: {order.date}</span>
                    </div>
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-sm ${
                      order.status === 'Đã nhận hàng' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-3xl p-4 flex items-center justify-center border border-gray-100 group-hover:scale-105 transition-transform">
                      <img src={order.img} alt="" className="max-h-full object-contain" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="font-black text-gray-800 text-base line-clamp-1 group-hover:text-red-600 transition">{order.name}</h4>
                      <p className="text-xs font-bold text-gray-400 mt-2">Đơn giá: {order.price}</p>
                      <div className="flex gap-2 mt-4 justify-center md:justify-start">
                        <span className="px-2 py-0.5 bg-blue-50 text-[#058a81] text-[9px] font-black rounded uppercase">Đã xuất VAT</span>
                        <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[9px] font-black rounded uppercase">Chính hãng</span>
                      </div>
                    </div>
                    <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
                      <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Tổng tiền</p>
                      <p className="text-2xl font-black text-red-600 tracking-tighter">{order.total}</p>
                      <button 
  onClick={() => onViewDetail(order)} // Gọi hàm truyền từ props
  className="text-[10px] font-black uppercase text-[#058a81] mt-2 hover:underline"
>
  Xem chi tiết ›
</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                <div className="text-6xl mb-6 opacity-20 scale-125">📦</div>
                <p className="text-gray-400 font-black uppercase text-xs tracking-[0.2em]">Không tìm thấy đơn hàng nào thỏa mãn</p>
                <button onClick={() => { setStartDate('01/12/2020'); setEndDate(todayStr); }} className="mt-6 text-[#058a81] text-[10px] font-black underline decoration-2 underline-offset-4">XÓA BỘ LỌC</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;