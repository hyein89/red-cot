export async function getServerSideProps() {
  return {
    redirect: {
      destination: 'https://googel.com', // GANTI dengan URL tujuan
      permanent: false,
    },
  };
}

export default function RedirectPage() {
  return null;
}
