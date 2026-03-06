import React, { useState } from 'react';
import { PRODUCTS } from '../data/products';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, product-list, product-upload
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans text-[#2b3674]">
      {/* --- SIDEBAR BÊN TRÁI --- */}
      <aside className="w-72 bg-white shadow-xl flex flex-col p-8 z-20">
        <div className="text-2xl font-black text-[#058a81] mb-12 flex items-center gap-2">
          <span className="bg-[#058a81] text-white p-1 rounded px-3">PH</span> Dashboard
        </div>

        <nav className="flex-1 space-y-2">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className={`p-4 rounded-2xl cursor-pointer flex items-center gap-4 transition-all ${activeTab === 'dashboard' ? 'bg-[#4318FF] text-white font-bold shadow-lg shadow-indigo-100' : 'text-[#A3AED0] hover:bg-gray-50'}`}
          >
            <span className="text-xl">📊</span> Dashboard
          </div>
          <div 
            onClick={() => setActiveTab('customers')}
            className={`p-4 rounded-2xl cursor-pointer flex items-center gap-4 transition-all ${activeTab === 'customers' ? 'bg-[#4318FF] text-white font-bold' : 'text-[#A3AED0] hover:bg-gray-50'}`}
          >
            <span className="text-xl">👥</span> Customers
          </div>
          {/* Menu Products với Dropdown */}
          <div>
            <div 
              onClick={() => setIsProductsMenuOpen(!isProductsMenuOpen)}
              className={`p-4 rounded-2xl cursor-pointer flex items-center justify-between transition-all ${activeTab.includes('product') ? 'text-[#4318FF] font-bold' : 'text-[#A3AED0] hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-xl">📦</span> Products
              </div>
              <span className={`text-xs transition-transform ${isProductsMenuOpen ? 'rotate-180' : ''}`}>▼</span>
            </div>

            {isProductsMenuOpen && (
              <div className="ml-12 mt-2 space-y-2 border-l-2 border-gray-100 pl-4">
                <p onClick={() => setActiveTab('product-list')} className={`cursor-pointer py-2 text-sm ${activeTab === 'product-list' ? 'text-[#4318FF] font-bold' : 'text-[#A3AED0]'}`}>Product List</p>
                <p onClick={() => setActiveTab('product-upload')} className={`cursor-pointer py-2 text-sm ${activeTab === 'product-upload' ? 'text-[#4318FF] font-bold' : 'text-[#A3AED0]'}`}>Product Upload</p>
              </div>
            )}
          </div>

          <div onClick={() => setActiveTab('orders')} className="p-4 text-[#A3AED0] hover:bg-gray-50 rounded-2xl cursor-pointer flex items-center gap-4">
            <span className="text-xl">🛒</span> Orders
          </div>
        </nav>

        <button onClick={onLogout} className="mt-auto bg-red-50 text-red-600 font-bold p-4 rounded-2xl hover:bg-red-100 transition">Đăng xuất</button>
      </aside>

      {/* --- NỘI DUNG CHÍNH BÊN PHẢI --- */}
      <main className="flex-1 p-10 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <p className="text-sm text-[#707EAE]">Pages / {activeTab.replace('-', ' ')}</p>
            <h2 className="text-3xl font-bold capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>
          <div className="bg-white p-2 rounded-full shadow-sm flex items-center gap-4 px-4">
            <input type="text" placeholder="Search..." className="bg-[#f4f7fe] rounded-full px-4 py-2 text-sm outline-none" />
            <div className="w-10 h-10 bg-[#4318FF] rounded-full text-white flex items-center justify-center font-bold">B</div>
          </div>
        </header>

        {/* Chuyển đổi giao diện dựa trên activeTab */}
        {activeTab === 'dashboard' && <DashboardOverview />}
        {activeTab === 'product-list' && <ProductInventoryList products={PRODUCTS}onNavigateToUpload={() => setActiveTab('product-upload')} />}
        {activeTab === 'product-upload' && <ProductUploadForm />}
        {activeTab === 'orders' && <OrderManagementList />}
        {activeTab === 'customers' && <CustomerManagement />}
      </main>
    </div>
  );
};
const OrderManagementList = () => {
  const [orders, setOrders] = useState([
    { id: 'ORD0001', customer: 'Nguyễn Văn A', phone: '0987654321',date: '01-03-2026', address: '123 Đường ABC, Quận 1, Hà Nội', product: 'iPhone 17 Pro Max', price: '34.990.000₫', payment: 'Paid', status: 'Delivered' },
    { id: 'ORD0002', customer: 'Trần Thị B', phone: '0123456789',date: '01-03-2026', address: '456 Đường XYZ, Quận 7, TP.HCM', product: 'Samsung S26 Ultra', price: '36.990.000₫', payment: 'Unpaid', status: 'Pending' },
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null); // Đơn hàng đang chọn để sửa

  // Hàm cập nhật dữ liệu khi gõ vào ô input ở bảng bên phải
  const handleFieldChange = (field, value) => {
    const updated = { ...selectedOrder, [field]: value };
    setSelectedOrder(updated);
    // Cập nhật luôn vào danh sách chính
    setOrders(orders.map(o => o.id === updated.id ? updated : o));
  };

  return (
    <div className="flex gap-8 animate-in slide-in-from-right-4 duration-500">
      
      {/* BÊN TRÁI: DANH SÁCH ĐƠN HÀNG */}
      <div className={`transition-all duration-500 bg-white rounded-3xl shadow-sm p-8 border border-gray-50 ${selectedOrder ? 'w-2/3' : 'w-full'}`}>
        <h3 className="text-xl font-bold mb-8">Danh sách đơn hàng</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="text-[#A3AED0] text-xs uppercase border-b border-gray-100">
              <th className="pb-4 font-medium px-2">Order Id</th>
              <th className="pb-4 font-medium">Khách hàng</th>
              <th className="pb-4 font-medium px-2">Ngày đặt</th>
              <th className="pb-4 font-medium">Thanh toán</th>
              <th className="pb-4 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {orders.map((order) => (
              <tr 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                className={`border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${selectedOrder?.id === order.id ? 'bg-blue-50/50' : ''}`}
              >
                <td className="py-5 px-2 font-bold text-[#2b3674]">{order.id}</td>
                <td className="py-5 font-bold text-[#058a81]">{order.customer}</td>
                <td className="py-5 font-bold text-[#058a81]">{order.date}</td>
                <td className="py-5">
                  <span className={`flex items-center gap-2 font-bold ${order.payment === 'Paid' ? 'text-green-500' : 'text-red-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${order.payment === 'Paid' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {order.payment === 'Paid' ? 'Đã trả' : 'Chưa trả'}
                  </span>
                </td>
                <td className="py-5">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BÊN PHẢI: CHI TIẾT & CHỈNH SỬA (Theo layout ông thích) */}
      {selectedOrder && (
        <div className="w-1/3 bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-in slide-in-from-right-10 duration-500 sticky top-0 h-fit">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl font-black text-blue-600">
                {selectedOrder.customer.charAt(0)}
              </div>
              <div>
                <h4 className="text-xl font-black">Sửa Đơn: {selectedOrder.id}</h4>
                <p className="text-sm text-gray-400">{selectedOrder.product}</p>
              </div>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="text-gray-300 hover:text-black text-xl">✕</button>
          </div>

          <div className="space-y-6">
            {/* Sửa Tên & SĐT */}
            <div>
              <label className="text-xs text-gray-400 block mb-1 uppercase font-bold">Người mua</label>
              <input 
                type="text" 
                value={selectedOrder.customer}
                onChange={(e) => handleFieldChange('customer', e.target.value)}
                className="w-full bg-gray-50 p-3 rounded-xl outline-none focus:ring-1 focus:ring-[#4318FF] font-bold"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1 uppercase font-bold">Số điện thoại</label>
              <input 
                type="text" 
                value={selectedOrder.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className="w-full bg-gray-50 p-3 rounded-xl outline-none"
              />
            </div>

            {/* Sửa Địa chỉ */}
            <div>
              <label className="text-xs text-gray-400 block mb-1 uppercase font-bold">Địa chỉ giao hàng</label>
              <textarea 
                value={selectedOrder.address}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                className="w-full bg-gray-50 p-3 rounded-xl outline-none h-20 text-sm"
              />
            </div>

            {/* Chọn Trạng thái */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1 uppercase font-bold">Thanh toán</label>
                <select 
                  value={selectedOrder.payment}
                  onChange={(e) => handleFieldChange('payment', e.target.value)}
                  className="w-full bg-gray-50 p-3 rounded-xl outline-none font-bold text-sm"
                >
                  <option value="Paid">Đã trả</option>
                  <option value="Unpaid">Chưa trả</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1 uppercase font-bold">Vận chuyển</label>
                <select 
                  value={selectedOrder.status}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  className="w-full bg-gray-50 p-3 rounded-xl outline-none font-bold text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => { alert("Đã lưu mọi thay đổi!"); setSelectedOrder(null); }}
              className="w-full bg-[#4318FF] text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 mt-4 hover:bg-indigo-700 transition"
            >
              LƯU CẬP NHẬT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
// const OrderManagementList = () => {
//   // Dữ liệu mẫu đơn hàng
//   const [orders, setOrders] = useState([
//     { no: 1, id: 'ORD0001', product: 'iPhone 17 Pro Max', date: '01-03-2026', price: '34.990.000₫', payment: 'Paid', status: 'Delivered', img: 'https://via.placeholder.com/40' },
//     { no: 2, id: 'ORD0002', product: 'Samsung S26 Ultra', date: '03-03-2026', price: '36.990.000₫', payment: 'Unpaid', status: 'Pending', img: 'https://via.placeholder.com/40' },
//     { no: 3, id: 'ORD0003', product: 'Xiaomi 15 Pro', date: '04-03-2026', price: '26.990.000₫', payment: 'Paid', status: 'Shipped', img: 'https://via.placeholder.com/40' },
//     { no: 4, id: 'ORD0004', product: 'AirPods Pro 2', date: '05-03-2026', price: '5.990.000₫', payment: 'Unpaid', status: 'Cancelled', img: 'https://via.placeholder.com/40' },
//   ]);

//   const [filterTab, setFilterTab] = useState('All');

//   return (
//     <div className="bg-white rounded-3xl shadow-sm p-8 animate-in slide-in-from-bottom-4 duration-500 border border-gray-50">
//       {/* Bộ lọc Tabs (Giống ảnh image_a0fe9d) */}
//       <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
//         <div className="flex bg-gray-50 p-1 rounded-xl">
//           {['All', 'Completed', 'Pending', 'Cancelled'].map(tab => (
//             <button 
//               key={tab} 
//               onClick={() => setFilterTab(tab)}
//               className={`px-6 py-2 rounded-lg text-sm font-bold transition ${filterTab === tab ? 'bg-white text-[#058a81] shadow-sm' : 'text-gray-400'}`}
//             >
//               {tab} order
//             </button>
//           ))}
//         </div>
//         <div className="relative">
//           <input type="text" placeholder="Search order report..." className="pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm outline-none border border-transparent focus:border-[#4318FF] w-64" />
//           <span className="absolute left-3 top-2.5 opacity-30">🔍</span>
//         </div>
//       </div>

//       <table className="w-full text-left">
//         <thead>
//           <tr className="text-[#A3AED0] text-sm border-b border-gray-100">
//             <th className="pb-4 font-medium px-2">No.</th>
//             <th className="pb-4 font-medium">Order Id</th>
//             <th className="pb-4 font-medium">Product</th>
//             <th className="pb-4 font-medium">Date</th>
//             <th className="pb-4 font-medium">Price</th>
//             <th className="pb-4 font-medium">Payment</th>
//             <th className="pb-4 font-medium">Status</th>
//             <th className="pb-4 font-medium">Action</th>
//           </tr>
//         </thead>
//         <tbody className="text-sm">
//           {orders.map((order) => (
//             <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
//               <td className="py-5 px-2 text-[#707EAE]">{order.no}</td>
//               <td className="py-5 font-bold text-[#2b3674]">{order.id}</td>
//               <td className="py-5 flex items-center gap-3">
//                 <img src={order.img} className="w-8 h-8 rounded-full bg-gray-100" alt="" />
//                 <span className="font-medium">{order.product}</span>
//               </td>
//               <td className="py-5 text-[#707EAE]">{order.date}</td>
//               <td className="py-5 font-bold">{order.price}</td>
              
//               {/* Trạng thái thanh toán (Paid/Unpaid với icon chấm tròn) */}
//               <td className="py-5">
//                 <div className="flex items-center gap-2">
//                   <span className={`w-2 h-2 rounded-full ${order.payment === 'Paid' ? 'bg-green-500' : 'bg-red-500'}`}></span>
//                   <span className={order.payment === 'Paid' ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{order.payment}</span>
//                 </div>
//               </td>

//               {/* Trạng thái vận chuyển (Delivered/Pending/Cancelled...) */}
//               <td className="py-5">
//                 <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
//                   order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 
//                   order.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 
//                   order.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
//                 }`}>
//                   {order.status}
//                 </span>
//               </td>

//               {/* Nút thao tác Sửa/Xóa */}
//               <td className="py-5">
//                 <div className="flex gap-2">
//                   <button onClick={() => alert(`Cập nhật đơn ${order.id}`)} className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition" title="Update Status">📝</button>
//                   <button onClick={() => setOrders(orders.filter(o => o.id !== order.id))} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition" title="Delete Order">🗑️</button>
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Pagination (Giống ảnh image_a0fe9d) */}
//       <div className="flex justify-between items-center mt-10">
//         <button className="text-gray-400 text-sm hover:text-black">← Previous</button>
//         <div className="flex gap-2">
//           {[1, 2, 3, 4, 5].map(p => <span key={p} className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer text-sm ${p === 1 ? 'bg-[#e8f5f4] text-[#058a81] font-bold' : 'text-gray-400 hover:bg-gray-50'}`}>{p}</span>)}
//         </div>
//         <button className="text-gray-400 text-sm hover:text-black">Next →</button>
//       </div>
//     </div>
//   );
// };
// --- SUB-COMPONENT 1: DASHBOARD CHÍNH ---
const DashboardOverview = () => (
  <div className="animate-in fade-in duration-500">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex items-center gap-4">
        <div className="w-14 h-14 bg-[#f4f7fe] rounded-full flex items-center justify-center text-2xl">👥</div>
        <div><p className="text-sm text-[#A3AED0]">Total Users</p><h3 className="text-2xl font-bold">2,748</h3></div>
      </div>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex items-center gap-4">
        <div className="w-14 h-14 bg-[#f4f7fe] rounded-full flex items-center justify-center text-2xl">💰</div>
        <div><p className="text-sm text-[#A3AED0]">Total Sales</p><h3 className="text-2xl font-bold">$37.5k</h3></div>
      </div>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex items-center gap-4">
        <div className="w-14 h-14 bg-[#f4f7fe] rounded-full flex items-center justify-center text-2xl">📦</div>
        <div><p className="text-sm text-[#A3AED0]">New Orders</p><h3 className="text-2xl font-bold">154</h3></div>
      </div>
    </div>
    <div className="bg-white p-8 rounded-3xl shadow-sm h-96 flex items-center justify-center text-gray-300 italic border border-dashed border-gray-200">
      Sales Analytics Chart Will Be Here
    </div>
  </div>
);

// --- SUB-COMPONENT 2: LIST SẢN PHẨM ---
// const ProductInventoryList = ({ products }) => (
//   <div className="bg-white rounded-3xl shadow-sm p-8 animate-in slide-in-from-bottom-4 duration-500 border border-gray-50">
//     <div className="flex justify-between items-center mb-8">
//       <h3 className="text-xl font-bold">Product Inventory</h3>
//       <button className="bg-[#4318FF] text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100">+ Add Product</button>
//     </div>
//     <table className="w-full text-left">
//       <thead>
//         <tr className="text-[#A3AED0] text-sm border-b border-gray-100">
//           <th className="pb-4 font-medium">Product</th>
//           <th className="pb-4 font-medium">SKU</th>
//           <th className="pb-4 font-medium">Category</th>
//           <th className="pb-4 font-medium">Price</th>
//           <th className="pb-4 font-medium">Stock</th>
//           <th className="pb-4 font-medium">Status</th>
//           <th className="pb-4 font-medium">Action</th>
//         </tr>
//       </thead>
//       <tbody className="text-sm">
//         {products.map((p) => (
//           <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
//             <td className="py-4 flex items-center gap-4">
//               <img src={p.img} className="w-12 h-12 object-contain bg-[#f4f7fe] rounded-lg p-1" alt="" />
//               <div><p className="font-bold text-[#2b3674]">{p.name}</p><p className="text-xs text-[#A3AED0]">{p.category}</p></div>
//             </td>
//             <td className="py-4 text-[#707EAE]">PH-{p.id}026</td>
//             <td className="py-4 text-[#707EAE]">{p.category}</td>
//             <td className="py-4 font-bold text-[#2b3674]">{p.price}</td>
//             <td className="py-4 text-[#707EAE]">124</td>
//             <td className="py-4"><span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">In Stock</span></td>
//             <td className="py-4">
//               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                 <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition">📝</button>
//                 <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition">🗑️</button>
//               </div>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// );
const ProductInventoryList = ({ products: initialProducts,onNavigateToUpload }) => {
  const [products, setProducts] = useState(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState(null); // Sản phẩm đang chọn để sửa

  // Hàm cập nhật dữ liệu khi sửa ở bảng bên phải
  const handleProductChange = (field, value) => {
    const updated = { ...selectedProduct, [field]: value };
    setSelectedProduct(updated);
    // Cập nhật vào danh sách hiển thị bên trái
    setProducts(products.map(p => p.id === updated.id ? updated : p));
  };

  return (
    <div className="flex gap-8 animate-in slide-in-from-right-4 duration-500">
      
      {/* BÊN TRÁI: DANH SÁCH SẢN PHẨM (image_a10da4) */}
      <div className={`transition-all duration-500 bg-white rounded-3xl shadow-sm p-8 border border-gray-50 ${selectedProduct ? 'w-2/3' : 'w-full'}`}>
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold">Product Inventory</h3>
          <button 
              onClick={onNavigateToUpload}
              className="bg-[#4318FF] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>+</span> Add New Product
            </button>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="text-[#A3AED0] text-xs uppercase border-b border-gray-100">
              <th className="pb-4 font-medium">Sản phẩm</th>
              <th className="pb-4 font-medium text-center">Giá</th>
              <th className="pb-4 font-medium text-center">Kho</th>
              <th className="pb-4 font-medium text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {products.map((p) => (
              <tr 
                key={p.id} 
                className={`border-b border-gray-50 hover:bg-gray-50 transition-colors group ${selectedProduct?.id === p.id ? 'bg-blue-50/50' : ''}`}
              >
                <td onClick={() => setSelectedProduct(p)} className="py-4 flex items-center gap-4 cursor-pointer">
                  <img src={p.img} className="w-12 h-12 object-contain bg-[#f4f7fe] rounded-lg p-1" alt="" />
                  <div>
                    <p className="font-bold text-[#2b3674] group-hover:text-[#4318FF] transition-colors">{p.name}</p>
                    <p className="text-xs text-[#A3AED0]">{p.category} | SKU: PH-{p.id}</p>
                  </div>
                </td>
                <td className="py-4 font-bold text-center text-red-600">{p.price}</td>
                <td className="py-4 text-center font-medium">{p.stock || 124}</td>
                <td className="py-4 text-center">
                  <button 
                    onClick={() => setSelectedProduct(p)}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                  >📝 Sửa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BÊN PHẢI: CHI TIẾT & CHỈNH SỬA SẢN PHẨM (Dựa trên image_0 & image_e70443) */}
      {selectedProduct && (
        <div className="w-1/3 bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-in slide-in-from-right-10 duration-500 sticky top-0 h-fit">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#f4f7fe] rounded-2xl flex items-center justify-center p-2 border">
                <img src={selectedProduct.img} className="w-full h-full object-contain" alt="" />
              </div>
              <div>
                <h4 className="text-lg font-black leading-tight">{selectedProduct.name}</h4>
                <p className="text-xs text-[#A3AED0]">Mã SP: PH-{selectedProduct.id}</p>
              </div>
            </div>
            <button onClick={() => setSelectedProduct(null)} className="text-gray-300 hover:text-black text-xl">✕</button>
          </div>

          <div className="space-y-5">
            {/* Sửa Tên & Giá */}
            <div>
              <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-1">Tên sản phẩm</label>
              <input 
                type="text" 
                value={selectedProduct.name}
                onChange={(e) => handleProductChange('name', e.target.value)}
                className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none font-bold border border-transparent focus:border-[#4318FF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-1">Giá bán (VND)</label>
                <input 
                  type="text" 
                  value={selectedProduct.price}
                  onChange={(e) => handleProductChange('price', e.target.value)}
                  className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none font-bold text-red-600"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-1">Tồn kho</label>
                <input 
                  type="number" 
                  value={selectedProduct.stock || 124}
                  onChange={(e) => handleProductChange('stock', e.target.value)}
                  className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none font-bold"
                />
              </div>
            </div>

            {/* Sửa Category & Brand */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-1">Hãng</label>
                <select 
                  value={selectedProduct.category}
                  onChange={(e) => handleProductChange('category', e.target.value)}
                  className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none text-sm font-bold"
                >
                  <option value="iPhone">Apple (iPhone)</option>
                  <option value="SamSung">Samsung</option>
                  <option value="Xiaomi">Xiaomi</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-1">Trạng thái</label>
                <select className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none text-sm font-bold">
                  <option>In Stock</option>
                  <option>Low Stock</option>
                  <option>Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Thông số kỹ thuật (Tags) - Dựa trên image_e70443 */}
            <div>
              <label className="text-[10px] font-black text-[#A3AED0] uppercase block mb-1">Thông số (Tags)</label>
              <textarea 
                placeholder="6.3 inches, 256GB, 12GB RAM..."
                className="w-full bg-[#f4f7fe] rounded-xl p-3 outline-none h-20 text-xs italic"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => { alert("Đã cập nhật sản phẩm!"); setSelectedProduct(null); }}
                className="flex-1 bg-[#4318FF] text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition"
              >
                LƯU THAY ĐỔI
              </button>
              <button className="p-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100">🗑️</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// --- SUB-COMPONENT 3: UPLOAD SẢN PHẨM ---
const ProductUploadForm = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-500">
    {/* Cột trái: Gallery */}
    <div className="lg:col-span-1 space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 text-center">
        <h4 className="font-bold mb-6 text-left">Product Gallery</h4>
        <div className="border-2 border-dashed border-gray-100 rounded-3xl p-10 bg-[#f4f7fe] cursor-pointer hover:border-[#4318FF] transition-colors">
          <div className="text-4xl mb-4">📸</div>
          <p className="text-sm font-bold text-[#4318FF]">Upload Main Image</p>
          <p className="text-xs text-[#A3AED0] mt-2">JPEG, PNG allowed</p>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[1, 2, 3].map(i => <div key={i} className="aspect-square bg-[#f4f7fe] rounded-2xl border border-dashed border-gray-100 flex items-center justify-center text-gray-400 text-xl">+</div>)}
        </div>
      </div>
    </div>

    {/* Cột phải: Form chi tiết */}
    <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-50 space-y-8">
      <h4 className="font-bold">General Information</h4>
      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="text-sm font-bold block mb-2">Product Name</label>
          <input type="text" placeholder="e.g iPhone 17 Pro Max" className="w-full bg-[#f4f7fe] rounded-2xl p-4 outline-none border border-transparent focus:border-[#4318FF]" />
        </div>
        <div>
          <label className="text-sm font-bold block mb-2">Brand</label>
          <select className="w-full bg-[#f4f7fe] rounded-2xl p-4 outline-none"><option>Apple</option><option>Samsung</option></select>
        </div>
        <div>
          <label className="text-sm font-bold block mb-2">Price (VND)</label>
          <input type="text" placeholder="34.990.000" className="w-full bg-[#f4f7fe] rounded-2xl p-4 outline-none" />
        </div>
        <div>
          <label className="text-sm font-bold block mb-2">Số lượng</label>
          <input type="text" className="w-full bg-[#f4f7fe] rounded-2xl p-4 outline-none" />
        </div>
        <div className="col-span-2 border-t pt-6">
          <label className="text-sm font-bold block mb-2">Configuration Tags</label>
          <input type="text" placeholder="6.3 inches, 256GB, 12GB RAM..." className="w-full bg-[#f4f7fe] rounded-2xl p-4 outline-none" />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button className="flex-1 bg-[#4318FF] text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">UPLOAD PRODUCT</button>
        <button className="px-8 border border-gray-100 rounded-2xl font-bold text-[#A3AED0] hover:bg-gray-50 transition">SAVE DRAFT</button>
      </div>
    </div>
  </div>
);
// --- SUB-COMPONENT 5: QUẢN LÝ KHÁCH HÀNG (Dựa trên image_a0a121 & image_a09df8) ---
const CustomerManagement = () => {
  const [selectedUser, setSelectedUser] = useState(null); // Lưu user đang được xem chi tiết
  const [customers, setCustomers] = useState([
    { id: 'CUST001', name: 'John Doe', email: 'john.doe@example.com', phone: '+1234567890', address: '123 Main St, NY', orderCount: 25, totalSpend: '3,450.00', status: 'Active', completed: 150, cancelled: 10 },
    { id: 'CUST002', name: 'Jane Smith', email: 'jane@smith.com', phone: '+1234567890', address: '456 Park Ave, LA', orderCount: 5, totalSpend: '250.00', status: 'Inactive', completed: 140, cancelled: 5 },
    { id: 'CUST003', name: 'Emily Davis', email: 'emily@davis.com', phone: '+1234567890', address: '789 Oak Rd, TX', orderCount: 30, totalSpend: '4,600.00', status: 'VIP', completed: 10, cancelled: 1 },
  ]);

  return (
    <div className="flex gap-8 animate-in slide-in-from-right-4 duration-500">
      {/* BÊN TRÁI: DANH SÁCH USER (image_a0a121) */}
      <div className={`transition-all duration-500 bg-white rounded-3xl shadow-sm p-8 border border-gray-50 ${selectedUser ? 'w-2/3' : 'w-full'}`}>
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold">Customer List</h3>
          <button onClick={() => alert("Thêm user mới")} className="bg-[#058a81] text-white px-6 py-2 rounded-xl text-sm font-bold">+ Add User</button>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="text-[#A3AED0] text-xs uppercase border-b border-gray-100">
              <th className="pb-4 font-medium">Customer Id</th>
              <th className="pb-4 font-medium">Name</th>
              <th className="pb-4 font-medium">Phone</th>
              <th className="pb-4 font-medium">Order Count</th>
              <th className="pb-4 font-medium">Total Spend</th>
              <th className="pb-4 font-medium">Status</th>
              <th className="pb-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {customers.map((user) => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group">
                <td className="py-5 font-bold text-[#2b3674]">{user.id}</td>
                <td className="py-5 font-bold text-[#058a81] hover:underline">{user.name}</td>
                <td className="py-5 text-[#707EAE]">{user.phone}</td>
                <td className="py-5 text-center">{user.orderCount}</td>
                <td className="py-5 font-bold">{user.totalSpend}</td>
                <td className="py-5">
                  <span className={`flex items-center gap-2 font-bold ${user.status === 'Active' ? 'text-green-500' : user.status === 'VIP' ? 'text-orange-400' : 'text-red-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : user.status === 'VIP' ? 'bg-orange-400' : 'bg-red-400'}`}></span>
                    {user.status}
                  </span>
                </td>
                <td className="py-5">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setSelectedUser(user)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg">📝</button>
                    <button onClick={() => setCustomers(customers.filter(c => c.id !== user.id))} className="p-2 hover:bg-red-50 text-red-600 rounded-lg">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BÊN PHẢI: CHI TIẾT USER (image_a09df8) */}
      {selectedUser && (
        <div className="w-1/3 bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-in slide-in-from-right-10 duration-500 sticky top-0 h-fit">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl font-black text-blue-600">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-xl font-black">{selectedUser.name}</h4>
                <p className="text-sm text-gray-400">{selectedUser.email}</p>
              </div>
            </div>
            <button onClick={() => setSelectedUser(null)} className="text-gray-300 hover:text-black text-xl">✕</button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Số điện thoại</label>
              <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
                <span>📞</span> {selectedUser.phone}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Địa chỉ</label>
              <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
                <span>📍</span> {selectedUser.address}
              </div>
            </div>

            {/* Thống kê đơn hàng (Overview) */}
            <div className="grid grid-cols-3 gap-2 pt-4">
              <div className="bg-gray-50 p-3 rounded-2xl text-center">
                <p className="text-lg font-black text-blue-600">{selectedUser.orderCount}</p>
                <p className="text-[10px] text-gray-400">Tổng đơn</p>
              </div>
              <div className="bg-green-50 p-3 rounded-2xl text-center">
                <p className="text-lg font-black text-green-600">{selectedUser.completed}</p>
                <p className="text-[10px] text-gray-400">Đã giao</p>
              </div>
              <div className="bg-red-50 p-3 rounded-2xl text-center">
                <p className="text-lg font-black text-red-600">{selectedUser.cancelled}</p>
                <p className="text-[10px] text-gray-400">Đã hủy</p>
              </div>
            </div>

            <button className="w-full bg-[#4318FF] text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 mt-4 hover:bg-indigo-700 transition">
              LIÊN HỆ KHÁCH HÀNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;