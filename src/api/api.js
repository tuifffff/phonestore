// ============================================================
// FILE API TẬP TRUNG - Quản lý tất cả API calls ở 1 nơi duy nhất
// ============================================================

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// --- HÀM GỌI API CÓ GẮN TOKEN TỰ ĐỘNG ---
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${url}`, { ...options, headers });

  // Nếu token hết hạn (401) -> tự logout
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userID");
    window.location.reload();
    throw new Error("Phiên đăng nhập hết hạn!");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Có lỗi xảy ra!");
  }

  return data;
};

// Hàm gọi API KHÔNG cần token (cho trang công khai)
const fetchPublic = async (url, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Có lỗi xảy ra!");
  }

  return data;
};

// ============================================================
// 1. PRODUCT API
// ============================================================

// Lấy danh sách sản phẩm (có phân trang, lọc, search, sort)
export const getProducts = (params = {}) => {
  const query = new URLSearchParams();
  if (params.keyword) query.append("keyword", params.keyword);
  if (params.brandId) query.append("brandId", params.brandId);
  if (params.minPrice) query.append("minPrice", params.minPrice);
  if (params.maxPrice) query.append("maxPrice", params.maxPrice);
  if (params.page !== undefined) query.append("page", params.page);
  if (params.size) query.append("size", params.size);
  if (params.sortBy) query.append("sortBy", params.sortBy);
  if (params.sortDir) query.append("sortDir", params.sortDir);

  return fetchPublic(`/products?${query.toString()}`);
};

// Lấy chi tiết sản phẩm
export const getProductDetail = (id) => {
  return fetchPublic(`/products/${id}`);
};

// Admin: Tạo sản phẩm mới
export const createProduct = (productData) => {
  return fetchWithAuth("/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });
};

// Admin: Cập nhật sản phẩm
export const updateProduct = (id, productData) => {
  return fetchWithAuth(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
};

// Admin: Xóa sản phẩm
export const deleteProduct = (id) => {
  return fetchWithAuth(`/products/${id}`, { method: "DELETE" });
};

// Admin: Upload ảnh gallery 360 (MultipartFile)
export const uploadGallery = (productId, files) => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));
  return fetch(`${import.meta.env.VITE_API_URL}/api/products/${productId}/gallery`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }).then(res => res.json());
};

// ============================================================
// 2. BRAND API
// ============================================================

export const getBrands = () => {
  return fetchPublic("/brands");
};

export const createBrand = (brandData) => {
  return fetchWithAuth("/brands", {
    method: "POST",
    body: JSON.stringify(brandData),
  });
};

export const deleteBrand = (id) => {
  return fetchWithAuth(`/brands/${id}`, { method: "DELETE" });
};

// ============================================================
// 3. CART API
// ============================================================

export const getCart = () => {
  return fetchWithAuth("/cart/my-cart");
};

export const addToCartAPI = (versionID, quantity) => {
  return fetchWithAuth("/cart/add", {
    method: "POST",
    body: JSON.stringify({ versionID, quantity }),
  });
};

export const updateCartItemAPI = (versionID, quantity) => {
  return fetchWithAuth("/cart/update", {
    method: "PUT",
    body: JSON.stringify({ versionID, quantity }),
  });
};

export const removeFromCartAPI = (versionID) => {
  return fetchWithAuth(`/cart/remove/${versionID}`, { method: "DELETE" });
};

// ============================================================
// 4. ORDER API
// ============================================================

export const checkout = (orderData) => {
  return fetchWithAuth("/order/checkout", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
};

export const getMyOrders = (page = 0, size = 10) => {
  return fetchWithAuth(`/order/my-orders?page=${page}&size=${size}`);
};

export const getOrderDetail = (orderId) => {
  return fetchWithAuth(`/order/${orderId}`);
};

export const cancelOrder = (orderId) => {
  return fetchWithAuth(`/order/${orderId}/cancel`, { method: "DELETE" });
};

// Sửa thông tin nhận hàng (chỉ khi đơn PENDING)
export const updateShippingInfo = (orderId, shippingData) => {
  return fetchWithAuth(`/order/${orderId}/shipping-info`, {
    method: "PUT",
    body: JSON.stringify(shippingData),
  });
};

// Admin: Lấy tất cả đơn hàng
export const getAllOrders = (params = {}) => {
  const query = new URLSearchParams();
  if (params.status) query.append("status", params.status);
  if (params.keyword) query.append("keyword", params.keyword);
  if (params.page !== undefined) query.append("page", params.page);
  if (params.size) query.append("size", params.size);
  if (params.sortBy) query.append("sortBy", params.sortBy);
  if (params.sortDir) query.append("sortDir", params.sortDir);
  return fetchWithAuth(`/order/admin/all?${query.toString()}`);
};

// Admin: Cập nhật trạng thái đơn
export const updateOrderStatus = (orderId, status) => {
  return fetchWithAuth(`/order/${orderId}/status?status=${status}`, {
    method: "PUT",
  });
};

// Admin: Xác nhận thanh toán
export const confirmPayment = (orderId) => {
  return fetchWithAuth(`/order/${orderId}/confirm-payment`, {
    method: "POST",
  });
};

// Admin: Từ chối đơn
export const rejectOrder = (orderId, reason) => {
  return fetchWithAuth(`/order/${orderId}/reject?reason=${encodeURIComponent(reason)}`, {
    method: "POST",
  });
};

// Admin: Đếm đơn chờ duyệt
export const countPendingOrders = () => {
  return fetchWithAuth("/order/admin/count-pending");
};

// Admin/User: Xuất hóa đơn
export const exportInvoice = (orderId) => {
  return fetchWithAuth(`/order/${orderId}/invoice`);
};

// User: Tạo URL Thanh toán VNPay
export const createVNPayUrl = (amount, orderId) => {
  return fetchWithAuth(`/payment/create-url?amount=${amount}&orderInfo=${orderId}`);
};

// ============================================================
// 5. USER API
// ============================================================

export const getMyInfo = () => {
  return fetchWithAuth("/user/me");
};

export const updateMyInfo = (userData) => {
  return fetchWithAuth("/user/update", {
    method: "PUT",
    body: JSON.stringify(userData),
  });
};

export const changePassword = (passwordData) => {
  return fetchWithAuth("/user/change-password", {
    method: "POST",
    body: JSON.stringify(passwordData),
  });
};

export const sendOtpForgotPassword = (email) => {
  return fetchPublic(`/user/forgot-password/send-otp?email=${encodeURIComponent(email)}`, {
    method: "POST",
  });
};

export const resetPasswordWithOtp = (resetData) => {
  return fetchPublic("/user/forgot-password/reset", {
    method: "POST",
    body: JSON.stringify(resetData),
  });
};

// Admin: Danh sách users
export const getAllUsers = (params = {}) => {
  const query = new URLSearchParams();
  if (params.keyword) query.append("keyword", params.keyword);
  if (params.role) query.append("role", params.role);
  if (params.page !== undefined) query.append("page", params.page);
  if (params.size) query.append("size", params.size);
  if (params.sortBy) query.append("sortBy", params.sortBy);
  if (params.sortDir) query.append("sortDir", params.sortDir);
  return fetchWithAuth(`/user/all?${query.toString()}`);
};

// Admin: Cấp quyền cho user
export const updateUserRole = (username, roleName) => {
  const token = localStorage.getItem("token");
  return fetch(`${BASE_URL}/user/${username}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "text/plain",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: roleName,
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Lỗi cấp quyền!");
    return data;
  });
};

