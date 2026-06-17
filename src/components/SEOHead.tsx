import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  jsonLd?: Record<string, unknown>;
}

const SITE_URL = 'https://botaritmo.com';

export const SEOHead = ({
  title,
  description,
  keywords = 'eventos rio de janeiro, eventos rj, eventos hoje, programação rj, festas rio, shows rio',
  image,
  url = typeof window !== 'undefined' ? window.location.href : `${SITE_URL}/`,
  jsonLd,
}: SEOHeadProps) => {
  const fullTitle = `${title} | Bota Ritmo by YEON`;
  const absoluteImage = image
    ? (image.startsWith('http') ? image : `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`)
    : `${SITE_URL}/placeholder.svg`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};
