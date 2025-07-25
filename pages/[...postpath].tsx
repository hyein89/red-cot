// pages/[...postpath].tsx
import { GetServerSideProps } from 'next';
import Head from 'next/head';

const dummyPosts = [
  {
    slug: 'helo',
    title: 'Judul Helo',
    excerpt: 'Ini excerpt Helo',
    content: '<p>Ini konten lengkap dari Helo</p>',
    date: '2025-07-25T00:00:00Z',
    modified: '2025-07-25T12:00:00Z',
    image: 'https://via.placeholder.com/800x400.png?text=Helo',
  },
  {
    slug: 'contoh-post',
    title: 'Contoh Post',
    excerpt: 'Excerpt dari contoh post.',
    content: '<p>Ini adalah isi konten contoh post.</p>',
    date: '2025-07-20T00:00:00Z',
    modified: '2025-07-21T00:00:00Z',
    image: 'https://via.placeholder.com/800x400.png?text=Contoh+Post',
  },
];

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const pathArr = ctx.params?.postpath as string[];
  const slug = pathArr?.[pathArr.length - 1] || '';

  const post = dummyPosts.find((p) => p.slug === slug);

  if (!post) {
    return { notFound: true };
  }

  return {
    props: {
      post,
      path: slug,
      host: ctx.req.headers.host,
    },
  };
};

interface Props {
  post: any;
  path: string;
  host: string;
}

export default function PostPage({ post, path, host }: Props) {
  const removeTags = (str: string) => {
    return str.replace(/(<([^>]+)>)/gi, '').replace(/\[[^\]]*\]/, '');
  };

  return (
    <>
      <Head>
        <title>{post.title}</title>
        <meta property="og:title" content={post.title} />
        <link rel="canonical" href={`https://${host}/${path}`} />
        <meta property="og:description" content={removeTags(post.excerpt)} />
        <meta property="og:url" content={`https://${host}/${path}`} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={post.image} />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:modified_time" content={post.modified} />
      </Head>
      <div className="post-container">
        <h1>{post.title}</h1>
        <img src={post.image} alt={post.title} />
        <article dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </>
  );
}