// Admin: Thu hồi quyền
export const revokeUserRole = (username) => {
  return fetchWithAuth(`/user/${username}/role`, { method: "DELETE" });
};

// Admin: Lấy danh sách roles
export const getRoles = () => {
  return fetchWithAuth("/roles");
};

// Admin: Tạo role mới
export const createRole = (roleData) => {
  return fetchWithAuth("/roles", {
    method: "POST",
    body: JSON.stringify(roleData),
  });
};

// Admin: Xóa role
export const deleteRole = (name) => {
  return fetchWithAuth(`/roles/${name}`, { method: "DELETE" });
};

// ============================================================
// 9. PERMISSION API
// ============================================================

export const getPermissions = () => {
  return fetchWithAuth("/permissions");
};

export const createPermission = (permissionData) => {
  return fetchWithAuth("/permissions", {
    method: "POST",
    body: JSON.stringify(permissionData),
  });
};

export const deletePermission = (name) => {
  return fetchWithAuth(`/permissions/${name}`, { method: "DELETE" });
};

// ============================================================
// 6. ADDRESS API
// ============================================================

export const getMyAddresses = () => {
  return fetchWithAuth("/addresses/my");
};

export const addAddress = (addressData) => {
  return fetchWithAuth("/addresses/add", {
    method: "POST",
    body: JSON.stringify(addressData),
  });
};

export const updateAddress = (id, addressData) => {
  return fetchWithAuth(`/addresses/update/${id}`, {
    method: "PUT",
    body: JSON.stringify(addressData),
  });
};

export const setDefaultAddress = (id) => {
  return fetchWithAuth(`/addresses/set-default/${id}`, { method: "PATCH" });
};

export const deleteAddress = (id) => {
  return fetchWithAuth(`/addresses/delete/${id}`, { method: "DELETE" });
};

// ============================================================
// 7. REVIEW API
// ============================================================

export const createReview = (reviewData) => {
  return fetchWithAuth("/reviews", {
    method: "POST",
    body: JSON.stringify(reviewData),
  });
};

export const getReviewsByProduct = (productId) => {
  return fetchPublic(`/reviews/product/${productId}`);
};

// ============================================================
// 8. STATISTICS API (Admin)
// ============================================================

export const getRevenue = (month, year) => {
  return fetchWithAuth(`/statistics/revenue?month=${month}&year=${year}`);
};

export const getTopSelling = () => {
  return fetchWithAuth("/statistics/top-selling");
};
