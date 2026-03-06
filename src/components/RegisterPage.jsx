import { useState } from 'react';

const RegisterPage = ({ onBack, onAuthSuccess }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleRegister = (e) => {
    e.preventDefault();
    const { name, email, password } = formData;

    if (!name || !email || !password) return alert("Vui lòng điền đủ thông tin!");

    // Lấy danh sách user cũ từ máy
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Kiểm tra xem email đã tồn tại chưa
    if (users.find(u => u.email === email)) return alert("Email này đã có người dùng!");

    // Thêm user mới vào "Database"
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert("Đăng ký thành công!");
    onAuthSuccess(name); // Đăng nhập luôn sau khi đăng ký
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-10">
      <div className="max-w-md w-full">
        <h2 className="text-3xl font-bold mb-2">Tạo tài khoản mới</h2>
        <p className="text-gray-500 mb-8">Nhập thông tin để bắt đầu mua sắm</p>
        <form className="space-y-6" onSubmit={handleRegister}>
          <input 
            type="text" placeholder="Tên của bạn" className="w-full border-b py-2 outline-none focus:border-red-500"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <input 
            type="email" placeholder="Email" className="w-full border-b py-2 outline-none focus:border-red-500"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" placeholder="Mật khẩu" className="w-full border-b py-2 outline-none focus:border-red-500"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <button type="submit" className="w-full bg-[#DB4444] text-white py-4 rounded font-medium">Đăng ký</button>
        </form>
        <button onClick={onBack} className="mt-8 text-black border-b border-black">Quay lại đăng nhập</button>
      </div>
    </div>
  );
};

export default RegisterPage;