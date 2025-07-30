import { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect } from "react";

interface Props {
  redirectUrl: string;
  imageUrl: string;
  title: string | null;
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
      title: null, // sengaja null agar title tidak tampil
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
  <meta property="og:title" content="&#8206;" />

  {/* Tidak ada <title> */}
  {/* Tidak ada og:title */}
  {/* Tidak ada og:image */}
  {/* Tidak ada og:type */}
  {/* Tidak ada og:url */}
  <meta name="robots" content="noindex,nofollow" />
</Head>


      <main style={{ textAlign: "center", paddingTop: "50px" }}>
        <p>Mengalihkan ke halaman tujuan...</p>
      </main>
    </>
  );
}
