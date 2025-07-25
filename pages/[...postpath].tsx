import { GetServerSideProps } from 'next';
import Head from 'next/head';

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT!;

export default function PostPage({ post }: { post: any }) {
  if (!post) return <p>404 - Post not found</p>;

  return (
    <>
      <Head>
        <title>{post.title}</title>
        <meta property="og:title" content={post.title} />
        <meta property="og:image" content={post.featuredImage?.node?.sourceUrl || ''} />
        <meta property="og:description" content={post.excerpt || ''} />
      </Head>
      <div>
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const slugArray = context.params?.postPath as string[];
  const slug = '/' + slugArray.join('/') + '/';

  const query = `
    query GetPost($id: ID!) {
      post(id: $id, idType: URI) {
        title
        content
        excerpt
        featuredImage {
          node {
            sourceUrl
          }
        }
      }
    }
  `;

  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { id: slug } }),
  });

  const result = await res.json();

  if (!result?.data?.post) {
    console.log('❌ Post not found:', slug);
    return { notFound: true };
  }

  return {
    props: {
      post: result.data.post,
    },
  };
};
