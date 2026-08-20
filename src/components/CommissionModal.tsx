import React, { useState, useRef, useEffect } from 'react';
import { soundEffects } from '../utils/audio';

interface CommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMISSION_IMAGES = [
  "https://files.catbox.moe/mlfkl8.png",
  "https://files.catbox.moe/s3xtbs.jpg",
  "https://files.catbox.moe/hgweu6.png",
  "https://files.catbox.moe/80tnj2.png",
  "https://files.catbox.moe/6gf7fs.png"
];

export const CommissionModal: React.FC<CommissionModalProps> = ({ isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = 0;
      }
    }
  }, [isOpen]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollPosition = scrollContainerRef.current.scrollLeft;
      const width = scrollContainerRef.current.offsetWidth;
      const newIndex = Math.round(scrollPosition / width);
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        soundEffects.playSelectClick(); // play subtle sound on slide change
      }
    }
  };

  const scrollTo = (index: number) => {
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: width * index,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
      soundEffects.playPageTurn();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFFCFA] w-full max-w-2xl h-[90vh] md:h-[85vh] md:rounded-2xl shadow-[0_24px_70px_rgba(185,149,167,0.3)] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="text-white text-sm font-bold tracking-widest drop-shadow-md">
            BẢNG GIÁ COMMISSION
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-lg font-bold backdrop-blur-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Swipeable Carousel */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory flex no-scrollbar"
        >
          {COMMISSION_IMAGES.map((src, index) => (
            <div 
              key={index}
              className="relative w-full h-full flex-shrink-0 snap-center flex items-center justify-center bg-[#E9BBCD]/20"
            >
              <img 
                src={src} 
                alt={`Commission Page ${index + 1}`}
                className="w-full h-full object-contain"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-2.5 z-10">
          {COMMISSION_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer shadow-sm ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>

        {/* Left/Right Arrows for Desktop */}
        {currentIndex > 0 && (
          <button 
            onClick={() => scrollTo(currentIndex - 1)}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white items-center justify-center backdrop-blur-sm transition-colors z-10"
          >
            ‹
          </button>
        )}
        {currentIndex < COMMISSION_IMAGES.length - 1 && (
          <button 
            onClick={() => scrollTo(currentIndex + 1)}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white items-center justify-center backdrop-blur-sm transition-colors z-10"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
};
