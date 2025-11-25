import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  canonicalUrl?: string;
  noindex?: boolean;
  structuredData?: object;
}

const DEFAULT_TITLE = 'eArcheo - Dálkový průzkum krajiny České republiky';
const DEFAULT_DESCRIPTION = 'Prozkoumejte krajinu České republiky pomocí pokročilých LiDAR dat a leteckých snímků. Interaktivní 3D vizualizace terénu pro archeology, historiky a badatele.';
const DEFAULT_KEYWORDS = 'lidar, čúzk, archeologický průzkum, digitální model reliéfu, ortofoto, mapa česká republika, 3D terén, dálkový průzkum, archeologie, letecká archeologie';
const DEFAULT_OG_IMAGE = '/og-image.png';
const SITE_URL = 'https://earcheo.cz';

export const SEOHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  canonicalUrl,
  noindex = false,
  structuredData
}: SEOHeadProps) => {
  const fullTitle = title ? `${title} | eArcheo` : DEFAULT_TITLE;
  const fullCanonicalUrl = canonicalUrl ? `${SITE_URL}${canonicalUrl}` : SITE_URL;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`;

  // Default structured data - WebSite schema
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'eArcheo',
        description: DEFAULT_DESCRIPTION,
        inLanguage: 'cs-CZ',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/map?search={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@type': 'WebApplication',
        '@id': `${SITE_URL}/#webapp`,
        name: 'eArcheo',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'CZK'
        },
        featureList: [
          'LiDAR data vizualizace',
          'Digitální model reliéfu',
          'Ortofoto letecké snímky',
          'Interaktivní 3D mapa',
          'Historické mapy overlay'
        ]
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'eArcheo',
        url: SITE_URL,
        description: 'Platforma pro dálkový archeologický průzkum pomocí LiDAR dat',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Technical Support',
          availableLanguage: ['cs', 'en']
        }
      }
    ]
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:site_name" content="eArcheo" />
      <meta property="og:locale" content="cs_CZ" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="eArcheo" />
      <meta name="language" content="Czech" />
      <meta name="geo.region" content="CZ" />
      <meta name="geo.placename" content="Česká republika" />
      
      {/* AI Crawlers - Explicitly allow indexing */}
      <meta name="GPTBot" content="index, follow" />
      <meta name="Anthropic-AI" content="index, follow" />
      <meta name="Claude-Web" content="index, follow" />
      
      {/* Structured Data - JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  );
};

