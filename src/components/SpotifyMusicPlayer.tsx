import React, { useState, useEffect, useRef } from 'react';
import { Music, Disc3, X, ExternalLink, Play, Pause, Volume2, VolumeX, Sparkles, SkipForward, SkipBack } from 'lucide-react';
import { soundEffects } from '../utils/audio';

export interface TrackInfo {
  id: string;
  title: string;
  artist: string;
  spotifyUrl: string;
  youtubeId: string;
  coverUrl: string;
}

const PLAYLIST: TrackInfo[] = [
  {
    id: 'salvatore',
    title: 'Salvatore',
    artist: 'Lana Del Rey',
    spotifyUrl: 'https://open.spotify.com/track/21qg0IBZf8R12qHd9A3AA4?si=wfAk4pvVSx6GkGnct5-Obw',
    youtubeId: '_oUu2QD2g_s', // Lana Del Rey - Salvatore Official Audio
    coverUrl: 'https://files.catbox.moe/vuy9ze.jpg',
  },
  {
    id: 'young-and-beautiful',
    title: 'Young and Beautiful',
    artist: 'Lana Del Rey',
    spotifyUrl: 'https://open.spotify.com/track/2nMeu6UenVvwUktBCpLMK9',
    youtubeId: 'o_1aF54DO60', // Lana Del Rey - Young and Beautiful Audio
    coverUrl: 'https://files.catbox.moe/00ltuy.jpg',
  },
];

interface SpotifyMusicPlayerProps {
  isLockScreen?: boolean;
  position?: 'top-left' | 'bottom-right';
}

