import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  INITIAL_CHARACTERS,
  INITIAL_RELATIONSHIPS,
  INITIAL_WORLDS,
  INITIAL_LORE,
  INITIAL_GUESTBOOK
} from './data/archiveData';
import { Character, LoreChapter, GuestbookEntry, WorldRealm } from './types';
import { TopBar } from './components/TopBar';
import { HeroProfile } from './components/HeroProfile';
import { Navigation } from './components/Navigation';
import { IntroBanner } from './components/IntroBanner';
import { FeaturedStories } from './components/FeaturedStories';
import { ArchiveGrid } from './components/ArchiveGrid';
import { CharacterList } from './components/CharacterList';
import { CharacterDossierModal } from './components/CharacterDossierModal';
import { RelationshipMatrix } from './components/RelationshipMatrix';
import { WorldLoreSection } from './components/WorldLoreSection';
import { LoreSection } from './components/LoreSection';
import { LoreReaderModal } from './components/LoreReaderModal';
import { ContactModal } from './components/ContactModal';
import { GuestbookSection } from './components/GuestbookSection';
import { SearchModal } from './components/SearchModal';
import { CommissionModal } from './components/CommissionModal';
import { FooterSection } from './components/FooterSection';
import { VictorianLockScreen } from './components/VictorianLockScreen';
import { SpotifyMusicPlayer } from './components/SpotifyMusicPlayer';
import { PromptArchiveView } from './components/PromptArchiveView';
import { AdminPage } from './components/AdminPanel/AdminPage';
import { apiGetCharacters } from './services/api';
import { soundEffects } from './utils/audio';

