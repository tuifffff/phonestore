import { useState,useEffect } from 'react';
import LoginPage from './components/LoginPage'; // Đảm bảo ông đã tách file này
import CartPage from './components/CartPage';
import { DEMO_USERS } from './data/users';
import ProductDetailPage from './components/ProductDetailPage';
import { PRODUCTS } from './data/products';
import CheckoutPage from './components/CheckoutPage';
import AdminDashboard from './components/AdminDashboard';
import ProfilePage from './components/ProfilePage';
import OrderHistoryPage from './components/OrderHistoryPage';
const parsePrice = (priceStr) => Number(priceStr.replace(/[^0-9]/g, ''));
// --- TÁCH COMPONENT RA NGOÀI ĐỂ TRÁNH RE-RENDER ---
const RegisterPage = ({ onBack, onNavigateToLogin }) => (
  <div className="min-h-screen bg-white flex flex-col md:flex-row items-center">
    <div className="w-1/2 mx-auto md:w-1/2 p-10 md:p-20 flex flex-col justify-center">
      <h2 className="text-3xl font-bold mb-2">Create an account</h2>
      <p className="text-gray-500 mb-8">Enter your details below</p>
      <form className="space-y-6">
        <input type="text" placeholder="Name" className="w-full border-b border-gray-300 py-2 outline-none" />
        <input type="text" placeholder="Email or Phone" className="w-full border-b border-gray-300 py-2 outline-none" />
        <input type="password" placeholder="Password" className="w-full border-b border-gray-300 py-2 outline-none" />
        <button className="w-full bg-[#DB4444] text-white py-4 rounded font-medium cursor-pointer">Create Account</button>
      </form>
      <div className="mt-8 text-center text-sm">
        Already have account? <button onClick={onNavigateToLogin} className="font-bold border-b border-black cursor-pointer">Log in</button>
      </div>
    </div>
  </div>
);
// --- HÀM CHÍNH APP ---
function App() {
  const [cart, setCart] = useState(0);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [activeSort, setActiveSort] = useState('Phổ biến');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  
  const [checkoutMode, setCheckoutMode] = useState("checkout");
  // --- TRONG HÀM App() ---
// 1. Hàm cập nhật số lượng theo ID (Dùng bản này)
const updateCartQuantity = (productId, delta) => {
  setCartItems(prevCart => {
    const newCart = prevCart.map(item => {
      // So sánh theo ID để đảm bảo chính xác tuyệt đối
      if (item.id == productId) { 
        const newQty = (item.quantity || 1) + delta;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    });
    // Lưu vào kho riêng của user
    if (user) localStorage.setItem(`cart_${user.email}`, JSON.stringify(newCart));
    return newCart;
  });
};

// 2. Hàm xóa sản phẩm theo ID (Viết mới bản này)
const removeFromCartById = (productId) => {
  const newCart = cartItems.filter(item => item.id != productId);
  setCartItems(newCart);
  if (user) localStorage.setItem(`cart_${user.email}`, JSON.stringify(newCart));
};
  const handleBuyNow = (product, qty, color, storage) => {
  // Giả lập việc thêm với các thuộc tính đã chọn
  const itemWithOptions = {
    ...product,
    quantity: qty,
    selectedColor: color,
    selectedStorage: storage
  };

  // 1. Thêm vào giỏ hàng
  addToCart(itemWithOptions);
  
  // 2. Chuyển thẳng sang trang Giỏ hàng
  setCurrentPage('cart');
};
  const [selectedProduct, setSelectedProduct] = useState(null); // Lưu thông tin sản phẩm đang xem
  // 1. Thêm State để lưu danh sách món hàng thực tế
  const [cartItems, setCartItems] = useState([]);

// 2. Hàm để tải giỏ hàng riêng của từng người từ máy (localStorage)
  // Sửa lại hàm loadUserCart để không bị crash nếu không có email
const loadUserCart = (email) => {
  if (!email) {
    setCartItems([]);
    return;
  }
  const savedCart = localStorage.getItem(`cart_${email}`);
  setCartItems(savedCart ? JSON.parse(savedCart) : []);
};

// Trong useEffect hoặc lúc khởi tạo, hãy kiểm tra user trước
useEffect(() => {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    const userData = JSON.parse(savedUser);
    setUser(userData);
    loadUserCart(userData.email);
  } else {
    setUser(null);
    setCartItems([]);
  }
}, []);

// 3. Cập nhật hàm handleAuthSuccess
  const handleAuthSuccess = (userData) => {
  setUser(userData);
  loadUserCart(userData.email); // <--- Tải đúng giỏ hàng của người này lên
  if (userData.email === 'admin' || userData.role === 'admin') {
    setCurrentPage('admin'); // Chuyển sang trang Dashboard Admin
  } else {
    setCurrentPage('home');  // Khách hàng bình thường thì về trang chủ
  }
  setIsLoginModalOpen(false);
};

// 4. Cập nhật hàm handleLogout
  const handleLogout = () => {
  setUser(null);
  setCartItems([]); // <--- Xóa sạch giỏ hàng trên màn hình khi thoát
  setIsUserDropdownOpen(false);
  localStorage.removeItem('currentUser');
};
  const addToCart = (product) => {
  if (!user) return setIsLoginModalOpen(true); // Chưa login thì bắt login

  const newCart = [...cartItems, product];
  setCartItems(newCart);
  
  // Lưu vào kho riêng của User này: ví dụ cart_admin@phonehub.com
  localStorage.setItem(`cart_${user.email}`, JSON.stringify(newCart));
  alert(`Đã thêm ${product.name} vào giỏ hàng `);
};
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // Để bật/tắt cái lưới menu
  // LOGIC TỔNG HỢP: Tự tính toán danh sách
  const filteredProducts = PRODUCTS
    .filter(p => activeCategory === 'Tất cả' || p.category === activeCategory)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (activeSort === 'Giá Cao - Thấp') return parsePrice(b.price) - parsePrice(a.price);
      if (activeSort === 'Giá Thấp - Cao') return parsePrice(a.price) - parsePrice(b.price);
      return 0;
    });

  return (
    <>
      {currentPage === 'home' && (
        <div className="min-h-screen bg-[#f4f4f4] font-sans text-sm">
          
          <header className="bg-[#058a81] text-white py-2 shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
              <div className="text-xl font-bold tracking-tighter">PhoneHub</div>
              
              
              {/* <div className="relative">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="hidden md:flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg font-medium">
                   <span>☰ Danh mục</span>
                </button>
                {isMenuOpen && (
                  <div className="absolute top-12 left-0 w-48 bg-white text-black shadow-xl rounded-lg border p-2 z-50">
                    {['Tất cả', 'iPhone', 'SamSung','Xiaomi'].map(cat => (
                      <div key={cat} onClick={() => { setActiveCategory(cat); setIsMenuOpen(false); }} className="p-2 hover:bg-gray-100 cursor-pointer rounded">
                        {cat}
                      </div>
                    ))}
                  </div>
                )}
                
                
              </div> */}
              
              <div className="flex-1">
                <input 
                  type="text" placeholder="Bạn cần tìm gì hôm nay?" 
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full max-w-md bg-white py-2 px-4 border rounded-lg text-black focus:outline-none"
                />
              </div>

              <div className="hidden lg:flex gap-6 items-center">
                <div onClick={user ? () => setCurrentPage('cart') : () => setIsLoginModalOpen(true)} className="relative cursor-pointer rounded-lg bg-white/20 px-3 py-2 hover:bg-white/30 transition-colors">
                  Giỏ hàng
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-600 text-[10px] font-bold px-1.5 rounded-full">{cartItems.length}</span>
                </div>
                {user ? (
    /* Giao diện khi ĐÃ đăng nhập thành công */
    <div className="relative">
      <button 
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} // Bấm để thả lưới
        className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg hover:bg-white/30 transition cursor-pointer border border-white/10"
      >
        <div className="w-6 h-6 bg-yellow-400 rounded-full text-[#058a81] flex items-center justify-center font-bold text-[10px]">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="font-bold uppercase tracking-tight">{user.name}</span>
        <span className={`text-[10px] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {/* CÁI LƯỚI THẢ XUỐNG (DROPDOWN) */}
      {isUserMenuOpen && (
        <>
          {/* Lớp phủ để bấm ra ngoài là đóng lưới */}
          <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
          
          <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-2xl rounded-xl border py-2 z-50 overflow-hidden ">
            <button onClick={() => { setCurrentPage("profile");setIsUserMenuOpen(false);}} className="w-full text-left px-4 py-2 hover:bg-gray-100 transition flex items-center gap-2">
              <span>👤</span> Thông tin tài khoản
            </button>
            <button onClick={() => {setCurrentPage("orders");setIsUserMenuOpen(false);}} className="w-full text-left px-4 py-2 hover:bg-gray-100 transition flex items-center gap-2">
              <span>👤</span> Lịch sử mua hàng
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 border-t mt-1 transition font-bold flex items-center gap-2"
            >
              <span>🚪</span> Đăng xuất
            </button>
          </div>
        </>
      )}
    </div>
  ) : (
                <div onClick={() => setIsLoginModalOpen(true)} className="rounded-lg cursor-pointer bg-white/20 px-3 py-2 hover:bg-white/30 transition-colors">Đăng nhập</div>)}
              </div>
            </div>
          </header>
          

          <div className="max-w-7xl mx-auto px-4 py-4 flex gap-2 overflow-x-auto justify-end">
            {['Phổ biến', 'Giá Thấp - Cao', 'Giá Cao - Thấp'].map((filter) => (
              <button 
                key={filter} onClick={() => setActiveSort(filter)}
                className={`px-4 py-1.5 rounded-lg border transition-all ${activeSort === filter ? 'bg-blue-50 border-blue-600 text-blue-600 font-bold' : 'bg-white border-gray-200 text-gray-600'}`}
              >
                {filter}
              </button>
            ))}
          </div>

          <main className="max-w-7xl mx-auto px-4 pb-10">
            {/* BƯỚC 1: Dùng Flex để chia đôi màn hình: Trái (Aside) - Phải (Content) */}
  <div className="flex flex-col md:flex-row gap-6">

    {/* BƯỚC 2: SIDE TAB DANH MỤC (Nằm bên trái) */}
    <aside className="w-full md:w-64 bg-white rounded-2xl shadow-sm border h-fit sticky top-20 transition-all duration-300">
      <div className="p-4 border-b font-black text-[#058a81] text-xs uppercase tracking-widest">
        Danh mục sản phẩm
      </div>
      <nav className="py-2">
        {['Tất cả', 'iPhone', 'SamSung', 'Xiaomi'].map((cat) => (
          <div 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-all border-l-4
              ${activeCategory === cat 
                ? 'bg-blue-50 text-[#058a81] font-bold border-[#058a81]' 
                : 'text-gray-500 border-transparent hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-[13px]">{cat}</span>
            </div>
            <span className="text-gray-300 text-xs">›</span>
          </div>
        ))}
      </nav>
    </aside>

    {/* BƯỚC 3: PHẦN BÊN PHẢI (HERO BAR + GRID SẢN PHẨM) */}
    <div className="flex-1 space-y-6">
      
      {/* HERO BAR - BANNER QUẢNG CÁO (Giống Hoang Ha/CellphoneS) */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm aspect-[21/9] md:aspect-[25/9] border relative group">
        <img 
          src="https://cdn2.cellphones.com.vn/insecure/rs:fill:1036:450/q:100/plain/https://dashboard.cellphones.com.vn/storage/iphone17-home-8-3-1.png" // Ông thay link ảnh xịn vào đây nhé
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          alt="Banner Sale" 
        />
        {/* Lớp phủ nhẹ cho sang */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* TIÊU ĐỀ & GRID SẢN PHẨM CỦA ÔNG */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-gray-800 uppercase "> {activeCategory}</h2>
          <div className="h-1 flex-1 mx-4 bg-gray-100 rounded-full hidden md:block"></div>
        </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              
              {filteredProducts.map((p) => (
                <div key={p.id} onClick={() => {setSelectedProduct(p);setCurrentPage('detail');}} className="bg-white rounded-xl p-3 shadow-sm relative flex flex-col justify-between">
                  <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] px-2 py-1 rounded-tl-xl rounded-br-xl font-bold">Giảm {p.discount}</div>
                  <div className="py-4 cursor-pointer" onClick={() => setCart(cart + 1)}>
                    <img src={p.img} alt={p.name} className="w-full h-auto object-contain hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[13px] leading-tight line-clamp-2 h-10">{p.name}</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-red-600 font-bold text-base">{p.price}</span>
                      <span className="text-gray-400 line-through text-[11px]">{p.oldPrice}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </div>
            </div>
            </div>
          </main>
        </div>
      )}
      {currentPage === 'cart' && (<CartPage cartItems={cartItems} onBack={() => setCurrentPage('home')}onRemove={removeFromCartById}onUpdateQty={updateCartQuantity}onNavigateToCheckout={() => {setCheckoutMode("checkout");setCurrentPage("checkout");}}/>)}
      {currentPage === 'checkout' && (<CheckoutPage cartItems={cartItems} onBack={() => setCurrentPage('home')}/>)}
      {currentPage === 'profile' && (<ProfilePage user={user} onBack={() => setCurrentPage('home')} />)}
      {currentPage === 'admin' && (<AdminDashboard onLogout={handleLogout} />)}
      {currentPage === 'orders' && (<OrderHistoryPage onBack={() => setCurrentPage('home')} />)}
      {currentPage === 'register' && <RegisterPage onBack={() => setCurrentPage('home')} onNavigateToLogin={() => setCurrentPage('login')} onAuthSuccess={handleAuthSuccess}  />}
      {currentPage === 'login' && <LoginPage onBack={() => setCurrentPage('home')} onNavigateToRegister={() => setCurrentPage('register')} onAuthSuccess={handleAuthSuccess} />}
      {currentPage === 'detail' && (
      <ProductDetailPage 
        product={selectedProduct} 
        onBack={() => setCurrentPage('home')}
        onAddToCart={addToCart}
        onBuyNow={handleBuyNow}
      />
    )}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsLoginModalOpen(false)}></div>
          <div className="relative bg-white w-[90%] max-w-[450px] rounded-2xl p-6 shadow-2xl flex flex-col items-center">
            <h2 className="text-[#0accc6] text-3xl font-black mb-4">Pmember</h2>
            <p className="text-center text-gray-700 mb-8 px-4">Vui lòng đăng nhập tài khoản.</p>
            <div className="flex gap-3 w-full">
              <button onClick={() => { setCurrentPage('register'); setIsLoginModalOpen(false); }} className="flex-1 py-3 border-2 border-[#e11b1e] text-[#e11b1e] rounded-xl font-bold">Đăng ký</button>
              <button onClick={() => { setCurrentPage('login'); setIsLoginModalOpen(false); }} className="flex-1 py-3 bg-[#e11b1e] text-white rounded-xl font-bold">Đăng nhập</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;