import { useState, useEffect } from 'react';
import { getReviewsByProduct, createReview } from '../api/api';

// 1. Tách Component Table ra ngoài để tối ưu hiệu năng
const SpecificationTable = ({ specs, brandName }) => {
  if (!specs) return <p className="text-gray-500 italic">Đang cập nhật thông số...</p>;

  const specRows = [
    { label: "Thương hiệu", value: brandName },
    { label: "Kích thước màn hình", value: specs.screenSize },
    { label: "Công nghệ màn hình", value: specs.screenTech },
    { label: "Camera sau", value: specs.rearCamera },
    { label: "Camera trước", value: specs.frontCamera },
    { label: "Chipset", value: specs.chipset },
    { label: "Dung lượng RAM", value: specs.ram },
    { label: "Bộ nhớ trong", value: specs.rom },
    { label: "Pin", value: specs.battery },
    { label: "Hệ điều hành", value: specs.os },
  ];

  return (
    <table className="w-full text-sm">
      <tbody>
        {specRows.map((row, index, array) => (
          <tr key={index} className={`${index !== array.length - 1 ? 'border-b border-gray-200' : ''}`}>
            <td className="py-3 text-gray-500 w-1/3">{row.label}</td>
            <td className="py-3 text-right font-semibold text-gray-800">{row.value || 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Component hiển thị sao
const StarRating = ({ rating, onRate, interactive = false }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`text-2xl ${interactive ? 'cursor-pointer' : ''} transition-transform ${interactive && hovered >= star ? 'scale-125' : ''}`}
          style={{ color: (hovered || rating) >= star ? '#f59e0b' : '#d1d5db' }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const ProductDetailPage = ({ product, onBack, onAddToCart, user, onLoginRequired }) => {
  const versions = product?.versions || [];
  const colors = [...new Set(versions.map(v => v.colour))];
  const storageOptions = [...new Set(versions.map(v => v.storage))];

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState('');

  // --- STATES REVIEW ---
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (versions.length > 0) {
      setSelectedColor(versions[0].colour);
      setSelectedStorage(versions[0].storage);
      setMainImage(versions[0].imageURL || product.imageUrls?.[0]);
    }
  }, [product]);

  // Load reviews khi mở trang chi tiết
  useEffect(() => {
    if (product?.id) {
      loadReviews();
    }
  }, [product?.id]);

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const data = await getReviewsByProduct(product.id);
      setReviews(data.result || []);
    } catch (err) {
      console.error("Lỗi tải đánh giá:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmitReview = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập để đánh giá!");
    if (!reviewComment.trim()) return alert("Vui lòng nhập nội dung đánh giá!");

    setSubmittingReview(true);
    try {
      await createReview({
        productId: product.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      alert("Đánh giá thành công! ⭐");
      setReviewComment('');
      setReviewRating(5);
      loadReviews(); // Refresh danh sách
    } catch (err) {
      alert(err.message || "Không thể gửi đánh giá!");
    } finally {
      setSubmittingReview(false);
    }
  };

  const currentVersion = versions.find(
    v => v.colour === selectedColor && v.storage === selectedStorage
  ) || versions[0];

  useEffect(() => {
    if (currentVersion?.imageURL) {
      setMainImage(currentVersion.imageURL);
    }
  }, [currentVersion]);

  if (!product) return <div className="p-20 text-center text-xl font-bold">Đang tải sản phẩm...</div>;

  const handleAddToCartInternal = () => {
    onAddToCart({
      ...product,
      price: currentVersion?.price,
      selectedColor,
      selectedStorage,
      quantity,
      img: mainImage
    });
  };

  // Tính trung bình sao
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 bg-white">
      <button onClick={onBack} className="mb-6 text-gray-400 hover:text-black transition flex items-center gap-2 cursor-pointer">
        ← Quay lại trang chủ
      </button>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Gallery */}
        <div className="w-full lg:w-1/2 flex gap-4">
          <div className="flex flex-col gap-3">
            {product.imageUrls?.map((url, idx) => (
              <div 
                key={idx}
                onMouseEnter={() => setMainImage(url)}
                className={`w-16 h-16 border-2 rounded-xl p-1 cursor-pointer transition-all ${mainImage === url ? 'border-[#058a81]' : 'border-gray-100'}`}
              >
                <img src={url} alt="angle" className="w-full h-full object-contain" />
              </div>
            ))}
          </div>

          <div className="flex-1 bg-gray-50 rounded-3xl p-8 flex items-center justify-center border border-gray-100 min-h-[400px]">
            <img src={mainImage || product.image} alt={product.name} className="max-h-[450px] object-contain transition-all duration-500" />
          </div>
        </div>

        {/* Info & Selection */}
        <div className="w-full lg:w-1/2 space-y-8">
          <div>
            <h1 className="text-4xl font-black text-gray-800 leading-tight mb-2">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-red-600">
                {currentVersion?.price ? currentVersion.price.toLocaleString('vi-VN') + '₫' : 'Liên hệ'}
              </div>
              {reviews.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <span className="text-amber-500">★</span> {avgRating} ({reviews.length} đánh giá)
                </div>
              )}
            </div>
          </div>

          {/* Color Select */}
          <div className="space-y-3">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Màu sắc: <b className="text-black">{selectedColor}</b></span>
            <div className="flex gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 border-2 rounded-xl font-bold transition-all cursor-pointer ${selectedColor === color ? 'border-[#058a81] bg-[#e6f4f3] text-[#058a81]' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Storage Select */}
          <div className="space-y-3">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Dung lượng: <b className="text-black">{selectedStorage}</b></span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {storageOptions.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedStorage(size)}
                  className={`py-3 px-2 border-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${selectedStorage === size ? 'border-[#058a81] bg-[#e6f4f3] text-[#058a81]' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-4 pt-6 border-t">
            <div className="flex items-center bg-gray-100 rounded-2xl p-1 h-14 w-32 justify-between">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center font-bold text-xl hover:bg-white rounded-xl transition cursor-pointer">-</button>
              <span className="font-bold text-lg">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center font-bold text-xl hover:bg-white rounded-xl transition cursor-pointer">+</button>
            </div>

            <button 
              onClick={handleAddToCartInternal}
              className="flex-1 bg-[#DB4444] text-white h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-200 hover:bg-red-700 transition-all cursor-pointer"
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>

      {/* --- PHẦN 3: ĐẶC ĐIỂM & THÔNG SỐ --- */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-10 border-t pt-10">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-black text-gray-800 uppercase flex items-center gap-2">
            <span className="w-2 h-8 bg-[#058a81] rounded-full"></span> Đặc điểm nổi bật
          </h3>
          <div className="prose max-w-none text-gray-600 leading-relaxed">
            <div 
              className="whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: product.description || "Đang cập nhật nội dung đánh giá chi tiết..." }} 
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-3xl p-8 h-fit sticky top-24 border border-gray-100">
          <h3 className="text-xl font-black text-gray-800 uppercase mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-[#058a81] rounded-full"></span> Thông số kỹ thuật
          </h3>
          <SpecificationTable specs={product.specs} brandName={product.brandName} />

          <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">Tình trạng</span>
            <span className="font-bold text-green-600">Còn {currentVersion?.stock || 0} máy</span>
          </div>
        </div>
      </div>

      {/* --- PHẦN 4: ĐÁNH GIÁ SẢN PHẨM --- */}
      <div className="mt-16 border-t pt-10">
        <h3 className="text-xl font-black text-gray-800 uppercase flex items-center gap-2 mb-8">
          <span className="w-2 h-8 bg-amber-500 rounded-full"></span> Đánh giá sản phẩm
          {reviews.length > 0 && (
            <span className="text-sm font-normal text-gray-400 ml-2">
              ({reviews.length} đánh giá • Trung bình {avgRating}⭐)
            </span>
          )}
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Form viết đánh giá hoặc prompt đăng nhập */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 sticky top-24">
              {user ? (
                <>
                  <h4 className="font-black text-gray-800 mb-4 uppercase text-sm">Viết đánh giá</h4>
                  
                  <div className="mb-4">
                    <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Đánh giá của bạn</label>
                    <StarRating rating={reviewRating} onRate={setReviewRating} interactive={true} />
                  </div>

                  <div className="mb-4">
                    <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Nhận xét</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={4}
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#058a81] resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className={`w-full py-3 rounded-xl font-bold text-white transition cursor-pointer ${
                      submittingReview ? 'bg-gray-400' : 'bg-[#058a81] hover:bg-[#046e67]'
                    }`}
                  >
                    {submittingReview ? '⏳ Đang gửi...' : '✍ GỬI ĐÁNH GIÁ'}
                  </button>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="text-4xl mb-4">🔒</div>
                  <p className="font-bold text-gray-700 mb-2">Bạn cần đăng nhập</p>
                  <p className="text-xs text-gray-400 mb-6">Đăng nhập hoặc đăng ký để viết đánh giá sản phẩm</p>
                  <button
                    onClick={onLoginRequired}
                    className="w-full bg-[#058a81] text-white py-3 rounded-xl font-bold hover:bg-[#046e67] transition cursor-pointer"
                  >
                    ĐĂNG NHẬP / ĐĂNG KÝ
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Danh sách đánh giá */}
          <div className="lg:col-span-2 space-y-4">
            {loadingReviews ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#058a81] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {review.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{review.username}</p>
                        <p className="text-[10px] text-gray-400">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed pl-[52px]">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <div className="text-5xl mb-4 opacity-20">⭐</div>
                <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Chưa có đánh giá nào</p>
                <p className="text-gray-300 text-xs mt-2">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;