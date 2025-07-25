import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { GraphQLClient, gql } from 'graphql-request';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const endpoint = process.env.GRAPHQL_ENDPOINT as string;
  const graphQLClient = new GraphQLClient(endpoint);

  const referringURL = ctx.req.headers?.referer || '';
  const fbclid = ctx.query.fbclid;
  const pathArray = ctx.query.postpath as string[];
  const path = '/' + pathArray.join('/') + '/'; // pastikan pakai '/' depan & belakang

  // Redirect kalau dari Facebook
  if (referringURL.includes('facebook.com') || fbclid) {
    return {
      redirect: {
        permanent: false,
        destination: endpoint.replace('/graphql', '') + path,
      },
    };
  }

  const query = gql`
    query GetPost($uri: ID!) {
      post(id: $uri, idType: URI) {
        id
        title
        excerpt
        content
        dateGmt
        modifiedGmt
        link
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
    const variables = { uri: path };
    const data = await graphQLClient.request(query, variables);

    if (!data.post) {
      return { notFound: true };
    }

    return {
      props: {
        post: data.post,
        path,
        host: ctx.req.headers.host || '',
      },
    };
  } catch (error) {
    console.error('GraphQL Error:', error);
    return { notFound: true };
  }
};

interface PostProps {
  post: any;
  host: string;
  path: string;
}

const Post: React.FC<PostProps> = ({ post, host, path }) => {
  const removeTags = (str: string) => {
    if (!str) return '';
    return str.replace(/(<([^>]+)>)/gi, '').replace(/\[[^\]]*\]/g, '');
  };

  return (
    <>
      <Head>
        <meta property="og:title" content={post.title} />
        <link rel="canonical" href={`https://${host}${path}`} />
        <meta property="og:description" content={removeTags(post.excerpt)} />
        <meta property="og:url" content={`https://${host}${path}`} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content={host.split('.')[0]} />
        <meta property="article:published_time" content={post.dateGmt} />
        <meta property="article:modified_time" content={post.modifiedGmt} />
        <meta property="og:image" content={post.featuredImage?.node.sourceUrl} />
        <meta
          property="og:image:alt"
          content={post.featuredImage?.node.altText || post.title}
        />
        <title>{post.title}</title>
      </Head>
      <main className="post-container">
        <h1>{post.title}</h1>
        {post.featuredImage?.node.sourceUrl && (
          <img
            src={post.featuredImage.node.sourceUrl}
            alt={post.featuredImage.node.altText || post.title}
          />
        )}
        <article dangerouslySetInnerHTML={{ __html: post.content }} />
      </main>
    </>
  );
};

export default Post;
