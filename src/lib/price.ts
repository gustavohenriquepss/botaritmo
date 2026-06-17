export const formatPriceBRL = (priceCents: number | null | undefined): string => {
  if (priceCents == null) return 'GRATUITO';
  if (priceCents === 0) return 'GRATUITO';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(priceCents / 100);
};
