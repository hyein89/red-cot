// pages/[slug].tsx
import type { GetServerSideProps } from 'next';
import { gql, GraphQLClient } from 'graphql-request';
import Head from 'next/head';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  dateGmt?: string;
  modifiedGmt?: string;
  author?: {
    node: {
      name: string;
    };
  };
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
}

interface Props {
  post: Post;
  host: string;
  path: string;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const slug = ctx.params?.slug;

  if (!slug || typeof slug !== 'string') {
    return { notFound: true };
  }

  const uri = `/${slug}/`;
  const graphQLClient = new GraphQLClient(process.env.WP_GRAPHQL_URL || '');

  const query = gql`
    query GetNodeByUri($uri: ID!) {
      nodeByUri(uri: $uri) {
        __typename
        ... on Post {
          id
          title
          content
          excerpt
          dateGmt
          modifiedGmt
          author {
            node {
              name
            }
          }
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
        ... on Page {
          id
          title
          content
        }
      }
    }
  `;

  try {
    const data = await graphQLClient.request<{ nodeByUri: Post | null }>(query, { uri });

    if (!data.nodeByUri) {
      return { notFound: true };
    }

    return {
      props: {
        post: data.nodeByUri,
        path: slug,
        host: ctx.req.headers.host || '',
      },
    };
  } catch (error) {
    console.error('GraphQL error:', error);
    return { notFound: true };
  }
};

export default function Page({ post, path, host }: Props) {
  return (
    <>
      <Head>
        <title>{post.title}</title>
        <meta property="og:title" content={post.title} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://${host}/${path}`} />
        {post.featuredImage?.node?.sourceUrl && (
          <meta property="og:image" content={post.featuredImage.node.sourceUrl} />
        )}
        {post.excerpt && (
          <meta
            property="og:description"
            content={post.excerpt.replace(/<[^>]*>?/gm, '').slice(0, 150)}
          />
        )}
      </Head>
      <main>
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </main>
    </>
  );
}
