import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, KeyRound, ShieldAlert, ArrowLeft, Eye, EyeOff, Sparkles } from 'lucide-react';
import { apiAdminLogin } from '../../services/api';
import { AdminUser } from '../../types';
import { soundEffects } from '../../utils/audio';

interface AdminLoginFormProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBackToHome: () => void;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      soundEffects.playAntiqueChime(300);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await apiAdminLogin(username.trim(), password.trim());
    setIsLoading(false);

    if (result.success && result.user) {
      soundEffects.playAntiqueChime(880);
      onLoginSuccess(result.user);
    } else {
      soundEffects.playAntiqueChime(300);
      setErrorMessage(result.error || 'Tài khoản hoặc mật khẩu không chính xác.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-[#FFFCFA] border-2 border-[#E9BBCD] rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(118,99,110,0.18)] relative overflow-hidden"
      >
        {/* Decorative corner ribbons */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#FBE3EC] rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-[#F3E7CF] rounded-full blur-xl pointer-events-none" />

        {/* Back Button */}
        <button
          onClick={() => {
            soundEffects.playPageTurn();
            onBackToHome();
          }}
          className="flex items-center gap-1.5 text-xs text-[#76636E] hover:text-[#4D4449] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chủ</span>
        </button>

        {/* Header Title */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#FBE3EC] to-[#FFF1F6] border border-[#E9BBCD] flex items-center justify-center text-[#B995A7] mb-3 shadow-inner">
            <Lock className="w-6 h-6 text-[#9D7E90]" />
          </div>
          <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#B995A7]">
            Sanctuary Administration
          </span>
          <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#4D4449] mt-1">
            Cổng Quản Trị Hoàng Gia
          </h2>
          <p className="text-xs text-[#76636E] mt-1.5">
            Xác thực quyền hạn để truy cập hệ thống chỉnh sửa và quản lý Bot
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-5 p-3.5 bg-[#FFF1F6] border border-[#E9BBCD] rounded-xl flex items-start gap-2.5 text-xs text-[#76636E]"
          >
            <ShieldAlert className="w-4 h-4 text-[#B995A7] shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#4D4449] mb-1.5">
              Tài khoản Quản trị viên
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9D7E90]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập (VD: admin)"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FFF8F3] border border-[#E9BBCD] rounded-xl text-[#4D4449] placeholder-[#AAA5CC] focus:outline-none focus:border-[#B995A7] focus:ring-2 focus:ring-[#FBE3EC] transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4D4449] mb-1.5">
              Mật khẩu Admin
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9D7E90]">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#FFF8F3] border border-[#E9BBCD] rounded-xl text-[#4D4449] placeholder-[#AAA5CC] focus:outline-none focus:border-[#B995A7] focus:ring-2 focus:ring-[#FBE3EC] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9D7E90] hover:text-[#4D4449] cursor-pointer"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#C4A1B2] via-[#B995A7] to-[#9D7E90] text-[#FFFCFA] font-medium text-sm border border-[#E2CFA9] shadow-[0_4px_15px_rgba(185,149,167,0.35)] hover:shadow-[0_6px_20px_rgba(185,149,167,0.45)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Đăng Nhập Quản Trị</span>
              </>
            )}
          </button>
        </form>

        {/* Credentials reminder for development */}
        <div className="mt-6 pt-4 border-t border-[#F4D1DE] text-center">
          <p className="text-[11px] text-[#76636E]">
            Mặc định: <code className="bg-[#FFF1F6] px-1.5 py-0.5 rounded text-[#4D4449] font-mono">admin</code> / <code className="bg-[#FFF1F6] px-1.5 py-0.5 rounded text-[#4D4449] font-mono">admin_hera_2026</code>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
