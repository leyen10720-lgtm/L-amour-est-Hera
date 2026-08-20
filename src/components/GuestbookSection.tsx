import React, { useState } from 'react';
import { GuestbookEntry, Character } from '../types';
import { Feather, Heart, Sparkles, Send } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface GuestbookSectionProps {
  entries: GuestbookEntry[];
  characters: Character[];
  onAddEntry: (entry: Omit<GuestbookEntry, 'id' | 'date'>) => void;
}

export const GuestbookSection: React.FC<GuestbookSectionProps> = ({
  entries,
  characters,
  onAddEntry
}) => {
  const [showForm, setShowForm] = useState(false);
  const [sender, setSender] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sealColor, setSealColor] = useState<'wine' | 'gold' | 'sapphire' | 'emerald'>('wine');
  const [characterDedicated, setCharacterDedicated] = useState<string>('Tất cả nhân vật');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender.trim() || !message.trim()) return;

    soundEffects.playWaxSeal();
    onAddEntry({
      sender: sender.trim(),
      title: title.trim() || 'Thư gửi Kho Lưu Trữ',
      message: message.trim(),
      sealColor,
      characterDedicated
    });

    setSender('');
    setTitle('');
    setMessage('');
    setShowForm(false);
  };

  const sealColorMap = {
    wine: 'bg-[#5b1824] border-[#d4bb86]',
    gold: 'bg-[#a88956] border-[#5b1824]',
    sapphire: 'bg-[#2b4c7e] border-[#d4bb86]',
    emerald: 'bg-[#1b4332] border-[#d4bb86]'
  };

  return (
    <section className="py-7 border-b border-[#d9cfc3]">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="block font-inter text-[11px] font-semibold uppercase tracking-[2px] text-[#746b65]">
            Imperial Guestbook & Letters
          </span>
          <h2 className="font-cormorant text-2xl sm:text-[32px] font-bold text-[#1d1918]">
            Sổ Lưu Bút Vương Quốc
          </h2>
          <p className="font-cormorant text-base sm:text-lg italic text-[#746b65] mt-0.5">
            Những dòng nhắn gửi, cảm nhận và lá thư từ những độc giả viếng thăm
          </p>
        </div>

        <button
          onClick={() => {
            soundEffects.playPageTurn();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 rounded-lg bg-[#5b1824] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#351016] transition-all"
        >
          <Feather className="h-4 w-4 text-[#d4bb86]" />
          <span>{showForm ? 'Đóng khung viết thư' : 'Viết Lời Nhắn Mới'}</span>
        </button>
      </div>

      {/* Write Letter Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-[#a88956] bg-[#fffdf9] p-6 shadow-md animate-fadeIn space-y-4">
          <div className="border-b border-[#d9cfc3] pb-2">
            <h3 className="font-cormorant text-xl font-bold text-[#1d1918]">
              Soạn Thư Tay Gửi Vào Kho Lưu Trữ
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#746b65] mb-1">
                Danh xưng của bạn *
              </label>
              <input
                type="text"
                required
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="Ví dụ: Lãng Khách Phương Xa"
                className="w-full rounded border border-[#d9cfc3] bg-white p-2 text-sm text-[#1d1918] focus:border-[#5b1824] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#746b65] mb-1">
                Dành tặng nhân vật
              </label>
              <select
                value={characterDedicated}
                onChange={(e) => setCharacterDedicated(e.target.value)}
                className="w-full rounded border border-[#d9cfc3] bg-white p-2 text-sm text-[#1d1918] focus:border-[#5b1824] focus:outline-none"
              >
                <option value="Tất cả nhân vật">Tất cả nhân vật</option>
                {characters.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#746b65] mb-1">
              Tiêu đề bức thư
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Gửi một buổi chiều mưa bên lâu đài"
              className="w-full rounded border border-[#d9cfc3] bg-white p-2 text-sm text-[#1d1918] focus:border-[#5b1824] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#746b65] mb-1">
              Nội dung lưu bút *
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Chia sẻ cảm xúc, lời nhắn gửi đến Hera hoặc các nhân vật bạn yêu thích..."
              className="w-full rounded border border-[#d9cfc3] bg-white p-2 text-sm text-[#1d1918] focus:border-[#5b1824] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#746b65]">Dấu sáp:</span>
              {(['wine', 'gold', 'sapphire', 'emerald'] as const).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSealColor(color)}
                  className={`h-5 w-5 rounded-full ${sealColorMap[color]} ${sealColor === color ? 'ring-2 ring-black' : ''}`}
                />
              ))}
            </div>

            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-md bg-[#5b1824] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#351016]"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Gửi Vào Lưu Bút</span>
            </button>
          </div>
        </form>
      )}

      {/* Guestbook List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="relative rounded-xl border border-[#d9cfc3] bg-[#fffdf9] p-5 shadow-sm transition-all duration-300 hover:border-[#a88956] hover:shadow-md flex flex-col justify-between"
          >
            {/* Wax Seal Stamp on Top Corner */}
            <div className="flex items-start justify-between border-b border-[#ebe3d7] pb-3">
              <div>
                <span className="font-cormorant text-xs uppercase tracking-wider text-[#a88956] block">
                  {entry.characterDedicated ? `Dành tặng: ${entry.characterDedicated}` : 'Lưu bút'}
                </span>
                <h4 className="font-cormorant text-lg font-bold text-[#1d1918] mt-0.5">
                  {entry.title}
                </h4>
              </div>

              <div className={`h-7 w-7 rounded-full border-2 shadow-sm flex items-center justify-center text-[10px] font-cinzel font-bold text-white flex-shrink-0 ${sealColorMap[entry.sealColor]}`}>
                H
              </div>
            </div>

            {/* Body Message */}
            <p className="my-3 font-cormorant text-base text-[#351016] leading-relaxed italic">
              “{entry.message}”
            </p>

            {/* Footer Sign */}
            <div className="pt-2 border-t border-[#ebe3d7] flex items-center justify-between text-xs text-[#746b65]">
              <span className="font-serif font-bold text-[#5b1824]">{entry.sender}</span>
              <span>{entry.date}</span>
            </div>

          </article>
        ))}
      </div>

    </section>
  );
};
