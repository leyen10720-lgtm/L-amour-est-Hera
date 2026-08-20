import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { INITIAL_CHARACTERS } from '../src/data/archiveData.js';
import { Character, BotUpdatePayload } from '../src/types.js';

export interface StoredCharacter extends Character {
  password_hash?: string | null;
  password_salt?: string | null;
  password_normalized_hash?: string | null;
  image?: string;
  slogan?: string;
  link?: string;
  password_enabled?: boolean;
  hasPassword?: boolean;
  updated_at?: string;
  updated_by?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'characters.json');

function normalizePassword(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/\s+/g, '');
}

export function hashPassword(plain: string, customSalt?: string): { hash: string; salt: string; normalizedHash: string } {
  const salt = customSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plain.trim(), salt, 10000, 64, 'sha512').toString('hex');
  
  const normalized = normalizePassword(plain);
  const normalizedHash = crypto.pbkdf2Sync(normalized, salt, 10000, 64, 'sha512').toString('hex');
  
  return { hash, salt, normalizedHash };
}

export function checkPasswordMatch(plain: string, storedHash: string, storedSalt: string, storedNormHash?: string | null): boolean {
  if (!plain || !storedHash || !storedSalt) return false;
  try {
    const computedHash = crypto.pbkdf2Sync(plain.trim(), storedSalt, 10000, 64, 'sha512').toString('hex');
    if (crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(storedHash, 'hex'))) {
      return true;
    }

    if (storedNormHash) {
      const normalizedInput = normalizePassword(plain);
      const computedNormHash = crypto.pbkdf2Sync(normalizedInput, storedSalt, 10000, 64, 'sha512').toString('hex');
      if (crypto.timingSafeEqual(Buffer.from(computedNormHash, 'hex'), Buffer.from(storedNormHash, 'hex'))) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

let memoryCharacters: StoredCharacter[] = [];

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function initCharacterStore() {
  ensureDataDirectory();

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      memoryCharacters = JSON.parse(content);
      console.log(`[Database] Loaded ${memoryCharacters.length} characters from ${DB_FILE}`);
      return;
    } catch (err) {
      console.error('[Database] Failed to read characters.json, re-initializing from seed data:', err);
    }
  }

  console.log('[Database] Initializing characters database from archive seed data...');
  memoryCharacters = INITIAL_CHARACTERS.map((char) => {
    let passHash: string | null = null;
    let passSalt: string | null = null;
    let normHash: string | null = null;

    if (char.password) {
      const hashed = hashPassword(char.password);
      passHash = hashed.hash;
      passSalt = hashed.salt;
      normHash = hashed.normalizedHash;
    }

    const initialDate = '20/08/2026 18:30';

    return {
      ...char,
      image: char.avatarUrl,
      slogan: char.vietnameseQuote || char.quote || char.description || '',
      link: char.linkGGAI || '',
      password_enabled: !!char.isLocked,
      password_hash: passHash,
      password_salt: passSalt,
      password_normalized_hash: normHash,
      // Remove plain password from storage object
      password: undefined,
      updated_at: initialDate,
      updated_by: 'system_admin',
      updatedAt: initialDate,
      updatedBy: 'system_admin',
    };
  });

  saveCharactersToFile();
}

export function saveCharactersToFile() {
  try {
    ensureDataDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryCharacters, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Database] Failed to save characters to file:', err);
  }
}

export function sanitizeCharacter(char: StoredCharacter): Character {
  const { password_hash, password_salt, password_normalized_hash, password, ...safe } = char;
  return {
    ...safe,
    hasPassword: !!password_hash,
    password_enabled: !!safe.isLocked,
    isLocked: !!safe.isLocked,
    image: safe.image || safe.avatarUrl,
    slogan: safe.slogan || safe.vietnameseQuote || safe.quote || safe.description || '',
    link: safe.link || safe.linkGGAI || '',
    updated_at: safe.updated_at || '20/08/2026 18:30',
    updated_by: safe.updated_by || 'admin',
    updatedAt: safe.updated_at || '20/08/2026 18:30',
    updatedBy: safe.updated_by || 'admin',
  };
}

export function getAllCharacters(includePrivate = false): Character[] | StoredCharacter[] {
  if (includePrivate) {
    return memoryCharacters;
  }
  return memoryCharacters.map(sanitizeCharacter);
}

export function getCharacterById(id: string, includePrivate = false): Character | StoredCharacter | null {
  const char = memoryCharacters.find((c) => c.id === id);
  if (!char) return null;
  if (includePrivate) return char;
  return sanitizeCharacter(char);
}

