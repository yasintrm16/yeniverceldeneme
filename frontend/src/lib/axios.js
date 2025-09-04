import axios from "axios";

const api = axios.create({
    // Vercel'in, frontend'den gelen API isteklerini
    // backend'e doğru şekilde yönlendirmesi için
    // burayı göreceli (relative) bir yol olarak değiştiriyoruz.
    baseURL: "/api"
});

export default api;