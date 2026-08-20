import React from 'react';
import { Search, Volume2, VolumeX, Heart, Feather } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface TopBarProps {
  onOpenSearch: () => void;
  onOpenContact: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  followerCount: number;
  isFollowing: boolean;
  onToggleFollow: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSearch,
  onOpenContact,
  isMuted,
  onToggleMute,
  followerCount,
  isFollowing,
  onToggleFollow
}) => {
  return (
    <header className="sticky top-0 z-40 h-[66px] border-b border-[#d9cfc3] bg-[#fffdf9]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-full max-w-[960px] items-center justify-between px-5 sm:px-8">
        
        {/* Brand */}
        <div 
          onClick={() => {
            soundEffects.playPageTurn();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="group flex cursor-pointer items-center gap-2"
        >
          <span className="text-[#a88956] transition-transform duration-300 group-hover:rotate-12">✦</span>
          <span className="font-cormorant text-2xl sm:text-[27px] font-semibold tracking-wide text-[#1d1918] transition-colors group-hover:text-[#5b1824]">
            L’amour est Hera
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Follow Badge */}
          <button
            id="topbar-follow-btn"
            onClick={() => {
              soundEffects.playAntiqueChime(600);
              onToggleFollow();
            }}
            className={`hidden md:flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
              isFollowing 
                ? 'border-[#5b1824] bg-[#5b1824] text-white shadow-sm' 
                : 'border-[#d9cfc3] bg-[#f7f3ed] text-[#746b65] hover:border-[#a88956] hover:text-[#1d1918]'
            }`}
            title={isFollowing ? 'Bỏ theo dõi' : 'Theo dõi kho lưu trữ'}
          >
            <Heart className={`h-3.5 w-3.5 ${isFollowing ? 'fill-current text-white' : 'text-[#5b1824]'}`} />
            <span>{followerCount}</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            id="topbar-sound-btn"
            onClick={() => {
              onToggleMute();
              soundEffects.playAntiqueChime(480);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9cfc3] bg-[#fffdf9] text-[#746b65] transition-colors hover:border-[#a88956] hover:text-[#5b1824]"
            title={isMuted ? 'Bật âm thanh cổ điển' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {/* Search Trigger */}
          <button
            id="topbar-search-btn"
            onClick={() => {
              soundEffects.playPageTurn();
              onOpenSearch();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9cfc3] bg-[#fffdf9] text-[#746b65] transition-colors hover:border-[#a88956] hover:text-[#5b1824]"
            title="Tìm kiếm nhân vật & thư tịch (Ctrl + K)"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Contact / Seal Letter Trigger */}
          <button
            id="topbar-contact-btn"
            onClick={() => {
              soundEffects.playPageTurn();
              onOpenContact();
            }}
            className="flex items-center gap-1.5 rounded-md bg-[#5b1824] px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white shadow-sm transition-all hover:bg-[#351016] active:scale-95"
          >
            <Feather className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Gửi thư</span>
          </button>

        </div>
      </div>
    </header>
  );
};
