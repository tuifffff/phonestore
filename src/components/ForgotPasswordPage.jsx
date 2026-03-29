import { useState } from 'react';

const ForgotPasswordPage = ({ onBack }) => {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // --- BƯỚC A: GỬI MÃ OTP (Khớp với /api/user/forgot-password/send-otp) ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Sửa lại URL đúng chuẩn của ông: dùng @RequestParam email
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/forgot-password/send-otp?email=${email}`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok && data.code === 1000) {
        alert("Mã OTP đã được gửi đến email của bạn!");
        setStep(2); 
      } else {
        alert(data.message || "Email không tồn tại !");
      }
    } catch (err) {
      alert("Không kết nối được Server!");
    } finally {
      setLoading(false);
    }
  };

  // --- BƯỚC B: RESET PASS (Khớp với /api/user/forgot-password/reset) ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Sửa lại URL đúng chuẩn @RequestMapping("/api/user") của ông
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email, 
          otp: otp, 
          newPassword: newPassword 
        })
      });
      const data = await res.json();

      if (res.ok && data.code === 1000) {
        alert("Mật khẩu mới đã được thiết lập!");
        onBack(); 
      } else {
        alert(data.message || "Mã OTP sai hoặc đã hết hạn!");
      }
    } catch (err) {
      alert("Lỗi kết nối!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-black text-[#DB4444] mb-2 uppercase">
          {step === 1 ? "Quên mật khẩu?" : "Đặt lại mật khẩu"}
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          {step === 1 
            ? "Nhập email đã đăng ký để nhận mã xác thực OTP." 
            : `Nhập mã OTP (6 số) vừa gửi đến ${email}`}
        </p>

        {step === 1 ? (
          <form className="space-y-6" onSubmit={handleSendOtp}>
            <input 
              type="email" required placeholder="Nhập email của bạn" 
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b-2 border-gray-200 py-3 outline-none focus:border-[#DB4444] bg-transparent"
            />
            <button disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 disabled:bg-gray-400">
              {loading ? "Đang gửi OTP..." : "TIẾP TỤC"}
            </button>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={handleResetPassword}>
            <input 
              type="text" required maxLength="6" placeholder="Mã OTP" 
              value={otp} onChange={(e) => setOtp(e.target.value)}
              className="w-full border-b-2 border-gray-200 py-3 outline-none focus:border-[#DB4444] text-center text-2xl tracking-widest bg-transparent"
            />
            <input 
              type="password" required placeholder="Mật khẩu mới" 
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border-b-2 border-gray-200 py-3 outline-none focus:border-[#DB4444] bg-transparent"
            />
            <button disabled={loading} className="w-full bg-[#DB4444] text-white py-4 rounded-xl font-bold hover:bg-[#c03939]">
              {loading ? "Đang xử lý..." : "XÁC NHẬN ĐẶT LẠI"}
            </button>
          </form>
        )}
        <button onClick={onBack} className="mt-8 text-gray-400 hover:text-black w-full text-sm font-medium">
          ← Quay lại đăng nhập
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;