// frontend/src/components/RateLimitedUI.jsx

import React from 'react';

// İsteğe bağlı olarak bir ikon kütüphanesi kullanabilirsiniz, örneğin react-icons
// npm install react-icons
import { ClockLoader } from 'react-spinners'; // Veya başka bir görsel element

const RateLimitedUI = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-800 p-4">
      <div className="text-center bg-white p-10 rounded-lg shadow-xl">
        <ClockLoader color={"#F59E0B"} size={60} className="mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-amber-500 mb-2">İstek Limiti Aşıldı</h1>
        <p className="text-lg mb-1">
          Sunucuya çok fazla istek gönderdiniz.
        </p>
        <p className="text-lg">
          Lütfen bir dakika sonra tekrar deneyin.
        </p>
      </div>
    </div>
  );
};

export default RateLimitedUI;