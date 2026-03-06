import { useState } from 'react';
import { DEMO_USERS } from '../data/users'; // Import đống user ở trên

const LoginPage = ({ onBack, onNavigateToRegister, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Logic check tài khoản "thật" từ mảng demo
    const userFound = DEMO_USERS.find(u => u.email === email && u.password === password);

    if (userFound) {
      alert(`Đăng nhập thành công! Quyền: ${userFound.role}`);
      onAuthSuccess(userFound); // Gửi dữ liệu về App.jsx
    } else {
      alert("Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row items-center">
      <div className="w-1/2 mx-auto p-10 md:p-20 flex flex-col justify-center">
        <h2 className="text-3xl font-bold mb-2">Log in to PhoneHub</h2>
        <form className="space-y-6" onSubmit={handleLogin}>
          <input 
            type="text" 
            placeholder="admin/user" 
            className="w-full border-b border-gray-300 py-2 outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="123" 
            className="w-full border-b border-gray-300 py-2 outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="bg-[#DB4444] text-white px-12 py-4 rounded font-medium cursor-pointer w-full">
            Đăng nhập
          </button>
        </form>
        <div className="mt-8 text-center text-sm">
          Chưa có tài khoản? <button onClick={onNavigateToRegister} className="font-bold border-b border-black cursor-pointer ">Đăng ký ngay</button>
        </div>
        <button onClick={onBack} className="mt-4 text-gray-400 cursor-pointer">← Quay lại trang chủ</button>
      </div>
    </div>
  );
};

export default LoginPage;