const GlobalClickEffect = () => {
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; angle: number; distance: number; size: number }[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      try {
        const target = e.target as HTMLElement | null;
        if (!target) return;

        let isClickable = false;
        if (typeof target.closest === 'function') {
          isClickable = !!target.closest('button, a, input, select, textarea, [role="button"]');
        }
        if (!isClickable && typeof window !== 'undefined' && target instanceof Element) {
          try {
            isClickable = window.getComputedStyle(target).cursor === 'pointer';
          } catch {
            // Ignore style computation errors
          }
        }
        
        if (isClickable) {
          soundEffects.playSelectClick();
        }
        
        // Always burst sparkles on any click
        const numSparkles = Math.floor(Math.random() * 5) + 6; // 6 to 10 sparkles
        const newSparkles = Array.from({ length: numSparkles }).map(() => ({
          id: Date.now() + Math.random(),
          x: e.clientX,
          y: e.clientY,
          angle: Math.random() * Math.PI * 2,
          distance: Math.random() * 50 + 20, // 20 to 70px
          size: Math.random() * 0.8 + 0.5, // 0.5x to 1.3x
        }));
        
        setSparkles(prev => [...prev, ...newSparkles]);
        
        setTimeout(() => {
          const idsToRemove = new Set(newSparkles.map(s => s.id));
          setSparkles(prev => prev.filter(s => !idsToRemove.has(s.id)));
        }, 1000);
      } catch {
        // Suppress any sparkle effect errors
      }
    };

    window.addEventListener('click', handleClick, true);
    return () => window.removeEventListener('click', handleClick, true);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden">
      <AnimatePresence>
        {sparkles.map(s => (
          <motion.div
            key={s.id}
            initial={{ 
              x: s.x, 
              y: s.y, 
              scale: 0, 
              opacity: 1, 
              rotate: 0 
            }}
            animate={{ 
              x: s.x + Math.cos(s.angle) * s.distance, 
              y: s.y + Math.sin(s.angle) * s.distance,
              scale: s.size, 
              opacity: 0, 
              rotate: 180 + Math.random() * 90
            }}
            transition={{ 
              duration: 0.6 + Math.random() * 0.3,
              ease: "easeOut"
            }}
            className="absolute text-[#D8A7BB] text-xl"
            style={{ 
              marginLeft: '-10px',
              marginTop: '-14px',
              textShadow: '0 0 6px rgba(216, 167, 187, 0.9), 0 0 12px rgba(255, 255, 255, 0.9)'
            }}
          >
            ✦
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  // Lockscreen & Gate State
  const [hasUnlocked, setHasUnlocked] = useState(false);

  // Admin Route State (supports /admin or hash #/admin)
  const [isAdminOpen, setIsAdminOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.pathname.startsWith('/admin') ||
        window.location.hash.startsWith('#/admin')
      );
    }
    return false;
  });

  // Archive Data & Tab State
  const [activeTab, setActiveTab] = useState<string>('nhan-vat');
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [relationships] = useState(INITIAL_RELATIONSHIPS);
  const [worlds] = useState<WorldRealm[]>(INITIAL_WORLDS);
  const [lore] = useState<LoreChapter[]>(INITIAL_LORE);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>(INITIAL_GUESTBOOK);

  // Interaction State
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedLoreChapter, setSelectedLoreChapter] = useState<LoreChapter | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isCommissionOpen, setIsCommissionOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Load characters from persistent API
  useEffect(() => {
    async function loadCharacters() {
      try {
        const fetched = await apiGetCharacters();
        if (fetched && fetched.length > 0) {
          setCharacters(fetched);
        }
      } catch (err) {
        console.warn('Failed to load characters from API:', err);
      }
    }
    loadCharacters();
  }, []);

  // Listen to browser URL changes for /admin
  useEffect(() => {
    const handleLocationChange = () => {
      const isCurrentAdmin =
        window.location.pathname.startsWith('/admin') ||
        window.location.hash.startsWith('#/admin');
      setIsAdminOpen(isCurrentAdmin);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleOpenAdmin = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/admin');
    }
    setIsAdminOpen(true);
  };

  const handleCloseAdmin = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
    setIsAdminOpen(false);
  };

  const handleCharacterUpdated = (updatedChar: Character) => {
    setCharacters((prevList) => {
      const exists = prevList.some((char) => char.id === updatedChar.id);
      if (exists) {
        return prevList.map((char) => (char.id === updatedChar.id ? updatedChar : char));
      }
      return [...prevList, updatedChar];
    });
    if (selectedCharacter && selectedCharacter.id === updatedChar.id) {
      setSelectedCharacter(updatedChar);
    }
    showToast(`✦ Đã lưu thông tin bot "${updatedChar.name}" thành công!`);
  };

  // Social & Engagement State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(1284);
  const [likedCharIds, setLikedCharIds] = useState<Set<string>>(new Set(['hera-valois']));
  const [bookmarkedLoreIds, setBookmarkedLoreIds] = useState<Set<string>>(new Set(['lore-1']));
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleToggleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowerCount((prev) => prev - 1);
      showToast('Đã hủy theo dõi kho lưu trữ.');
    } else {
      setIsFollowing(true);
      setFollowerCount((prev) => prev + 1);
      showToast('✦ Cảm ơn bạn đã theo dõi L’amour est Hera!');
    }
  };

  const handleToggleLikeCharacter = (charId: string) => {
    setLikedCharIds((prev) => {
      const next = new Set(prev);
      if (next.has(charId)) {
        next.delete(charId);
        setCharacters((list) =>
          list.map((c) => (c.id === charId ? { ...c, likes: c.likes - 1 } : c))
        );
        showToast('Đã bỏ yêu thích.');
      } else {
        next.add(charId);
        setCharacters((list) =>
          list.map((c) => (c.id === charId ? { ...c, likes: c.likes + 1 } : c))
        );
        showToast('♥ Đã thêm vào danh sách nhân vật yêu thích!');
      }
      return next;
    });
  };

  const handleToggleBookmarkLore = (loreId: string) => {
    setBookmarkedLoreIds((prev) => {
      const next = new Set(prev);
      if (next.has(loreId)) {
        next.delete(loreId);
        showToast('Đã gỡ dấu trang.');
      } else {
        next.add(loreId);
        showToast('🔖 Đã đánh dấu chương sách.');
      }
      return next;
    });
  };

  const handleAddGuestbook = (entryData: Omit<GuestbookEntry, 'id' | 'date'>) => {
    const newEntry: GuestbookEntry = {
      ...entryData,
      id: `gb-${Date.now()}`,
      date: 'Hôm nay'
    };
    setGuestbook([newEntry, ...guestbook]);
    showToast('✦ Bức thư của bạn đã được ghi vào Sổ Lưu Bút!');
  };

  const handleSelectCharacterById = (id: string) => {
    const found = characters.find((c) => c.id === id);
    if (found) {
      setSelectedCharacter(found);
    }
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    soundEffects.isMuted = newMuted;
    showToast(newMuted ? 'Đã tắt âm thanh hiệu ứng.' : 'Đã bật âm thanh cổ điển.');
  };

  // Keyboard shortcut Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // RENDER ADMIN PAGE VIEW IF /admin IS ACTIVE
  if (isAdminOpen) {
    return (
      <div className="min-h-screen bg-[#FFF8F3] text-[#4D4449] selection:bg-[#FBE3EC] selection:text-[#4D4449] font-montserrat">
        <GlobalClickEffect />
        <AdminPage
          characters={characters}
          onCharacterUpdated={handleCharacterUpdated}
          onNavigateHome={handleCloseAdmin}
        />
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-[#E2CFA9] bg-[#FFFCFA] px-4 py-3 text-xs font-semibold text-[#4D4449] shadow-[0_18px_50px_rgba(118,99,110,0.2)] animate-bounce">
            {toastMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F3] text-[#4D4449] selection:bg-[#FBE3EC] selection:text-[#4D4449] font-montserrat">
      <GlobalClickEffect />

      {/* =========================================================
          MÀN HÌNH KHÓA HOÀNG GIA / VÀO THAM QUAN (Victorian Lockscreen)
         ========================================================= */}
      {!hasUnlocked ? (
        <VictorianLockScreen
          onEnterArchive={() => {
            setHasUnlocked(true);
            setActiveTab('nhan-vat');
            showToast('✦ Chào mừng bạn đã bước vào Thư Viện Nhân Vật L’Amour est Hera!');
          }}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenAdmin={handleOpenAdmin}
        />
      ) : (
        <PromptArchiveView
          characters={characters}
          onSelectCharacter={(c) => setSelectedCharacter(c)}
          onOpenContact={() => setIsContactOpen(true)}
          onOpenCommission={() => setIsCommissionOpen(true)}
          onReturnHome={() => {
            setHasUnlocked(false);
            showToast('✦ Đã quay lại màn hình chính.');
          }}
          onOpenAdmin={handleOpenAdmin}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          activeNavTab={activeTab}
          onTabChange={(t) => setActiveTab(t)}
        />
      )}

      {/* =========================================================
          INTERACTIVE MODALS & OVERLAYS
         ========================================================= */}

      {/* Character Dossier Modal */}
      <CharacterDossierModal
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
        relationships={relationships}
        onSelectCharacterById={handleSelectCharacterById}
        isLiked={selectedCharacter ? likedCharIds.has(selectedCharacter.id) : false}
        onToggleLike={handleToggleLikeCharacter}
      />

      {/* Lore Reader Book Modal */}
      <LoreReaderModal
        chapter={selectedLoreChapter}
        allChapters={lore}
        onClose={() => setSelectedLoreChapter(null)}
        onSelectChapter={(ch) => setSelectedLoreChapter(ch)}
        isBookmarked={selectedLoreChapter ? bookmarkedLoreIds.has(selectedLoreChapter.id) : false}
        onToggleBookmark={handleToggleBookmarkLore}
      />

      {/* Contact & Tribute Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* Commission Price List Modal */}
      <CommissionModal
        isOpen={isCommissionOpen}
        onClose={() => setIsCommissionOpen(false)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        characters={characters}
        worlds={worlds}
        lore={lore}
        relationships={relationships}
        onSelectCharacter={(c) => setSelectedCharacter(c)}
        onSelectLore={(l) => setSelectedLoreChapter(l)}
        onSelectTab={(t) => setActiveTab(t)}
      />

      {/* Lana Del Rey Spotify Soundtrack Player on Bottom-Right */}
      <SpotifyMusicPlayer isLockScreen={!hasUnlocked} position="bottom-right" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-[#E2CFA9] bg-[#FFFCFA] px-4 py-3 text-xs font-semibold text-[#4D4449] shadow-[0_18px_50px_rgba(118,99,110,0.2)] animate-bounce">
          {toastMessage}
        </div>
      )}

    </div>
  );
}
