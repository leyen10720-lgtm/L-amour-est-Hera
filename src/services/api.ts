import { Character, BotUpdatePayload, AdminUser } from '../types';
import { INITIAL_CHARACTERS } from '../data/archiveData';

const TOKEN_KEY = 'hera_admin_token';

export function getStoredAdminToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAdminToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
}

// 1. Get all characters from API (with fallback)
export async function apiGetCharacters(): Promise<Character[]> {
  try {
    const res = await fetch('/api/characters');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
    return INITIAL_CHARACTERS;
  } catch (err) {
    console.warn('[API] Failed to fetch /api/characters, using fallback seed data:', err);
    return INITIAL_CHARACTERS;
  }
}

// 2. Get single character
export async function apiGetCharacter(id: string): Promise<Character | null> {
  try {
    const res = await fetch(`/api/characters/${id}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data.success && data.data) {
      return data.data;
    }
    return null;
  } catch (err) {
    console.warn(`[API] Failed to fetch /api/characters/${id}:`, err);
    const found = INITIAL_CHARACTERS.find((c) => c.id === id);
    return found || null;
  }
}

// 3. Verify password for locked character
export async function apiVerifyCharacterPassword(id: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/characters/${id}/verify-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true };
    }
    return { success: false, error: data.error || 'Mật khẩu không chính xác!' };
  } catch (err) {
    console.error('[API] Verify password error:', err);
    return { success: false, error: 'Không thể kết nối đến máy chủ để xác thực mật khẩu.' };
  }
}

// 4. Admin Login
export async function apiAdminLogin(username: string, password: string): Promise<{ success: boolean; user?: AdminUser; token?: string; error?: string }> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setStoredAdminToken(data.token);
      return { success: true, user: data.user, token: data.token };
    }
    return { success: false, error: data.error || 'Đăng nhập không thành công.' };
  } catch (err) {
    console.error('[API] Admin login network error:', err);
    return { success: false, error: 'Lỗi mạng khi kết nối đến hệ thống xác thực.' };
  }
}

// 5. Verify Admin Session
export async function apiAdminVerify(): Promise<{ success: boolean; user?: AdminUser }> {
  const token = getStoredAdminToken();
  if (!token) return { success: false };

  try {
    const res = await fetch('/api/admin/verify', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return { success: true, user: data.user };
      }
    }
    setStoredAdminToken(null);
    return { success: false };
  } catch {
    return { success: false };
  }
}

// 6. Admin Logout
export async function apiAdminLogout(): Promise<void> {
  const token = getStoredAdminToken();
  try {
    if (token) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {
    // Ignore network error on logout
  } finally {
    setStoredAdminToken(null);
  }
}

// 7. Update Bot / Character
export async function apiUpdateCharacter(id: string, payload: BotUpdatePayload): Promise<{ success: boolean; data?: Character; error?: string }> {
  const token = getStoredAdminToken();
  if (!token) {
    return { success: false, error: 'Vui lòng đăng nhập Admin để lưu thay đổi.' };
  }

  try {
    const res = await fetch(`/api/admin/characters/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, data: data.data };
    }
    return { success: false, error: data.error || 'Không thể cập nhật bot.' };
  } catch (err) {
    console.error('[API] Update character error:', err);
    return { success: false, error: 'Lỗi kết nối máy chủ khi lưu bot.' };
  }
}

// 7.5. Create New Bot / Character
export async function apiCreateCharacter(payload: BotUpdatePayload): Promise<{ success: boolean; data?: Character; error?: string }> {
  const token = getStoredAdminToken();
  if (!token) {
    return { success: false, error: 'Vui lòng đăng nhập Admin để tạo bot mới.' };
  }

  try {
    const res = await fetch(`/api/admin/characters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, data: data.data };
    }
    return { success: false, error: data.error || 'Không thể tạo bot mới.' };
  } catch (err) {
    console.error('[API] Create character error:', err);
    return { success: false, error: 'Lỗi kết nối máy chủ khi tạo bot mới.' };
  }
}

// 8. Upload Bot Image
export async function apiUploadBotImage(data: string, filename?: string, mimeType?: string): Promise<{ success: boolean; url?: string; error?: string }> {
  const token = getStoredAdminToken();
  if (!token) {
    return { success: false, error: 'Chưa đăng nhập quyền Admin.' };
  }

  try {
    const res = await fetch('/api/admin/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data, filename, mimeType }),
    });

    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, url: result.url };
    }
    return { success: false, error: result.error || 'Lỗi khi upload ảnh.' };
  } catch (err) {
    console.error('[API] Upload image error:', err);
    return { success: false, error: 'Lỗi kết nối khi upload ảnh.' };
  }
}
