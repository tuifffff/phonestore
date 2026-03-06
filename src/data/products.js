// src/data/products.js

export const PRODUCTS = [
  {
    id: 1,
    name: "iPhone 17 Pro 256GB | Chính hãng",
    price: "34.490.000₫",
    oldPrice: "38.990.000₫",
    discount: "12%",
    category: "iPhone",
    img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png",
    tags: ["6.3 inches", "256 GB"],
    // Thuộc tính chi tiết
    colors: [
      { id: 'titan', name: 'Titan Tự Nhiên', class: 'bg-stone-400' },
      { id: 'gold', name: 'Desert Titanium', class: 'bg-orange-200' }
    ],
    storageOptions: ['128GB', '256GB', '512GB', '1TB'],
    description: "iPhone 17 Pro với chip A19 Pro siêu mạnh mẽ, camera cải tiến vượt bậc..."
  },
  {
    id: 2,
    name: "Samsung Galaxy S26 Ultra 12GB 256GB",
    price: "36.990.000₫",
    oldPrice: "36.990.000₫",
    discount: "5%",
    category: "SamSung",
    img: "https://cdn2.cellphones.com.vn/x/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-ultra_3__3.png",
    tags: ["6.9 inches", "12 GB", "256 GB"],
    colors: [
      { id: 'black', name: 'Phantom Black', class: 'bg-black' },
      { id: 'silver', name: 'Titanium Silver', class: 'bg-gray-300' }
    ],
    storageOptions: ['256GB', '512GB', '1TB'],
    description: "Siêu phẩm Galaxy S26 Ultra với bút S-Pen quyền năng và zoom 100x..."
  },
  {
    id: 3,
    name: "Xiaomi 15T Pro 5G 12GB 512GB",
    price: "26.990.000₫",
    oldPrice: "26.990.000₫",
    discount: "5%",
    category: "Xiaomi",
    img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/x/i/xiaomi-15t-pro-5g_1.jpg",
    tags: ["6.9 inches", "12 GB", "256 GB"],
    colors: [
      { id: 'black', name: 'Phantom Black', class: 'bg-black' },
      { id: 'silver', name: 'Titanium Silver', class: 'bg-gray-300' }
    ],
    storageOptions: ['256GB', '512GB', '1TB'],
    description: "Siêu phẩm Galaxy S26 Ultra với bút S-Pen quyền năng và zoom 100x..."
  }
];