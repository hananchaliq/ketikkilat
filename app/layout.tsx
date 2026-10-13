import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'KetikKilat - Tes Kecepatan Mengetik Indonesia',
  description: 'Website latihan dan tes kecepatan mengetik Bahasa Indonesia modern dengan mekanisme 10FastFingers, grafik performa aktual, engine tema dinamis, dan efek suara keyboard mekanikal.',
  openGraph: {
    title: 'KetikKilat - Tes Kecepatan Mengetik Indonesia',
    description: 'Website latihan dan tes kecepatan mengetik Bahasa Indonesia modern dengan mekanisme 10FastFingers, grafik performa aktual, engine tema dinamis, dan efek suara keyboard mekanikal.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KetikKilat - Tes Kecepatan Mengetik Indonesia',
    description: 'Website latihan dan tes kecepatan mengetik Bahasa Indonesia modern dengan mekanisme 10FastFingers, grafik performa aktual, engine tema dinamis, dan efek suara keyboard mekanikal.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
