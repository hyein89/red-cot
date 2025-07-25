import { GetStaticProps, GetStaticPaths } from 'next';

export default function PostPage({ post }: any) {
  if (!post) return <p>404 Not Found</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const res = await fetch('https://bonteng.infy.uk/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query {
          posts(first: 100) {
            nodes {
              slug
            }
          }
        }
      `,
    }),
  });

  const json = await res.json();

  // Kalau error, kasih fallback: true
  if (!json.data || !json.data.posts) {
    return { paths: [], fallback: true };
  }

  const paths = json.data.posts.nodes.map((post: any) => ({
    params: { slug: post.slug },
  }));

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug;

  const res = await fetch('https://bonteng.infy.uk/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query GetPostBySlug($slug: ID!) {
          post(id: $slug, idType: SLUG) {
            title
            content
          }
        }
      `,
      variables: { slug },
    }),
  });

  const json = await res.json();

  // Kalau data kosong atau error
  if (!json.data || !json.data.post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post: json.data.post,
    },
    revalidate: 10, // ISR setiap 10 detik
  };
};
