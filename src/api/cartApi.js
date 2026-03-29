const BASE_URL = `${import.meta.env.VITE_API_URL}/api/cart/my-cart`;

export const getCart = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(BASE_URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Token chính là "chìa khóa" để lấy username ở BE
        }
    });
    
    if (!res.ok) throw new Error("Không thể lấy giỏ hàng");
    
    const data = await res.json();
    return data.result; // Trả về danh sách món hàng trong result
};