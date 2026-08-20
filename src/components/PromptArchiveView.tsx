import React, { useState } from 'react';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import { Character } from '../types';
import { ALL_TAGS } from '../data/archiveData';
import { soundEffects } from '../utils/audio';
import { apiVerifyCharacterPassword } from '../services/api';

interface PromptArchiveViewProps {
  characters: Character[];
  onSelectCharacter: (char: Character) => void;
  onOpenContact: () => void;
  onOpenCommission: () => void;
  onReturnHome?: () => void;
  onOpenAdmin?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  activeNavTab: string;
  onTabChange: (tab: string) => void;
}

export const PromptArchiveView: React.FC<PromptArchiveViewProps> = ({
  characters,
  onSelectCharacter,
  onOpenContact,
  onOpenCommission,
  onReturnHome,
  onOpenAdmin,
  isMuted,
  onToggleMute,
  activeNavTab,
  onTabChange,
}) => {
  // Panel state: 'characters' | 'search' | 'tag'
  const [activePanel, setActivePanel] = useState<'characters' | 'search' | 'tag'>(
    activeNavTab === 'search' ? 'search' : activeNavTab === 'tag' ? 'tag' : 'characters'
  );

  // Sort state: 'all' | 'new' | 'locked'
  const [sortOption, setSortOption] = useState<'all' | 'new' | 'locked' | 'bl' | 'gl'>('all');

  // Search Panel state
  const [searchInput, setSearchInput] = useState<string>('');

  // Tag Panel state
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  // Plot Modal State
  const [selectedPlotChar, setSelectedPlotChar] = useState<Character | null>(null);

  // Unlocked characters state (Session-only, re-locks after action)
  const [unlockedCharIds, setUnlockedCharIds] = useState<Set<string>>(new Set());

  // Password modal states
  const [passwordModalChar, setPasswordModalChar] = useState<Character | null>(null);
  const [enteredPass, setEnteredPass] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passError, setPassError] = useState<string>('');
  const [pendingAction, setPendingAction] = useState<{ type: 'plot' | 'ggai'; char: Character } | null>(null);
  const [failedAttemptsMap, setFailedAttemptsMap] = useState<Record<string, number>>({});
  const [lockedOutCharIds, setLockedOutCharIds] = useState<Set<string>>(new Set());
  const [hintModal, setHintModal] = useState<{ charId: string; charName: string; hint: string } | null>(null);

  // Donate Modal State ("Một chút yêu thương ♡")
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);

  // Creator Info Modal State
  const [isCreatorInfoOpen, setIsCreatorInfoOpen] = useState(false);

  // Top Menu Dropdown State
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);

  const handleUnlockSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passwordModalChar) return;

    const maxAttempts = passwordModalChar.maxAttempts || (passwordModalChar.id === 'an-tich-vu' ? 5 : 5);
    const isAlreadyLockedOut = lockedOutCharIds.has(passwordModalChar.id) || (failedAttemptsMap[passwordModalChar.id] || 0) >= maxAttempts;

    if (isAlreadyLockedOut) {
      setPassError(`Link này đã bị khóa vĩnh viễn do bạn đã nhập sai quá ${maxAttempts} lần!`);
      return;
    }

    // Call server verify API first
    const apiCheck = await apiVerifyCharacterPassword(passwordModalChar.id, enteredPass);
    let isCorrect = apiCheck.success;

    // Fallback if client has local password string
    if (!isCorrect && passwordModalChar.password) {
      const rawPass = passwordModalChar.password;
      const normalizePass = (str: string) =>
        str
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'd');

      const cleanEntered = normalizePass(enteredPass);
      const cleanTarget = normalizePass(rawPass);

      const noSpaceEntered = cleanEntered.replace(/\s+/g, '');
      const noSpaceTarget = cleanTarget.replace(/\s+/g, '');

      const exactEntered = enteredPass.trim().toLowerCase().normalize('NFC').replace(/\s+/g, ' ');
      const exactTarget = rawPass.trim().toLowerCase().normalize('NFC').replace(/\s+/g, ' ');

      isCorrect =
        cleanEntered === cleanTarget ||
        noSpaceEntered === noSpaceTarget ||
        exactEntered === exactTarget ||
        noSpaceEntered === noSpaceTarget.replace(',', '.') ||
        noSpaceEntered === noSpaceTarget.replace('.', ',') ||
        (noSpaceTarget === '12,00' && (noSpaceEntered === '12' || noSpaceEntered === '12.00' || noSpaceEntered === '1200'));
    }

    if (isCorrect) {
      soundEffects.playAntiqueChime(880);

      const targetChar = passwordModalChar;
      const action = pendingAction;
      setPasswordModalChar(null);
      setEnteredPass('');
      setPassError('');
      setPendingAction(null);
      
      setUnlockedCharIds((prev) => new Set(prev).add(targetChar.id));

      const charLink = targetChar.link || targetChar.linkGGAI;
      if (action?.type === 'plot') {
        setSelectedPlotChar(targetChar);
      } else if (action?.type === 'ggai' && charLink) {
        window.open(charLink, '_blank', 'noopener,noreferrer');
      }
    } else {
      soundEffects.playAntiqueChime(300);
      const currentFails = (failedAttemptsMap[passwordModalChar.id] || 0) + 1;
      setFailedAttemptsMap((prev) => ({
        ...prev,
        [passwordModalChar.id]: currentFails,
      }));

      if (currentFails >= maxAttempts) {
        setLockedOutCharIds((prev) => new Set(prev).add(passwordModalChar.id));
        setPassError(`Bạn đã nhập sai ${currentFails}/${maxAttempts} lần. Link đã bị khóa!`);
      } else {
        setPassError(`Mật khẩu không chính xác! (Đã thử sai ${currentFails}/${maxAttempts} lần - Sai ${maxAttempts} lần khóa link)`);
      }

      if (passwordModalChar.hint && currentFails < maxAttempts) {
        setHintModal({
          charId: passwordModalChar.id,
          charName: passwordModalChar.name,
          hint: passwordModalChar.hint,
        });
      }
    }
  };

  const handleClosePlotModal = () => {
    setSelectedPlotChar(null);
  };

  const handleGgaiClick = (e: React.MouseEvent, char: Character) => {
    e.stopPropagation();
    const maxAttempts = char.maxAttempts || (char.id === 'an-tich-vu' ? 5 : 5);
    const isLockedOut = lockedOutCharIds.has(char.id) || (failedAttemptsMap[char.id] || 0) >= maxAttempts;

    if (isLockedOut) {
      soundEffects.playAntiqueChime(300);
      setPasswordModalChar(char);
      setPassError(`Link này đã bị khóa do bạn đã nhập sai quá ${maxAttempts} lần!`);
      return;
    }

    if (char.isLocked && !unlockedCharIds.has(char.id)) {
      soundEffects.playPageTurn();
      setPasswordModalChar(char);
      setPendingAction({ type: 'ggai', char });
      setEnteredPass('');
      setPassError('');
    } else if (char.linkGGAI) {
      window.open(char.linkGGAI, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePlotClick = (e: React.MouseEvent, char: Character) => {
    e.stopPropagation();
    soundEffects.playPageTurn();
    setSelectedPlotChar(char);
  };

  // Dynamic Vote state tracking
  const [votesMap, setVotesMap] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    characters.forEach((c) => {
      initial[c.id] = c.votes ?? c.likes ?? 0;
    });
    return initial;
  });

  const [votedSet, setVotedSet] = useState<Set<string>>(new Set());

  // Toggle vote handler
  const handleToggleVote = (charId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEffects.playAntiqueChime(750);

    const isCurrentlyVoted = votedSet.has(charId);

    if (isCurrentlyVoted) {
      setVotedSet((prev) => {
        const next = new Set(prev);
        next.delete(charId);
        return next;
      });
      setVotesMap((vm) => {
        const currentCount = vm[charId] ?? 0;
        return {
          ...vm,
          [charId]: Math.max(0, currentCount - 1),
        };
      });
    } else {
      setVotedSet((prev) => {
        const next = new Set(prev);
        next.add(charId);
        return next;
      });
      setVotesMap((vm) => {
        const currentCount = vm[charId] ?? 0;
        return {
          ...vm,
          [charId]: currentCount + 1,
        };
      });
    }
  };

  // Handle panel tab changes
  const handlePanelSwitch = (panel: 'characters' | 'search' | 'tag') => {
    soundEffects.playPageTurn();
    setActivePanel(panel);
    onTabChange(panel);
  };

  const normalizeSearchStr = (str: string) =>
    (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .trim();

  // Sort, Tag and Search logic
  const getSortedCharacters = () => {
    let list = [...characters];

    // Selected Tags Filter
    if (selectedTags.size > 0) {
      list = list.filter((c) => {
        const charTags: string[] = c.tags || [];
        return Array.from(selectedTags).some((selTag: string) =>
          charTags.some((t: string) => String(t).toLowerCase() === String(selTag).toLowerCase())
        );
      });
    }

    // Text Search Filter
    if (searchInput.trim()) {
      const queryNorm = normalizeSearchStr(searchInput);
      list = list.filter((c) => {
        const normName = normalizeSearchStr(c.name);
        const normEnglishTitle = normalizeSearchStr(c.englishTitle);
        const normVietnameseTitle = normalizeSearchStr(c.vietnameseTitle);
        const normDesc = normalizeSearchStr(c.description);
        const normRole = normalizeSearchStr(c.role);
        const normFaction = normalizeSearchStr(c.faction);
        const normTags = (c.tags || []).map((t) => normalizeSearchStr(t));
        const normPlot = normalizeSearchStr(c.plot);
        const normQuestion = normalizeSearchStr(c.question);

        return (
          normName.includes(queryNorm) ||
          normEnglishTitle.includes(queryNorm) ||
          normVietnameseTitle.includes(queryNorm) ||
          normDesc.includes(queryNorm) ||
          normRole.includes(queryNorm) ||
          normFaction.includes(queryNorm) ||
          normTags.some((t) => t.includes(queryNorm)) ||
          normPlot.includes(queryNorm) ||
          normQuestion.includes(queryNorm)
        );
      });
    }

    if (sortOption === 'locked') {
      return list.filter((c) => c.isLocked);
    } else if (sortOption === 'bl') {
      return list.filter((c) => c.tags?.some((t: string) => ['BL', 'BOY LOVE'].includes(String(t).toUpperCase())));
    } else if (sortOption === 'gl') {
      return list.filter((c) => c.tags?.some((t: string) => ['GL', 'GIRL LOVE', 'BÁCH HỢP'].includes(String(t).toUpperCase())));
    } else if (sortOption === 'new') {
      return list.sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
    }
    return list;
  };

  // Search logic
  const getSearchFilteredCharacters = () => {
    if (!searchInput.trim()) return characters;
    const queryNorm = normalizeSearchStr(searchInput);
    return characters.filter((c) => {
      const normName = normalizeSearchStr(c.name);
      const normEnglishTitle = normalizeSearchStr(c.englishTitle);
      const normVietnameseTitle = normalizeSearchStr(c.vietnameseTitle);
      const normDesc = normalizeSearchStr(c.description);
      const normRole = normalizeSearchStr(c.role);
      const normFaction = normalizeSearchStr(c.faction);
      const normTags = (c.tags || []).map((t) => normalizeSearchStr(t));
      const normPlot = normalizeSearchStr(c.plot);
      const normQuestion = normalizeSearchStr(c.question);

      return (
        normName.includes(queryNorm) ||
        normEnglishTitle.includes(queryNorm) ||
        normVietnameseTitle.includes(queryNorm) ||
        normDesc.includes(queryNorm) ||
        normRole.includes(queryNorm) ||
        normFaction.includes(queryNorm) ||
        normTags.some((t) => t.includes(queryNorm)) ||
        normPlot.includes(queryNorm) ||
        normQuestion.includes(queryNorm)
      );
    });
  };

  // Tag filter logic
  const toggleTag = (tag: string) => {
    soundEffects.playPageTurn();
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const getTagFilteredCharacters = () => {
    if (selectedTags.size === 0) return characters;
    return characters.filter((c) => {
      const charTags: string[] = c.tags || [];
      return Array.from(selectedTags).some((selTag: string) =>
        charTags.some((t: string) => String(t).toLowerCase() === String(selTag).toLowerCase())
      );
    });
  };

  const sortedList = getSortedCharacters();
  const searchList = getSearchFilteredCharacters();
  const tagList = getTagFilteredCharacters();

  // Helper render for single Horizontal Character Frame
  const renderHorizontalCharacterCard = (char: Character, index: number) => {
    const isVoted = votedSet.has(char.id);
    const voteCount = votesMap[char.id] ?? char.votes ?? char.likes ?? 0;

    return (
      <article
        key={char.id}
        className="bg-[#FFFCFA] border border-[#E9BBCD] rounded-2xl p-5 shadow-[0_18px_50px_rgba(118,99,110,0.14)] hover:shadow-[0_24px_70px_rgba(185,149,167,0.22)] hover:bg-[#FFF8FB] transition-all duration-300 flex flex-col gap-4"
      >
        {/* TOP: Dedicated Character Info Layout with compact Blink-Blink Image Frame */}
        <div className="flex flex-row gap-4 items-start w-full">
          {/* Shimmering compact 1:1 square blink-blink card frame */}
          {char.avatarUrl && (
            <div 
              onClick={() => {
                soundEffects.playPageTurn();
                onSelectCharacter(char);
              }}
              className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-[#E9BBCD] bg-gradient-to-b from-[#FFFCFA] to-[#FFF8F3] blink-blink-card group/avatar shadow-sm flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              title="Xem hồ sơ chi tiết"
            >
              <img
                src={char.avatarUrl}
                alt={char.name}
                className="w-full h-full object-cover rounded-lg group-hover/avatar:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              {/* Elegant vignette glaze */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#FBE3EC]/10 via-transparent to-white/10 pointer-events-none" />

              {/* Minimal Twinkling Sparkle Decors */}
              <span className="sparkle-decor top-1 left-1 text-[10px]" style={{ animationDelay: '0s' }}>✦</span>
              <span className="sparkle-decor bottom-1.5 right-1.5 text-[9px]" style={{ animationDelay: '0.6s' }}>✧</span>
            </div>
          )}

          {/* Character Details Column */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 
                  onClick={() => {
                    soundEffects.playPageTurn();
                    onSelectCharacter(char);
                  }}
                  className="font-cormorant text-xl sm:text-2xl font-bold text-[#4D4449] leading-tight flex items-center gap-2 cursor-pointer hover:text-[#B995A7] transition-colors"
                  title="Xem hồ sơ chi tiết"
                >
                  <span>{char.name}</span>
                  {char.isLocked && (
                    <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded font-bold flex items-center gap-1 border ${
                      lockedOutCharIds.has(char.id)
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : unlockedCharIds.has(char.id)
                        ? 'bg-[#F0ECF6] text-[#76636E] border-[#DDD6EB]'
                        : 'bg-[#FBE3EC] text-[#76636E] border-[#D8A7BB]'
                    }`}>
                      {lockedOutCharIds.has(char.id) ? '🔒 Đã khóa link' : unlockedCharIds.has(char.id) ? '🔓 Đã mở' : '🔒 Khóa'}
                    </span>
                  )}
                </h3>
                {char.role && (
                  <span className="bg-[#B995A7] text-[#FFFCFA] text-[9px] font-semibold px-2 py-0.5 rounded-lg border border-[#E2CFA9] text-center leading-tight max-w-full">
                    {char.role}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold text-[#76636E] bg-[#FBE3EC] border border-[#F4D1DE] px-2 py-0.5 rounded-full shrink-0">
                #{index + 1}
              </span>
            </div>

            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#76636E] mt-1">
              {char.vietnameseTitle || char.englishTitle} {char.faction ? `• ${char.faction}` : ''}
            </div>

            <p className="text-xs sm:text-sm text-[#4D4449] italic mt-2 leading-relaxed">
              "{char.vietnameseQuote || char.quote || char.description || 'Chưa có thông tin mô tả.'}"
            </p>

            {/* Tags */}
            {char.tags && char.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {char.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="bg-[#FFF1F6] text-[#76636E] border border-[#F4D1DE] text-[9px] font-medium px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BARS: "Link GGAI" | "Plot" | "vote" */}
        <div className="pt-3 border-t border-[#F4D1DE] flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* 1. Link GGAI Bar */}
          {char.linkGGAI && (
            <button
              onClick={(e) => handleGgaiClick(e, char)}
              disabled={lockedOutCharIds.has(char.id)}
              className={`flex-1 sm:flex-none border text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                lockedOutCharIds.has(char.id)
                  ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed opacity-75'
                  : 'border-[#D8A7BB] bg-[#FFF8F3] hover:bg-[#FBE3EC] text-[#76636E] cursor-pointer'
              }`}
              title={lockedOutCharIds.has(char.id) ? 'Link đã bị khóa do nhập sai quá 5 lần' : 'Mở Google AI Studio Prompt'}
            >
              <span>{lockedOutCharIds.has(char.id) ? '🚫' : char.isLocked && !unlockedCharIds.has(char.id) ? '🔒' : '✨'}</span>
              <span>{lockedOutCharIds.has(char.id) ? 'Link Bị Khóa' : 'Link GGAI'}</span>
            </button>
          )}

          {/* 2. Plot Bar */}
          <button
            onClick={(e) => handlePlotClick(e, char)}
            className="flex-1 sm:flex-none border border-[#E2CFA9] bg-[#FFF8F3] hover:bg-[#FBE3EC] text-[#76636E] text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Đọc cốt truyện & bối cảnh"
          >
            <span>📜</span>
            <span>Plot</span>
          </button>

          {/* 3. Vote Bar */}
          <button
            onClick={(e) => handleToggleVote(char.id, e)}
            className={`flex-2 sm:flex-1 py-2.5 px-5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 ${
              isVoted
                ? 'bg-gradient-to-r from-[#C4A1B2] to-[#AE899D] text-[#FFFCFA] border border-[#E2CFA9]'
                : 'bg-[#FFF8F3] hover:bg-[#FBE3EC] text-[#76636E] border border-[#D8A7BB]'
            }`}
            title={isVoted ? 'Bỏ bình chọn' : 'Bình chọn cho nhân vật'}
          >
            <span className="text-base leading-none">{isVoted ? '♥' : '♡'}</span>
            <span>{isVoted ? `Đã Vote (${voteCount})` : `Vote (${voteCount})`}</span>
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="app-container font-montserrat">
      {/* =======================================================
           TOP BAR
         ======================================================= */}
      <header className="topbar-archive flex items-center justify-between gap-2.5 sm:gap-4 px-3 sm:px-5">
        {/* Left side: Creator Info */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink min-w-0 mr-1 sm:mr-3">
          <button
            onClick={() => {
              soundEffects.playPageTurn();
              setIsCreatorInfoOpen(true);
            }}
            className="flex items-center gap-2 sm:gap-2.5 p-1 pr-2.5 sm:pr-3.5 rounded-full border border-[#D8A7BB] bg-gradient-to-r from-[#FFF8F3] to-[#FBE3EC] hover:shadow-md transition-all duration-300 cursor-pointer active:scale-95 group text-left shrink min-w-0"
          >
            {/* Avatar Wrap */}
            <div className="relative shrink-0">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-[#FFFCFA] shadow-sm bg-[#FFF1F6] flex items-center justify-center">
                 <img src="https://files.catbox.moe/z4aadt.jpg" alt="Creator Avatar" className="w-full h-full object-cover" />
              </div>
              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-400 border-2 border-[#FFF8F3] rounded-full"></span>
            </div>

            {/* Info */}
            <div className="flex flex-col items-start leading-tight min-w-0">
              <span className="text-[8px] sm:text-[9px] font-bold text-[#B995A7] uppercase tracking-wider mb-0.5 whitespace-nowrap">The Creator</span>
              <strong className="text-[#4D4449] font-bold text-xs sm:text-sm font-cormorant leading-none whitespace-nowrap truncate max-w-[95px] sm:max-w-none">L'amour est Hera</strong>
              <small className="text-[9px] sm:text-[10px] text-[#76636E] leading-none mt-1 hidden md:block">Một góc nhỏ được viết bằng những giấc mơ.</small>
            </div>

            {/* Arrow */}
            <div className="ml-0.5 sm:ml-1.5 text-[#B995A7] group-hover:translate-x-1 transition-transform text-xs sm:text-sm shrink-0">
              →
            </div>
          </button>
        </div>

        {/* Right side: Action Menu */}
        <div className="top-actions flex items-center justify-end relative shrink-0">
          {/* Dropdown Backdrop */}
          {isTopMenuOpen && (
            <div 
              className="fixed inset-0 z-[90]" 
              onClick={() => setIsTopMenuOpen(false)}
            />
          )}

          <div className="relative z-[100]">
            <button
              onClick={() => {
                soundEffects.playPageTurn();
                setIsTopMenuOpen(!isTopMenuOpen);
              }}
              className="px-3 sm:px-4 py-1.5 rounded-full border border-[#D8A7BB] bg-gradient-to-r from-[#FFF8F3] to-[#FBE3EC] hover:from-[#FBE3EC] hover:to-[#F4D1DE] text-[#4D4449] font-bold text-xs shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <span>Dịch vụ & Ủng hộ</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isTopMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Options */}
            <div className={`absolute right-0 top-full mt-2 w-[180px] flex flex-col bg-[#FFFCFA] border border-[#D8A7BB] rounded-xl shadow-[0_10px_30px_rgba(118,99,110,0.15)] overflow-hidden transition-all duration-300 origin-top-right ${isTopMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
              <button
                onClick={() => {
                  soundEffects.playPageTurn();
                  setIsTopMenuOpen(false);
                  onOpenCommission();
                }}
                className="px-4 py-3 text-xs font-bold text-[#4D4449] text-left hover:bg-[#FBE3EC] border-b border-[#F4D1DE] transition-colors"
              >
                📜 Bảng Giá
              </button>
              <button
                onClick={() => {
                  soundEffects.playPageTurn();
                  setIsTopMenuOpen(false);
                  setIsDonateModalOpen(true);
                }}
                className="px-4 py-3 text-xs font-bold text-[#4D4449] text-left hover:bg-[#FBE3EC] border-b border-[#F4D1DE] transition-colors"
              >
                ♡ Một chút yêu thương
              </button>
              {onOpenAdmin && (
                <button
                  onClick={() => {
                    soundEffects.playPageTurn();
                    setIsTopMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="px-4 py-3 text-xs font-bold text-[#4D4449] text-left hover:bg-[#FBE3EC] transition-colors flex items-center gap-1.5"
                >
                  <span>🔒 Quản Trị Bot (Admin)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =======================================================
           HERO SECTION
         ======================================================= */}
      <section className="hero-archive">
        <div className="hero-small">Character Archive</div>
        <h1 className="hero-title-archive">The Collection</h1>
        <p className="hero-sub-archive">A little world of fictional people</p>
        <div className="ornament">✦ ─── ✦</div>
      </section>

      {/* =======================================================
           CONTENT PANELS
         ======================================================= */}
      <main className="content px-4 sm:px-5 pb-20">
        {/* =======================================================
             CHARACTERS LIST
           ======================================================= */}
        <section className="panel-animate">
          <div className="section-head">
            <div>
              <div className="section-kicker">Explore the archive</div>
              <h2 className="section-title">Characters</h2>
            </div>
          </div>

          {/* Sticky Direct Search Input Bar */}
          <div className="sticky top-0 z-30 py-3 -mx-4 sm:-mx-5 px-4 sm:px-5 bg-[#FFF8F3]/95 backdrop-blur-md transition-all border-b border-[#F4D1DE]/80 shadow-[0_4px_16px_rgba(118,99,110,0.06)] mb-3">
            <div className="search-box shadow-sm mb-0">
              <span className="text-lg text-[#76636E]">⌕</span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm kiếm nhân vật, tag, plot..."
                autoComplete="off"
                className="w-full bg-transparent text-base text-[#4D4449] placeholder-[#9D8E95] focus:outline-none font-cormorant"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="text-xs text-[#76636E] hover:text-[#4D4449] font-bold px-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Tags List directly below Search Bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#76636E] flex items-center gap-1">
                🏷️ Tags:
              </span>
              {selectedTags.size > 0 && (
                <button
                  onClick={() => setSelectedTags(new Set())}
                  className="text-xs text-[#76636E] underline hover:text-[#4D4449] font-medium cursor-pointer"
                >
                  Xóa chọn ({selectedTags.size})
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 p-2 bg-[#FFFCFA] border border-[#E9BBCD] rounded-xl max-h-36 overflow-y-auto no-scrollbar shadow-inner">
              {ALL_TAGS.map((tag) => {
                const isSelected = selectedTags.has(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-[#F4D1DE] text-[#4D4449] border border-[#D8A7BB] font-semibold shadow-sm scale-105'
                        : 'bg-[#FFF1F6] text-[#76636E] border border-[#F4D1DE] hover:bg-[#FBE3EC]'
                    }`}
                  >
                    {isSelected ? `✓ ${tag}` : tag}
                  </button>
                );
              })}
            </div>
          </div>

            {/* Filter Buttons: "Tất cả", "Mới nhất", "Boy Love", "Girl Love", "🔒" */}
            <div className="sort-archive">
              <button
                className={sortOption === 'all' ? 'active' : ''}
                onClick={() => {
                  soundEffects.playPageTurn();
                  setSortOption('all');
                }}
              >
                Tất cả
              </button>
              <button
                className={sortOption === 'new' ? 'active' : ''}
                onClick={() => {
                  soundEffects.playPageTurn();
                  setSortOption('new');
                }}
              >
                Mới nhất
              </button>
              <button
                className={sortOption === 'bl' ? 'active' : ''}
                onClick={() => {
                  soundEffects.playPageTurn();
                  setSortOption('bl');
                }}
              >
                Boy Love
              </button>
              <button
                className={sortOption === 'gl' ? 'active' : ''}
                onClick={() => {
                  soundEffects.playPageTurn();
                  setSortOption('gl');
                }}
              >
                Girl Love
              </button>
              <button
                className={sortOption === 'locked' ? 'active' : ''}
                onClick={() => {
                  soundEffects.playPageTurn();
                  setSortOption('locked');
                }}
                title="Nhân vật yêu cầu mật mã mở khóa"
              >
                🔒
              </button>
            </div>

            {/* Horizontal Frame List */}
            {sortedList.length === 0 ? (
              <div className="text-center py-12 px-4 bg-[#FFFCFA] border border-[#F4D1DE] rounded-2xl my-4 shadow-sm">
                <div className="text-3xl mb-2">🔍</div>
                <p className="font-cormorant text-xl font-bold text-[#4D4449]">
                  Không tìm thấy nhân vật phù hợp
                </p>
                <p className="text-xs text-[#76636E] mt-1">
                  {searchInput ? `Không tìm thấy nhân vật nào phù hợp với từ khóa "${searchInput}".` : 'Không có nhân vật nào trong mục này.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {sortedList.map((char, index) => renderHorizontalCharacterCard(char, index))}
              </div>
            )}
          </section>

      </main>

      {/* =======================================================
           PLOT READER MODAL
         ======================================================= */}
      {selectedPlotChar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn" onClick={handleClosePlotModal}>
          <div className="bg-[#FFFCFA] border border-[#E2CFA9] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-[0_24px_70px_rgba(185,149,167,0.22)] relative" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 z-20 p-4 sm:p-5 border-b border-[#F4D1DE] bg-[#FFF8F3]/95 backdrop-blur-md flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#76636E] font-bold block">
                  Cốt Truyện & Bối Cảnh
                </span>
                <h3 className="font-cormorant text-2xl font-bold text-[#4D4449]">
                  {selectedPlotChar.name}
                </h3>
              </div>
              <button
                onClick={handleClosePlotModal}
                className="w-8 h-8 rounded-full bg-[#B995A7] hover:bg-[#9D7E90] text-[#FFFCFA] flex items-center justify-center text-sm font-bold transition-colors cursor-pointer shadow-sm"
                title="Đóng (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-[#4D4449] leading-relaxed font-sans">
              {selectedPlotChar.plot ? (
                <div className="whitespace-pre-line font-serif text-[#4D4449] leading-relaxed">
                  {selectedPlotChar.plot}
                </div>
              ) : selectedPlotChar.backstory ? (
                <div className="whitespace-pre-line font-serif text-[#4D4449] leading-relaxed">
                  {selectedPlotChar.backstory}
                </div>
              ) : (
                <p className="italic text-[#76636E]">Chưa có nội dung plot chi tiết cho nhân vật này.</p>
              )}

              {selectedPlotChar.linkGGAI && (
                <div className="pt-4 border-t border-[#F4D1DE]">
                  <button
                    onClick={(e) => handleGgaiClick(e as any, selectedPlotChar)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C4A1B2] to-[#AE899D] hover:from-[#B995A7] hover:to-[#9D7E90] text-[#FFFCFA] border border-[#E2CFA9] px-4 py-2.5 rounded-xl font-semibold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <span>{selectedPlotChar.isLocked && !unlockedCharIds.has(selectedPlotChar.id) ? '🔒' : '✨'}</span>
                    <span>Mở Prompt Trên Google AI Studio</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
           PASSWORD UNLOCK MODAL (🔒)
         ======================================================= */}
      {passwordModalChar && (() => {
        const charMaxAttempts = passwordModalChar.maxAttempts || (passwordModalChar.id === 'an-tich-vu' ? 5 : 5);
        const charFails = failedAttemptsMap[passwordModalChar.id] || 0;
        const isCharLockedOut = lockedOutCharIds.has(passwordModalChar.id) || charFails >= charMaxAttempts;
        const hintThreshold = charMaxAttempts <= 5 ? 2 : 10;

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
            <div className="bg-[#FFFCFA] border border-[#E2CFA9] rounded-2xl max-w-md w-full p-6 shadow-[0_24px_70px_rgba(185,149,167,0.22)] flex flex-col gap-4 relative">
              <button
                onClick={() => {
                  setPasswordModalChar(null);
                  setEnteredPass('');
                  setShowPassword(false);
                  setPassError('');
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#B995A7] text-[#FFFCFA] flex items-center justify-center text-sm font-bold hover:bg-[#9D7E90] transition-colors cursor-pointer shadow-sm"
                title="Đóng"
              >
                ✕
              </button>

              <div className="text-center">
                <div className={`w-12 h-12 rounded-full ${isCharLockedOut ? 'bg-red-100 text-red-600 border-red-300' : 'bg-[#FBE3EC] text-[#76636E] border-[#D8A7BB]'} border flex items-center justify-center mx-auto mb-2 text-2xl shadow-sm`}>
                  {isCharLockedOut ? '🚫' : '🔒'}
                </div>
                <h3 className="font-cormorant text-2xl font-bold text-[#4D4449]">
                  {isCharLockedOut ? 'Liên Kết Đã Bị Khóa' : 'Yêu Cầu Mật Mã'}
                </h3>
                <p className="text-xs text-[#76636E] font-medium mt-1">
                  {isCharLockedOut ? (
                    <>Liên kết của nhân vật <strong className="text-red-700">{passwordModalChar.name}</strong> đã bị vô hiệu hóa.</>
                  ) : (
                    <>Nhân vật <strong className="text-[#4D4449]">{passwordModalChar.name}</strong> đang trong trạng thái phong ấn.</>
                  )}
                </p>
              </div>

              {isCharLockedOut ? (
                <div className="flex flex-col gap-3">
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-xs leading-relaxed text-center font-medium shadow-inner">
                    <p className="font-bold mb-1 text-sm">🔒 ĐÃ THỬ SAI QUÁ {charMaxAttempts} LẦN</p>
                    <p>Bạn đã nhập sai mật khẩu <strong>{charFails}/{charMaxAttempts}</strong> lần. Theo quy định bảo mật, liên kết này đã bị khóa vĩnh viễn.</p>
                  </div>
                  <button
                    onClick={() => {
                      setPasswordModalChar(null);
                      setEnteredPass('');
                      setPassError('');
                    }}
                    className="w-full py-2.5 bg-[#B995A7] hover:bg-[#9D7E90] text-[#FFFCFA] rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm text-center"
                  >
                    Đóng Cửa Sổ
                  </button>
                </div>
              ) : (
                <>
                  {passwordModalChar.question && (
                    <div className="bg-[#FFF8F3] border border-[#F4D1DE] rounded-xl p-3.5 text-xs text-[#4D4449] whitespace-pre-line leading-relaxed shadow-inner">
                      <span className="font-bold text-[#76636E] flex items-center gap-1 mb-1">
                        <span>❓</span>
                        <span>Câu hỏi giải mã:</span>
                      </span>
                      {passwordModalChar.question}
                    </div>
                  )}

                  <form onSubmit={handleUnlockSubmit} className="flex flex-col gap-3">
                    <div className="relative w-full">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={enteredPass}
                        onChange={(e) => {
                          setEnteredPass(e.target.value);
                          setPassError('');
                        }}
                        placeholder="Nhập mật khẩu mở khóa..."
                        autoFocus
                        className="w-full px-4 py-2.5 pr-11 rounded-xl border border-[#E9BBCD] bg-[#FFFCFA] text-sm text-[#4D4449] placeholder-[#9D8E95] focus:outline-none focus:border-[#B995A7] focus:ring-2 focus:ring-[#F4D1DE]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76636E] hover:text-[#4D4449] p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-[#FBE3EC]/60"
                        title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-[#76636E]" />
                        ) : (
                          <Eye className="w-4 h-4 text-[#76636E]" />
                        )}
                      </button>
                    </div>

                    {passError && (
                      <div className="text-xs text-[#76636E] font-semibold text-center bg-[#FBE3EC] border border-[#D8A7BB] py-1.5 rounded-lg">
                        {passError}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-[#C4A1B2] to-[#AE899D] hover:from-[#B995A7] hover:to-[#9D7E90] text-[#FFFCFA] border border-[#E2CFA9] rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-[0_0_24px_rgba(244,209,222,0.78)] cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>🔓</span>
                      <span>Mở Khóa Nhân Vật</span>
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* =======================================================
           CREATOR INFO MODAL
         ======================================================= */}
      {isCreatorInfoOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsCreatorInfoOpen(false)}
        >
          <div
            className="bg-[#FFFCFA] border border-[#E9BBCD] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-[0_24px_70px_rgba(185,149,167,0.22)] flex flex-col items-center text-center relative max-h-[90vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE */}
            <button
              onClick={() => setIsCreatorInfoOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FFF1F6] text-[#B995A7] hover:bg-[#FBE3EC] hover:text-[#4D4449] flex items-center justify-center text-lg transition-colors cursor-pointer shadow-sm"
              title="Đóng"
            >
              ✕
            </button>

            {/* DECORATION */}
            <div className="text-[#D8A7BB] tracking-[0.2em] text-sm mb-4">✦ ❀ ✦</div>

            {/* AVATAR */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#F4D1DE] overflow-hidden mb-4 bg-[#FFF1F6] flex items-center justify-center shadow-lg relative shrink-0">
              <img src="https://files.catbox.moe/z4aadt.jpg" alt="Creator Avatar" className="w-full h-full object-cover" />
            </div>

            {/* NAME */}
            <div className="font-cormorant text-3xl font-bold text-[#4D4449] mb-1">L'amour est Hera</div>
            <div className="text-[10px] sm:text-xs font-bold text-[#B995A7] tracking-[0.15em] mb-4">CREATOR · WRITER · WORLD BUILDER</div>

            {/* TAGLINE */}
            <div className="italic text-sm text-[#76636E] mb-6 px-4">
              “Mình là một creator nhỏ bé bị tư bản bào mòn nên tìm chút lấp lánh nơi mộng ảo. Mong rằng bạn ghé qua có thể để lại chút dịu dàng và cùng mình nán lại lâu thêm đôi chút.”
            </div>

            {/* DIVIDER */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#E9BBCD] to-transparent relative mb-6 flex justify-center items-center">
              <span className="bg-[#FFFCFA] px-2 text-[#D8A7BB] text-xs">✦</span>
            </div>

            {/* INTRODUCTION */}
            <div className="text-sm sm:text-base text-[#76636E] leading-relaxed space-y-3 mb-8 px-2 text-justify">
              <p>Xin chào, mình là Hera.</p>
              <p>Đây là một góc nhỏ được mình tạo ra để lưu giữ những nhân vật, câu chuyện và những thế giới mà mình đã dành thời gian tưởng tượng, xây dựng và chăm chút.</p>
              <p>Nếu bạn tình cờ bước vào nơi này, hy vọng bạn sẽ tìm được một nhân vật khiến mình muốn ở lại lâu hơn một chút.</p>
            </div>

            {/* STATS */}
            <div className="flex w-full justify-around items-center border-y border-[#F4D1DE] py-4 mb-6 bg-[#FFF8F3]/50 rounded-xl">
              <div className="flex flex-col items-center">
                <strong className="text-xl font-cormorant text-[#4D4449]">04+</strong>
                <span className="text-[9px] font-bold tracking-wider text-[#B995A7] mt-1">CHARACTERS</span>
              </div>
              <div className="flex flex-col items-center">
                <strong className="text-xl font-cormorant text-[#4D4449]">∞</strong>
                <span className="text-[9px] font-bold tracking-wider text-[#B995A7] mt-1">STORIES</span>
              </div>
              <div className="flex flex-col items-center">
                <strong className="text-xl font-cormorant text-[#4D4449]">♡</strong>
                <span className="text-[9px] font-bold tracking-wider text-[#B995A7] mt-1">DREAMS</span>
              </div>
            </div>

            {/* LINKS */}
            <div className="flex flex-col w-full gap-3 mb-6">
              <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl border border-[#F4D1DE] bg-[#FFF8F3] hover:bg-[#FBE3EC] transition-colors group text-left">
                <div className="flex items-center gap-3">
                  <span className="text-xl text-[#B995A7] w-8 text-center">◎</span>
                  <div className="flex flex-col">
                    <small className="text-[9px] tracking-wider font-bold text-[#76636E]">PAGE</small>
                    <strong className="text-[#4D4449] text-sm">L'amour est Hera</strong>
                  </div>
                </div>
                <b className="text-[#B995A7] group-hover:translate-x-1 transition-transform">↗</b>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl border border-[#F4D1DE] bg-[#FFF8F3] hover:bg-[#FBE3EC] transition-colors group text-left">
                <div className="flex items-center gap-3">
                  <span className="text-xl text-[#B995A7] w-8 text-center">◇</span>
                  <div className="flex flex-col">
                    <small className="text-[9px] tracking-wider font-bold text-[#76636E]">COMMUNITY</small>
                    <strong className="text-[#4D4449] text-sm">Discord Server</strong>
                  </div>
                </div>
                <b className="text-[#B995A7] group-hover:translate-x-1 transition-transform">↗</b>
              </a>
            </div>

            {/* FOOTER */}
            <div className="text-[11px] text-[#B995A7] italic font-medium">
              Made with a little imagination ♡
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
           DONATE MODAL ("Một chút yêu thương ♡")
         ======================================================= */}
      {isDonateModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsDonateModalOpen(false)}
        >
          <div
            className="bg-[#FFFCFA] border border-[#E2CFA9] rounded-2xl max-w-sm w-full p-6 shadow-[0_24px_70px_rgba(185,149,167,0.22)] flex flex-col items-center text-center gap-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsDonateModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#B995A7] text-[#FFFCFA] flex items-center justify-center text-sm font-bold hover:bg-[#9D7E90] transition-colors cursor-pointer shadow-sm"
              title="Đóng"
            >
              ✕
            </button>

            <div className="w-12 h-12 rounded-full bg-[#FBE3EC] text-[#76636E] border border-[#D8A7BB] flex items-center justify-center text-2xl shadow-sm">
              ♡
            </div>

            <div>
              <h3 className="font-cormorant text-2xl font-bold text-[#4D4449]">
                Một Chút Yêu Thương ♡
              </h3>
              <p className="text-xs text-[#76636E] font-medium mt-2 flex items-center justify-center gap-1.5 flex-wrap">
                <span>Cảm ơn bbi đã luôn đồng hành và ủng hộ Dượng</span>
                <img
                  src="https://files.catbox.moe/lm6v8s.gif"
                  alt="sticker"
                  className="w-7 h-7 inline-block object-contain"
                  referrerPolicy="no-referrer"
                />
              </p>
            </div>

            <div className="w-full bg-[#FFF8F3] border border-[#F4D1DE] rounded-xl p-3 shadow-inner flex justify-center items-center">
              <img
                src="https://files.catbox.moe/iwo8c1.png"
                alt="Số tài khoản ủng hộ"
                className="max-w-full h-auto max-h-[60vh] rounded-lg border border-[#E9BBCD] object-contain shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
           HINT MODAL (10, 20, 30 fails...)
         ======================================================= */}
      {hintModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#FFFCFA] border-2 border-[#D8A7BB] rounded-2xl max-w-sm w-full p-6 shadow-2xl flex flex-col items-center text-center gap-4 relative">
            <button
              onClick={() => setHintModal(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#B995A7] text-[#FFFCFA] flex items-center justify-center text-xs font-bold hover:bg-[#9D7E90] transition-colors cursor-pointer"
              title="Đóng"
            >
              ✕
            </button>
            <div className="w-12 h-12 rounded-full bg-[#FBE3EC] text-[#76636E] border border-[#D8A7BB] flex items-center justify-center text-2xl shadow-sm mb-2">
              💡
            </div>
            <h3 className="font-cormorant text-2xl font-bold text-[#4D4449]">
              Gợi Ý Giải Mã
            </h3>
            <p className="text-sm text-[#76636E] font-medium mb-2">
              Bạn đã nhập sai nhiều lần cho nhân vật <strong className="text-[#4D4449]">{hintModal.charName}</strong>.
            </p>
            <div className="w-full bg-[#FFF8F3] border border-[#F4D1DE] rounded-xl p-4 text-[#4D4449] font-medium shadow-inner">
              "{hintModal.hint}"
            </div>
            <button
              onClick={() => setHintModal(null)}
              className="mt-2 w-full py-2.5 bg-gradient-to-r from-[#C4A1B2] to-[#AE899D] hover:from-[#B995A7] hover:to-[#9D7E90] text-[#FFFCFA] border border-[#E2CFA9] rounded-xl text-sm font-semibold transition-all shadow-md cursor-pointer"
            >
              Đã hiểu & Tiếp tục
            </button>
          </div>
        </div>
      )}

      {/* =======================================================
           FOOTER
         ======================================================= */}
      <footer className="footer-archive">
        <div className="footer-name-archive">L'amour est Hera</div>
        <p>Every character carries a story.</p>
      </footer>
    </div>
  );
};
