import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <meta property="og:title" content="Judul Halaman Kamu" />
        <meta property="og:description" content="Deskripsi singkat halaman kamu." />
        <meta property="og:image" content="https://red-cot.vercel.app/preview.jpg" />
        <meta property="og:url" content="https://red-cot.vercel.app" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main>
        {/* Konten halaman kamu */}
      </main>
    </>
  );
}
