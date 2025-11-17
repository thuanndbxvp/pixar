import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PaintBrushIcon, CheckIcon, ArrowUpTrayIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { PREDEFINED_STYLES } from '../constants';
import * as geminiService from '../services/geminiService';
import * as openaiService from '../services/openaiService';
import type { VisualStyle, AIConfig, Toast, ApiKeyStore } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface StyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (style: VisualStyle) => void;
  currentStyle: VisualStyle;
  aiConfig: AIConfig | null;
  addToast: (message: string, subMessage?: string, type?: Toast['type']) => void;
}

const fileToBas64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve({ base64, mimeType: file.type });
        };
        reader.onerror = error => reject(error);
    });
};

const hasActiveApiKey = (provider: 'gemini' | 'openai'): boolean => {
    const storeStr = localStorage.getItem('apiKeyStore');
    if (!storeStr) return false;
    const store: ApiKeyStore = JSON.parse(storeStr);
    const providerStore = store[provider];
    if (!providerStore || !providerStore.activeKeyId) return false;
    const activeKey = providerStore.keys.find(k => k.id === providerStore.activeKeyId);
    return !!activeKey;
};


const StyleModal: React.FC<StyleModalProps> = ({ isOpen, onClose, onSave, currentStyle, aiConfig, addToast }) => {
  const [activeTab, setActiveTab] = useState<'select' | 'upload'>('select');
  const [selectedStyle, setSelectedStyle] = useState<VisualStyle>(currentStyle);
  
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzedDescription, setAnalyzedDescription] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzeDisabled, setIsAnalyzeDisabled] = useState(false);
  const [analyzeDisabledReason, setAnalyzeDisabledReason] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        setSelectedStyle(currentStyle);
        // Reset upload tab state when modal opens
        setUploadedImage(null);
        setImagePreview(null);
        setAnalyzedDescription('');
        setIsAnalyzing(false);
        // Set active tab based on current style type
        setActiveTab(currentStyle.type === 'predefined' ? 'select' : 'upload');
        
        // Check if analysis is possible
        if (!aiConfig) {
          setIsAnalyzeDisabled(true);
          setAnalyzeDisabledReason('Vui lòng cấu hình nhà cung cấp AI trong phần Quản lý API.');
        } else if (!hasActiveApiKey(aiConfig.provider)) {
          const providerName = aiConfig.provider === 'gemini' ? 'Google Gemini' : 'OpenAI';
          setIsAnalyzeDisabled(true);
          setAnalyzeDisabledReason(`Vui lòng kích hoạt API key cho ${providerName} trong phần Quản lý API.`);
        } else if (aiConfig.provider === 'openai' && !aiConfig.model.startsWith('gpt-4')) {
          setIsAnalyzeDisabled(true);
          setAnalyzeDisabledReason('Phân tích hình ảnh chỉ được hỗ trợ trên các mô hình GPT-4 có khả năng vision.');
        } else {
          setIsAnalyzeDisabled(false);
          setAnalyzeDisabledReason('');
        }
    }
  }, [isOpen, currentStyle, aiConfig]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        setUploadedImage(file);
        setImagePreview(URL.createObjectURL(file));
        setAnalyzedDescription(''); // Clear previous analysis
    } else {
        addToast("Tệp không hợp lệ", "Vui lòng tải lên một tệp hình ảnh.", "error");
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedImage || !aiConfig || isAnalyzeDisabled) return;
    setIsAnalyzing(true);
    setAnalyzedDescription('');
    try {
        const { base64, mimeType } = await fileToBas64(uploadedImage);
        const service = aiConfig.provider === 'gemini' ? geminiService : openaiService;
        const description = await service.analyzeImageStyle(base64, mimeType, aiConfig.model);
        setAnalyzedDescription(description);
        
        // Automatically select the analyzed style
        setSelectedStyle({
            type: 'analyzed',
            name: `Phân tích từ: ${uploadedImage.name}`,
            description: description
        });

    } catch (err: any) {
        addToast("Lỗi Phân tích", err.message, "error");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleSaveClick = () => {
    if (activeTab === 'upload' && analyzedDescription) {
        onSave({
            type: 'analyzed',
            name: uploadedImage ? `Phân tích từ: ${uploadedImage.name}` : 'Phong cách tùy chỉnh',
            description: analyzedDescription
        });
    } else {
        onSave(selectedStyle);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-[#1A233A] text-gray-200 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <PaintBrushIcon className="w-8 h-8 text-[var(--theme-400)]"/>
            <div>
              <h2 className="text-2xl font-bold text-white">Quản lý Phong cách Hình ảnh</h2>
              <p className="text-gray-400 text-sm mt-1">Chọn phong cách cho các gợi ý hình ảnh và video của bạn.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        
        <div className="p-6">
            <div className="flex border-b border-gray-700 mb-6">
              <button onClick={() => setActiveTab('select')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'select' ? 'text-[var(--theme-400)] border-b-2 border-[var(--theme-400)]' : 'text-gray-400 hover:text-white'}`}>
                Chọn Phong cách
              </button>
              <button onClick={() => setActiveTab('upload')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'upload' ? 'text-[var(--theme-400)] border-b-2 border-[var(--theme-400)]' : 'text-gray-400 hover:text-white'}`}>
                Tải lên Ảnh tham khảo
              </button>
            </div>

            {activeTab === 'select' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-80 overflow-y-auto pr-2">
                    {PREDEFINED_STYLES.map(style => (
                        <button 
                            key={style.name}
                            onClick={() => setSelectedStyle(style)}
                            className={`p-4 rounded-lg text-left border-2 transition-all duration-200 ${selectedStyle.name === style.name ? 'border-[var(--theme-500)] bg-gray-900/80 scale-105' : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'}`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-base text-gray-100">{style.name}</h4>
                                {selectedStyle.name === style.name && <CheckIcon className="w-5 h-5 text-[var(--theme-400)]" />}
                            </div>
                            <p className="text-xs text-gray-400">{style.description.split('. ')[0]}.</p>
                        </button>
                    ))}
                </div>
            )}
            
            {activeTab === 'upload' && (
                <div className="grid md:grid-cols-2 gap-6 h-80 overflow-y-auto pr-2">
                    {/* Left: Upload and Preview */}
                    <div className="flex flex-col items-center">
                       <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-48 bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-600 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gray-500 transition-colors mb-4"
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                            ) : (
                                <>
                                    <ArrowUpTrayIcon className="w-8 h-8 text-gray-500 mb-2"/>
                                    <p className="text-sm text-gray-400">Nhấp để tải lên hình ảnh</p>
                                    <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
                                </>
                            )}
                        </div>
                        <button 
                            onClick={handleAnalyze} 
                            disabled={!uploadedImage || isAnalyzing || isAnalyzeDisabled}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-[var(--theme-500)] rounded-lg hover:bg-[var(--theme-600)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            <span>{isAnalyzing ? 'Đang phân tích...' : 'Phân tích Phong cách'}</span>
                        </button>
                        {isAnalyzeDisabled && uploadedImage && (
                            <p className="text-xs text-yellow-400 mt-2 text-center">{analyzeDisabledReason}</p>
                        )}
                    </div>
                    {/* Right: Analysis Result */}
                    <div className="flex flex-col">
                        <label htmlFor="style-description" className="block text-sm font-medium text-gray-300 mb-2">Mô tả Phong cách (được tạo bởi AI)</label>
                        <div className="relative flex-grow">
                             {isAnalyzing && <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 rounded-lg"><LoadingSpinner /></div>}
                            <textarea
                                id="style-description"
                                value={analyzedDescription}
                                onChange={(e) => setAnalyzedDescription(e.target.value)}
                                placeholder={isAnalyzing ? "AI đang phân tích hình ảnh..." : "Mô tả phong cách sẽ xuất hiện ở đây sau khi phân tích. Bạn có thể chỉnh sửa nó."}
                                className="w-full h-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--theme-500)] focus:border-[var(--theme-500)] transition-colors text-sm"
                                rows={8}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="p-6 bg-gray-900/50 rounded-b-2xl flex justify-between items-center">
          <div className="text-sm text-gray-400">
             Phong cách đang chọn: <span className="font-semibold text-[var(--theme-400)]">{selectedStyle.name}</span>
          </div>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">Hủy</button>
            <button onClick={handleSaveClick} className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">Lưu & Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleModal;