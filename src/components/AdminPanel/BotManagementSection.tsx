import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Upload,
  Image as ImageIcon,
  Tag,
  Plus,
  X,
  Link as LinkIcon,
  Lock,
  Unlock,
  ShieldCheck,
  Save,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  Clock,
  UserCheck,
  Trash2,
  FileText,
  RefreshCw
} from 'lucide-react';
import { Character, BotUpdatePayload } from '../../types';
import { ALL_TAGS } from '../../data/archiveData';
import { apiUpdateCharacter, apiUploadBotImage } from '../../services/api';
import { soundEffects } from '../../utils/audio';

interface BotManagementSectionProps {
  characters: Character[];
  onCharacterUpdated: (updated: Character) => void;
  adminUsername: string;
}

export const BotManagementSection: React.FC<BotManagementSectionProps> = ({
  characters,
  onCharacterUpdated,
  adminUsername
}) => {
  // Selected Bot ID
  const [selectedBotId, setSelectedBotId] = useState<string>(characters[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [slogan, setSlogan] = useState('');
  const [plot, setPlot] = useState('');
  const [plotTab, setPlotTab] = useState<'edit' | 'preview'>('edit');
  const [link, setLink] = useState('');
  
  // Password Protection State
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasExistingPassword, setHasExistingPassword] = useState(false);
  const [isRemovingPassword, setIsRemovingPassword] = useState(false);

  // Metadata
  const [lastUpdated, setLastUpdated] = useState('');
  const [updatedBy, setUpdatedBy] = useState('');

  // Action status
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // When selectedBotId changes, populate form fields
  useEffect(() => {
    if (selectedBotId === 'new') {
      setName('');
      setImage('');
      setPreviewImage('');
      setTags([]);
      setSlogan('');
      setPlot('');
      setLink('');
      
      setPasswordEnabled(false);
      setHasExistingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setIsRemovingPassword(false);

      setLastUpdated('-');
      setUpdatedBy(adminUsername);

      setErrorMessage(null);
      setSuccessMessage(null);
    } else {
      const current = characters.find((c) => c.id === selectedBotId);
      if (current) {
        setName(current.name || '');
        const currentImg = current.image || current.avatarUrl || '';
        setImage(currentImg);
        setPreviewImage(currentImg);
        setTags(current.tags ? [...current.tags] : []);
        setSlogan(current.slogan || current.vietnameseQuote || current.quote || current.description || '');
        setPlot(current.plot || current.backstory || '');
        setLink(current.link || current.linkGGAI || '');
        
        const isLocked = !!current.isLocked || !!current.password_enabled;
        setPasswordEnabled(isLocked);
        setHasExistingPassword(!!current.hasPassword || isLocked);
        setNewPassword('');
        setConfirmPassword('');
        setIsRemovingPassword(false);

        setLastUpdated(current.updated_at || current.updatedAt || '20/08/2026 18:30');
        setUpdatedBy(current.updated_by || current.updatedBy || 'admin');

        setErrorMessage(null);
        setSuccessMessage(null);
      }
    }
  }, [selectedBotId, characters, adminUsername]);

  // Filter bots for dropdown
  const filteredBots = characters.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.englishTitle && c.englishTitle.toLowerCase().includes(q)) ||
      (c.vietnameseTitle && c.vietnameseTitle.toLowerCase().includes(q))
    );
  });

  // Handle Image Upload via file picker
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setErrorMessage('Định dạng ảnh không hỗ trợ. Vui lòng chọn file JPG, PNG, WEBP hoặc GIF.');
      soundEffects.playAntiqueChime(300);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Dung lượng ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.');
      soundEffects.playAntiqueChime(300);
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setPreviewImage(base64Data);

      const uploadResult = await apiUploadBotImage(base64Data, file.name, file.type);
      setIsUploading(false);

      if (uploadResult.success && uploadResult.url) {
        setImage(uploadResult.url);
        setPreviewImage(uploadResult.url);
        soundEffects.playAntiqueChime(880);
      } else {
        // Fallback to base64 data URL
        setImage(base64Data);
      }
    };
    reader.onerror = () => {
      setIsUploading(false);
      setErrorMessage('Lỗi khi đọc tệp ảnh.');
    };
    reader.readAsDataURL(file);
  };

  // Tag Management
  const handleAddTag = (tagToAdd?: string) => {
    const tag = (tagToAdd || newTagInput).trim();
    if (!tag) return;
    if (tags.includes(tag)) {
      setNewTagInput('');
      return;
    }
    setTags([...tags, tag]);
    setNewTagInput('');
    soundEffects.playPageTurn();
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
    soundEffects.playPageTurn();
  };

  // Remove Password Option
  const handleRemovePassword = () => {
    setIsRemovingPassword(true);
    setPasswordEnabled(false);
    setNewPassword('');
    setConfirmPassword('');
    setHasExistingPassword(false);
    soundEffects.playSelectClick();
  };

  // Submit Save Changes
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBotId) return;

    // Validation
    if (!name.trim()) {
      setErrorMessage('Tên bot không được để trống.');
      soundEffects.playAntiqueChime(300);
      return;
    }

    if (link.trim()) {
      const trimmedLink = link.trim();
      if (!trimmedLink.startsWith('http://') && !trimmedLink.startsWith('https://') && !trimmedLink.startsWith('//')) {
        setErrorMessage('Bot Link phải là URL hợp lệ (bắt đầu bằng https:// hoặc http://).');
        soundEffects.playAntiqueChime(300);
        return;
      }
    }

    if (passwordEnabled && newPassword) {
      if (newPassword !== confirmPassword) {
        setErrorMessage('Mật khẩu xác nhận không khớp với mật khẩu mới.');
        soundEffects.playAntiqueChime(300);
        return;
      }
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload: BotUpdatePayload = {
      name: name.trim(),
      image: image || previewImage,
      avatarUrl: image || previewImage,
      bannerUrl: image || previewImage,
      tags: tags,
      slogan: slogan.trim(),
      quote: slogan.trim(),
      vietnameseQuote: slogan.trim(),
      description: slogan.trim(),
      plot: plot,
      link: link.trim(),
      linkGGAI: link.trim(),
      password_enabled: passwordEnabled,
      isLocked: passwordEnabled,
      new_password: passwordEnabled && newPassword.trim() ? newPassword.trim() : undefined,
      remove_password: isRemovingPassword || !passwordEnabled,
    };

    let result;
    if (selectedBotId === 'new') {
      result = await import('../../services/api').then(m => m.apiCreateCharacter(payload));
    } else {
      result = await apiUpdateCharacter(selectedBotId, payload);
    }
    
    setIsSaving(false);

    if (result.success && result.data) {
      soundEffects.playAntiqueChime(880);
      setSuccessMessage(selectedBotId === 'new' ? 'Bot created successfully' : 'Bot updated successfully');
      setLastUpdated(result.data.updated_at || result.data.updatedAt || 'Hôm nay');
      setUpdatedBy(result.data.updated_by || result.data.updatedBy || adminUsername);
      setHasExistingPassword(!!result.data.hasPassword || !!result.data.isLocked);
      setNewPassword('');
      setConfirmPassword('');
      setIsRemovingPassword(false);
      
      onCharacterUpdated(result.data);

      if (selectedBotId === 'new') {
         setSelectedBotId(result.data.id);
      }

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } else {
      soundEffects.playAntiqueChime(300);
      setErrorMessage(result.error || (selectedBotId === 'new' ? 'Lỗi khi tạo bot mới.' : 'Lỗi khi cập nhật bot.'));
    }
  };

  const selectedBot = characters.find((c) => c.id === selectedBotId);

  const renderLivePreviewCard = () => {
    return (
      <div className="bg-[#FFFCFA] border border-[#E9BBCD] rounded-2xl p-5 shadow-[0_18px_50px_rgba(118,99,110,0.14)] flex flex-col gap-4 relative overflow-hidden group">
        {/* Subtle hover background accent */}
        <div className="absolute inset-0 bg-[#FFF8FB] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        {/* TOP: Dedicated Character Info Layout with compact Blink-Blink Image Frame */}
        <div className="flex flex-row gap-4 items-start w-full relative z-10">
          {/* Shimmering compact 1:1 square blink-blink card frame */}
          {(previewImage || image) ? (
            <div 
              className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-[#E9BBCD] bg-gradient-to-b from-[#FFFCFA] to-[#FFF8F3] blink-blink-card group/avatar shadow-sm flex items-center justify-center transition-transform"
            >
              <img
                src={image || previewImage}
                alt={name || 'Tên Bot'}
                className="w-full h-full object-cover rounded-lg group-hover/avatar:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#FBE3EC]/10 via-transparent to-white/10 pointer-events-none" />
              <span className="sparkle-decor top-1 left-1 text-[10px]" style={{ animationDelay: '0s' }}>✦</span>
              <span className="sparkle-decor bottom-1.5 right-1.5 text-[9px]" style={{ animationDelay: '0.6s' }}>✧</span>
            </div>
          ) : (
            <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-[#E9BBCD] bg-[#FFF8F3] flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-[#AAA5CC]" />
            </div>
          )}

          {/* Character Details Column */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-cormorant text-xl sm:text-2xl font-bold text-[#4D4449] leading-tight flex items-center gap-2">
                  <span>{name || 'Tên Bot'}</span>
                  {passwordEnabled && (
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded font-bold flex items-center gap-1 border bg-[#FBE3EC] text-[#76636E] border-[#D8A7BB]">
                      🔒 Khóa
                    </span>
                  )}
                </h3>
                {selectedBot?.role && (
                  <span className="bg-[#B995A7] text-[#FFFCFA] text-[9px] font-semibold px-2 py-0.5 rounded-lg border border-[#E2CFA9] text-center leading-tight max-w-full">
                    {selectedBot.role}
                  </span>
                )}
              </div>
            </div>

            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#76636E] mt-1">
              {selectedBot?.vietnameseTitle || selectedBot?.englishTitle || 'Tiêu Đề'} {selectedBot?.faction ? `• ${selectedBot.faction}` : ''}
            </div>

            <p className="text-xs sm:text-sm text-[#4D4449] italic mt-2 leading-relaxed">
              "{slogan || 'Chưa có thông tin mô tả.'}"
            </p>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {tags.map((tag, idx) => (
                  <span key={idx} className="text-[9px] sm:text-[10px] font-medium text-[#76636E] bg-[#FFF1F6] border border-[#F4D1DE] px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM: Action Buttons */}
        <div className="flex items-center justify-between mt-1 pt-3 border-t border-[#F4D1DE] relative z-10">
          <div className="flex items-center gap-2">
             <button disabled className="px-3 py-1.5 rounded-xl border border-[#E9BBCD] text-xs font-semibold bg-[#FFFCFA] text-[#76636E] opacity-70">
                📖 Plot
             </button>
             <button disabled className="px-3 py-1.5 rounded-xl border border-[#E9BBCD] text-xs font-semibold bg-[#FFFCFA] text-[#76636E] opacity-70 flex items-center gap-1.5">
                {passwordEnabled ? '🔒' : '✨'} Mở Bot
             </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 xl:col-span-8 space-y-6">
        {/* Bot Selector Header Card */}
        <div className="bg-[#FFFCFA] border border-[#E9BBCD] rounded-2xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(118,99,110,0.08)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[#C5A779] text-sm">✦</span>
              <h3 className="font-cormorant text-xl sm:text-2xl font-bold text-[#4D4449]">
                Bot Management / Update Bot
              </h3>
            </div>
            <p className="text-xs text-[#76636E] mt-0.5">
              Chọn nhân vật và chỉnh sửa thông tin chi tiết trực tiếp trên hệ thống
            </p>
          </div>

          {/* Selector Dropdown & Quick Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative min-w-[240px]">
              <select
                value={selectedBotId}
                onChange={(e) => {
                  soundEffects.playPageTurn();
                  setSelectedBotId(e.target.value);
                }}
                className="w-full pl-3.5 pr-8 py-2 text-xs font-semibold bg-[#FFF8F3] border border-[#E9BBCD] rounded-xl text-[#4D4449] focus:outline-none focus:border-[#B995A7] focus:ring-2 focus:ring-[#FBE3EC] cursor-pointer appearance-none truncate"
              >
                <option value="new" className="font-bold text-[#B995A7]">✦ Tạo Bot Mới</option>
                {filteredBots.map((bot) => (
                  <option key={bot.id} value={bot.id}>
                    {bot.isLocked ? '🔒 ' : ''}{bot.name} {bot.vietnameseTitle ? `(${bot.vietnameseTitle})` : ''}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none text-[#9D7E90]">
                ▼
              </div>
            </div>

            {/* Quick Search input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bot..."
                className="w-full sm:w-36 pl-8 pr-3 py-2 text-xs bg-[#FFF8F3] border border-[#E9BBCD] rounded-xl text-[#4D4449] placeholder-[#AAA5CC] focus:outline-none focus:border-[#B995A7]"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#9D7E90]" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Edit Form */}
      <form onSubmit={handleSaveChanges} className="space-y-6">
        {/* Status Alerts */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-[#F0FDF4] border border-[#86EFAC] rounded-2xl flex items-center gap-3 text-sm text-[#166534] shadow-sm"
          >
            <CheckCircle className="w-5 h-5 text-[#22C55E] shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-[#FFF1F6] border border-[#E9BBCD] rounded-2xl flex items-center gap-3 text-sm text-[#9F1239] shadow-sm"
          >
            <AlertCircle className="w-5 h-5 text-[#E11D48] shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {/* Section 1: Bot Profile & Image */}
        <div className="bg-[#FFFCFA] border border-[#E9BBCD] rounded-2xl p-5 sm:p-7 shadow-[0_10px_30px_rgba(118,99,110,0.08)] space-y-6">
          <div className="flex items-center gap-2 border-b border-[#F4D1DE] pb-3">
            <ImageIcon className="w-4 h-4 text-[#B995A7]" />
            <h4 className="font-cormorant text-lg font-bold text-[#4D4449]">
              1. Thông Tin Nhận Diện & Ảnh Bot
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Image Preview & Upload Controls */}
            <div className="md:col-span-4 flex flex-col items-center text-center p-4 bg-[#FFF8F3] border border-[#E9BBCD] rounded-2xl">
              <span className="text-[11px] font-semibold text-[#76636E] uppercase tracking-wider mb-2">
                Ảnh hiện tại / Preview
              </span>
              
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-[#D8A7BB] shadow-md bg-[#FFF1F6] mb-3 flex items-center justify-center">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-xs text-[#AAA5CC] flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                    <span>Chưa có ảnh</span>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-[#4D4449]/60 backdrop-blur-xs flex items-center justify-center text-white text-xs">
                    <RefreshCw className="w-5 h-5 animate-spin mb-1" />
                  </div>
                )}
              </div>

              {/* Upload New Image Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => {
                  soundEffects.playPageTurn();
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
                className="w-full py-2 px-3 rounded-xl bg-[#FFF1F6] hover:bg-[#FBE3EC] border border-[#E9BBCD] text-xs font-semibold text-[#4D4449] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5 text-[#B995A7]" />
                <span>{isUploading ? 'Đang tải lên...' : 'Upload New Image'}</span>
              </button>

              {/* Direct Image URL input */}
              <div className="w-full mt-3">
                <input
                  type="text"
                  value={image}
                  onChange={(e) => {
                    setImage(e.target.value);
                    setPreviewImage(e.target.value);
                  }}
                  placeholder="Hoặc dán URL ảnh trực tiếp..."
                  className="w-full px-2.5 py-1.5 text-[11px] bg-[#FFFCFA] border border-[#E9BBCD] rounded-lg text-[#4D4449] placeholder-[#AAA5CC] focus:outline-none focus:border-[#B995A7]"
                />
              </div>
            </div>

            {/* Right: Bot Name & Slogan */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4D4449] mb-1.5">
                  Tên Bot / Nhân Vật <span className="text-[#B995A7]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Ngụy Trạch Sâm"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FFF8F3] border border-[#E9BBCD] rounded-xl text-[#4D4449] focus:outline-none focus:border-[#B995A7] focus:ring-2 focus:ring-[#FBE3EC]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4D4449] mb-1.5">
                  Slogan / Giới thiệu ngắn
                </label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="Your mysterious roommate who knows more than she should."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FFF8F3] border border-[#E9BBCD] rounded-xl text-[#4D4449] focus:outline-none focus:border-[#B995A7] focus:ring-2 focus:ring-[#FBE3EC]"
                />
                <p className="text-[11px] text-[#76636E] mt-1 italic">
                  Slogan này sẽ được cập nhật hiển thị ngay ở phần mô tả/trích dẫn ngoài website.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4D4449] mb-1.5">
                  Bot Link (Google AI Studio / Chat URL)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9D7E90]">
                      <LinkIcon className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://aistudio.google.com/app/prompts?..."
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#FFF8F3] border border-[#E9BBCD] rounded-xl text-[#4D4449] focus:outline-none focus:border-[#B995A7]"
                    />
                  </div>
                  {link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl border border-[#E9BBCD] bg-[#FFF8F3] text-[#76636E] hover:text-[#4D4449] hover:bg-[#FBE3EC] transition-colors"
                      title="Mở thử liên kết"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Tags Management */}
        <div className="bg-[#FFFCFA] border border-[#E9BBCD] rounded-2xl p-5 sm:p-7 shadow-[0_10px_30px_rgba(118,99,110,0.08)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#F4D1DE] pb-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#B995A7]" />
              <h4 className="font-cormorant text-lg font-bold text-[#4D4449]">
                2. Quản Lý Thẻ (Tags)
              </h4>
            </div>
            <span className="text-[11px] text-[#76636E]">
              {tags.length} thẻ đang chọn
            </span>
          </div>

          {/* Current Tags Chips */}
          <div className="flex flex-wrap items-center gap-2 min-h-[42px] p-3 bg-[#FFF8F3] border border-[#E9BBCD] rounded-xl">
            {tags.length === 0 ? (
              <span className="text-xs text-[#AAA5CC] italic">Chưa có tag nào cho bot này.</span>
            ) : (
              tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBE3EC] border border-[#E9BBCD] text-xs font-medium text-[#4D4449] shadow-xs group"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[#9D7E90] hover:text-[#4D4449] hover:bg-[#E9BBCD] transition-colors cursor-pointer"
                    title="Xóa tag này"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Add Tag Input & Action */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Nhập tên tag mới (VD: Romance, Drama, Fantasy, NSFW)..."
              className="flex-1 px-3.5 py-2 text-xs bg-[#FFF8F3] border border-[#E9BBCD] rounded-xl text-[#4D4449] focus:outline-none focus:border-[#B995A7]"
            />
            <button
              type="button"
              onClick={() => handleAddTag()}
              className="px-4 py-2 rounded-xl bg-[#FBE3EC] hover:bg-[#E9BBCD] border border-[#E9BBCD] text-xs font-semibold text-[#4D4449] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Tag</span>
            </button>
          </div>

          {/* Quick Suggestions from ALL_TAGS */}
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#76636E] block mb-2">
              Gợi ý tag phổ biến:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {['Romance', 'Drama', 'Fantasy', 'NSFW', 'Dark Romance', 'Slowburn', 'Hiện Đại', 'ABO', 'Hào môn', 'Hài hước', 'Chữa lành', '3P', 'NTR', 'Commission']
                .filter((t) => !tags.includes(t))
                .map((suggested) => (
                  <button
                    key={suggested}
                    type="button"
                    onClick={() => handleAddTag(suggested)}
                    className="px-2 py-0.5 rounded-lg bg-[#FFFCFA] hover:bg-[#FBE3EC] border border-[#F4D1DE] text-[11px] text-[#76636E] hover:text-[#4D4449] transition-colors cursor-pointer"
                  >
                    + {suggested}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Section 3: Plot / Description Textarea (Preserves newlines & Markdown) */}
        <div className="bg-[#FFFCFA] border border-[#E9BBCD] rounded-2xl p-5 sm:p-7 shadow-[0_10px_30px_rgba(118,99,110,0.08)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#F4D1DE] pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#B995A7]" />
              <h4 className="font-cormorant text-lg font-bold text-[#4D4449]">
                3. Plot / Description (Bối Cảnh & Kịch Bản Bot)
              </h4>
            </div>

            <div className="flex items-center bg-[#FFF8F3] border border-[#E9BBCD] rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setPlotTab('edit')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  plotTab === 'edit'
                    ? 'bg-[#B995A7] text-white font-medium shadow-xs'
                    : 'text-[#76636E] hover:text-[#4D4449]'
                }`}
              >
                Chỉnh sửa
              </button>
              <button
                type="button"
                onClick={() => setPlotTab('preview')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  plotTab === 'preview'
                    ? 'bg-[#B995A7] text-white font-medium shadow-xs'
                    : 'text-[#76636E] hover:text-[#4D4449]'
                }`}
              >
                Xem trước
              </button>
            </div>
          </div>

          {plotTab === 'edit' ? (
            <div>
              <textarea
                value={plot}
                onChange={(e) => setPlot(e.target.value)}
                rows={12}
                placeholder="Nhập toàn bộ nội dung Plot, context, bối cảnh, thiết lập bot... Hỗ trợ Markdown và giữ nguyên định dạng xuống dòng."
                className="w-full p-4 text-xs font-mono sm:text-sm bg-[#FFF8F3] border border-[#E9BBCD] rounded-xl text-[#4D4449] focus:outline-none focus:border-[#B995A7] focus:ring-2 focus:ring-[#FBE3EC] resize-y leading-relaxed"
              />
              <p className="text-[11px] text-[#76636E] mt-1.5">
                ✦ Hỗ trợ nhiều dòng, danh sách, in đậm/in nghiêng Markdown (`**chữ đậm**`, `_in nghiêng_`, tiêu đề).
              </p>
            </div>
          ) : (
            <div className="p-4 bg-[#FFF8F3] border border-[#E9BBCD] rounded-xl min-h-[240px] max-h-[400px] overflow-y-auto text-sm text-[#4D4449] whitespace-pre-wrap font-sans leading-relaxed">
              {plot ? plot : <span className="text-[#AAA5CC] italic">Chưa có nội dung plot.</span>}
            </div>
          )}
        </div>

        {/* Section 4: Password Protection */}
        <div className="bg-[#FFFCFA] border border-[#E9BBCD] rounded-2xl p-5 sm:p-7 shadow-[0_10px_30px_rgba(118,99,110,0.08)] space-y-5">
          <div className="flex items-center justify-between border-b border-[#F4D1DE] pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#B995A7]" />
              <h4 className="font-cormorant text-lg font-bold text-[#4D4449]">
                4. Password Protection (Bảo Vệ Bằng Mật Khẩu)
              </h4>
            </div>

            {/* Toggle Enable Password */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <span className="text-xs font-medium text-[#4D4449]">
                {passwordEnabled ? 'Đang bật mật khẩu' : 'Tắt mật khẩu'}
              </span>
              <input
                type="checkbox"
                checked={passwordEnabled}
                onChange={(e) => {
                  soundEffects.playSelectClick();
                  setPasswordEnabled(e.target.checked);
                  if (!e.target.checked) {
                    setIsRemovingPassword(true);
                  }
                }}
                className="sr-only"
              />
              <div className={`w-11 h-6 rounded-full transition-colors relative ${passwordEnabled ? 'bg-[#B995A7]' : 'bg-[#E9BBCD]'}`}>
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-xs ${passwordEnabled ? 'left-5.5' : 'left-0.5'}`} />
              </div>
            </label>
          </div>

          <div className="p-4 bg-[#FFF8F3] border border-[#E9BBCD] rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#4D4449]">
                {hasExistingPassword && !isRemovingPassword ? (
                  <span className="flex items-center gap-1 text-[#059669]">
                    <ShieldCheck className="w-4 h-4" /> Bot hiện đang có mật khẩu bảo mật
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[#76636E]">
                    <Unlock className="w-4 h-4" /> Bot công khai (không yêu cầu mật khẩu)
                  </span>
                )}
              </div>

              {hasExistingPassword && !isRemovingPassword && (
                <button
                  type="button"
                  onClick={handleRemovePassword}
                  className="px-3 py-1 rounded-lg bg-[#FFF1F6] hover:bg-[#FBE3EC] border border-[#E9BBCD] text-xs font-semibold text-[#9F1239] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Password</span>
                </button>
              )}
            </div>

            {passwordEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#4D4449] mb-1">
                    Mật khẩu mới (New Password)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={hasExistingPassword ? 'Giữ nguyên hoặc nhập pass mới...' : 'Nhập mật khẩu...'}
                      className="w-full px-3 py-2 text-xs bg-[#FFFCFA] border border-[#E9BBCD] rounded-xl text-[#4D4449] focus:outline-none focus:border-[#B995A7]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#9D7E90] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4D4449] mb-1">
                    Xác nhận mật khẩu (Confirm Password)
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className="w-full px-3 py-2 text-xs bg-[#FFFCFA] border border-[#E9BBCD] rounded-xl text-[#4D4449] focus:outline-none focus:border-[#B995A7]"
                  />
                </div>
              </div>
            )}

            <p className="text-[11px] text-[#76636E]">
              🔒 Mật khẩu được mã hóa an toàn (PBKDF2/SHA-512 với Salt ngẫu nhiên) tại máy chủ, tuyệt đối không gửi password hash về frontend.
            </p>
          </div>
        </div>

        {/* Section 5: Metadata & Save Changes */}
        <div className="bg-[#FFFCFA] border border-[#E9BBCD] rounded-2xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(118,99,110,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#76636E]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#B995A7]" />
              <span>Last updated: <strong>{lastUpdated || 'Chưa cập nhật'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#B995A7]" />
              <span>Updated by: <strong className="text-[#4D4449]">{updatedBy || adminUsername}</strong></span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#C4A1B2] via-[#B995A7] to-[#9D7E90] text-[#FFFCFA] font-bold text-sm border border-[#E2CFA9] shadow-[0_6px_20px_rgba(185,149,167,0.4)] hover:shadow-[0_8px_25px_rgba(185,149,167,0.5)] hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang lưu thay đổi...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{selectedBotId === 'new' ? 'Create New Bot' : 'Save Changes'}</span>
              </>
            )}
          </button>
        </div>
      </form>
      </div>

      {/* Right Column: Live Preview Sticky */}
      <div className="lg:col-span-5 xl:col-span-4 sticky top-6 space-y-6">
        <div className="bg-[#FFFCFA] border border-[#E9BBCD] rounded-2xl p-5 shadow-[0_10px_30px_rgba(118,99,110,0.08)] relative overflow-hidden">
          {/* Subtle bg decoration */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FBE3EC] rounded-full blur-3xl opacity-40 pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4 border-b border-[#F4D1DE] pb-3 relative z-10">
            <h4 className="font-cormorant text-lg font-bold text-[#4D4449] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#B995A7]" /> Preview Mode
            </h4>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#76636E] bg-[#FFF1F6] px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          
          <p className="text-xs text-[#76636E] mb-4">
            Hiển thị giao diện thẻ nhân vật của bạn sẽ xuất hiện trên trang lưu trữ. 
            Thẻ này được cập nhật trực tiếp theo dữ liệu chỉnh sửa.
          </p>

          {renderLivePreviewCard()}
        </div>
      </div>
    </div>
  );
};
