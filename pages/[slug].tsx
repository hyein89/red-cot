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
  const res = await fetch(https://red-cot.vercel.app/graphql', {
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
  const paths = json.data.posts.nodes.map((post: any) => ({
    params: { slug: post.slug },
  }));

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
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
      variables: { slug: params?.slug },
    }),
  });

  const json = await res.json();
  return {
    props: {
      post: json.data.post || null,
    },
    revalidate: 10,
  };
};