export function verifyCharacterPassword(id: string, inputPass: string): boolean {
  const char = memoryCharacters.find((c) => c.id === id);
  if (!char) return false;

  // If character is not locked or has no password, access is permitted
  if (!char.isLocked || !char.password_hash || !char.password_salt) {
    return true;
  }

  return checkPasswordMatch(inputPass, char.password_hash, char.password_salt, char.password_normalized_hash);
}

export function updateCharacter(
  id: string,
  payload: BotUpdatePayload,
  adminUsername: string
): Character | null {
  const index = memoryCharacters.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const current = memoryCharacters[index];

  const now = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : n);
  const formattedDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  let newPassHash = current.password_hash;
  let newPassSalt = current.password_salt;
  let newNormHash = current.password_normalized_hash;
  let isLocked = payload.password_enabled !== undefined ? payload.password_enabled : current.isLocked;

  if (payload.remove_password) {
    newPassHash = null;
    newPassSalt = null;
    newNormHash = null;
    isLocked = false;
  } else if (payload.new_password && payload.new_password.trim().length > 0) {
    const hashed = hashPassword(payload.new_password.trim());
    newPassHash = hashed.hash;
    newPassSalt = hashed.salt;
    newNormHash = hashed.normalizedHash;
    isLocked = true;
  }

  const updatedImage = payload.image || payload.avatarUrl || current.avatarUrl;
  const updatedSlogan = payload.slogan !== undefined ? payload.slogan : (current.slogan || current.vietnameseQuote || current.quote || current.description || '');
  const updatedPlot = payload.plot !== undefined ? payload.plot : current.plot;
  const updatedLink = payload.link !== undefined ? payload.link : (payload.linkGGAI !== undefined ? payload.linkGGAI : current.linkGGAI);
  const updatedTags = payload.tags ? Array.from(new Set(payload.tags.map((t) => t.trim()).filter(Boolean))) : current.tags;

  const updatedChar: StoredCharacter = {
    ...current,
    name: payload.name?.trim() || current.name,
    avatarUrl: updatedImage,
    bannerUrl: payload.bannerUrl || updatedImage,
    image: updatedImage,
    tags: updatedTags,
    slogan: updatedSlogan,
    quote: updatedSlogan,
    vietnameseQuote: updatedSlogan,
    description: updatedSlogan || current.description,
    plot: updatedPlot,
    linkGGAI: updatedLink,
    link: updatedLink,
    isLocked: !!isLocked,
    password_enabled: !!isLocked,
    password_hash: newPassHash,
    password_salt: newPassSalt,
    password_normalized_hash: newNormHash,
    updated_at: formattedDate,
    updated_by: adminUsername,
    updatedAt: formattedDate,
    updatedBy: adminUsername,
  };

  memoryCharacters[index] = updatedChar;
  saveCharactersToFile();

  return sanitizeCharacter(updatedChar);
}

export function createCharacter(
  payload: BotUpdatePayload,
  adminUsername: string
): Character {
  const now = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : n);
  const formattedDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  let newPassHash: string | null = null;
  let newPassSalt: string | null = null;
  let newNormHash: string | null = null;
  let isLocked = !!payload.password_enabled;

  if (payload.new_password && payload.new_password.trim().length > 0) {
    const hashed = hashPassword(payload.new_password.trim());
    newPassHash = hashed.hash;
    newPassSalt = hashed.salt;
    newNormHash = hashed.normalizedHash;
    isLocked = true;
  }

  const updatedImage = payload.image || payload.avatarUrl || '';
  const updatedSlogan = payload.slogan || payload.vietnameseQuote || payload.quote || payload.description || '';
  const updatedPlot = payload.plot || '';
  const updatedLink = payload.link || payload.linkGGAI || '';
  const updatedTags = payload.tags ? Array.from(new Set(payload.tags.map((t) => t.trim()).filter(Boolean))) : [];

  const newId = `bot-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  const newChar: StoredCharacter = {
    id: newId,
    name: payload.name?.trim() || 'New Bot',
    englishTitle: payload.name?.trim() || 'New Bot',
    vietnameseTitle: payload.name?.trim() || 'New Bot',
    avatarUrl: updatedImage,
    bannerUrl: payload.bannerUrl || updatedImage,
    image: updatedImage,
    tags: updatedTags,
    slogan: updatedSlogan,
    quote: updatedSlogan,
    vietnameseQuote: updatedSlogan,
    description: updatedSlogan,
    plot: updatedPlot,
    linkGGAI: updatedLink,
    link: updatedLink,
    isLocked: !!isLocked,
    password_enabled: !!isLocked,
    password_hash: newPassHash,
    password_salt: newPassSalt,
    password_normalized_hash: newNormHash,
    updated_at: formattedDate,
    updated_by: adminUsername,
    updatedAt: formattedDate,
    updatedBy: adminUsername,
  };

  memoryCharacters.push(newChar);
  saveCharactersToFile();

  return sanitizeCharacter(newChar);
}
