export async function getServerSideProps() {
  return {
    redirect: {
      destination: 'https://example.com/target-article', // GANTI dengan URL tujuan
      permanent: false,
    },
  };
}

export default function RedirectPage() {
  return null;
}
