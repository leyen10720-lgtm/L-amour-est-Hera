import React, { useState } from 'react';
import { WorldRealm } from '../types';
import { Compass, MapPin, Sparkles, Wind, Eye } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface WorldLoreSectionProps {
  worlds: WorldRealm[];
}

export const WorldLoreSection: React.FC<WorldLoreSectionProps> = ({ worlds }) => {
  const [selectedWorld, setSelectedWorld] = useState<WorldRealm | null>(worlds[0] || null);

  return (
    <section className="py-7 border-b border-[#d9cfc3]">
      {/* Header */}
      <div className="mb-6">
        <span className="block font-inter text-[11px] font-semibold uppercase tracking-[2px] text-[#746b65]">
          Realms & Architecture
        </span>
        <h2 className="font-cormorant text-2xl sm:text-[32px] font-bold text-[#1d1918]">
          Thế Giới & Các Vùng Đất Kỳ Quan
        </h2>
        <p className="font-cormorant text-base sm:text-lg italic text-[#746b65] mt-0.5">
          Những lâu đài cổ, thư viện vô tận và thánh đường sâu thẳm
        </p>
      </div>

      {/* World Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {worlds.map((w) => (
          <article
            key={w.id}
            onClick={() => {
              soundEffects.playPageTurn();
              setSelectedWorld(w);
            }}
            className={`group cursor-pointer overflow-hidden rounded-xl border transition-all duration-300 ${
              selectedWorld?.id === w.id
                ? 'border-[#5b1824] ring-2 ring-[#5b1824]/20 shadow-lg'
                : 'border-[#d9cfc3] bg-[#fffdf9] hover:border-[#a88956] hover:shadow-md'
            }`}
          >
            {/* Landscape Banner */}
            <div className="relative h-52 w-full overflow-hidden bg-[#351016]">
              <img
                src={w.bannerUrl}
                alt={w.name}
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1d1918]/90 via-[#1d1918]/30 to-transparent" />
              
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[11px] font-serif italic text-[#d4bb86]">
                  {w.frenchTitle}
                </span>
                <h3 className="font-cormorant text-2xl font-bold">
                  {w.name}
                </h3>
              </div>
            </div>

            {/* Card Info */}
            <div className="p-5 bg-[#fffdf9]">
              <p className="font-cormorant text-base italic text-[#5b1824] mb-3">
                “{w.tagline}”
              </p>
              
              <p className="font-cormorant text-base text-[#351016] leading-relaxed line-clamp-3">
                {w.description}
              </p>

              {/* Landmarks preview */}
              <div className="mt-4 pt-3 border-t border-[#ebe3d7] space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-[#746b65] tracking-wider block">
                  Địa danh nổi bật
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {w.landmarks.map((l, i) => (
                    <span
                      key={i}
                      className="rounded bg-[#f7f3ed] px-2 py-0.5 text-xs text-[#1d1918] border border-[#d9cfc3]"
                    >
                      ✦ {l.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Atmosphere */}
              <div className="mt-3 flex items-center gap-2 text-xs text-[#746b65] italic font-serif">
                <Wind className="h-3.5 w-3.5 text-[#a88956]" />
                <span>Không khí: {w.atmosphere}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Selected World Focus Inspector */}
      {selectedWorld && (
        <div className="mt-8 rounded-xl border border-[#a88956] bg-[#fffdf9] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d9cfc3] pb-4">
            <div>
              <span className="text-xs uppercase font-cinzel tracking-wider text-[#a88956]">
                Khảo Luận Vùng Đất
              </span>
              <h3 className="font-cormorant text-3xl font-bold text-[#1d1918]">
                {selectedWorld.name} ({selectedWorld.frenchTitle})
              </h3>
            </div>
            <div className="rounded-full bg-[#ebe3d7] px-3 py-1 text-xs font-semibold text-[#5b1824]">
              {selectedWorld.geography}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-cormorant text-xl font-bold text-[#1d1918] mb-2">
                Tổng quan & Nền Văn Minh
              </h4>
              <p className="font-cormorant text-lg text-[#351016] leading-relaxed">
                {selectedWorld.description}
              </p>
              
              <div className="mt-4 rounded-lg bg-[#f7f3ed] p-4 border border-[#d9cfc3]">
                <strong className="text-xs font-semibold uppercase text-[#5b1824] block mb-1">
                  Phong tục & Tập quán
                </strong>
                <p className="font-cormorant text-base text-[#1d1918]">
                  {selectedWorld.culture}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-cormorant text-xl font-bold text-[#1d1918] mb-2">
                Kỳ Quan Kiến Trúc
              </h4>
              <div className="space-y-3">
                {selectedWorld.landmarks.map((l, i) => (
                  <div key={i} className="rounded-lg border border-[#d9cfc3] bg-white p-3.5 shadow-2xs">
                    <strong className="font-cormorant text-lg text-[#5b1824] block">
                      ✦ {l.name}
                    </strong>
                    <p className="font-cormorant text-base text-[#554a45] mt-0.5">
                      {l.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

    </section>
  );
};
