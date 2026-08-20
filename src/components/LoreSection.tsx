import React from 'react';
import { LoreChapter } from '../types';
import { BookOpen, Clock, Calendar, Bookmark, ChevronRight } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface LoreSectionProps {
  chapters: LoreChapter[];
  onOpenChapter: (chapter: LoreChapter) => void;
  bookmarkedIds: Set<string>;
}

export const LoreSection: React.FC<LoreSectionProps> = ({
  chapters,
  onOpenChapter,
  bookmarkedIds
}) => {
  return (
    <section className="py-7 border-b border-[#d9cfc3]">
      {/* Header */}
      <div className="mb-6">
        <span className="block font-inter text-[11px] font-semibold uppercase tracking-[2px] text-[#746b65]">
          Chronicles & Memoirs
        </span>
        <h2 className="font-cormorant text-2xl sm:text-[32px] font-bold text-[#1d1918]">
          Lore & Thư Tịch Cổ Đại
        </h2>
        <p className="font-cormorant text-base sm:text-lg italic text-[#746b65] mt-0.5">
          Những chương truyện chưa từng được kể, lưu giữ trọn vẹn trong kho lưu trữ
        </p>
      </div>

      {/* Chapters List */}
      <div className="space-y-4">
        {chapters.map((chap) => {
          const isBookmarked = bookmarkedIds.has(chap.id);
          return (
            <article
              key={chap.id}
              onClick={() => {
                soundEffects.playPageTurn();
                onOpenChapter(chap);
              }}
              className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#d9cfc3] bg-[#fffdf9] p-5 sm:p-6 shadow-sm transition-all duration-300 hover:border-[#a88956] hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#ebe3d7] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="rounded bg-[#5b1824] px-2 py-0.5 font-cinzel text-[10px] font-bold text-[#d4bb86] uppercase">
                    {chap.chapterNumber}
                  </span>
                  <span className="text-xs uppercase tracking-wider text-[#746b65] font-semibold">
                    {chap.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#746b65]">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-[#a88956]" />
                    {chap.dateInStory}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-[#a88956]" />
                    {chap.readTime}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#1d1918] group-hover:text-[#5b1824] transition-colors">
                  {chap.title}
                </h3>
                <p className="font-cormorant text-base sm:text-lg italic text-[#5b1824] mt-0.5">
                  {chap.subtitle}
                </p>

                <p className="font-cormorant text-base sm:text-lg text-[#554a45] mt-2.5 leading-relaxed line-clamp-2">
                  {chap.excerpt}
                </p>
              </div>

              {/* Bottom Action */}
              <div className="mt-4 pt-3 border-t border-[#ebe3d7] flex items-center justify-between">
                <span className="text-xs font-serif italic text-[#a88956]">
                  ✦ Nhấp để mở sách & đọc toàn chương
                </span>

                <div className="flex items-center gap-1 font-cormorant text-base font-bold text-[#5b1824] group-hover:translate-x-1 transition-transform">
                  <span>Mở Sách</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

            </article>
          );
        })}
      </div>
    </section>
  );
};
