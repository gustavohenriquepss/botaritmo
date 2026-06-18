import React from 'react';
import { Link } from 'react-router-dom';
import { formatPriceBRL } from '@/lib/price';
import { BrazilCupBadge } from './BrazilCupBadge';

interface CreatorProfile {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface EventHeaderProps {
  title: string;
  creator: string;
  venue?: string | null;
  priceCents?: number | null;
  broadcastsBrazilGame?: boolean;
  creatorProfile?: CreatorProfile | null;
}

export const EventHeader: React.FC<EventHeaderProps> = ({ title, creator, venue, priceCents, broadcastsBrazilGame, creatorProfile }) => {
  const priceLabel = formatPriceBRL(priceCents);
  const isFree = priceCents == null || priceCents === 0;

  const displayName = creatorProfile?.display_name || creator;
  const username = creatorProfile?.username;
  const avatarUrl = creatorProfile?.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col items-start gap-4 self-stretch relative">
      <header>
        <h1 className="self-stretch text-[#1A1A1A] text-[56px] font-medium leading-[54.88px] tracking-[-2.24px] relative max-md:text-[42px] max-md:leading-[38px] max-md:tracking-[-1.68px] max-sm:text-[32px] max-sm:leading-[30px] max-sm:tracking-[-1.28px] font-display">
          {title}
        </h1>
      </header>

      {venue && (
        <div className="self-stretch text-[#1A1A1A] text-[11px] font-normal uppercase relative">
          {venue}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <div
          className={
            'inline-flex items-center px-2 h-[24px] border border-solid border-[#1A1A1A] ' +
            (isFree ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A]')
          }
        >
          <span className="text-[11px] font-normal uppercase">{priceLabel}</span>
        </div>
        {broadcastsBrazilGame && <BrazilCupBadge size="sm" />}
      </div>

      {username ? (
        <Link
          to={`/${username}`}
          className="flex items-center gap-2 self-stretch"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-8 h-8 object-cover border border-[#1A1A1A] rounded-none"
            />
          ) : (
            <div className="w-8 h-8 flex items-center justify-center bg-gray-200 border border-[#1A1A1A] text-[11px] font-medium text-[#1A1A1A] uppercase rounded-none">
              {initials}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-[11px] font-normal uppercase text-[#1A1A1A] leading-tight">
              {displayName}
            </span>
            <span className="text-[11px] font-normal uppercase text-[#1A1A1A] opacity-60 leading-tight">
              @{username}
            </span>
          </div>
        </Link>
      ) : (
        <div className="self-stretch text-[#1A1A1A] text-[11px] font-normal uppercase relative">
          BY {creator}
        </div>
      )}
    </div>
  );
};
