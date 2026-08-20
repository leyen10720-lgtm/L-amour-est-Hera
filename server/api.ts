import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  getAllCharacters,
  getCharacterById,
  updateCharacter,
  createCharacter,
  verifyCharacterPassword,
} from './store.js';
import {
  requireAdmin,
  validateAdminCredentials,
  createAdminToken,
  AuthenticatedRequest,
} from './auth.js';

export const apiRouter = Router();

// ==========================================
// 1. PUBLIC CHARACTER & BOT ENDPOINTS
// ==========================================

// Get all characters (public safe view)
apiRouter.get('/characters', (req: Request, res: Response) => {
  try {
    const characters = getAllCharacters(false);
    res.json({ success: true, count: characters.length, data: characters });
  } catch (err) {
    console.error('[API] Error fetching characters:', err);
    res.status(500).json({ success: false, error: 'Lỗi khi tải danh sách nhân vật.' });
  }
});

// Get single character by ID (public safe view)
apiRouter.get('/characters/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const character = getCharacterById(id, false);
    if (!character) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy nhân vật.' });
    }
    res.json({ success: true, data: character });
  } catch (err) {
    console.error('[API] Error fetching character:', err);
    res.status(500).json({ success: false, error: 'Lỗi khi tải thông tin nhân vật.' });
  }
});

// Verify character password (for unlocking locked bots on user client)
apiRouter.post('/characters/:id/verify-password', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Mật khẩu không hợp lệ.' });
    }

    const isValid = verifyCharacterPassword(id, password);
    if (isValid) {
      return res.json({ success: true, message: 'Mở khóa thành công!' });
    } else {
      return res.status(401).json({ success: false, error: 'Mật khẩu không chính xác!' });
    }
  } catch (err) {
    console.error('[API] Error verifying password:', err);
    res.status(500).json({ success: false, error: 'Lỗi hệ thống khi kiểm tra mật khẩu.' });
  }
});

// ==========================================
// 2. ADMIN AUTHENTICATION ENDPOINTS
// ==========================================

// Admin Login
apiRouter.post('/admin/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.',
      });
    }

    const isValid = validateAdminCredentials(username, password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Tài khoản hoặc mật khẩu quản trị viên không chính xác.',
      });
    }

    const token = createAdminToken(username.trim());
    return res.json({
      success: true,
      message: 'Đăng nhập Admin thành công!',
      token,
      user: {
        username: username.trim(),
        role: 'admin',
      },
    });
  } catch (err) {
    console.error('[API] Admin login error:', err);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ khi đăng nhập.' });
  }
});

// Admin Session Verification
apiRouter.get('/admin/verify', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    user: {
      username: req.admin?.username || 'admin',
      role: 'admin',
    },
  });
});

// Admin Logout
apiRouter.post('/admin/logout', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Đăng xuất thành công.' });
});

// ==========================================
// 3. ADMIN BOT MANAGEMENT & UPDATE ENDPOINTS
// ==========================================

// Update Character / Bot details (Admin Only)
apiRouter.post('/admin/characters', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = req.body;
    const adminUser = req.admin?.username || 'admin';

    // Validation
    if (payload.new_password && payload.confirm_password) {
      if (payload.new_password !== payload.confirm_password) {
        return res.status(400).json({
          success: false,
          error: 'Mật khẩu xác nhận không khớp.',
        });
      }
    }

    const newChar = createCharacter(payload, adminUser);

    res.json({
      success: true,
      message: 'Tạo Bot thành công',
      data: newChar,
    });
  } catch (err) {
    console.error('Create character error:', err);
    res.status(500).json({
      success: false,
      error: 'Lỗi server khi tạo bot.',
    });
  }
});

apiRouter.put('/admin/characters/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const adminUser = req.admin?.username || 'admin';

    // Validation
    if (payload.new_password && payload.confirm_password) {
      if (payload.new_password !== payload.confirm_password) {
        return res.status(400).json({
          success: false,
          error: 'Mật khẩu xác nhận không khớp với mật khẩu mới.',
        });
      }
    }

    // Basic URL validation if link is provided
    if (payload.link && typeof payload.link === 'string' && payload.link.trim().length > 0) {
      const trimmed = payload.link.trim();
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('//')) {
        return res.status(400).json({
          success: false,
          error: 'Link bot phải là đường dẫn URL hợp lệ (bắt đầu bằng https:// hoặc http://).',
        });
      }
    }

    const updated = updateCharacter(id, payload, adminUser);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Không tìm thấy bot có mã định danh: ${id}`,
      });
    }

    console.log(`[Admin] Character '${id}' successfully updated by ${adminUser}`);
    return res.json({
      success: true,
      message: 'Bot updated successfully',
      data: updated,
    });
  } catch (err) {
    console.error('[API] Error updating character:', err);
    res.status(500).json({
      success: false,
      error: 'Đã xảy ra lỗi khi lưu thông tin bot. Vui lòng thử lại.',
    });
  }
});

// Upload Bot Image (Admin Only)
apiRouter.post('/admin/upload-image', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, filename, mimeType } = req.body;

    if (!data || typeof data !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp dữ liệu hình ảnh.',
      });
    }

    // Extract base64 data & mime
    let base64Content = data;
    let actualMime = mimeType || 'image/jpeg';

    if (data.includes(';base64,')) {
      const parts = data.split(';base64,');
      actualMime = parts[0].replace('data:', '');
      base64Content = parts[1];
    }

    // Validate MIME type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(actualMime)) {
      return res.status(400).json({
        success: false,
        error: 'Định dạng file không hỗ trợ. Vui lòng upload ảnh JPG, PNG, WEBP hoặc GIF.',
      });
    }

    const buffer = Buffer.from(base64Content, 'base64');
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (buffer.length > maxSize) {
      return res.status(400).json({
        success: false,
        error: 'Dung lượng ảnh vượt quá giới hạn cho phép (Tối đa 5MB).',
      });
    }

    // Determine extension
    let ext = 'jpg';
    if (actualMime === 'image/png') ext = 'png';
    else if (actualMime === 'image/webp') ext = 'webp';
    else if (actualMime === 'image/gif') ext = 'gif';

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileHash = crypto.randomBytes(8).toString('hex');
    const savedFileName = `bot_${Date.now()}_${fileHash}.${ext}`;
    const filePath = path.join(uploadsDir, savedFileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${savedFileName}`;
    return res.json({
      success: true,
      message: 'Tải ảnh lên thành công!',
      url: publicUrl,
    });
  } catch (err) {
    console.error('[API] Error handling image upload:', err);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi xử lý hình ảnh tải lên.',
    });
  }
});
