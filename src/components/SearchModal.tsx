import React, { useState, useMemo } from 'react';
import { Character, WorldRealm, LoreChapter, Relationship } from '../types';
import { Search, X, Users, Compass, Scroll, ArrowRight } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  worlds: WorldRealm[];
  lore: LoreChapter[];
  relationships: Relationship[];
  onSelectCharacter: (c: Character) => void;
  onSelectLore: (l: LoreChapter) => void;
  onSelectTab: (tab: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  characters,
  worlds,
  lore,
  relationships,
  onSelectCharacter,
  onSelectLore,
  onSelectTab
}) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return { characters: [], worlds: [], lore: [] };
    const q = query.toLowerCase();

    const matchedChars = characters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.vietnameseTitle || '').toLowerCase().includes(q) ||
        (c.englishTitle || '').toLowerCase().includes(q) ||
        (c.faction || '').toLowerCase().includes(q) ||
        (c.quote || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.tags || []).some((t) => t.toLowerCase().includes(q))
    );

    const matchedWorlds = worlds.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.frenchTitle.toLowerCase().includes(q) ||
        w.tagline.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q)
    );

    const matchedLore = lore.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.subtitle.toLowerCase().includes(q) ||
        l.excerpt.toLowerCase().includes(q) ||
        l.content.some((p) => p.toLowerCase().includes(q))
    );

    return {
      characters: matchedChars,
      worlds: matchedWorlds,
      lore: matchedLore
    };
  }, [query, characters, worlds, lore]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-[#1d1918]/80 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative my-8 sm:my-16 w-full max-w-[650px] overflow-hidden rounded-xl border border-[#a88956] bg-[#fffdf9] p-5 sm:p-6 shadow-2xl">
        
        {/* Search Bar Input */}
        <div className="flex items-center gap-3 border-b border-[#d9cfc3] pb-3.5">
          <Search className="h-5 w-5 text-[#5b1824]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm nhân vật, lãnh địa, lore, trích dẫn..."
            className="flex-1 bg-transparent font-cormorant text-xl text-[#1d1918] placeholder-[#746b65] focus:outline-none"
          />
          <button
            onClick={() => {
              soundEffects.playPageTurn();
              onClose();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ebe3d7] text-[#1d1918] hover:bg-[#5b1824] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto mt-4 space-y-5">
          
          {!query.trim() && (
            <div className="py-8 text-center text-[#746b65]">
              <span className="text-[#a88956] text-xl block mb-1">✦</span>
              <p className="font-cormorant text-lg italic">
                Nhập tên nhân vật (Hera, Lucien, Céleste...), vùng đất hoặc từ khóa để tra cứu kho lưu trữ.
              </p>
            </div>
          )}

          {/* Character Matches */}
          {results.characters.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#5b1824] mb-2">
                <Users className="h-3.5 w-3.5" />
                <span>Nhân vật ({results.characters.length})</span>
              </div>
              <div className="space-y-2">
                {results.characters.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      soundEffects.playPageTurn();
                      onSelectCharacter(c);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-[#d9cfc3] hover:border-[#a88956] hover:bg-[#f7f3ed] cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={c.avatarUrl}
                        alt={c.name}
                        className="h-10 w-10 rounded-full object-cover border border-[#a88956]"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <strong className="font-cormorant text-lg text-[#1d1918] block leading-tight">{c.name}</strong>
                        <span className="text-xs text-[#746b65]">{c.vietnameseTitle}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#5b1824]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lore Matches */}
          {results.lore.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#5b1824] mb-2">
                <Scroll className="h-3.5 w-3.5" />
                <span>Lore & Thư Tịch ({results.lore.length})</span>
              </div>
              <div className="space-y-2">
                {results.lore.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => {
                      soundEffects.playPageTurn();
                      onSelectLore(l);
                      onClose();
                    }}
                    className="p-3 rounded-lg border border-[#d9cfc3] hover:border-[#a88956] hover:bg-[#f7f3ed] cursor-pointer transition-all"
                  >
                    <strong className="font-cormorant text-lg text-[#1d1918] block">{l.title}</strong>
                    <p className="text-xs text-[#746b65] line-clamp-1">{l.excerpt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* World Matches */}
          {results.worlds.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#5b1824] mb-2">
                <Compass className="h-3.5 w-3.5" />
                <span>Vùng đất & Kỳ quan ({results.worlds.length})</span>
              </div>
              <div className="space-y-2">
                {results.worlds.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => {
                      soundEffects.playPageTurn();
                      onSelectTab('the-gioi');
                      onClose();
                    }}
                    className="p-3 rounded-lg border border-[#d9cfc3] hover:border-[#a88956] hover:bg-[#f7f3ed] cursor-pointer transition-all"
                  >
                    <strong className="font-cormorant text-lg text-[#1d1918] block">{w.name} ({w.frenchTitle})</strong>
                    <p className="text-xs text-[#746b65] line-clamp-1">{w.tagline}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query.trim() &&
            results.characters.length === 0 &&
            results.lore.length === 0 &&
            results.worlds.length === 0 && (
              <div className="py-8 text-center text-[#746b65]">
                <p className="font-cormorant text-lg italic">
                  Không tìm thấy kết quả nào cho “{query}”.
                </p>
              </div>
            )}

        </div>

      </div>
    </div>
  );
};
