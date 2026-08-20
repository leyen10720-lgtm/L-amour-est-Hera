import React, { useState } from 'react';
import { X, Send, Mail, MessageSquare, Check, Sparkles, Feather } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose
}) => {
  const [senderName, setSenderName] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [message, setMessage] = useState('');
  const [topicChoice, setTopicChoice] = useState('Gửi thư đến Nữ Bá Tước Hera von Valois');
  const [sealColor, setSealColor] = useState<'wine' | 'gold' | 'sapphire'>('wine');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !message.trim()) return;

    soundEffects.playWaxSeal();
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSenderName('');
    setSenderContact('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1d1918]/80 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      
      {/* Modal Card */}
      <div className="relative my-auto w-full max-w-[620px] overflow-hidden rounded-xl border border-[#a88956] bg-[#fffdf9] p-6 sm:p-8 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={() => {
            soundEffects.playPageTurn();
            onClose();
          }}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#ebe3d7] text-[#1d1918] hover:bg-[#5b1824] hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Header */}
            <div className="text-center border-b border-[#d9cfc3] pb-4 mb-5">
              <span className="font-cinzel text-xs uppercase tracking-[2px] text-[#a88956]">
                Imperial Dispatch
              </span>
              <h3 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#1d1918] mt-1">
                Gửi Thư Niêm Phong Đến Nhân Vật
              </h3>
              <p className="font-cormorant text-base italic text-[#746b65] mt-1">
                Gửi lời nhắn nhủ, cảm nghĩ hoặc lời thăm hỏi đến các nhân vật trong kho lưu trữ
              </p>
            </div>

            {/* Direct Social Channels */}
            <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a 
                href="https://discord.gg/moonlightvow" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-2.5 rounded-lg border border-[#d9cfc3] bg-[#fbf8f4] p-3 text-xs shadow-sm hover:border-[#63222a] hover:bg-[#fffdf9] transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#63222a] font-cinzel">Discord:</span>
                  <span className="font-mono text-[#352520]">Moonlight Vow</span>
                </div>
                <span className="text-[10px] text-[#802c38] font-semibold group-hover:translate-x-0.5 transition-transform">Tham gia ↗</span>
              </a>
              <a 
                href="https://www.facebook.com/share/18psNny1Eh/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-2.5 rounded-lg border border-[#d9cfc3] bg-[#fbf8f4] p-3 text-xs shadow-sm hover:border-[#63222a] hover:bg-[#fffdf9] transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#63222a] font-cinzel">Facebook:</span>
                  <span className="text-[#352520]">L’amour est Hera</span>
                </div>
                <span className="text-[10px] text-[#802c38] font-semibold group-hover:translate-x-0.5 transition-transform">Xem Page ↗</span>
              </a>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#746b65] mb-1">
                    Quý danh / Tên của bạn *
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Ví dụ: Tiểu Thư Vivienne"
                    className="w-full rounded-md border border-[#d9cfc3] bg-[#fffdf9] px-3 py-2 text-sm text-[#1d1918] focus:border-[#5b1824] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#746b65] mb-1">
                    Địa chỉ hồi âm (Email / Discord) *
                  </label>
                  <input
                    type="text"
                    required
                    value={senderContact}
                    onChange={(e) => setSenderContact(e.target.value)}
                    placeholder="Để nhận thư phản hồi"
                    className="w-full rounded-md border border-[#d9cfc3] bg-[#fffdf9] px-3 py-2 text-sm text-[#1d1918] focus:border-[#5b1824] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#746b65] mb-1">
                  Nhân vật / Chủ đề gửi đến
                </label>
                <select
                  value={topicChoice}
                  onChange={(e) => setTopicChoice(e.target.value)}
                  className="w-full rounded-md border border-[#d9cfc3] bg-[#fffdf9] px-3 py-2 text-sm text-[#1d1918] focus:border-[#5b1824] focus:outline-none"
                >
                  <option value="Gửi thư đến Nữ Bá Tước Hera von Valois">Gửi thư đến Nữ Bá Tước Hera von Valois</option>
                  <option value="Gửi thư đến Hầu Tước Lucien Sterling">Gửi thư đến Hầu Tước Lucien Sterling</option>
                  <option value="Gửi thư đến Céleste Thorne (Thư Viện Thủy Tinh)">Gửi thư đến Céleste Thorne (Thư Viện Thủy Tinh)</option>
                  <option value="Gửi thư đến Chiêm Tinh Gia Elysian Moreau">Gửi thư đến Chiêm Tinh Gia Elysian Moreau</option>
                  <option value="Gửi thư đến Nghệ Sĩ Vespera Nightingale">Gửi thư đến Nghệ Sĩ Vespera Nightingale</option>
                  <option value="Góp ý & Trao đổi cốt truyện thế giới">Góp ý & Trao đổi cốt truyện thế giới</option>
                  <option value="Khác">Khác...</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#746b65] mb-1">
                  Nội dung thư *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Viết những lời nhắn gửi, suy nghĩ của bạn về nhân vật hoặc thế giới..."
                  className="w-full rounded-md border border-[#d9cfc3] bg-[#fffdf9] p-3 text-sm text-[#1d1918] focus:border-[#5b1824] focus:outline-none"
                />
              </div>

              {/* Wax Seal Selector */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#746b65]">Màu dấu sáp:</span>
                  <button
                    type="button"
                    onClick={() => setSealColor('wine')}
                    className={`h-6 w-6 rounded-full bg-[#5b1824] shadow-sm ${sealColor === 'wine' ? 'ring-2 ring-[#a88956]' : ''}`}
                    title="Đỏ Rượu Vang Valois"
                  />
                  <button
                    type="button"
                    onClick={() => setSealColor('gold')}
                    className={`h-6 w-6 rounded-full bg-[#a88956] shadow-sm ${sealColor === 'gold' ? 'ring-2 ring-[#5b1824]' : ''}`}
                    title="Vàng Hoàng Kim"
                  />
                  <button
                    type="button"
                    onClick={() => setSealColor('sapphire')}
                    className={`h-6 w-6 rounded-full bg-[#2b4c7e] shadow-sm ${sealColor === 'sapphire' ? 'ring-2 ring-[#d4bb86]' : ''}`}
                    title="Lam Ngọc Thủy Tinh"
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-[#5b1824] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-[#351016] active:scale-98 transition-all"
                >
                  <Feather className="h-4 w-4 text-[#d4bb86]" />
                  <span>Đóng Dấu & Gửi Thư</span>
                </button>
              </div>

            </form>
          </div>
        ) : (
          /* Success Screen with Wax Seal Animation */
          <div className="text-center py-8 space-y-4">
            
            {/* Wax Seal Graphic */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#5b1824] border-4 border-[#d4bb86] text-white shadow-xl animate-pulse">
              <span className="font-cinzel text-2xl font-bold text-[#d4bb86]">H</span>
            </div>

            <div className="font-cinzel text-xs uppercase tracking-[3px] text-[#a88956]">
              Sealed & Dispatched
            </div>

            <h3 className="font-cormorant text-3xl font-bold text-[#1d1918]">
              Bức Thư Đã Được Niêm Phong!
            </h3>

            <p className="mx-auto max-w-[420px] font-cormorant text-lg text-[#554a45] leading-relaxed">
              Cảm ơn <strong>{senderName}</strong>. Bức thư gửi đến “{topicChoice}” đã được cất giữ trang trọng trong Kho Lưu Trữ Ký Ức.
            </p>

            <div className="pt-4">
              <button
                onClick={handleReset}
                className="rounded-lg bg-[#5b1824] px-6 py-2 text-xs font-semibold text-white hover:bg-[#351016] transition-colors"
              >
                Hoàn tất & Quay lại kho lưu trữ
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

