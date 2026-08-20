import React from 'react';
import { Heart, Mail, Sparkles, BookOpen, Users, Compass, Scroll } from 'lucide-react';
import { soundEffects } from '../utils/audio';

const HERO_AVATAR_SRC = 'https://files.catbox.moe/z27ksh.jpg';

interface HeroProfileProps {
  onOpenContact: () => void;
  isFollowing: boolean;
  onToggleFollow: () => void;
  followerCount: number;
  totalCharacters: number;
  totalWorlds: number;
  totalLore: number;
  totalRelationships: number;
  onSelectTab: (tab: string) => void;
}

export const HeroProfile: React.FC<HeroProfileProps> = () => {
  return null;
};
