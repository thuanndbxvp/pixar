import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PaintBrushIcon, CheckIcon, ArrowUpTrayIcon, SparklesIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { PREDEFINED_STYLES, PREDEFINED_CHARACTERS } from '../constants';
import * as geminiService from '../services/geminiService';
import * as openaiService from '../services/openaiService';
import type { VisualStyle, AIConfig, Toast, ApiKeyStore, StoredAnalyzedItem, LibraryCharacter } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface StyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (style: VisualStyle, character: LibraryCharacter | null) => void;
  currentStyle: VisualStyle;
  currentCharacter: LibraryCharacter | null;
  aiConfig: AIConfig | null;
  addToast: (message: string, subMessage?: string, type?: Toast['type']) => void;
  aspectRatio: '9:16' | '16:9';
  onAspectRatioChange: (ratio: '9:16' | '16:9') => void;
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

const parseCharacterDescription = (desc: string): LibraryCharacter => {
    const nameMatch = desc.match(/Character Name:\s*(.*)/);
    const speciesMatch = desc.match(/Species:\s*(.*)/);
    const appearanceMatch = desc.match(/Detailed Appearance:\s*([\s\S]*?)Visual Style Keywords:/);
    const keywordsMatch = desc.match(/Visual Style Keywords:\s*(.*)/);

    return {
        id: `analyzed_${crypto.randomUUID()}`,
        name: nameMatch ? nameMatch[1].trim() : 'Unnamed Character',
        species: speciesMatch ? speciesMatch[1].trim() : 'Unknown',
        detailedAppearance: appearanceMatch ? appearanceMatch[1].trim() : 'No description.',
        visualStyleKeywords: keywordsMatch ? keywordsMatch[1].trim() : 'Not specified.',
    };
};


