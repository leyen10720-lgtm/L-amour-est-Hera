import React from 'react';

export const IntroBanner: React.FC = () => {
  return (
    <section className="py-7 border-b border-[#d9cfc3]">
      <div className="mb-4">
        <span className="block font-inter text-[11px] font-semibold uppercase tracking-[2px] text-[#746b65]">
          Welcome to the archive
        </span>
        <h2 className="font-cormorant text-2xl sm:text-[29px] font-bold text-[#1d1918]">
          Một góc nhỏ của những câu chuyện
        </h2>
      </div>

      <div className="relative border border-[#d9cfc3] bg-[#fffdf9] p-6 sm:p-8 shadow-sm">
        {/* Golden corner stars */}
        <span className="absolute top-2.5 left-3 text-xs text-[#a88956] select-none">✦</span>
        <span className="absolute top-2.5 right-3 text-xs text-[#a88956] select-none">✦</span>
        <span className="absolute bottom-2.5 left-3 text-xs text-[#a88956] select-none">✦</span>
        <span className="absolute bottom-2.5 right-3 text-xs text-[#a88956] select-none">✦</span>

        <p className="mx-auto max-w-[650px] text-center font-cormorant text-lg sm:text-[21px] leading-relaxed text-[#1d1918]">
          Nơi lưu giữ những con người chưa từng tồn tại, những câu chuyện chưa từng được kể, và những thế giới chỉ tồn tại giữa những trang giấy da thơm mùi thời gian.
        </p>

        <div className="mt-4 text-center font-italianno text-3xl sm:text-4xl text-[#5b1824] tracking-wide">
          L’amour est Hera
        </div>
      </div>
    </section>
  );
};
