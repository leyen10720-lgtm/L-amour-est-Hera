import React, { useState } from 'react';
import { LoreChapter } from '../types';
import { X, BookOpen, Clock, Calendar, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Type, Sun, Moon } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface LoreReaderModalProps {
  chapter: LoreChapter | null;
  allChapters: LoreChapter[];
  onClose: () => void;
  onSelectChapter: (chapter: LoreChapter) => void;
  isBookmarked: boolean;
  onToggleBookmark: (chapterId: string) => void;
}

export const LoreReaderModal: React.FC<LoreReaderModalProps> = ({
  chapter,
  allChapters,
  onClose,
  onSelectChapter,
  isBookmarked,
  onToggleBookmark
}) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('normal');
  const [readingTheme, setReadingTheme] = useState<'parchment' | 'sepia' | 'dark'>('parchment');

  if (!chapter) return null;

  const currentIndex = allChapters.findIndex((c) => c.id === chapter.id);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  const themeClasses = {
    parchment: 'bg-[#fffdf9] text-[#1d1918] border-[#a88956]',
    sepia: 'bg-[#f4ecd8] text-[#2b2118] border-[#a88956]',
    dark: 'bg-[#181514] text-[#ebe3d7] border-[#5b1824]'
  };

  const textSizes = {
    normal: 'text-lg leading-relaxed',
    large: 'text-xl leading-loose',
    huge: 'text-2xl leading-loose'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1d1918]/85 p-2 sm:p-6 backdrop-blur-md overflow-y-auto animate-fadeIn">
      
      {/* Reader Container */}
      <div className={`relative my-auto w-full max-w-[800px] overflow-hidden rounded-xl border shadow-2xl transition-colors duration-300 ${themeClasses[readingTheme]}`}>
        
        {/* Reader Top Controls */}
        <div className="flex items-center justify-between border-b border-[#d9cfc3]/50 px-5 sm:px-8 py-3.5 bg-black/5">
          
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#a88956]">
              {chapter.chapterNumber} · {chapter.category}
            </span>
          </div>

          {/* Controls: Font size, Theme, Bookmark, Close */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Font Size Toggles */}
            <div className="flex items-center rounded border border-[#d9cfc3]/70 px-1.5 py-0.5">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-1.5 py-0.5 text-xs font-serif ${fontSize === 'normal' ? 'font-bold text-[#5b1824]' : 'opacity-60'}`}
                title="Cỡ chữ chuẩn"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-1.5 py-0.5 text-sm font-serif ${fontSize === 'large' ? 'font-bold text-[#5b1824]' : 'opacity-60'}`}
                title="Cỡ chữ vừa"
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('huge')}
                className={`px-1.5 py-0.5 text-base font-serif ${fontSize === 'huge' ? 'font-bold text-[#5b1824]' : 'opacity-60'}`}
                title="Cỡ chữ lớn"
              >
                A++
              </button>
            </div>

            {/* Theme Picker */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setReadingTheme('parchment')}
                className={`h-6 w-6 rounded-full border border-[#d9cfc3] bg-[#fffdf9] ${readingTheme === 'parchment' ? 'ring-2 ring-[#5b1824]' : ''}`}
                title="Giao diện Giấy Trắng"
              />
              <button
                onClick={() => setReadingTheme('sepia')}
                className={`h-6 w-6 rounded-full border border-[#d9cfc3] bg-[#f4ecd8] ${readingTheme === 'sepia' ? 'ring-2 ring-[#5b1824]' : ''}`}
                title="Giao diện Giấy Da Cổ"
              />
              <button
                onClick={() => setReadingTheme('dark')}
                className={`h-6 w-6 rounded-full border border-[#5b1824] bg-[#181514] ${readingTheme === 'dark' ? 'ring-2 ring-[#d4bb86]' : ''}`}
                title="Giao diện Đêm Huyền Bí"
              />
            </div>

            {/* Bookmark */}
            <button
              onClick={() => {
                soundEffects.playAntiqueChime(640);
                onToggleBookmark(chapter.id);
              }}
              className="flex h-8 w-8 items-center justify-center rounded border border-[#d9cfc3]/70 transition-colors"
              title={isBookmarked ? 'Đã đánh dấu trang' : 'Đánh dấu chương này'}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-[#5b1824] fill-current" />
              ) : (
                <Bookmark className="h-4 w-4 opacity-70" />
              )}
            </button>

            {/* Close */}
            <button
              onClick={() => {
                soundEffects.playPageTurn();
                onClose();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 hover:bg-[#5b1824] hover:text-white transition-colors"
              title="Đóng sách"
            >
              <X className="h-4 w-4" />
            </button>

          </div>
        </div>

        {/* Reader Content Body */}
        <div className="max-h-[70vh] overflow-y-auto px-6 sm:px-12 py-8 sm:py-10">
          
          {/* Header Title in Book */}
          <div className="text-center border-b border-[#d9cfc3]/60 pb-6 mb-8">
            <span className="font-cinzel text-xs uppercase tracking-[3px] text-[#a88956]">
              {chapter.chapterNumber} · L’amour est Hera
            </span>
            <h2 className="font-cormorant text-3xl sm:text-4xl font-bold mt-2">
              {chapter.title}
            </h2>
            <p className="font-cormorant text-lg italic text-[#a88956] mt-1">
              {chapter.subtitle}
            </p>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs opacity-70">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {chapter.dateInStory}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {chapter.readTime}
              </span>
            </div>
          </div>

          {/* Paragraphs with Drop Cap on First Paragraph */}
          <div className="space-y-6">
            {chapter.content.map((paragraph, index) => {
              if (index === 0) {
                const firstLetter = paragraph.charAt(0);
                const restText = paragraph.slice(1);
                return (
                  <p key={index} className={`font-cormorant ${textSizes[fontSize]}`}>
                    <span className="float-left mr-2.5 font-cinzel text-4xl sm:text-5xl font-bold text-[#5b1824] leading-none pt-1">
                      {firstLetter}
                    </span>
                    {restText}
                  </p>
                );
              }
              return (
                <p key={index} className={`font-cormorant ${textSizes[fontSize]}`}>
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* End of chapter ornament */}
          <div className="mt-12 text-center">
            <span className="text-[#a88956] tracking-[6px]">✦ ✦ ✦</span>
            <div className="mt-3 font-italianno text-3xl text-[#5b1824]">
              L’amour est Hera — Ký ức vĩnh cửu
            </div>
          </div>

        </div>

        {/* Chapter Navigation Footer */}
        <div className="flex items-center justify-between border-t border-[#d9cfc3]/50 px-6 sm:px-10 py-4 bg-black/5">
          {prevChapter ? (
            <button
              onClick={() => {
                soundEffects.playPageTurn();
                onSelectChapter(prevChapter);
              }}
              className="flex items-center gap-1 text-xs sm:text-sm font-semibold hover:text-[#5b1824] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Chương trước: {prevChapter.title}</span>
            </button>
          ) : (
            <div />
          )}

          {nextChapter ? (
            <button
              onClick={() => {
                soundEffects.playPageTurn();
                onSelectChapter(nextChapter);
              }}
              className="flex items-center gap-1 text-xs sm:text-sm font-semibold hover:text-[#5b1824] transition-colors ml-auto"
            >
              <span>Chương sau: {nextChapter.title}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <div />
          )}
        </div>

      </div>

    </div>
  );
};
