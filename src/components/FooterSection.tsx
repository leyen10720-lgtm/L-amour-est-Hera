import React from 'react';
import { soundEffects } from '../utils/audio';

interface FooterSectionProps {
  onOpenContact: () => void;
  onSelectTab: (tab: string) => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  onOpenContact,
  onSelectTab
}) => {
  return (
    <div className="w-full">
      {/* Information Details Section */}
      <section className="py-7 border-b border-[#d9cfc3]">
        <div className="mb-4">
          <span className="block font-inter text-[11px] font-semibold uppercase tracking-[2px] text-[#746b65]">
            Information & Archives
          </span>
          <h2 className="font-cormorant text-2xl sm:text-[29px] font-bold text-[#1d1918]">
            Thông tin & Kết nối
          </h2>
        </div>

        <div className="space-y-0 divide-y divide-[#d9cfc3]">
          
          {/* Detail Item 1 */}
          <div 
            onClick={() => {
              soundEffects.playPageTurn();
              onSelectTab('nhan-vat');
            }}
            className="flex items-center gap-4 py-4 cursor-pointer group"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#a88956] text-[#5b1824] font-serif text-xl transition-transform group-hover:scale-110">
              ♧
            </div>
            <div>
              <strong className="font-cormorant text-xl text-[#1d1918] group-hover:text-[#5b1824] transition-colors block">
                Character Archive
              </strong>
              <span className="text-xs text-[#746b65]">
                Bộ sưu tập nhân vật & Hồ sơ dòng dõi hoàng gia
              </span>
            </div>
          </div>

          {/* Detail Item 2 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
            <div 
              onClick={() => {
                soundEffects.playPageTurn();
                onOpenContact();
              }}
              className="flex items-center gap-4 cursor-pointer group"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#a88956] text-[#5b1824] font-serif text-xl transition-transform group-hover:scale-110">
                ✉
              </div>
              <div>
                <strong className="font-cormorant text-xl text-[#1d1918] group-hover:text-[#5b1824] transition-colors block">
                  Imperial Letters & Contact
                </strong>
                <span className="text-xs text-[#746b65]">
                  Gửi thư niêm phong đến các nhân vật trong kho lưu trữ
                </span>
              </div>
            </div>

            {/* Quick links to Discord & Facebook */}
            <div className="flex items-center gap-2 pl-15 sm:pl-0">
              <a
                href="https://discord.gg/moonlightvow"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#b89587]/70 bg-[#fbf8f4] px-3.5 py-1 text-xs font-semibold text-[#63222a] font-cinzel shadow-sm hover:border-[#63222a] hover:bg-[#63222a] hover:text-[#fffdf9] transition-all"
              >
                Discord
              </a>
              <a
                href="https://www.facebook.com/share/18psNny1Eh/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#b89587]/70 bg-[#fbf8f4] px-3.5 py-1 text-xs font-semibold text-[#63222a] font-cinzel shadow-sm hover:border-[#63222a] hover:bg-[#63222a] hover:text-[#fffdf9] transition-all"
              >
                Facebook Page
              </a>
            </div>
          </div>

          {/* Detail Item 3 */}
          <div className="flex items-center gap-4 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#a88956] text-[#5b1824] font-serif text-xl">
              ♢
            </div>
            <div>
              <strong className="font-cormorant text-xl text-[#1d1918] block">
                Created with love
              </strong>
              <span className="text-xs text-[#746b65]">
                A personal fictional universe & roleplay archive
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Global Footer */}
      <footer className="py-12 text-center text-[#746b65]">
        <div className="font-italianno text-4xl sm:text-5xl text-[#5b1824] tracking-wide">
          L’amour est Hera
        </div>

        <div className="mx-auto my-3.5 h-[1.5px] w-20 bg-[#a88956]" />

        <p className="font-cormorant text-lg sm:text-xl italic text-[#554a45]">
          “Some stories deserve to be remembered forever.”
        </p>

        <div className="mt-4 text-xs font-serif text-[#a88956]">
          ✦ Lưu trữ vĩnh hằng · 2026 ✦
        </div>
      </footer>
    </div>
  );
};
