import { useState } from 'react';

const LoginPage = ({ onBack, onNavigateToRegister, onAuthSuccess,onNavigateToForgotPassword }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, password: password }) 
      });
      const data = await res.json(); 
      if (res.ok && data.code === 1000) {
   
  
  // 1. Lưu Token (Chìa khóa)
  localStorage.setItem("token", data.result.token);
  
  // 2. Lưu ID thật
  localStorage.setItem("userID", data.result.id); 

  // 3. Parse permissions từ JWT token (scope claim) — đáng tin hơn response field
  let permissions = data.result.permissions || [];
  if (!permissions.length) {
    try {
      const payload = JSON.parse(atob(data.result.token.split('.')[1]));
      const scope = payload.scope || '';
      permissions = scope.split(' ').filter(s => s.length > 0 && !s.startsWith('ROLE_'));
    } catch (e) {
      console.warn('Không parse được JWT scope:', e);
    }
  }

  // 4. Tạo object User (có permissions để Dynamic Sidebar hoạt động)
  const userObj = { 
    id: data.result.id,
    username: data.result.username,
    role: data.result.role,
    permissions,
  };
  localStorage.setItem("currentUser", JSON.stringify(userObj));

  alert(`Chào mừng ${data.result.username} đã quay trở lại!`);
  
  // 5. Báo cho App.jsx biết để đổi trang
  onAuthSuccess(userObj); 
} else {
        alert("Sai tài khoản hoặc mật khẩu!");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      alert("Không kết nối được với Server Backend!");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row items-center">
      <div className="w-1/2 mx-auto p-10 md:p-20 flex flex-col justify-center">
        <h2 className="text-3xl font-bold mb-2">Log in to PhoneHub</h2>
        <form className="space-y-6" onSubmit={handleLogin}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            className="w-full border-b border-gray-300 py-2 outline-none"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            className="w-full border-b border-gray-300 py-2 outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="bg-[#DB4444] text-white px-12 py-4 rounded font-medium cursor-pointer w-full">
            Đăng nhập
          </button>
        </form>
        <div className="mt-8 text-center text-sm">
          Chưa có tài khoản? <button onClick={onNavigateToRegister} className="font-bold border-b border-black cursor-pointer">Đăng ký ngay</button>
        </div>
        <div className="mt-4 text-center text-sm">
            <button 
              onClick={onNavigateToForgotPassword} 
              className="text-[#DB4444] font-medium hover:underline cursor-pointer"
            >
              Quên mật khẩu?
            </button>
          </div>
        <button onClick={onBack} className="mt-4 text-gray-400 cursor-pointer">← Quay lại trang chủ</button>
      </div>
    </div>
  );
};

export default LoginPage;