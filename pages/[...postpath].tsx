import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { GraphQLClient, gql } from 'graphql-request';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const endpoint = process.env.GRAPHQL_ENDPOINT!;
  const graphQLClient = new GraphQLClient(endpoint);
  const pathArr = ctx.query.postpath as string[] || [];
  const path = pathArr.join('/');

  const query = gql`
    query GetPost($uri: String!) {
      post(id: $uri, idType: URI) {
        id
        excerpt
        title
        link
        dateGmt
        modifiedGmt
        content
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
    }
  `;

  try {
    const data = await graphQLClient.request(query, { uri: `/${path}/` });

    if (!data?.post) return { notFound: true };

    return {
      props: {
        path,
        post: data.post,
        host: ctx.req.headers.host || process.env.NEXT_PUBLIC_SITE_URL,
      },
    };
  } catch (error) {
    console.error('GraphQL ERROR:', error);
    return { notFound: true };
  }
};

interface PostProps {
  post: any;
  host: string;
  path: string;
}

const Post: React.FC<PostProps> = ({ post, host, path }) => {
  const removeTags = (str: string) =>
    str.replace(/(<([^>]+)>)/gi, '').replace(/\[[^\]]*\]/g, '');

  const imageUrl =
    post.featuredImage?.node?.sourceUrl || 'https://iili.io/Fke33TG.md.jpg';
  const imageAlt = post.featuredImage?.node?.altText || post.title;

  return (
    <>
      <Head>
        <title>{post.title}</title>
        <meta property="og:title" content={post.title} />
        <meta
          property="og:description"
          content={removeTags(post.excerpt || '')}
        />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:url" content={`https://${host}/${path}`} />
        <link rel="canonical" href={`https://${host}/${path}`} />
        <meta property="og:site_name" content={host.split('.')[0]} />
        <meta property="article:published_time" content={post.dateGmt} />
        <meta property="article:modified_time" content={post.modifiedGmt} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:alt" content={imageAlt} />
      </Head>
      <main className="post-container" style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
        <h1>{post.title}</h1>
        <article dangerouslySetInnerHTML={{ __html: post.content }} />
      </main>
    </>
  );
};

export default Post;
