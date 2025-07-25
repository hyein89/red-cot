import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const pathArr = ctx.query.postpath as string[];
  const path = pathArr.join('/');

  const referer = ctx.req.headers?.referer || '';
  const userAgent = ctx.req.headers['user-agent'] || '';
  const isFacebook =
    referer.includes('facebook.com') ||
    userAgent.includes('facebookexternalhit') ||
    ctx.query?.fbclid;

  const imageUrl = `https://${ctx.req.headers.host}/${path}.jpg`; // ← otomatis sesuai folder public/images
  const redirectTarget = `https://tujuanmu.com/`; // GANTI ke tujuan aslinya

  if (!isFacebook) {
    return {
      redirect: {
        destination: redirectTarget,
        permanent: false,
      },
    };
  }

  return {
    props: {
      imageUrl,
      canonicalUrl: `https://${ctx.req.headers.host}/${path}`,
    },
  };
};

interface Props {
  imageUrl: string;
  canonicalUrl: string;
}

const Page: React.FC<Props> = ({ imageUrl, canonicalUrl }) => {
  return (
    <>
      <Head>
        <meta property="og:image" content={imageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />

        {/* INI TRIK AGAR TIDAK MUNCUL TEKS TITLE/DESKRIPSI DI FACEBOOK */}
        <meta property="og:title" content=" " />
        <meta property="og:description" content=" " />

        {/* Bisa ditambah untuk SEO & mencegah index Google */}
        <meta name="robots" content="noindex" />
        <title> </title>
      </Head>

      {/* Optional: tampilkan halaman kosong jika diakses langsung */}
      <main style={{ textAlign: 'center', padding: '50px' }}>
        <p>Facebook preview loaded.</p>
      </main>
    </>
  );
};

export default Page;
