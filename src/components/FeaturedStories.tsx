import React from 'react';
import { soundEffects } from '../utils/audio';

interface FeaturedStoriesProps {
  onSelectFeature: (featureKey: string) => void;
}

export const FeaturedStories: React.FC<FeaturedStoriesProps> = ({ onSelectFeature }) => {
  const features = [
    {
      id: 'nhan-vat',
      name: 'Characters',
      desc: 'Character archive',
      imageUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=500&q=85',
      badge: '6 Hồ sơ'
    },
    {
      id: 'the-gioi',
      name: 'Worlds',
      desc: 'World building',
      imageUrl: 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?auto=format&fit=crop&w=500&q=85',
      badge: '4 Vùng đất'
    },
    {
      id: 'lore',
      name: 'Lore',
      desc: 'Stories',
      imageUrl: 'https://images.unsplash.com/photo-1518568740560-333139a27e72?auto=format&fit=crop&w=500&q=85',
      badge: '3 Biên niên'
    },
    {
      id: 'lien-ket',
      name: 'Bonds',
      desc: 'Relationships',
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=85',
      badge: '5 Liên kết'
    },
    {
      id: 'guestbook',
      name: 'Letters',
      desc: 'Guestbook',
      imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=500&q=85',
      badge: 'Lưu bút'
    }
  ];

  return (
    <section className="py-7 border-b border-[#d9cfc3]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="block font-inter text-[11px] font-semibold uppercase tracking-[2px] text-[#746b65]">
            Featured
          </span>
          <h2 className="font-cormorant text-2xl sm:text-[29px] font-bold text-[#1d1918]">
            Tin nổi bật & Khám phá
          </h2>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2.5 pt-1 no-scrollbar">
        {features.map((item) => (
          <article
            key={item.id}
            onClick={() => {
              soundEffects.playPageTurn();
              onSelectFeature(item.id);
            }}
            className="group w-[150px] sm:w-[160px] flex-shrink-0 cursor-pointer transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="relative h-[205px] w-full overflow-hidden rounded-[18px] border border-[#503223]/20 shadow-[0_6px_16px_rgba(45,20,20,0.12)]">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#14080a]/75 via-[#14080a]/20 to-transparent" />

              {/* Tag Badge */}
              <div className="absolute top-2.5 right-2.5 rounded-full bg-[#5b1824]/90 backdrop-blur-sm px-2 py-0.5 font-cinzel text-[10px] font-semibold text-[#d4bb86] border border-[#a88956]/40">
                {item.badge}
              </div>

              {/* Title overlay on bottom of card */}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="font-cormorant text-lg font-bold tracking-wide group-hover:text-[#d4bb86] transition-colors">
                  {item.name}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-[#d9cfc3]">
                  {item.desc}
                </div>
              </div>
            </div>

            <div className="mt-2 text-center sm:text-left">
              <h3 className="font-cormorant text-lg font-bold text-[#1d1918] group-hover:text-[#5b1824] transition-colors">
                {item.name}
              </h3>
              <p className="text-[11px] uppercase tracking-wider text-[#746b65]">
                {item.desc}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
