// pages/[slug].tsx
import { useRouter } from 'next/router';

export default function SlugPage() {
  const router = useRouter();
  const { slug } = router.query;

  return (
    <div>
      <h1>Halaman: {slug}</h1>
    </div>
  );
}
