import { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect } from "react";

interface Props {
  redirectUrl: string;
  imageUrl: string;
  title: string;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const slugPath = ctx.params?.postpath || [];

  // Kondisi URL tidak valid / salah / tidak ditemukan
  const isInvalid = !slugPath || slugPath.length === 0 || slugPath[0] === 'helo';

  if (isInvalid) {
    // Solusi: redirect ke halaman utama agar Facebook tidak melihat error
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // Data dummy jika slug valid (isi sesuai kebutuhan kamu)
  return {
    props: {
      redirectUrl: "https://example.com/offer",
      imageUrl: "https://via.placeholder.com/600x315.png?text=Preview",
      title: null,
    },
  };
};

export default function RedirectPage({ redirectUrl, imageUrl, title }: Props) {
  useEffect(() => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }, [redirectUrl]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={redirectUrl} />
      </Head>

      <main style={{ textAlign: "center", paddingTop: "50px" }}>
        <p>Mengalihkan ke halaman tujuan...</p>
      </main>
    </>
  );
}
