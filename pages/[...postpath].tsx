// pages/[...postPath].tsx
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

const GRAPHQL_ENDPOINT = "https://bonteng.infy.uk/graphql";

export default function PostPage({ post }: { post: any }) {
  const router = useRouter();

  if (router.isFallback) return <p>Loading...</p>;
  if (!post) return <p>404 - Not Found</p>;

  return (
    <div>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const slugArray = context.params?.postPath as string[];
  const slug = '/' + slugArray.join('/') + '/'; // ini penting pakai '/' di depan & akhir

  const query = `
    query GetPost($id: ID!) {
      post(id: $id, idType: URI) {
        title
        content
        uri
      }
    }
  `;

  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { id: slug } }),
  });

  const { data } = await res.json();

  if (!data?.post) {
    return { notFound: true };
  }

  return {
    props: {
      post: data.post,
    },
  };
};
