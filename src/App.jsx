import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import CartPage from './components/CartPage';
import ProductDetailPage from './components/ProductDetailPage';
import CheckoutPage from './components/CheckoutPage';
import AdminDashboard from './components/AdminDashboard';
import ProfilePage from './components/ProfilePage';
import OrderHistoryPage from './components/OrderHistoryPage';
import OrderDetailPage from './components/OrderDetailPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import RegisterPage from './components/RegisterPage';
import {
  getProducts,
  getProductDetail,
  getBrands,
  getCart,
  addToCartAPI,
  updateCartItemAPI,
  removeFromCartAPI,
  getActiveBanners,
} from './api/api';

// --- HÀM CHÍNH APP ---
function App() {
  // --- STATES ---
  const [activeCategory, setActiveCategory] = useState(null); // null = Tất cả
  const [activeSort, setActiveSort] = useState('Phổ biến');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [checkoutMode, setCheckoutMode] = useState("checkout");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // --- STATES MỚI: SẢN PHẨM TỪ DB ---
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [currentAPIPage, setCurrentAPIPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // --- STATES: BANNERS ---
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  // --- STATES: BỘ LỌC GIÁ & KHO ---
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStock, setInStock] = useState(null); // null = tất cả, true = còn hàng, false = hết hàng
  const [activePriceRange, setActivePriceRange] = useState(null); // theo dõi preset đang chọn

  // --- XỬ LÝ VNPay RETURN URL ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('paymentStatus');
    const page = urlParams.get('page');
    const orderId = urlParams.get('orderId');
    const msg = urlParams.get('msg');

    if (paymentStatus) {
      if (paymentStatus === 'success') {
        alert(`Thanh toán thành công qua VNPay (Mã Đơn: #${orderId}). Cảm ơn bạn đã mua hàng! 🎉`);
      } else if (paymentStatus === 'failed') {
        alert('Thanh toán VNPay thất bại hoặc đã bị bạn hủy!');
      } else if (paymentStatus === 'error') {
        alert(`Lỗi thanh toán: ${msg || 'Mã đơn hàng không hợp lệ'}`);
      } else if (paymentStatus === 'checksum_failed') {
        alert('Cảnh báo: Phát hiện gian lận dữ liệu thanh toán!');
      }

      // Xóa params khỏi thanh cuộn URL để F5 không báo lại
      window.history.replaceState({}, document.title, window.location.pathname);

      if (page) {
        setCurrentPage(page);
      }
    }
  }, []);

  // --- HÀM LOAD SẢN PHẨM TỪ API ---
  const loadProducts = async (page = 0) => {
    setLoadingProducts(true);
    try {
      // Xác định sortBy dựa trên activeSort
      let sortBy = 'productID';
      let sortDir = 'desc';
      if (activeSort === 'Giá Thấp - Cao') {
        sortBy = 'priceAsc';
      } else if (activeSort === 'Giá Cao - Thấp') {
        sortBy = 'priceDesc';
      }

      const params = {
        page,
        size: 20,
        sortBy,
        sortDir,
        keyword: searchTerm || undefined,
        brandId: activeCategory || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        inStock: inStock !== null ? inStock : undefined,
      };

      const data = await getProducts(params);
      const pageData = data.result;
      setProducts(pageData.content || []);
      setCurrentAPIPage(pageData.page);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // --- HÀM LOAD BRANDS (DANH MỤC) TỪ API ---
  const loadBrands = async () => {
    try {
      const data = await getBrands();
      setBrands(data.result || []);
    } catch (err) {
      console.error("Lỗi tải danh mục:", err);
    }
  };

  // --- HÀM LOAD GIỎ HÀNG TỪ API ---
  const loadCartFromAPI = async () => {
    try {
      const data = await getCart();
      setCartItems(data.result || []);
    } catch (err) {
      console.error("Không lấy được giỏ hàng:", err);
      setCartItems([]);
    }
  };

  // --- LOAD BRANDS KHI APP KHỞI CHẠY ---
  useEffect(() => {
    loadBrands();
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const data = await getActiveBanners();
      setBanners(data.result || []);
    } catch (err) {
      console.error("Lỗi tải banners:", err);
    }
  };

  // --- TỰ ĐỘNG CHUYỂN BANNER TRONG 5S ---
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // --- LOAD SẢN PHẨM KHI FILTER/SORT/SEARCH THAY ĐỔI ---
  useEffect(() => {
    const debounce = setTimeout(() => loadProducts(0), 300);  // Debounce search
    return () => clearTimeout(debounce);
  }, [activeCategory, activeSort, searchTerm, minPrice, maxPrice, inStock]);

  // --- KHỞI TẠO USER TỪ LOCALSTORAGE ---
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      loadCartFromAPI();
      // Nếu là ADMIN thì giữ lại trang admin khi F5
      if (['ADMIN', 'WAREHOUSE_STAFF'].includes(userData.role)) {
        setCurrentPage('admin');
      }
    } else {
      handleLogout();
    }
  }, []);

  // --- XEM CHI TIẾT SẢN PHẨM ---
  const handleViewDetail = async (productId) => {
    try {
      const data = await getProductDetail(productId);
      if (data.code === 1000) {
        setSelectedProduct(data.result);
        setCurrentPage('detail');
        window.scrollTo(0, 0);
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (err) {
      console.error("Lỗi fetch chi tiết:", err);
      alert("Không kết nối được với Server Backend!");
    }
  };

  // --- CẬP NHẬT SỐ LƯỢNG GIỎ HÀNG (GỌI API) ---
  const updateCartQuantity = async (versionID, delta) => {
    // Tìm item hiện tại để tính quantity mới
    const item = cartItems.find(i => i.id == versionID);
    if (!item) return;

    const newQty = (item.quantity || 1) + delta;
    if (newQty < 1) return;

    try {
      await updateCartItemAPI(versionID, newQty);
      // Refresh giỏ hàng từ server
      await loadCartFromAPI();
    } catch (err) {
      console.error("Lỗi cập nhật giỏ hàng:", err);
      alert("Không thể cập nhật số lượng!");
    }
  };

  // --- XÓA SẢN PHẨM KHỎI GIỎ (GỌI API) ---
  const removeFromCartById = async (versionID) => {
    try {
      await removeFromCartAPI(versionID);
      await loadCartFromAPI();
    } catch (err) {
      console.error("Lỗi xóa sản phẩm:", err);
      alert("Không thể xóa sản phẩm khỏi giỏ hàng!");
    }
  };

  // --- MUA NGAY ---
  const handleBuyNow = async (product, qty, color, storage) => {
    if (!user) return setIsLoginModalOpen(true);

    // Tìm versionID phù hợp
    const version = product.versions?.find(
      v => v.colour === color && v.storage === storage
    );
    if (!version) {
      alert("Không tìm thấy phiên bản này!");
      return;
    }

    try {
      await addToCartAPI(version.versionID, qty);
      await loadCartFromAPI();
      setCurrentPage('cart');
    } catch (err) {
      console.error("Lỗi mua ngay:", err);
      alert("Không thể thêm vào giỏ hàng!");
    }
  };

  // --- THÊM VÀO GIỎ HÀNG (GỌI API) ---
  const addToCart = async (product) => {
    if (!user) return setIsLoginModalOpen(true);

    // Lấy versionID từ product (đã chọn ở trang chi tiết)
    const version = product.versions?.find(
      v => v.colour === product.selectedColor && v.storage === product.selectedStorage
    );

    const versionID = version?.versionID;
    if (!versionID) {
      alert("Vui lòng chọn phiên bản sản phẩm!");
      return;
    }

    try {
      await addToCartAPI(versionID, product.quantity || 1);
      await loadCartFromAPI();
      alert(`Đã thêm ${product.name} vào giỏ hàng!`);
    } catch (err) {
      console.error("Lỗi thêm giỏ hàng:", err);
      alert(err.message || "Không thể thêm vào giỏ hàng!");
    }
  };

  // --- ĐĂNG NHẬP THÀNH CÔNG ---
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    loadCartFromAPI(); // Load giỏ hàng từ DB
    if (userData.role === 'ADMIN') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('home');
    }
    setIsLoginModalOpen(false);
  };

  // --- ĐĂNG XUẤT ---
  const handleLogout = () => {
    setUser(null);
    setCartItems([]);
    setIsUserMenuOpen(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('userID');
    setCurrentPage('home');
  };

  // --- TÌM TÊN BRAND ĐANG CHỌN ---
  const getActiveBrandName = () => {
    if (!activeCategory) return 'Tất cả';
    const brand = brands.find(b => b.id === activeCategory);
    return brand ? brand.name : 'Tất cả';
  };

  return (
    <>
      {currentPage === 'home' && (
        <div className="min-h-screen bg-[#f4f4f4] font-sans text-sm">

          <header className="bg-[#058a81] text-white py-2 shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
              <div className="text-xl font-bold tracking-tighter cursor-pointer" onClick={() => { setActiveCategory(null); setSearchTerm(''); }}>PhoneHub</div>

              <div className="flex-1">
                <input
                  type="text" placeholder="Bạn cần tìm gì hôm nay?"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full max-w-md bg-white py-2 px-4 border rounded-lg text-black focus:outline-none"
                />
              </div>

              <div className=" lg:flex gap-6 items-center">
                <div onClick={user ? () => setCurrentPage('cart') : () => setIsLoginModalOpen(true)} className="relative cursor-pointer rounded-lg bg-white/20 px-3 py-2 hover:bg-white/30 transition-colors">
                  Giỏ hàng
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-600 text-[10px] font-bold px-1.5 rounded-full">{cartItems.length}</span>
                </div>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg hover:bg-white/30 transition cursor-pointer border border-white/10"
                    >
                      <div className="w-6 h-6 bg-yellow-400 rounded-full text-[#058a81] flex items-center justify-center font-bold text-[10px]">
                        {(user?.username || "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold uppercase tracking-tight">{user?.username || "Thành viên"}</span>
                      <span className={`text-[10px] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}>▼</span>
                    </button>

                    {isUserMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                        <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-2xl rounded-xl border py-2 z-50 overflow-hidden ">
                          <button onClick={() => { setCurrentPage("profile"); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 transition flex items-center gap-2">
                            <span>👤</span> Thông tin tài khoản
                          </button>
                          <button onClick={() => { setCurrentPage("orders"); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 transition flex items-center gap-2">
                            <span>📦</span> Lịch sử mua hàng
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
            <div className="flex flex-col md:flex-row gap-6">

              {/* SIDE TAB DANH MỤC - LOAD TỪ API */}
              <aside className="w-full md:w-64 bg-white rounded-2xl shadow-sm border h-fit transition-all duration-300">
                <div className="p-4 border-b font-black text-[#058a81] text-xs uppercase tracking-widest">
                  Danh mục sản phẩm
                </div>
                <nav className="py-2">
                  {/* Nút "Tất cả" */}
                  <div
                    onClick={() => setActiveCategory(null)}
                    className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-all border-l-4
            ${activeCategory === null
                        ? 'bg-blue-50 text-[#058a81] font-bold border-[#058a81]'
                        : 'text-gray-500 border-transparent hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[13px]">Tất cả</span>
                    </div>
                    <span className="text-gray-300 text-xs">›</span>
                  </div>
                  {/* Các brand từ API */}
                  {brands.map((brand) => (
                    <div
                      key={brand.id}
                      onClick={() => setActiveCategory(brand.id)}
                      className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-all border-l-4
              ${activeCategory === brand.id
                          ? 'bg-blue-50 text-[#058a81] font-bold border-[#058a81]'
                          : 'text-gray-500 border-transparent hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        {brand.logo && <img src={brand.logo} alt={brand.name} className="w-5 h-5 object-contain" />}
                        <span className="text-[13px]">{brand.name}</span>
                      </div>
                      <span className="text-gray-300 text-xs">›</span>
                    </div>
                  ))}
                </nav>

                {/* BỘ LỌC KHOẢNG GIÁ */}
                <div className="border-t">
                  <div className="p-4 font-black text-[#058a81] text-xs uppercase tracking-widest">
                    Khoảng giá
                  </div>
                  <div className="px-4 pb-4 space-y-2">
                    {/* Preset giá nhanh */}
                    {[
                      { label: 'Dưới 5 triệu', min: '', max: '5000000' },
                      { label: '5 - 10 triệu', min: '5000000', max: '10000000' },
                      { label: '10 - 20 triệu', min: '10000000', max: '20000000' },
                      { label: '20 - 30 triệu', min: '20000000', max: '30000000' },
                      { label: 'Trên 30 triệu', min: '30000000', max: '' },
                    ].map((range, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (activePriceRange === idx) {
                            setMinPrice(''); setMaxPrice(''); setActivePriceRange(null);
                          } else {
                            setMinPrice(range.min); setMaxPrice(range.max); setActivePriceRange(idx);
                          }
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[12px] transition-all cursor-pointer ${activePriceRange === idx
                          ? 'bg-[#058a81] text-white font-bold'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {range.label}
                      </button>
                    ))}

                    {/* Input tùy chỉnh */}
                    <div className="flex gap-2 items-center pt-2">
                      <input
                        type="number" placeholder="Từ" value={minPrice}
                        onChange={(e) => { setMinPrice(e.target.value); setActivePriceRange(null); }}
                        className="w-full bg-gray-50 border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#058a81]"
                      />
                      <span className="text-gray-300 text-xs">→</span>
                      <input
                        type="number" placeholder="Đến" value={maxPrice}
                        onChange={(e) => { setMaxPrice(e.target.value); setActivePriceRange(null); }}
                        className="w-full bg-gray-50 border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#058a81]"
                      />
                    </div>
                    {(minPrice || maxPrice) && (
                      <button
                        onClick={() => { setMinPrice(''); setMaxPrice(''); setActivePriceRange(null); }}
                        className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
                      >
                        ✕ Xóa lọc giá
                      </button>
                    )}
                  </div>
                </div>

                {/* LỌC TÌNH TRẠNG KHO */}
                <div className="border-t">
                  <div className="p-4 font-black text-[#058a81] text-xs uppercase tracking-widest">
                    Tình trạng
                  </div>
                  <div className="px-4 pb-4 space-y-2">
                    {[
                      { label: 'Tất cả', value: null },
                      { label: 'Còn hàng', value: true },
                      { label: 'Hết hàng', value: false },
                    ].map((opt) => (
                      <button
                        key={String(opt.value)}
                        onClick={() => setInStock(opt.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[12px] transition-all cursor-pointer ${inStock === opt.value
                          ? 'bg-[#058a81] text-white font-bold'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              {/* PHẦN BÊN PHẢI */}
              <div className="flex-1 space-y-6">

                {/* HERO BANNER */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm aspect-[21/9] md:aspect-[25/9] border relative group">
                  {banners.length > 0 ? (
                    <>
                      {banners.map((banner, index) => (
                        <div
                          key={banner.id}
                          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                          onClick={() => {
                            if (banner.linkUrl) {
                              if (banner.linkUrl.startsWith('http')) {
                                window.open(banner.linkUrl, '_blank');
                              } else if (!isNaN(banner.linkUrl)) {
                                handleViewDetail(parseInt(banner.linkUrl.trim()));
                              }
                            }
                          }}
                        >
                          <img
                            src={banner.imageUrl}
                            className={`w-full h-full object-cover transition-transform duration-700 ${index === currentBanner ? 'scale-105' : 'scale-100'} ${banner.linkUrl ? 'cursor-pointer' : ''}`}
                            alt="Banner Sale"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                        </div>
                      ))}

                      {banners.length > 1 && (
                        <>
                          <button onClick={() => setCurrentBanner(prev => prev === 0 ? banners.length - 1 : prev - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>‹</span>
                          </button>
                          <button onClick={() => setCurrentBanner(prev => (prev + 1) % banners.length)} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>›</span>
                          </button>

                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                            {banners.map((_, index) => (
                              <div key={index} onClick={() => setCurrentBanner(index)} className={`h-1.5 rounded-full cursor-pointer transition-all ${index === currentBanner ? 'bg-white w-6' : 'bg-white/50 w-2'}`}></div>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <img
                        src="https://cdn2.cellphones.com.vn/insecure/rs:fill:1036:450/q:100/plain/https://dashboard.cellphones.com.vn/storage/iphone17-home-8-3-1.png"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        alt="Banner Default"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </>
                  )}
                </div>

                {/* TIÊU ĐỀ & GRID SẢN PHẨM */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-gray-800 uppercase">{getActiveBrandName()}</h2>
                    <div className="h-1 flex-1 mx-4 bg-gray-100 rounded-full hidden md:block"></div>
                    <span className="text-sm text-gray-400">{totalElements} sản phẩm</span>
                  </div>

                  {/* LOADING STATE */}
                  {loadingProducts ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-3 shadow-sm animate-pulse">
                          <div className="bg-gray-200 h-40 rounded-lg mb-3"></div>
                          <div className="bg-gray-200 h-4 rounded mb-2"></div>
                          <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                      <div className="text-5xl mb-4">📱</div>
                      <p className="font-bold">Không tìm thấy sản phẩm nào</p>
                      <p className="text-sm mt-2">Thử tìm kiếm với từ khóa khác</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {products.map((p) => (
                          <div key={p.id} onClick={() => handleViewDetail(p.id)} className="bg-white rounded-xl p-3 shadow-sm relative flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow">
                            <div className="py-4">
                              <img src={p.image} alt={p.name} className="w-full h-auto object-contain hover:scale-105 transition-transform" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-[13px] leading-tight line-clamp-2 h-10">{p.name}</h3>
                              <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-red-600 font-bold text-base">
                                  {p.minPrice ? Number(p.minPrice).toLocaleString('vi-VN') + '₫' : 'Liên hệ'}
                                </span>
                              </div>
                              {p.brandName && (
                                <span className="text-[10px] text-gray-400 mt-1 block">{p.brandName}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* PHÂN TRANG */}
                      {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 pt-6">
                          <button
                            onClick={() => loadProducts(currentAPIPage - 1)}
                            disabled={currentAPIPage === 0}
                            className="px-4 py-2 rounded-lg border text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                          >
                            ← Trước
                          </button>
                          {[...Array(totalPages)].map((_, i) => (
                            <button
                              key={i}
                              onClick={() => loadProducts(i)}
                              className={`w-9 h-9 rounded-lg text-sm font-bold transition ${currentAPIPage === i
                                ? 'bg-[#058a81] text-white shadow-md'
                                : 'bg-white border hover:bg-gray-50'
                                }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                          <button
                            onClick={() => loadProducts(currentAPIPage + 1)}
                            disabled={currentAPIPage >= totalPages - 1}
                            className="px-4 py-2 rounded-lg border text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                          >
                            Sau →
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
      {currentPage === 'cart' && (
        <CartPage
          cartItems={cartItems}
          onBack={() => setCurrentPage('home')}
          onRemove={removeFromCartById}
          onUpdateQty={updateCartQuantity}
          onNavigateToCheckout={(itemsToBuy) => {
            setCheckoutItems(itemsToBuy);
            setCheckoutMode("checkout");
            setCurrentPage("checkout");
          }}
        />
      )}
      {currentPage === 'checkout' && (<CheckoutPage cartItems={checkoutItems} onBack={() => setCurrentPage('cart')} onCheckoutSuccess={() => { loadCartFromAPI(); setCurrentPage('home'); }} />)}
      {currentPage === 'profile' && (<ProfilePage user={user} onBack={() => setCurrentPage('home')} />)}
      {currentPage === 'admin' && (<AdminDashboard onLogout={handleLogout} user={user} />)}
      {currentPage === 'orderDetail' && (<OrderDetailPage order={selectedOrder} onBack={() => setCurrentPage('orders')} />)}
      {currentPage === 'forgot-password' && (<ForgotPasswordPage onBack={() => setCurrentPage('login')} />)}
      {currentPage === 'orders' && (<OrderHistoryPage onBack={() => setCurrentPage('home')} onViewDetail={(order) => { setSelectedOrder(order); setCurrentPage('orderDetail'); }} />)}
      {currentPage === 'register' && <RegisterPage onBack={() => setCurrentPage('login')} onNavigateToLogin={() => setCurrentPage('login')} onAuthSuccess={handleAuthSuccess} />}
      {currentPage === 'login' && <LoginPage onBack={() => setCurrentPage('home')} onNavigateToRegister={() => setCurrentPage('register')} onAuthSuccess={handleAuthSuccess} onNavigateToForgotPassword={() => setCurrentPage('forgot-password')} />}
      {currentPage === 'detail' && (
        <ProductDetailPage
          product={selectedProduct}
          onBack={() => setCurrentPage('home')}
          onAddToCart={addToCart}
          onBuyNow={handleBuyNow}
          user={user}
          onLoginRequired={() => setIsLoginModalOpen(true)}
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