import React, { useState } from 'react';
import { Relationship, Character } from '../types';
import { HeartHandshake, ArrowRightLeft, Sparkles, User } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface RelationshipMatrixProps {
  relationships: Relationship[];
  characters: Character[];
  onSelectCharacterById: (id: string) => void;
}

export const RelationshipMatrix: React.FC<RelationshipMatrixProps> = ({
  relationships,
  characters,
  onSelectCharacterById
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const types = ['all', 'Lời thề', 'Tri kỷ', 'Đối thủ', 'Tình cảm sâu kín', 'Đồng minh'];

  const filtered = relationships.filter((r) => {
    return filterType === 'all' || r.relationType === filterType;
  });

  return (
    <section className="py-7 border-b border-[#d9cfc3]">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="block font-inter text-[11px] font-semibold uppercase tracking-[2px] text-[#746b65]">
            Bonds & Destinies
          </span>
          <h2 className="font-cormorant text-2xl sm:text-[32px] font-bold text-[#1d1918]">
            Mối Quan Hệ & Định Mệnh
          </h2>
          <p className="font-cormorant text-base sm:text-lg italic text-[#746b65] mt-0.5">
            Những sợi tơ vô hình đan cài giữa các linh hồn trong vương triều
          </p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 pt-1 no-scrollbar">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => {
              soundEffects.playPageTurn();
              setFilterType(t);
            }}
            className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
              filterType === t
                ? 'border-[#5b1824] bg-[#5b1824] text-white shadow-sm'
                : 'border-[#d9cfc3] bg-[#fffdf9] text-[#746b65] hover:border-[#a88956] hover:text-[#1d1918]'
            }`}
          >
            {t === 'all' ? 'Tất cả liên kết' : t}
          </button>
        ))}
      </div>

      {/* Relations Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((rel) => (
          <article
            key={rel.id}
            className="rounded-lg border border-[#d9cfc3] bg-[#fffdf9] p-5 shadow-sm transition-all duration-300 hover:border-[#a88956] hover:shadow-md flex flex-col justify-between"
          >
            <div>
              {/* Characters Pair Header */}
              <div className="flex items-center justify-between border-b border-[#ebe3d7] pb-4">
                
                {/* Character A */}
                <div
                  onClick={() => {
                    soundEffects.playPageTurn();
                    onSelectCharacterById(rel.characterAId);
                  }}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <img
                    src={rel.characterAAvatar}
                    alt={rel.characterAName}
                    className="h-12 w-12 rounded-full object-cover border-2 border-[#a88956] transition-transform group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="font-cormorant text-lg font-bold text-[#1d1918] group-hover:text-[#5b1824] transition-colors leading-tight">
                      {rel.characterAName}
                    </div>
                    <span className="text-[10px] text-[#746b65] uppercase">Xem hồ sơ</span>
                  </div>
                </div>

                {/* Relation Icon Badge in Center */}
                <div className="flex flex-col items-center px-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5b1824] text-white shadow-sm">
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                  </div>
                  <span className="mt-1 rounded bg-[#ebe3d7] px-1.5 py-0.5 font-cinzel text-[9px] font-bold text-[#5b1824] uppercase">
                    {rel.relationType}
                  </span>
                </div>

                {/* Character B */}
                <div
                  onClick={() => {
                    soundEffects.playPageTurn();
                    onSelectCharacterById(rel.characterBId);
                  }}
                  className="flex items-center gap-2.5 cursor-pointer group text-right flex-row-reverse"
                >
                  <img
                    src={rel.characterBAvatar}
                    alt={rel.characterBName}
                    className="h-12 w-12 rounded-full object-cover border-2 border-[#a88956] transition-transform group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="font-cormorant text-lg font-bold text-[#1d1918] group-hover:text-[#5b1824] transition-colors leading-tight">
                      {rel.characterBName}
                    </div>
                    <span className="text-[10px] text-[#746b65] uppercase">Xem hồ sơ</span>
                  </div>
                </div>

              </div>

              {/* Title & Description */}
              <div className="mt-4">
                <h4 className="font-cormorant text-xl font-bold text-[#5b1824]">
                  {rel.title}
                </h4>
                <p className="mt-1.5 font-cormorant text-base text-[#351016] leading-relaxed">
                  {rel.description}
                </p>
              </div>
            </div>

            {/* Quote Footer */}
            <div className="mt-4 pt-3 border-t border-[#ebe3d7]">
              <p className="font-cormorant text-base italic text-[#a88956]">
                {rel.quote}
              </p>
            </div>

          </article>
        ))}
      </div>
    </section>
  );
};
