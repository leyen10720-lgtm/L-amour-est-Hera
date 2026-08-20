import React, { useState } from 'react';
import { Character } from '../types';
import { Heart, BookOpen, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface CharacterListProps {
  characters: Character[];
  onSelectCharacter: (char: Character) => void;
  onLikeCharacter: (charId: string) => void;
  likedCharIds: Set<string>;
}

export const CharacterList: React.FC<CharacterListProps> = ({
  characters,
  onSelectCharacter,
  onLikeCharacter,
  likedCharIds
}) => {
  const [selectedFaction, setSelectedFaction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const factions = [
    { id: 'all', label: 'Tất cả các dòng dõi' },
    { id: 'Valois', label: 'Đại Lãnh Địa Valois' },
    { id: 'Silver Veil', label: 'Hiệp Sĩ Màn Bạc' },
    { id: 'Glass Library', label: 'Thư Viện Thủy Tinh' },
    { id: 'White Spire', label: 'Bạch Tháp Thiên Văn' },
    { id: 'Opera of Shadows', label: 'Nhà Hát Vô Hình' },
    { id: 'Gilded Tribunal', label: 'Tòa Thánh Ánh Vàng' }
  ];

  const filteredCharacters = characters.filter((c) => {
    const matchesFaction =
      selectedFaction === 'all' ||
      c.faction.toLowerCase().includes(selectedFaction.toLowerCase());
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vietnameseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.englishTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFaction && matchesSearch;
  });

  return (
    <section className="py-7 border-b border-[#d9cfc3]">
      {/* Section Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="block font-inter text-[11px] font-semibold uppercase tracking-[2px] text-[#746b65]">
            Roster & Dossiers
          </span>
          <h2 className="font-cormorant text-2xl sm:text-[32px] font-bold text-[#1d1918]">
            Hồ Sơ Nhân Vật Fictional
          </h2>
          <p className="font-cormorant text-base sm:text-lg italic text-[#746b65] mt-0.5">
            Những linh hồn dệt nên câu chuyện tình và vận mệnh đế chế
          </p>
        </div>

        {/* Search input in list */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Tìm kiếm nhân vật..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-[#d9cfc3] bg-[#fffdf9] px-3 py-1.5 text-xs text-[#1d1918] placeholder-[#746b65] focus:border-[#5b1824] focus:outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Faction Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 pt-1 no-scrollbar">
        {factions.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              soundEffects.playPageTurn();
              setSelectedFaction(f.id);
            }}
            className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
              selectedFaction === f.id
                ? 'border-[#5b1824] bg-[#5b1824] text-white shadow-sm'
                : 'border-[#d9cfc3] bg-[#fffdf9] text-[#746b65] hover:border-[#a88956] hover:text-[#1d1918]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Character Cards Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCharacters.map((char) => {
          const isLiked = likedCharIds.has(char.id);
          return (
            <article
              key={char.id}
              id={`character-card-${char.id}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-[#d9cfc3] bg-[#fffdf9] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#a88956] hover:shadow-lg"
            >
              {/* Card Top Banner / Static Character Image */}
              <div 
                onClick={() => {
                  soundEffects.playPageTurn();
                  onSelectCharacter(char);
                }}
                className="character-image relative h-64 w-full cursor-pointer overflow-hidden bg-[#351016]"
              >
                <img
                  src={char.avatarUrl}
                  data-asset-id="192292ee1647401d6f963dd4684dc21f"
                  alt="Character"
                  draggable={false}
                  className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Subtle vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1d1918]/80 via-[#1d1918]/20 to-transparent" />

                {/* Status / Role Tag */}
                <div className="absolute top-3 left-3 rounded-lg bg-[#351016]/85 backdrop-blur-md px-2.5 py-1 border border-[#d4bb86]/50 text-[10px] font-cinzel font-semibold text-[#d4bb86] max-w-[85%] leading-tight text-left">
                  {char.role}
                </div>

                {/* Bottom title on image */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#d4bb86]">
                    {char.vietnameseTitle}
                  </div>
                  <h3 className="font-cormorant text-2xl font-bold tracking-wide">
                    {char.name}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#746b65] font-semibold">
                    {char.faction}
                  </div>

                  <p className="mt-2 font-cormorant text-base italic text-[#554a45] line-clamp-2 leading-snug">
                    {char.vietnameseQuote}
                  </p>
                </div>

                {/* Quick Info & Read Button */}
                <div className="mt-4 pt-3 border-t border-[#ebe3d7] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#746b65]">
                    <Sparkles className="h-3.5 w-3.5 text-[#a88956]" />
                    <span>{char.origin.split(' ')[0]}</span>
                  </div>

                  <button
                    onClick={() => {
                      soundEffects.playPageTurn();
                      onSelectCharacter(char);
                    }}
                    className="flex items-center gap-1 font-cormorant text-base font-bold text-[#5b1824] hover:text-[#351016] transition-colors"
                  >
                    <span>Xem Hồ Sơ</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

              </div>

            </article>
          );
        })}
      </div>

      {filteredCharacters.length === 0 && (
        <div className="text-center py-12 bg-[#fffdf9] border border-[#d9cfc3] rounded-lg">
          <p className="font-cormorant text-xl italic text-[#746b65]">
            Không tìm thấy nhân vật nào phù hợp với từ khóa này.
          </p>
        </div>
      )}

    </section>
  );
};