export const SpotifyMusicPlayer: React.FC<SpotifyMusicPlayerProps> = ({ 
  isLockScreen = false,
  position = 'bottom-right'
}) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const currentTrack = PLAYLIST[currentTrackIndex];

  // Track origin for YouTube iframe
  const originParam = typeof window !== 'undefined' && window.location.origin ? `&origin=${encodeURIComponent(window.location.origin)}` : '';

  // Floating notes animation state
  const [notes, setNotes] = useState<{ id: number, tx: number, ty: number, isSparkle: boolean }[]>([]);

  // Generate floating notes when playing
  useEffect(() => {
    if (!isPlaying || isLockScreen) return;

    const interval = setInterval(() => {
      setNotes(prev => {
        const current = prev.length > 7 ? prev.slice(1) : prev;
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 40;
        
        return [...current, { 
          id: Date.now(), 
          tx: Math.cos(angle) * distance,
          ty: Math.sin(angle) * distance,
          isSparkle: Math.random() > 0.5
        }];
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isPlaying, isLockScreen]);

  // Clean up old notes
  useEffect(() => {
    if (notes.length === 0) return;
    const timeout = setTimeout(() => {
      setNotes(prev => prev.filter(n => Date.now() - n.id < 2500));
    }, 2500);
    return () => clearTimeout(timeout);
  }, [notes]);

  // Auto-play trigger on initial user gesture
  useEffect(() => {
    const handleFirstGesture = () => {
      setIsPlaying(true);
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        } catch {
          // Ignore
        }
      }
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });
    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, []);

  const togglePlay = () => {
    soundEffects.playAntiqueChime(520);
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        const command = nextState ? 'playVideo' : 'pauseVideo';
        iframeRef.current.contentWindow.postMessage(`{"event":"command","func":"${command}","args":""}`, '*');
      } catch {
        // Ignore
      }
    }
  };

  const nextTrack = () => {
    soundEffects.playPageTurn();
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    soundEffects.playPageTurn();
    setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
    setIsPlaying(true);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playPageTurn();
    const nextMute = !isMuted;
    setIsMuted(nextMute);

    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        const command = nextMute ? 'mute' : 'unMute';
        iframeRef.current.contentWindow.postMessage(`{"event":"command","func":"${command}","args":""}`, '*');
      } catch {
        // Ignore
      }
    }
  };

  const renderFloatingNotes = () => (
    <>
      {notes.map(note => (
        <div
          key={note.id}
          className="absolute left-1/2 top-1/2 pointer-events-none z-0"
          style={{
            '--tx': `${note.tx}px`,
            '--ty': `${note.ty}px`,
          } as React.CSSProperties}
        >
          <div className="animate-radiate-blink flex items-center justify-center drop-shadow-md">
            {note.isSparkle ? (
              <Sparkles className="h-3 w-3 text-[#E2CFA9]" />
            ) : (
              <Music className="h-4 w-4 text-[#B995A7]" />
            )}
          </div>
        </div>
      ))}
    </>
  );

  return (
    <>
      {/* 1. OFFSCREEN BACKGROUND AUDIO ENGINE (Not display:none so browser allows autoplay) */}
      <div 
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          width: '1px',
          height: '1px',
          opacity: 0.001,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <iframe
          key={currentTrack.id}
          ref={iframeRef}
          title={`${currentTrack.title} Audio Stream`}
          width="200"
          height="200"
          src={`https://www.youtube-nocookie.com/embed/${currentTrack.youtubeId}?autoplay=1&enablejsapi=1&loop=1&playlist=${currentTrack.youtubeId}&playsinline=1&controls=0${originParam}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          loading="eager"
        />
      </div>

      {/* 2. MAIN MUSIC PLAYER (Stationary, z-20 to stay behind all modals) */}
      {!isLockScreen && (
        <div
          className={`fixed z-20 transition-all duration-300 ${
            position === 'top-left'
              ? 'top-4 left-4 sm:top-6 sm:left-6'
              : 'bottom-6 right-6 sm:bottom-8 sm:right-8'
          }`}
        >
          {isExpanded ? (
            /* EXPANDED FRAME */
            <div className="relative flex items-center gap-3 rounded-full border border-[#E9BBCD] bg-[#FFFCFA]/95 p-2 pr-4 sm:pr-5 shadow-[0_18px_50px_rgba(118,99,110,0.14)] backdrop-blur-md cursor-default">
              
              {/* Inner Disc (Stationary) */}
              <div className="relative">
                {renderFloatingNotes()}
                <div 
                  className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[2px] border-[#E9BBCD] bg-[#FFFCFA] shadow-[0_4px_15px_rgba(118,99,110,0.15)] z-10"
                >
                   <div className="absolute inset-0.5 rounded-full border border-black/5" />
                   <img src={currentTrack.coverUrl} className="h-full w-full rounded-full object-cover p-0.5" referrerPolicy="no-referrer" draggable={false} alt={currentTrack.title} />
                   <div className="absolute h-2 w-2 rounded-full bg-[#FFFCFA] shadow-inner border border-[#E9BBCD]" />
                </div>
              </div>

              {/* Controls & Info */}
              <div className="flex flex-col z-10 min-w-0">
                 <strong className="font-cinzel text-xs sm:text-[13px] font-bold tracking-wide text-[#4D4449] leading-tight truncate max-w-[140px]">
                   {currentTrack.title}
                 </strong>
                 <span className="font-serif text-[11px] italic text-[#76636E] leading-tight truncate max-w-[140px] mt-0.5">
                   {currentTrack.artist}
                 </span>
                 
                 <div className="mt-1.5 flex items-center gap-1.5">
                    <button onClick={prevTrack} className="flex h-6 w-6 items-center justify-center rounded-full text-[#76636E] hover:bg-[#FBE3EC] transition-colors cursor-pointer" title="Bài trước">
                      <SkipBack className="h-3 w-3" />
                    </button>
                    <button onClick={togglePlay} className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#C4A1B2] to-[#9D7E90] text-[#FFFCFA] hover:from-[#B995A7] hover:to-[#8E6D80] shadow-sm transition-transform hover:scale-105 cursor-pointer" title={isPlaying ? "Tạm dừng nhạc" : "Phát nhạc"}>
                      {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.5 fill-current" />}
                    </button>
                    <button onClick={nextTrack} className="flex h-6 w-6 items-center justify-center rounded-full text-[#76636E] hover:bg-[#FBE3EC] transition-colors cursor-pointer" title="Bài tiếp">
                      <SkipForward className="h-3 w-3" />
                    </button>
                    <button onClick={toggleMute} className="flex h-6 w-6 items-center justify-center rounded-full text-[#76636E] hover:bg-[#FBE3EC] transition-colors cursor-pointer" title={isMuted ? "Bật tiếng" : "Tắt tiếng"}>
                      {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                    </button>
                    <a href={currentTrack.spotifyUrl} target="_blank" rel="noopener noreferrer" className="flex h-6 w-6 items-center justify-center rounded-full text-[#1DB954] hover:bg-[#1DB954]/10 transition-colors" title="Mở trên Spotify">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <div className="w-px h-4 bg-[#E9BBCD] mx-0.5" />
                    <button onClick={() => { soundEffects.playPageTurn(); setIsExpanded(false); }} className="flex h-6 w-6 items-center justify-center rounded-full text-[#76636E] hover:bg-[#FBE3EC] transition-colors cursor-pointer" title="Thu gọn">
                      <X className="h-3.5 w-3.5" />
                    </button>
                 </div>
              </div>
            </div>
          ) : (
            /* COLLAPSED DISC (Stationary) */
            <div className="relative">
              {renderFloatingNotes()}

              {/* The Static Vinyl Cover */}
              <div 
                onClick={() => { soundEffects.playPageTurn(); setIsExpanded(true); }}
                className="relative flex h-[68px] w-[68px] sm:h-[76px] sm:w-[76px] items-center justify-center rounded-full border-[3px] border-[#E9BBCD] bg-[#FFFCFA] shadow-[0_8px_30px_rgba(118,99,110,0.2)] cursor-pointer hover:scale-105 transition-transform z-10"
                title={`Đang phát: ${currentTrack.title} - Nhấn để mở điều khiển`}
              >
                {/* Vinyl Grooves Effect */}
                <div className="absolute inset-1 rounded-full border border-black/5" />
                <div className="absolute inset-2 rounded-full border border-black/5" />
                
                {/* Center Image */}
                <img 
                  src={currentTrack.coverUrl} 
                  alt="Music Record Label" 
                  className="h-full w-full rounded-full object-cover p-1"
                  referrerPolicy="no-referrer"
                  draggable={false}
                />
                
                {/* Center Spindle Hole */}
                <div className="absolute h-3 w-3 rounded-full bg-[#FFFCFA] shadow-inner border border-[#E9BBCD]" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Note CSS Animation Definition */}
      <style>{`
        @keyframes radiate-blink {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          30% {
            opacity: 0.2;
          }
          45% {
            opacity: 1;
          }
          60% {
            opacity: 0.2;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1.2);
            opacity: 0;
          }
        }
        .animate-radiate-blink {
          animation: radiate-blink 2s ease-out forwards;
        }
      `}</style>
    </>
  );
};
