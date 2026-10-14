import type { Metadata, Viewport } from 'next';
import './globals.css';

const siteTitle = 'KetikKilat - Tes Kecepatan Mengetik Bahasa Indonesia Online';
const siteDescription =
  'Website tes kecepatan mengetik Bahasa Indonesia online gratis ala 10FastFingers. Uji WPM (kata per menit), akurasi 10 jari, grafik fluktuasi ritme, dan keyboard visualizer interaktif.';
const siteKeywords = [
  'ketikkilat',
  'ketik kilat',
  'tes mengetik',
  'tes kecepatan mengetik',
  'tes mengetik 10 jari',
  'typing test indonesia',
  '10fastfingers indonesia',
  'tes wpm online',
  'latihan mengetik bahasa indonesia',
  'kecepatan mengetik kata per menit',
  'tes kecepatan jari',
  'tes akurasi mengetik',
  'tes wpm 1 menit',
  'speed typing test id',
  'latihan mengetik cepat gratis',
  'keyboard visualizer indonesia',
];

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://ketikkilat.app'),
  title: {
    default: siteTitle,
    template: '%s | KetikKilat',
  },
  description: siteDescription,
  keywords: siteKeywords,
  authors: [{ name: 'KetikKilat Team' }],
  creator: 'KetikKilat',
  publisher: 'KetikKilat',
  applicationName: 'KetikKilat',
  category: 'Education / Productivity',
  classification: 'Typing Test & Speed Training',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icon.svg', sizes: '180x180' }],
    shortcut: ['/icon.svg'],
  },
  // Google Search Console Site Verification
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      'google-site-verification=KetikKilat-TypingSpeedTest-ConsoleVerificationToken',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    siteName: 'KetikKilat',
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: '/icon.svg',
        width: 512,
        height: 512,
        alt: 'KetikKilat Logo - Tes Kecepatan Mengetik Indonesia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/icon.svg'],
    creator: '@KetikKilat',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Schema.org Structured Data (WebApplication + SoftwareApplication)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'KetikKilat',
    alternateName: ['Ketik Kilat', 'KetikKilat Indonesia', 'Tes Mengetik KetikKilat'],
    url: 'https://ketikkilat.app',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'All',
    inLanguage: 'id',
    description: siteDescription,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    featureList: [
      'Tes Kecepatan Mengetik Bahasa Indonesia 60 Detik',
      'Perhitungan WPM dan Akurasi Standar 10FastFingers',
      'Grafik Fluktuasi Laju Kecepatan Riil Detik Demi Detik',
      'Keyboard Visualizer Interaktif dengan Panduan Jalur Jari',
      'Efek Suara Keyboard Mekanikal Beragam Profil',
      'Tingkat Kosakata Lengkap: Mudah, Normal, Mahir',
      'Penyimpanan Rekor Terbaik dan Riwayat Latihan Lokal',
    ],
  };

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        {/* Google Search Console verification meta tag */}
        <meta
          name="google-site-verification"
          content={
            process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
            'google-site-verification=KetikKilat-TypingSpeedTest-ConsoleVerificationToken'
          }
        />
        {/* JSON-LD Schema for Google Search Engine indexing */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
