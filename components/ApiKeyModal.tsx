import React, { useState, useEffect } from 'react';
import { KeyIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const storedKeys = JSON.parse(localStorage.getItem('apiKeys') || '{}');
      setGeminiKey(storedKeys.gemini || '');
      setOpenaiKey(storedKeys.openai || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    const keys = { gemini: geminiKey, openai: openaiKey };
    localStorage.setItem('apiKeys', JSON.stringify(keys));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-[#1A233A] text-gray-200 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-700">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Quản lý API Keys</h2>
            <p className="text-gray-400 text-sm mt-1">API key của bạn được lưu trữ cục bộ trong trình duyệt của bạn.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* Gemini Card */}
          <div className="bg-[#111827]/50 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white">
                <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5.03,16.42 5.03,12.5C5.03,8.58 8.36,5.73 12.19,5.73C15.29,5.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2.18 12.19,2.18C7.03,2.18 3,6.58 3,12.5C3,18.42 7.03,22.82 12.19,22.82C17.76,22.82 21.7,18.79 21.7,13.37C21.7,12.23 21.55,11.67 21.35,11.1Z"></path></svg>
              </div>
              <h3 className="text-xl font-semibold">Google Gemini</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">Lấy key từ <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google AI Studio</a>.</p>
            <div className="relative">
              <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="password"
                placeholder="Dán API key mới..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>

          {/* OpenAI Card */}
          <div className="bg-[#111827]/50 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white">
                <svg className="w-6 h-6 text-black" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M35.3331 16.8182C35.3331 16.342 35.21 15.8899 35.0028 15.4862C34.7956 15.0825 34.5158 14.7391 34.1873 14.4841C33.5256 13.9704 32.722 13.6963 31.8988 13.6963C31.0756 13.6963 30.272 13.9704 29.6103 14.4841L25.1378 18.0182L20.6653 14.4841C19.9999 13.9666 19.2023 13.6925 18.3849 13.6925C17.5675 13.6925 16.7699 13.9666 16.1045 14.4841C15.776 14.7391 15.4962 15.0825 15.289 15.4862C15.0818 15.8899 14.9587 16.342 14.9587 16.8182V20.5L10.3295 24.1023C9.66415 24.6198 8.86653 24.8939 8.04914 24.8939C7.23174 24.8939 6.43413 24.6198 5.76873 24.1023C5.44023 23.8473 5.16043 23.5038 4.95323 23.1002C4.74603 22.6965 4.62293 22.2444 4.62293 21.7807V16.8182C4.62293 16.342 4.5 15.8899 4.29279 15.4862C4.08559 15.0825 3.8058 14.7391 3.4773 14.4841C2.81559 13.9704 2.01198 13.6963 1.18879 13.6963C0.365593 13.6963 -0.438018 13.9704 1.22171e-05 14.4841L9.4673 21.7807L14.0965 18.1784V24.1023C14.0965 24.5785 14.2196 25.0306 14.4268 25.4343C14.634 25.838 14.9138 26.1814 15.2423 26.4364L20.3545 30.3034V35.3333C20.3545 35.8095 20.4776 36.2616 20.6848 36.6653C20.892 37.069 21.1718 37.4124 21.5003 37.6674C22.162 38.1811 22.9656 38.4552 23.7888 38.4552C24.612 38.4552 25.4156 38.1811 26.0773 37.6674L35.3331 30.3034C35.6616 30.0484 35.9414 29.705 36.1486 29.3013C36.3558 28.8976 36.4789 28.4455 36.4789 27.9818V24.1023L39.7789 21.4773C40.4443 20.9598 40.8331 20.2585 40.8331 19.5182C40.8331 18.7779 40.4443 18.0766 39.7789 17.5591L35.3331 14.1489V16.8182Z" fill="currentColor"></path><path d="M21.5004 2.33301L12.2446 9.62967L16.8738 13.232V9.62967C16.8738 9.15349 16.9969 8.69956 17.2041 8.29589C17.4113 7.89221 17.6911 7.54884 18.0196 7.29384L23.1318 3.42684V7.64773L20.3545 9.93295V15.5534L25.1379 11.9818L29.6104 15.5159C30.2758 16.0334 31.0734 16.3075 31.8908 16.3075C32.7082 16.3075 33.5058 16.0334 34.1712 15.5159L38.5688 12.05L29.313 4.75341L24.6838 8.35568V2.33301C24.6838 1.85683 24.5607 1.40474 24.3535 1.00106C24.1463 0.597384 23.8665 0.254012 23.538 0L21.5004 2.33301Z" fill="currentColor"></path></svg>
              </div>
              <h3 className="text-xl font-semibold">OpenAI</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">Lấy key từ <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">trang tổng quan OpenAI</a>.</p>
            <div className="relative">
              <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="password"
                placeholder="Dán API key mới..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-900/50 rounded-b-2xl flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">Hủy</button>
          <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">Lưu & Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
