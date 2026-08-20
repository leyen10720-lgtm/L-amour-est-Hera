import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Character, Relationship } from '../types';
import { 
  X, 
  Heart, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  BookOpen, 
  User, 
  Shield, 
  Lock,
  ChevronRight,
  Eye,
  Crown
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface CharacterDossierModalProps {
  character: Character | null;
  onClose: () => void;
  relationships?: Relationship[];
  onSelectCharacterById?: (id: string) => void;
  isLiked?: boolean;
  onToggleLike?: (charId: string) => void;
}

export const CharacterDossierModal: React.FC<CharacterDossierModalProps> = ({
  character,
  onClose,
  relationships = [],
  onSelectCharacterById,
  isLiked = false,
  onToggleLike
}) => {
  const [activeTab, setActiveTab] = useState<'plot' | 'profile' | 'relations'>('plot');
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  useEffect(() => {
    if (character) {
      soundEffects.playAntiqueChime(660);
      setActiveTab('plot');
    }
  }, [character]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && character) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [character, onClose]);

  if (!character) return null;

  const handleCopyPlot = () => {
    const textToCopy = character.plot || character.backstory || character.description || '';
    if (!textToCopy) return;

    soundEffects.playPageTurn();
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }
    setCopied(true);
    setShowToast('Đã sao chép nội dung kịch bản vào clipboard!');
    setTimeout(() => {
      setCopied(false);
      setShowToast(null);
    }, 2800);
  };

  const handleOpenGgai = () => {
    if (character.linkGGAI) {
      soundEffects.playSelectClick();
      window.open(character.linkGGAI, '_blank', 'noopener,noreferrer');
    }
  };

  const charRelations = relationships.filter(
    (r) => r.characterAId === character.id || r.characterBId === character.id
  );

  return (
    <AnimatePresence>
      <div 
        id="character-dossier-modal"
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      >
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#4D4449]/70 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-[#FFFCFA] border-2 border-[#D8A7BB] rounded-3xl shadow-[0_25px_70px_rgba(118,99,110,0.3)] flex flex-col overflow-hidden z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Decorative Border Ribbon */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#D8A7BB] via-[#F4D1DE] to-[#D8A7BB] shrink-0" />

          {/* Modal Header (Sticky so close button stays visible at all times) */}
          <div className="shrink-0 sticky top-0 z-30 px-5 sm:px-8 pt-5 pb-4 border-b border-[#F4D1DE] flex items-start justify-between gap-4 bg-[#FFF8F3]/95 backdrop-blur-md">
            {/* Character Header Info */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#D8A7BB] shadow-md bg-[#FFF1F6] flex items-center justify-center">
                <img
                  src={character.avatarUrl || 'https://files.catbox.moe/3plt6u.jpg'}
                  alt={character.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-1 left-1 text-[10px] text-[#D8A7BB]">✦</span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#B995A7]">
                    {character.vietnameseTitle || 'Hồ Sơ Nhân Vật'}
                  </span>
                  {character.age && (
                    <span className="text-[10px] bg-[#FFF1F6] text-[#76636E] border border-[#F4D1DE] px-2 py-0.5 rounded-full font-medium">
                      {character.age}
                    </span>
                  )}
                  {character.faction && (
                    <span className="text-[10px] bg-[#FBE3EC] text-[#4D4449] border border-[#D8A7BB] px-2 py-0.5 rounded-full font-semibold">
                      {character.faction}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold font-cormorant text-[#4D4449] tracking-wide leading-tight truncate mt-0.5">
                  {character.name}
                </h2>
                
                {character.englishTitle && (
                  <p className="text-xs text-[#76636E] italic font-cormorant">
                    {character.englishTitle}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons: Close (Always following & visible) */}
            <div className="flex items-center gap-2 shrink-0">
              {onToggleLike && (
                <button
                  onClick={() => {
                    soundEffects.playSelectClick();
                    onToggleLike(character.id);
                  }}
                  className={`p-2.5 rounded-full border transition-all cursor-pointer shadow-sm ${
                    isLiked
                      ? 'bg-[#FBE3EC] text-[#D8A7BB] border-[#D8A7BB]'
                      : 'bg-[#FFF8F3] text-[#76636E] border-[#F4D1DE] hover:bg-[#FBE3EC]'
                  }`}
                  title={isLiked ? 'Bỏ yêu thích' : 'Yêu thích nhân vật'}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              )}
              <button
                onClick={() => {
                  soundEffects.playPageTurn();
                  onClose();
                }}
                className="p-2.5 rounded-full border border-[#D8A7BB] bg-[#FFF8F3] hover:bg-[#FBE3EC] text-[#4D4449] transition-colors cursor-pointer shadow-sm"
                title="Đóng cửa sổ (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="shrink-0 sticky top-[80px] sm:top-[92px] z-20 px-5 sm:px-8 border-b border-[#F4D1DE] bg-[#FFF8FB]/95 backdrop-blur-md flex items-center gap-2 sm:gap-4 overflow-x-auto py-2">
            <button
              onClick={() => {
                soundEffects.playPageTurn();
                setActiveTab('plot');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'plot'
                  ? 'bg-gradient-to-r from-[#C4A1B2] to-[#AE899D] text-[#FFFCFA] shadow-sm'
                  : 'text-[#76636E] hover:bg-[#FBE3EC]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Cốt Truyện & Kịch Bản</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playPageTurn();
                setActiveTab('profile');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-[#C4A1B2] to-[#AE899D] text-[#FFFCFA] shadow-sm'
                  : 'text-[#76636E] hover:bg-[#FBE3EC]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Hồ Sơ & Đặc Điểm</span>
            </button>

            {charRelations.length > 0 && (
              <button
                onClick={() => {
                  soundEffects.playPageTurn();
                  setActiveTab('relations');
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'relations'
                    ? 'bg-gradient-to-r from-[#C4A1B2] to-[#AE899D] text-[#FFFCFA] shadow-sm'
                    : 'text-[#76636E] hover:bg-[#FBE3EC]'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Mối Quan Hệ ({charRelations.length})</span>
              </button>
            )}
          </div>

          {/* Modal Body Content */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-6 text-[#4D4449]">
            {/* TAB 1: PLOT & STORY */}
            {activeTab === 'plot' && (
              <div className="space-y-6">
                {/* Vietnamese Quote Box */}
                {(character.vietnameseQuote || character.quote) && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF8F3] to-[#FBE3EC] border border-[#D8A7BB] relative">
                    <span className="absolute top-2 left-3 text-2xl text-[#D8A7BB] font-cormorant leading-none">“</span>
                    <p className="text-sm sm:text-base font-cormorant italic text-[#4D4449] px-4 font-semibold text-center">
                      {character.vietnameseQuote || character.quote}
                    </p>
                    <span className="absolute bottom-1 right-3 text-2xl text-[#D8A7BB] font-cormorant leading-none">”</span>
                  </div>
                )}

                {/* Tags */}
                {character.tags && character.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {character.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-[#FFF1F6] text-[#76636E] border border-[#F4D1DE] text-xs font-medium px-2.5 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Plot text display */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFCFA] border border-[#F4D1DE] shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F4D1DE] pb-3">
                    <h3 className="text-base font-bold font-cormorant text-[#4D4449] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D8A7BB]" />
                      Chi Tiết Thiết Lập & Kịch Bản Mở Đầu
                    </h3>
                    <button
                      onClick={handleCopyPlot}
                      className="px-3 py-1.5 rounded-xl border border-[#D8A7BB] bg-[#FFF8F3] hover:bg-[#FBE3EC] text-[#76636E] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Đã Sao Chép' : 'Sao Chép'}</span>
                    </button>
                  </div>

                  <div className="text-xs sm:text-sm leading-relaxed text-[#4D4449] space-y-3 whitespace-pre-line font-serif">
                    {character.plot || character.backstory || character.description || 'Chưa có thông tin kịch bản.'}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PROFILE & ATTRIBUTES */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Basic Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#FFF8F3] border border-[#F4D1DE] text-center">
                    <span className="text-[10px] uppercase font-bold text-[#B995A7] block">Tuổi</span>
                    <strong className="text-sm font-semibold text-[#4D4449]">{character.age || 'Chưa rõ'}</strong>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#FFF8F3] border border-[#F4D1DE] text-center">
                    <span className="text-[10px] uppercase font-bold text-[#B995A7] block">Chiều cao</span>
                    <strong className="text-sm font-semibold text-[#4D4449]">{character.height || '1m74'}</strong>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#FFF8F3] border border-[#F4D1DE] text-center">
                    <span className="text-[10px] uppercase font-bold text-[#B995A7] block">Thân phận</span>
                    <strong className="text-sm font-semibold text-[#4D4449] truncate block" title={character.role || ''}>
                      {character.role || 'Chưa rõ'}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#FFF8F3] border border-[#F4D1DE] text-center">
                    <span className="text-[10px] uppercase font-bold text-[#B995A7] block">Thế lực / Gia tộc</span>
                    <strong className="text-sm font-semibold text-[#4D4449] truncate block" title={character.faction || ''}>
                      {character.faction || 'Chưa rõ'}
                    </strong>
                  </div>
                </div>

                {/* Appearance */}
                {character.appearance && character.appearance.length > 0 && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFCFA] border border-[#F4D1DE]">
                    <h4 className="text-sm font-bold font-cormorant text-[#4D4449] mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[#D8A7BB]" />
                      Ngoại Hình & Khí Chất
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-[#76636E]">
                      {character.appearance.map((app, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#D8A7BB] mt-0.5">✦</span>
                          <span>{app}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Personality */}
                {character.personality && character.personality.length > 0 && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFCFA] border border-[#F4D1DE]">
                    <h4 className="text-sm font-bold font-cormorant text-[#4D4449] mb-3 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-[#D8A7BB]" />
                      Tính Cách & Tâm Lý
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-[#76636E]">
                      {character.personality.map((pers, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#D8A7BB] mt-0.5">✦</span>
                          <span>{pers}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Secrets / Hidden Lore */}
                {character.secrets && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF1F6] border border-[#F4D1DE]">
                    <h4 className="text-sm font-bold font-cormorant text-[#4D4449] mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#D8A7BB]" />
                      Bí Mật & Thói Quen
                    </h4>
                    <p className="text-xs sm:text-sm text-[#76636E] italic">
                      {character.secrets}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: RELATIONSHIPS */}
            {activeTab === 'relations' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold font-cormorant text-[#4D4449] mb-2">
                  Các Mối Quan Hệ Trong Lưu Trữ
                </h4>
                {charRelations.length === 0 ? (
                  <p className="text-xs text-[#76636E] italic">Chưa có dữ liệu mối quan hệ liên kết.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {charRelations.map((rel) => {
                      const isTargetA = rel.characterAId === character.id;
                      const targetName = isTargetA ? rel.characterBName : rel.characterAName;
                      const targetId = isTargetA ? rel.characterBId : rel.characterAId;
                      const targetAvatar = isTargetA ? rel.characterBAvatar : rel.characterAAvatar;

                      return (
                        <div
                          key={rel.id}
                          onClick={() => {
                            if (onSelectCharacterById && targetId) {
                              onSelectCharacterById(targetId);
                            }
                          }}
                          className="p-3.5 rounded-2xl bg-[#FFF8F3] border border-[#F4D1DE] hover:border-[#D8A7BB] hover:bg-[#FBE3EC] transition-all cursor-pointer flex items-center gap-3"
                        >
                          <img
                            src={targetAvatar || 'https://files.catbox.moe/3plt6u.jpg'}
                            alt={targetName}
                            className="w-10 h-10 rounded-full object-cover border border-[#D8A7BB]"
                          />
                          <div className="min-w-0 flex-1">
                            <strong className="text-xs font-semibold text-[#4D4449] block truncate">{targetName}</strong>
                            <span className="text-[10px] text-[#B995A7] block">{rel.relationType || rel.title}</span>
                            <p className="text-[10px] text-[#76636E] line-clamp-1 mt-0.5">{rel.description}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#B995A7] shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer Bar */}
          <div className="px-5 sm:px-8 py-4 border-t border-[#F4D1DE] bg-gradient-to-t from-[#FFF8F3] to-[#FFFCFA] flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#76636E]">
                ID: <span className="font-mono text-[#B995A7]">{character.id}</span>
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {character.linkGGAI && (
                <button
                  onClick={handleOpenGgai}
                  className="flex-1 sm:flex-none border border-[#D8A7BB] bg-[#FFF8F3] hover:bg-[#FBE3EC] text-[#76636E] text-xs font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở Google AI Studio</span>
                </button>
              )}

              <button
                onClick={handleCopyPlot}
                className="flex-1 sm:flex-none bg-gradient-to-r from-[#C4A1B2] to-[#AE899D] text-[#FFFCFA] hover:from-[#AE899D] hover:to-[#967487] text-xs font-semibold px-5 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã Copy' : 'Copy Kịch Bản'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Temporary Toast inside Modal */}
        {showToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] rounded-xl border border-[#D8A7BB] bg-[#FFFCFA] px-4 py-2.5 text-xs font-semibold text-[#4D4449] shadow-lg">
            {showToast}
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
