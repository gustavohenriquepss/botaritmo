import React from 'react';
import { formatPriceBRL } from '@/lib/price';

interface EventHeaderProps {
  title: string;
  creator: string;
  venue?: string | null;
  priceCents?: number | null;
}

export const EventHeader: React.FC<EventHeaderProps> = ({ title, creator, venue, priceCents }) => {
  const priceLabel = formatPriceBRL(priceCents);
  const isFree = priceCents == null || priceCents === 0;
  return (
    <div className="flex flex-col items-start gap-4 self-stretch relative">
      <header>
        <h1 className="self-stretch text-[#1A1A1A] text-[56px] font-medium leading-[54.88px] tracking-[-2.24px] relative max-md:text-[42px] max-md:leading-[38px] max-md:tracking-[-1.68px] max-sm:text-[32px] max-sm:leading-[30px] max-sm:tracking-[-1.28px] font-display">
          {title}
        </h1>
      </header>
      <div className="self-stretch text-[#1A1A1A] text-[11px] font-normal uppercase relative">
        {venue ? <>POR {venue}</> : <>BY {creator}</>}
      </div>
      <div
        className={
          'inline-flex items-center px-2 h-[24px] border border-solid border-[#1A1A1A] ' +
          (isFree ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A]')
        }
      >
        <span className="text-[11px] font-normal uppercase">{priceLabel}</span>
      </div>
    </div>
  );
};
