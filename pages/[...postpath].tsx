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

  const imageUrl = `https://red-cot.vercel.app/${path}.jpg`; // GANTI dengan URL asli gambarmu
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
        <meta name="robots" content="noindex" />
      </Head>
      <main style={{ textAlign: 'center', padding: '100px' }}>
        <h1>Redirecting...</h1>
      </main>
    </>
  );
};

export default Page;
