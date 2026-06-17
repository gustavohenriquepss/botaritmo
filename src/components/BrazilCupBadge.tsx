import React from 'react';

interface BrazilCupBadgeProps {
  size?: 'sm' | 'lg';
  className?: string;
}

/**
 * Tag temporária para destacar eventos que transmitirão jogos do Brasil na Copa.
 * Estilo: amarelo Brasil (#FFDF00), borda preta, sem cantos arredondados (segue design system).
 */
export const BrazilCupBadge: React.FC<BrazilCupBadgeProps> = ({ size = 'sm', className = '' }) => {
  const sizeClasses =
    size === 'lg'
      ? 'h-[28px] px-3 text-[12px]'
      : 'h-[23px] px-3 text-[11px]';

  return (
    <div
      className={`inline-flex items-center gap-1.5 border border-black bg-[#FFDF00] text-black font-medium uppercase leading-none ${sizeClasses} ${className}`}
      title="Transmite jogo do Brasil na Copa"
    >
      <span aria-hidden="true">🇧🇷</span>
      <span>Brasil ao vivo</span>
    </div>
  );
};
