import React, { useState, useEffect, useRef } from 'react';
import { FolderOpenIcon, XMarkIcon, TrashIcon, ArrowPathIcon, ArrowUpTrayIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import type { Session } from '../types';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSession: (session: Session) => void;
}

const LibraryModal: React.FC<LibraryModalProps> = ({ isOpen, onClose, onLoadSession }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const storedSessions: Session[] = JSON.parse(localStorage.getItem('animationStudioSessions') || '[]');
      // Sort by date, newest first
      storedSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSessions(storedSessions);
    }
  }, [isOpen]);

  const handleDelete = (sessionId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa phiên làm việc này không? Thao tác này không thể hoàn tác.")) {
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(updatedSessions);
      localStorage.setItem('animationStudioSessions', JSON.stringify(updatedSessions));
    }
  };

  const handleExport = () => {
    if (sessions.length === 0) {
      alert("Không có phiên làm việc nào để xuất.");
      return;
    }
    const dataStr = JSON.stringify(sessions, null, 2); // Pretty print JSON
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    linkElement.setAttribute('download', `animation_studio_sessions_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(url);
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') throw new Error("Không thể đọc tệp");
            
            const importedData = JSON.parse(text);
            if (!Array.isArray(importedData) || !importedData.every(s => s.id && s.name && s.createdAt && s.state)) {
                throw new Error("Định dạng tệp phiên không hợp lệ.");
            }
            const importedSessions = importedData as Session[];

            if (confirm("Bạn có muốn hợp nhất các phiên đã nhập với các phiên hiện có không?\n\n- Nhấn 'OK' để hợp nhất (các phiên trùng lặp sẽ được bỏ qua).\n- Nhấn 'Hủy' để thay thế hoàn toàn các phiên hiện tại.")) {
                // Merge logic
                const existingIds = new Set(sessions.map(s => s.id));
                const newUniqueSessions = importedSessions.filter(s => !existingIds.has(s.id));
                const merged = [...sessions, ...newUniqueSessions];
                merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setSessions(merged);
                localStorage.setItem('animationStudioSessions', JSON.stringify(merged));
                alert(`Đã hợp nhất! Thêm ${newUniqueSessions.length} phiên mới.`);
            } else {
                // Replace logic
                importedSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setSessions(importedSessions);
                localStorage.setItem('animationStudioSessions', JSON.stringify(importedSessions));
                alert(`Đã nhập và thay thế bằng ${importedSessions.length} phiên.`);
            }

        } catch (error) {
            alert(`Lỗi khi nhập tệp: ${error instanceof Error ? error.message : "Lỗi không xác định"}`);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-[#1A233A] text-gray-200 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700 flex flex-col" style={{height: 'min(80vh, 700px)'}}>
        <div className="p-6 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <FolderOpenIcon className="w-8 h-8 text-[var(--theme-400)]"/>
            <div>
              <h2 className="text-2xl font-bold text-white">Thư viện Phiên làm việc</h2>
              <p className="text-gray-400 text-sm mt-1">Tải, xóa và quản lý các phiên làm việc đã lưu của bạn.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        
        <div className="p-6 flex-grow overflow-y-auto">
            {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <FolderOpenIcon className="w-16 h-16 text-gray-600 mb-4"/>
                    <h3 className="text-lg font-semibold text-gray-400">Thư viện của bạn trống</h3>
                    <p className="text-gray-500">Hãy nhấp 'Lưu Phiên' để lưu công việc hiện tại của bạn.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {sessions.map(session => (
                        <li key={session.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-[var(--theme-500)] transition-colors">
                            <div>
                                <p className="font-semibold text-white">{session.name}</p>
                                <p className="text-xs text-gray-400">Đã lưu: {new Date(session.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => onLoadSession(session)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-[var(--theme-500)] text-white font-semibold rounded-md transition-colors text-sm">
                                    <ArrowPathIcon className="w-4 h-4" />
                                    <span>Tải</span>
                                </button>
                                <button onClick={() => handleDelete(session.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>

        <div className="p-6 bg-gray-900/50 rounded-b-2xl flex justify-between items-center flex-shrink-0 border-t border-gray-700">
            <div className="flex gap-4">
                 <input type="file" ref={fileInputRef} onChange={handleFileImport} style={{ display: 'none' }} accept=".json" />
                 <button onClick={handleImportClick} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-sm">
                    <ArrowUpTrayIcon className="w-5 h-5" />
                    <span>Nhập</span>
                </button>
                 <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-sm">
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    <span>Xuất</span>
                </button>
            </div>
            <button onClick={onClose} className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default LibraryModal;
