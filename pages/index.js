import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <meta property="og:image" content="https://red-cot.vercel.app/preview.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://red-cot.vercel.app" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main>
        <p>Jika kamu melihat ini, berarti preview sudah muncul.</p>
      </main>
    </>
  );
}