const StyleModal: React.FC<StyleModalProps> = ({ isOpen, onClose, onSave, currentStyle, currentCharacter, aiConfig, addToast, aspectRatio, onAspectRatioChange }) => {
  const [activeTab, setActiveTab] = useState<'select' | 'upload' | 'library' | 'characterLibrary'>('select');
  const [localStyle, setLocalStyle] = useState<VisualStyle>(currentStyle);
  const [localCharacter, setLocalCharacter] = useState<LibraryCharacter | null>(currentCharacter);
  const [hoveredItem, setHoveredItem] = useState<VisualStyle | LibraryCharacter | null>(null);
  
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzedDescription, setAnalyzedDescription] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzeDisabled, setIsAnalyzeDisabled] = useState(false);
  const [analyzeDisabledReason, setAnalyzeDisabledReason] = useState('');
  const [analysisOptions, setAnalysisOptions] = useState({ style: true, character: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [storedItems, setStoredItems] = useState<StoredAnalyzedItem[]>([]);
  const [customItemName, setCustomItemName] = useState('');

  const handleAnalysisOptionChange = (option: 'style' | 'character') => {
    setAnalysisOptions(prev => {
        const newState = { ...prev, [option]: !prev[option] };
        if (!newState.style && !newState.character) {
            return prev;
        }
        return newState;
    });
  };

  useEffect(() => {
    if (isOpen) {
        setLocalStyle(currentStyle);
        setLocalCharacter(currentCharacter);
        setHoveredItem(null);
        setUploadedImage(null);
        setImagePreview(null);
        setAnalyzedDescription('');
        setIsAnalyzing(false);
        setCustomItemName('');
        setAnalysisOptions({ style: true, character: false });
        
        const storedCustomItems = JSON.parse(localStorage.getItem('customAnalyzedItems') || '[]');
        setStoredItems(storedCustomItems);
        
        setActiveTab(currentStyle.type === 'predefined' ? 'select' : 'library');
        if (currentCharacter) setActiveTab('characterLibrary');
        
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
  }, [isOpen, currentStyle, currentCharacter, aiConfig]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        setUploadedImage(file);
        setImagePreview(URL.createObjectURL(file));
        setAnalyzedDescription('');
        setCustomItemName('');
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
        const description = await service.analyzeImageStyle(base64, mimeType, aiConfig.model, analysisOptions);
        setAnalyzedDescription(description);
        
        if (analysisOptions.character) {
            const newChar = parseCharacterDescription(description);
            setLocalCharacter(newChar);
        } else {
            setLocalStyle({
                type: 'analyzed',
                name: `Phân tích từ: ${uploadedImage.name}`,
                description: description
            });
        }
        
        const generatedName = uploadedImage.name.split('.')[0].replace(/[-_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
        setCustomItemName(generatedName);

    } catch (err: any) {
        addToast("Lỗi Phân tích", err.message, "error");
    } finally {
        setIsAnalyzing(false);
    }
  };
  
  const handleSaveToLibrary = () => {
    if (!customItemName.trim() || !analyzedDescription.trim()) return;

    const newItem: StoredAnalyzedItem = {
        id: crypto.randomUUID(),
        name: customItemName,
        description: analyzedDescription,
        type: analysisOptions.character ? 'custom_character' : 'custom_style',
    };

    const updatedItems = [...storedItems, newItem];
    setStoredItems(updatedItems);
    localStorage.setItem('customAnalyzedItems', JSON.stringify(updatedItems));
    
    setCustomItemName('');
    addToast('Lưu thành công!', `"${newItem.name}" đã được thêm vào thư viện.`, 'success');
  };
  
  const handleDeleteCustomItem = (itemId: string) => {
    if (confirm("Bạn có chắc muốn xóa mục này khỏi thư viện?")) {
        const updatedItems = storedItems.filter(s => s.id !== itemId);
        setStoredItems(updatedItems);
        localStorage.setItem('customAnalyzedItems', JSON.stringify(updatedItems));

        if (localStyle.type === 'custom' && localStyle.id === itemId) {
            setLocalStyle(PREDEFINED_STYLES[0]);
        }
        if (localCharacter?.id === itemId) {
            setLocalCharacter(null);
        }
    }
  };
  
  const handleSelectCustomItem = (item: StoredAnalyzedItem) => {
      if (item.type === 'custom_character') {
          const newChar: LibraryCharacter = { ...parseCharacterDescription(item.description), id: item.id, name: item.name };
          setLocalCharacter(newChar);
      } else {
          setLocalStyle({
              id: item.id,
              name: item.name,
              description: item.description,
              type: 'custom',
          });
      }
  };
  
  const handleSaveClick = () => {
    onSave(localStyle, localCharacter);
  };

  if (!isOpen) return null;
  
  const displayItem = hoveredItem || localCharacter || localStyle;
  const isCharacter = (item: any): item is LibraryCharacter => !!item?.species;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-[#1A233A] text-gray-200 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-700">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <PaintBrushIcon className="w-8 h-8 text-[var(--theme-400)]"/>
            <div>
              <h2 className="text-2xl font-bold text-white">Đạo diễn</h2>
              <p className="text-gray-400 text-sm mt-1">Chọn phong cách hình ảnh và nhân vật cho câu chuyện của bạn.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        
        <div className="p-6">
            <div className="flex border-b border-gray-700 mb-6">
              <button onClick={() => setActiveTab('select')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'select' ? 'text-[var(--theme-400)] border-b-2 border-[var(--theme-400)]' : 'text-gray-400 hover:text-white'}`}>
                Chọn Phong cách
              </button>
               <button onClick={() => setActiveTab('characterLibrary')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'characterLibrary' ? 'text-[var(--theme-400)] border-b-2 border-[var(--theme-400)]' : 'text-gray-400 hover:text-white'}`}>
                Thư viện Nhân vật
              </button>
              <button onClick={() => setActiveTab('upload')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'upload' ? 'text-[var(--theme-400)] border-b-2 border-[var(--theme-400)]' : 'text-gray-400 hover:text-white'}`}>
                Tải lên Ảnh tham khảo
              </button>
               <button onClick={() => setActiveTab('library')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'library' ? 'text-[var(--theme-400)] border-b-2 border-[var(--theme-400)]' : 'text-gray-400 hover:text-white'}`}>
                Thư viện Tùy chỉnh
              </button>
            </div>

            {activeTab === 'select' && (
                <div className="grid md:grid-cols-2 gap-6 h-96">
                    <div 
                      className="overflow-y-auto pr-2 grid grid-cols-2 gap-4"
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                        {PREDEFINED_STYLES.map(style => (
                            <button 
                                key={style.name}
                                onMouseEnter={() => setHoveredItem(style)}
                                onClick={() => setLocalStyle(style)}
                                className={`p-4 rounded-lg text-left border-2 transition-all duration-200 h-28 flex flex-col justify-between ${localStyle.name === style.name && localStyle.type === 'predefined' ? 'border-[var(--theme-500)] bg-gray-900/80 scale-105' : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'}`}
                            >
                                <h4 className="font-semibold text-base text-gray-100">{style.name}</h4>
                                {localStyle.name === style.name && localStyle.type === 'predefined' && <CheckIcon className="w-5 h-5 text-[var(--theme-400)] self-end" />}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col relative overflow-hidden">
                      {!isCharacter(displayItem) && displayItem.imageUrl ? (
                        <>
                          <div className="w-full aspect-video bg-gray-900/50 rounded-lg mb-4 overflow-hidden shadow-lg">
                            <img 
                              key={displayItem.name}
                              src={displayItem.imageUrl} 
                              alt={`Preview for ${displayItem.name}`}
                              className="w-full h-full object-cover animate-fade-in"
                            />
                          </div>
                          <div className="overflow-y-auto pr-2">
                            <h4 className="font-semibold text-lg text-white">{displayItem.name}</h4>
                            <p className="text-sm text-gray-400 mt-1">{displayItem.description}</p>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-900/50 rounded-lg flex items-center justify-center p-4">
                            {displayItem ? (
                                <div className="overflow-y-auto pr-2 text-left w-full">
                                    <h4 className="font-semibold text-lg text-white">{displayItem.name}</h4>
                                    {isCharacter(displayItem) ? (
                                      <div className="text-sm text-gray-400 mt-1 space-y-1">
                                        <p><span className="font-semibold text-gray-300">Species:</span> {displayItem.species}</p>
                                        <p><span className="font-semibold text-gray-300">Appearance:</span> {displayItem.detailedAppearance}</p>
                                        <p><span className="font-semibold text-gray-300">Keywords:</span> {displayItem.visualStyleKeywords}</p>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap">{displayItem.description}</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center">Di chuột qua một mục để xem trước</p>
                            )}
                        </div>
                      )}
                    </div>
                </div>
            )}
            
            {activeTab === 'upload' && (
                <div className="grid md:grid-cols-2 gap-6 h-96 overflow-y-auto pr-2">
                    <div className="flex flex-col items-center">
                       <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-48 bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-600 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gray-500 transition-colors mb-4"
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg p-1" />
                            ) : (
                                <>
                                    <ArrowUpTrayIcon className="w-8 h-8 text-gray-500 mb-2"/>
                                    <p className="text-sm text-gray-400">Nhấp để tải lên hình ảnh</p>
                                    <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
                                </>
                            )}
                        </div>
                        <div className="w-full bg-gray-900/50 p-3 rounded-lg border border-gray-700 mb-4">
                            <p className="text-sm font-medium text-gray-300 mb-2">Tùy chọn Phân tích:</p>
                            <div className="flex gap-4 justify-center">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={analysisOptions.style} onChange={() => handleAnalysisOptionChange('style')} className="form-checkbox h-4 w-4 rounded bg-gray-700 border-gray-500 text-[var(--theme-500)] focus:ring-[var(--theme-500)]" />
                                    <span className="text-sm text-gray-200">Phong cách</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={analysisOptions.character} onChange={() => handleAnalysisOptionChange('character')} className="form-checkbox h-4 w-4 rounded bg-gray-700 border-gray-500 text-[var(--theme-500)] focus:ring-[var(--theme-500)]" />
                                    <span className="text-sm text-gray-200">Nhân vật</span>
                                </label>
                            </div>
                        </div>
                        <button 
                            onClick={handleAnalyze} 
                            disabled={!uploadedImage || isAnalyzing || isAnalyzeDisabled}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-[var(--theme-500)] rounded-lg hover:bg-[var(--theme-600)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            <span>{isAnalyzing ? 'Đang phân tích...' : 'Phân tích Ảnh'}</span>
                        </button>
                        {isAnalyzeDisabled && uploadedImage && (
                            <p className="text-xs text-yellow-400 mt-2 text-center">{analyzeDisabledReason}</p>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="style-description" className="block text-sm font-medium text-gray-300 mb-2">Kết quả Phân tích (tạo bởi AI)</label>
                        <div className="relative flex-grow flex flex-col">
                             {isAnalyzing && <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 rounded-lg"><LoadingSpinner /></div>}
                            <textarea
                                id="style-description"
                                value={analyzedDescription}
                                readOnly
                                placeholder={isAnalyzing ? "AI đang phân tích hình ảnh..." : "Kết quả phân tích sẽ xuất hiện ở đây."}
                                className="w-full flex-grow bg-gray-800 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--theme-500)] focus:border-[var(--theme-500)] transition-colors text-sm"
                                rows={6}
                            />
                             {analyzedDescription && !isAnalyzing && (
                                <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                    <label htmlFor="custom-style-name" className="block text-sm font-medium text-gray-300 mb-2">Lưu vào Thư viện Tùy chỉnh</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="custom-style-name"
                                            type="text"
                                            value={customItemName}
                                            onChange={(e) => setCustomItemName(e.target.value)}
                                            placeholder="Đặt tên cho mục này..."
                                            className="flex-grow bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-gray-200 text-sm focus:ring-2 focus:ring-[var(--theme-500)]"
                                        />
                                        <button
                                            onClick={handleSaveToLibrary}
                                            disabled={!customItemName.trim()}
                                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
                                        >
                                            Lưu
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'library' && (
                <div className="h-96 overflow-y-auto pr-2">
                    {storedItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                            <PaintBrushIcon className="w-16 h-16 mb-4"/>
                            <h3 className="text-lg font-semibold">Thư viện Tùy chỉnh trống</h3>
                            <p>Lưu các phong cách hoặc nhân vật đã phân tích để sử dụng lại sau này.</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {storedItems.map(item => (
                                <li 
                                    key={item.id} 
                                    className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${(localStyle.id === item.id || localCharacter?.id === item.id) ? 'border-[var(--theme-500)] bg-gray-900/80' : 'border-gray-700 bg-gray-900/50'}`}
                                >
                                    <div className="flex-1 min-w-0 flex items-center gap-3">
                                        {item.type === 'custom_character' ? <UserGroupIcon className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <PaintBrushIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                                        <div>
                                          <p className="font-semibold text-white truncate">{item.name}</p>
                                          <p className="text-xs text-gray-400 truncate">{item.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                        <button 
                                            onClick={() => handleSelectCustomItem(item)}
                                            className="px-3 py-1 bg-gray-700 hover:bg-[var(--theme-500)] text-white font-semibold rounded-md transition-colors text-sm"
                                        >
                                            {(localStyle.id === item.id || localCharacter?.id === item.id) ? 'Đã chọn' : 'Chọn'}
                                        </button>
                                        <button onClick={() => handleDeleteCustomItem(item.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            
            {activeTab === 'characterLibrary' && (
                 <div className="h-96 overflow-y-auto pr-2">
                    {PREDEFINED_CHARACTERS.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                            <UserGroupIcon className="w-16 h-16 mb-4"/>
                            <h3 className="text-lg font-semibold">Thư viện Nhân vật trống</h3>
                        </div>
                    ) : (
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {PREDEFINED_CHARACTERS.map(char => (
                                <li 
                                    key={char.id} 
                                    onMouseEnter={() => setHoveredItem(char)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${localCharacter?.id === char.id ? 'border-[var(--theme-500)] bg-gray-900/80' : 'border-gray-700 bg-gray-900/50'}`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-white truncate">{char.name} <span className="text-sm text-gray-400 font-normal">({char.species.replace('Anthropomorphic ', '').replace('.', '')})</span></p>
                                        <p className="text-xs text-gray-400 truncate">{char.detailedAppearance}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                        <button 
                                            onClick={() => setLocalCharacter(char)}
                                            className="px-3 py-1 bg-gray-700 hover:bg-[var(--theme-500)] text-white font-semibold rounded-md transition-colors text-sm"
                                        >
                                            {localCharacter?.id === char.id ? 'Đã chọn' : 'Chọn'}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

        </div>

        <div className="p-4 bg-gray-900/50 rounded-b-2xl flex justify-between items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3" style={{ flexBasis: '280px' }}>
                <label htmlFor="aspectRatioModal" className="text-sm font-medium text-gray-300 whitespace-nowrap">Định dạng Khung hình</label>
                <select
                id="aspectRatioModal"
                value={aspectRatio}
                onChange={(e) => onAspectRatioChange(e.target.value as '9:16' | '16:9')}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-[var(--theme-500)] focus:border-[var(--theme-500)]"
                >
                <option value="16:9">Ngang (16:9)</option>
                <option value="9:16">Dọc (9:16)</option>
                </select>
            </div>
            <div className="text-sm text-gray-400 flex-1 min-w-0 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 truncate">
                    <span>Phong cách:</span>
                    <span className="font-semibold text-[var(--theme-400)]">{localStyle.name}</span>
                    <button onClick={() => setLocalStyle(PREDEFINED_STYLES[0])} title="Xóa lựa chọn phong cách" className="p-0.5 rounded-full hover:bg-gray-700">
                        <XMarkIcon className="w-3 h-3"/>
                    </button>
                </div>
                 <div className="flex items-center justify-center gap-2 truncate">
                    <span>Nhân vật:</span>
                    <span className="font-semibold text-[var(--theme-400)]">{localCharacter?.name || 'AI sẽ tự tạo'}</span>
                    {localCharacter && (
                         <button onClick={() => setLocalCharacter(null)} title="Xóa lựa chọn nhân vật" className="p-0.5 rounded-full hover:bg-gray-700">
                            <XMarkIcon className="w-3 h-3"/>
                        </button>
                    )}
                </div>
            </div>
            <div className="flex gap-4" style={{ flexBasis: '280px', justifyContent: 'flex-end' }}>
                <button onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">Hủy</button>
                <button onClick={handleSaveClick} className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">Lưu & Đóng</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StyleModal;