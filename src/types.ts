export interface Character {
  id: string;
  name: string;
  vietnameseTitle?: string;
  englishTitle?: string;
  role?: string;
  faction?: string;
  description?: string;
  tags?: string[];
  votes?: number;
  created?: number;
  quote?: string;
  vietnameseQuote?: string;
  avatarUrl: string;
  bannerUrl?: string;
  gallery?: string[];
  age?: string;
  birthday?: string;
  height?: string;
  origin?: string;
  status?: 'Active' | 'Legendary' | 'Hidden' | 'Deceased';
  appearance?: string[];
  personality?: string[];
  backstory?: string;
  secrets?: string;
  signatureWeaponOrArtifact?: string;
  themeColor?: string;
  likes: number;
  linkGGAI?: string;
  plot?: string;
  isLocked?: boolean;
  password?: string;
  hint?: string;
  question?: string;
  exactPassword?: boolean;
  maxAttempts?: number;
  // Bot management fields
  image?: string;
  slogan?: string;
  link?: string;
  password_enabled?: boolean;
  hasPassword?: boolean;
  updated_at?: string;
  updated_by?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface AdminUser {
  username: string;
  role: 'admin';
}

export interface BotUpdatePayload {
  name?: string;
  image?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  tags?: string[];
  slogan?: string;
  description?: string;
  vietnameseQuote?: string;
  quote?: string;
  plot?: string;
  link?: string;
  linkGGAI?: string;
  password_enabled?: boolean;
  isLocked?: boolean;
  new_password?: string;
  remove_password?: boolean;
  updated_at?: string;
  updated_by?: string;
}

export interface Relationship {
  id: string;
  characterAId: string;
  characterBId: string;
  characterAName: string;
  characterBName: string;
  characterAAvatar: string;
  characterBAvatar: string;
  relationType: 'Lời thề' | 'Tri kỷ' | 'Đối thủ' | 'Chủ tớ' | 'Tình cảm sâu kín' | 'Đồng minh';
  title: string;
  description: string;
  quote: string;
}

export interface WorldRealm {
  id: string;
  name: string;
  frenchTitle: string;
  tagline: string;
  description: string;
  geography: string;
  culture: string;
  landmarks: { name: string; description: string }[];
  bannerUrl: string;
  thumbnailUrl: string;
  atmosphere: string;
}

export interface LoreChapter {
  id: string;
  chapterNumber: string;
  title: string;
  subtitle: string;
  category: 'Biên Niên Sử' | 'Thư Tịch Cổ' | 'Hồi Ký' | 'Truyền Thuyết';
  readTime: string;
  dateInStory: string;
  excerpt: string;
  content: string[];
  featuredCharacterId?: string;
  bannerUrl: string;
}

export interface GuestbookEntry {
  id: string;
  sender: string;
  title: string;
  message: string;
  date: string;
  sealColor: 'wine' | 'gold' | 'sapphire' | 'emerald';
  characterDedicated?: string;
}
