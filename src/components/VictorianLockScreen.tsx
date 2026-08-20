import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, Volume2, VolumeX, Music } from 'lucide-react';
import { soundEffects } from '../utils/audio';

const LOCK_SCREEN_BG_URL = 'https://files.catbox.moe/z27ksh.jpg';
const DISCORD_URL = 'https://discord.gg/moonlightvow';
const FACEBOOK_URL = 'https://www.facebook.com/share/18psNny1Eh/';

interface VictorianLockScreenProps {
  onEnterArchive: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onOpenAdmin?: () => void;
}

export const VictorianLockScreen: React.FC<VictorianLockScreenProps> = ({
  onEnterArchive,
  isMuted = false,
  onToggleMute,
  onOpenAdmin
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const handleBarClick = () => {
    if (isLoading) return;
    setIsLoading(true);
    soundEffects.playAntiqueChime(660);

    // Smooth loading sequence into archive
    setLoadingProgress(35);
    setTimeout(() => {
      setLoadingProgress(75);
      soundEffects.playPageTurn();
    }, 220);

    setTimeout(() => {
      setLoadingProgress(100);
      soundEffects.playBell(880);
      setTimeout(() => {
        onEnterArchive();
      }, 180);
    }, 550);
  };

  const handleSocialClick = () => {
    soundEffects.playAntiqueChime(520);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center text-[#4D4449] select-none font-montserrat overflow-hidden px-4 sm:px-6 py-6 sm:py-8 bg-[#FFF8F3]">
      
      {/* 1. MÀN HÌNH CHỜ: NỀN ẢNH MỜ NGHỆ THUẬT */}
      <div 
        className="absolute inset-0 -z-20 bg-cover bg-center transition-all duration-1000 scale-105 blur-[3px] opacity-75"
        style={{
          backgroundImage: `url(${LOCK_SCREEN_BG_URL})`
        }}
      />

      {/* Vanilla Cream & Soft Tint Overlays */}
      <div className="absolute inset-0 -z-10 bg-[#FFF8F3]/65 backdrop-blur-[2px] pointer-events-none" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#FFF8F3]/80 via-transparent to-[#FBE3EC]/50 pointer-events-none" />

      {/* TOP FLOATING HEADER */}
      <header className="relative w-full max-w-[420px] flex items-center justify-between z-20 pt-1 pb-2">
        <div className="flex items-center gap-1 text-[#76636E] text-[10px] font-bold uppercase tracking-[2px]">
          <span>✦</span>
          <span>Hera Esther</span>
        </div>
        {onOpenAdmin && (
          <button
            onClick={() => {
              soundEffects.playPageTurn();
              onOpenAdmin();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#E9BBCD] bg-[#FFFCFA]/80 hover:bg-[#FBE3EC] text-[#76636E] hover:text-[#4D4449] text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer shadow-xs"
            title="Khu vực Quản trị viên (Admin Portal)"
          >
            <span>🔒 Admin</span>
          </button>
        )}
      </header>

      {/* 2. CENTER CONTENT BLOCK: KHUNG ẢNH XÉO XÉO NGHỆ THUẬT, QUOTE & "VÀO THAM QUAN" */}
      <main className="relative w-full max-w-[420px] flex flex-col items-center text-center px-4 z-10 my-auto">
        
        {/* Tilted Romantic Photo Card */}
        <div className="mb-6 relative group">
          <div className="character-image relative w-52 h-64 sm:w-56 sm:h-72 rounded-2xl p-2 bg-gradient-to-b from-[#FFFCFA]/90 to-[#FFF8F3]/90 border border-[#E9BBCD] shadow-[0_18px_50px_rgba(118,99,110,0.14)] backdrop-blur-sm transform -rotate-3 group-hover:rotate-0 transition-transform duration-500 overflow-hidden">
            <img
              src={LOCK_SCREEN_BG_URL}
              data-asset-id="192292ee1647401d6f963dd4684dc21f"
              alt="Character"
              draggable={false}
              className="w-full h-full object-cover rounded-xl filter contrast-[1.03] brightness-[0.98] transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            {/* Soft dreamy sheen overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#FBE3EC]/20 via-transparent to-white/30 pointer-events-none" />
          </div>
        </div>

        {/* Center Romantic Quote */}
        <blockquote 
          className="text-2xl sm:text-3xl font-normal italic text-[#4D4449] leading-snug drop-shadow-sm mb-3"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          “Some stories
          <br />
          deserve to be remembered.”
        </blockquote>

        <div 
          className="text-[10px] sm:text-[11px] tracking-[5px] uppercase text-[#76636E] font-semibold mb-6"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          L’AMOUR EST HERA
        </div>

        {/* =========================================================
            THANH BẤM "VÀO THAM QUAN" (Vị trí trung tâm thanh lịch)
           ========================================================= */}
        <div className="w-full max-w-[320px] relative">
          
          {!isLoading ? (
            <button
              id="enter-visit-bar"
              onClick={handleBarClick}
              className="group relative w-full h-[50px] rounded-full border border-[#E9BBCD] bg-gradient-to-r from-[#FFFCFA]/95 via-[#FFF8F3]/95 to-[#FFFCFA]/95 px-3.5 sm:px-4 shadow-[0_18px_50px_rgba(118,99,110,0.14)] backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:border-[#D8A7BB] hover:shadow-[0_24px_70px_rgba(185,149,167,0.22)] active:scale-[0.97] flex items-center justify-between cursor-pointer overflow-hidden"
            >
              {/* Shimmer sweep animation */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-700 bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform pointer-events-none" />

              {/* Left Heart Symbol Circle */}
              <div className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full border border-[#D8A7BB] bg-[#FBE3EC] text-[#76636E] text-sm font-bold group-hover:bg-[#B995A7] group-hover:text-[#FFFCFA] transition-colors shadow-inner">
                ❦
              </div>

              {/* Center Text: "Lật Mở Chương Cổ Tích" */}
              <span 
                className="text-[1.05rem] sm:text-[1.15rem] font-bold text-[#4D4449] tracking-wide flex-1 text-center px-1.5 whitespace-nowrap"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Lật Mở Chương Cổ Tích
              </span>

              {/* Right Arrow indicator */}
              <ArrowRight className="h-4 w-4 text-[#76636E] group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
          ) : (
            /* Loading State Bar */
            <div className="w-full h-[50px] rounded-full border border-[#D8A7BB] bg-[#FFFCFA]/95 px-4 flex flex-col justify-center shadow-md animate-fadeIn backdrop-blur-md">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#76636E] mb-1 font-cinzel">
                <span className="tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 animate-spin text-[#B995A7]" />
                  ĐANG MỞ THƯ VIỆN...
                </span>
                <span>{loadingProgress}%</span>
              </div>
              
              {/* Soft Pink Mauve Progress Fill */}
              <div className="h-1.5 w-full rounded-full bg-[#FBE3EC] overflow-hidden p-[0.5px]">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#C4A1B2] via-[#B995A7] to-[#AE899D] shadow-[0_0_6px_rgba(244,209,222,0.8)] transition-all duration-200 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="text-center mt-2.5">
            <span 
              className="text-[10px] tracking-[3px] uppercase text-[#76636E] font-medium"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              CHẠM ĐỂ MỞ
            </span>
          </div>

        </div>

      </main>

      {/* =========================================================
          3. 2 PHÍM TRÒN DƯỚI CHÂN TRANG: DISCORD (TRÁI) & FACEBOOK PAGE (PHẢI)
         ========================================================= */}
      <footer className="relative w-full max-w-[420px] flex items-center justify-between px-6 pb-12 sm:pb-8 z-10">
        
        {/* Left Circular Button: Discord Server */}
        <div className="flex flex-col items-center gap-1.5">
          <a
            id="lockscreen-discord-btn"
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleSocialClick}
            className="group flex h-12 w-12 items-center justify-center rounded-full border border-[#E9BBCD] bg-[#FFFCFA]/90 text-[#76636E] shadow-[0_18px_50px_rgba(118,99,110,0.14)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-[#E2CFA9] hover:bg-[#B995A7] hover:text-[#FFFCFA] hover:shadow-[0_24px_70px_rgba(185,149,167,0.22)] active:scale-95 cursor-pointer"
            title="Tham gia Discord Server Moonlight Vow"
          >
            {/* Discord Icon SVG */}
            <svg 
              className="h-5 w-5 fill-current transition-colors" 
              viewBox="0 0 24 24"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </a>
          <span 
            className="text-[11px] font-semibold tracking-wider text-[#76636E] uppercase font-cinzel"
          >
            Discord
          </span>
        </div>

        {/* Right Circular Button: Facebook Page */}
        <div className="flex flex-col items-center gap-1.5">
          <a
            id="lockscreen-facebook-btn"
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleSocialClick}
            className="group flex h-12 w-12 items-center justify-center rounded-full border border-[#E9BBCD] bg-[#FFFCFA]/90 text-[#76636E] shadow-[0_18px_50px_rgba(118,99,110,0.14)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-[#E2CFA9] hover:bg-[#B995A7] hover:text-[#FFFCFA] hover:shadow-[0_24px_70px_rgba(185,149,167,0.22)] active:scale-95 cursor-pointer"
            title="Truy cập Page Facebook"
          >
            {/* Facebook Icon SVG */}
            <svg 
              className="h-5 w-5 fill-current transition-colors" 
              viewBox="0 0 24 24"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <span 
            className="text-[11px] font-semibold tracking-wider text-[#76636E] uppercase font-cinzel"
          >
            Facebook
          </span>
        </div>

      </footer>
    </div>
  );
};
