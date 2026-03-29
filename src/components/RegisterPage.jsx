import { useState } from 'react';

const RegisterPage = ({ onBack, onAuthSuccess }) => {
  // 1. Sửa 'name' thành 'username' để khớp với Backend RegisterRequest
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    const { username, email, password } = formData;

    if (!username || !email || !password) return alert("Vui lòng điền đủ thông tin!");

    setLoading(true);
    try {
      // 2. Gọi API Register của ông (Thường là /api/auth/register hoặc /api/user/register)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData) 
      });

      const data = await res.json();

      if (res.ok && data.code === 1000) {
        alert("Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.");
        
        // 3. Sau khi đăng ký, thường mình bắt user đăng nhập lại cho an toàn
        // Hoặc nếu ông muốn vào luôn thì truyền data.result (UserResponse) qua
        onBack(); 
      } else {
        alert(data.message || "Tên đăng nhập hoặc Email đã tồn tại!");
      }
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      alert("Không kết nối được với Server Backend!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-10">
      <div className="max-w-md w-full bg-gray-50 p-8 rounded-2xl border">
        <h2 className="text-3xl font-bold mb-2 text-[#DB4444]">Tạo tài khoản</h2>
        <p className="text-gray-500 mb-8">Nhập thông tin</p>
        
        <form className="space-y-6" onSubmit={handleRegister}>
          <input 
            type="text" 
            placeholder="Tên đăng nhập (Username)" 
            className="w-full border-b py-2 outline-none focus:border-[#DB4444] bg-transparent"
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full border-b py-2 outline-none focus:border-[#DB4444] bg-transparent"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" 
            placeholder="Mật khẩu" 
            className="w-full border-b py-2 outline-none focus:border-[#DB4444] bg-transparent"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#DB4444] text-white py-4 rounded-xl font-bold hover:bg-[#c03939] transition-all disabled:bg-gray-400"
          >
            {loading ? "ĐANG XỬ LÝ..." : "TẠO TÀI KHOẢN"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          Đã có tài khoản? <button onClick={onBack} className="font-bold border-b border-black hover:text-[#DB4444]">Đăng nhập ngay</button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;