import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, LogOut, ArrowLeft, Bot, Sparkles, RefreshCw, History, X, Clock } from 'lucide-react';
import { Character, AdminUser } from '../../types';
import { apiAdminVerify, apiAdminLogout } from '../../services/api';
import { AdminLoginForm } from './AdminLoginForm';
import { BotManagementSection } from './BotManagementSection';
import { soundEffects } from '../../utils/audio';

interface AdminPageProps {
  characters: Character[];
  onCharacterUpdated: (updated: Character) => void;
  onNavigateHome: () => void;
}

function parseCustomDate(dateStr?: string) {
  if (!dateStr || dateStr === '-') return 0;
  const [datePart, timePart] = dateStr.split(' ');
  if (!datePart || !timePart) return 0;
  const [day, month, year] = datePart.split('/');
  const [hour, minute] = timePart.split(':');
  // Return timestamp for sorting
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`).getTime();
}

export const AdminPage: React.FC<AdminPageProps> = ({
  characters,
  onCharacterUpdated,
  onNavigateHome,
}) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const result = await apiAdminVerify();
      if (result.success && result.user) {
        setCurrentUser(result.user);
      } else {
        setCurrentUser(null);
      }
      setIsCheckingAuth(false);
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    soundEffects.playSelectClick();
    await apiAdminLogout();
    setCurrentUser(null);
  };

  // Get recent 5 updated bots
  const recentUpdates = [...characters]
    .sort((a, b) => {
      const timeA = parseCustomDate(a.updated_at || a.updatedAt);
      const timeB = parseCustomDate(b.updated_at || b.updatedAt);
      return timeB - timeA;
    })
    .slice(0, 5);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#FFF8F3] flex flex-col items-center justify-center p-6 text-[#4D4449]">
        <div className="w-12 h-12 rounded-full border-3 border-[#E9BBCD] border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-semibold font-cormorant tracking-widest text-[#76636E]">
          Đang xác thực quyền Quản trị...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FFF8F3]">
        <AdminLoginForm
          onLoginSuccess={(user) => setCurrentUser(user)}
          onBackToHome={onNavigateHome}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F3] text-[#4D4449] selection:bg-[#FBE3EC]">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 h-[70px] border-b border-[#E9BBCD] bg-[#FFF8F3]/95 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-full max-w-[1140px] items-center justify-between px-4 sm:px-8">
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundEffects.playPageTurn();
                onNavigateHome();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E9BBCD] bg-[#FFFCFA] hover:bg-[#FBE3EC] text-xs font-semibold text-[#4D4449] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quay lại trang chủ</span>
              <span className="sm:hidden">Trang chủ</span>
            </button>

            <div className="h-4 w-px bg-[#E9BBCD]" />

            <div className="flex items-center gap-2">
              <span className="font-cormorant text-xl sm:text-2xl font-bold tracking-wide text-[#4D4449]">
                L’amour est Hera
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#FBE3EC] border border-[#E9BBCD] text-[10px] font-bold uppercase tracking-wider text-[#9D7E90]">
                Admin Sanctuary
              </span>
            </div>
          </div>

          {/* Right actions: Current User & Logout */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsActivityOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E9BBCD] bg-[#FFFCFA] hover:bg-[#FBE3EC] text-xs font-semibold text-[#4D4449] transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lịch sử</span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#FFF1F6] border border-[#E9BBCD] rounded-full text-xs text-[#76636E]">
              <Shield className="w-3.5 h-3.5 text-[#B995A7]" />
              <span>Admin: <strong>{currentUser.username}</strong></span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF1F6] hover:bg-[#FBE3EC] border border-[#E9BBCD] text-xs font-semibold text-[#9F1239] transition-colors cursor-pointer"
              title="Đăng xuất khỏi trang quản trị"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="mx-auto max-w-[1140px] px-4 sm:px-8 py-8">
        <BotManagementSection
          characters={characters}
          onCharacterUpdated={onCharacterUpdated}
          adminUsername={currentUser.username}
        />
      </main>

      {/* Recent Activity Drawer */}
      <AnimatePresence>
        {isActivityOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsActivityOpen(false)}
              className="fixed inset-0 bg-[#4D4449]/20 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-[#FFFCFA] border-l border-[#E9BBCD] shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#F4D1DE]">
                <h3 className="font-cormorant text-xl font-bold text-[#4D4449] flex items-center gap-2">
                  <History className="w-5 h-5 text-[#B995A7]" />
                  Hoạt động gần đây
                </h3>
                <button
                  onClick={() => setIsActivityOpen(false)}
                  className="p-2 -mr-2 rounded-full hover:bg-[#FBE3EC] text-[#76636E] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-[#FFF8F3]/50">
                {recentUpdates.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {recentUpdates.map((bot, idx) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-xl border border-[#F4D1DE] bg-[#FFFCFA] shadow-sm">
                        <div className="shrink-0 mt-1">
                          <div className="w-8 h-8 rounded-full bg-[#FBE3EC] border border-[#E9BBCD] flex items-center justify-center">
                            <Bot className="w-4 h-4 text-[#B995A7]" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[#4D4449] truncate">{bot.name}</div>
                          <div className="text-xs text-[#76636E] mt-2 flex flex-col gap-1.5">
                            <span className="flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5" /> 
                              Cập nhật bởi: <strong className="text-[#4D4449]">{bot.updated_by || bot.updatedBy || 'admin'}</strong>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" /> 
                              {bot.updated_at || bot.updatedAt || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-[#76636E] text-sm italic mt-10">
                    Chưa có hoạt động nào.
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
