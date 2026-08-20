import React from 'react';
import { soundEffects } from '../utils/audio';

interface ArchiveGridProps {
  onSelectArchive: (category: string) => void;
}

export const ArchiveGrid: React.FC<ArchiveGridProps> = ({ onSelectArchive }) => {
  const archives = [
    {
      roman: 'I',
      key: 'nhan-vat',
      title: 'Characters',
      desc: 'Những nhân vật trong câu chuyện',
      sub: '6 Hồ sơ nhân vật',
      bg: 'https://images.unsplash.com/photo-1455885666463-5d1d7c7b2b6a?auto=format&fit=crop&w=800&q=85'
    },
    {
      roman: 'II',
      key: 'lien-ket',
      title: 'Relationships',
      desc: 'Những mối quan hệ và liên kết',
      sub: '5 Lời thề & Định mệnh',
      bg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=85'
    },
    {
      roman: 'III',
      key: 'the-gioi',
      title: 'Worlds',
      desc: 'Những thế giới được tạo nên',
      sub: '4 Lãnh địa & Kỳ quan',
      bg: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=85'
    },
    {
      roman: 'IV',
      key: 'lore',
      title: 'Lore',
      desc: 'Những câu chuyện chưa được kể',
      sub: '3 Biên niên sử cổ',
      bg: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=85'
    }
  ];

  return (
    <section className="py-7 border-b border-[#d9cfc3]">
      <div className="mb-4">
        <span className="block font-inter text-[11px] font-semibold uppercase tracking-[2px] text-[#746b65]">
          The collection
        </span>
        <h2 className="font-cormorant text-2xl sm:text-[29px] font-bold text-[#1d1918]">
          Kho lưu trữ thư tịch & nhân vật
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {archives.map((item) => (
          <article
            key={item.key}
            id={`archive-card-${item.key}`}
            onClick={() => {
              soundEffects.playPageTurn();
              onSelectArchive(item.key);
            }}
            className="group relative min-h-[160px] cursor-pointer overflow-hidden rounded-lg bg-[#351016] p-5 sm:p-6 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-end"
          >
            {/* Background Image with Dark Burgundy Gradient */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${item.bg})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#28080d]/95 via-[#28080d]/60 to-[#28080d]/30" />

            {/* Inner Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="font-cormorant text-sm font-semibold tracking-[2px] text-[#d4bb86]">
                  {item.roman}
                </span>
                <span className="text-[10px] uppercase font-sans tracking-widest text-[#d9cfc3]/80 bg-[#5b1824]/60 px-2 py-0.5 rounded">
                  {item.sub}
                </span>
              </div>

              <h3 className="font-cormorant text-2xl sm:text-[28px] font-bold text-white group-hover:text-[#d4bb86] transition-colors mt-1">
                {item.title}
              </h3>

              <p className="text-xs text-white/80 tracking-wide mt-1 line-clamp-1">
                {item.desc}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
