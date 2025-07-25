// pages/[...postpath].tsx
import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { GraphQLClient, gql } from 'graphql-request';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const endpoint = process.env.GRAPHQL_ENDPOINT as string;
  const graphQLClient = new GraphQLClient(endpoint);
  const referringURL = ctx.req.headers?.referer || null;
  const fbclid = ctx.query.fbclid;

  const pathArr = ctx.params?.postpath as string[];
  const path = pathArr?.join('/') || '';

  // Redirect jika dari Facebook
  if (referringURL?.includes('facebook.com') || fbclid) {
    return {
      redirect: {
        destination: `${endpoint.replace(/\/graphql\/?/, '/')}${encodeURI(path)}`,
        permanent: false,
      },
    };
  }

  const query = gql`
    query GetPost($uri: ID!) {
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

  const variables = { uri: `/${path}/` };

  try {
    const data = await graphQLClient.request(query, variables);

    if (!data?.post) {
      return { notFound: true };
    }

    return {
      props: {
        post: data.post,
        path,
        host: ctx.req.headers.host,
      },
    };
  } catch (error) {
    console.error('GraphQL Error:', error);
    return { notFound: true };
  }
};

interface PostProps {
  post: any;
  path: string;
  host: string;
}

const Post: React.FC<PostProps> = ({ post, path, host }) => {
  const removeTags = (str: string) =>
    str?.replace(/(<([^>]+)>)/gi, '').replace(/\[[^\]]*\]/, '') || '';

  return (
    <>
      <Head>
        <title>{post.title}</title>
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={removeTags(post.excerpt)} />
        <meta property="og:url" content={`https://${host}/${path}`} />
        <meta property="og:image" content={post.featuredImage?.node.sourceUrl || ''} />
        <meta property="og:image:alt" content={post.featuredImage?.node.altText || post.title} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content={host.split('.')[0]} />
        <meta property="article:published_time" content={post.dateGmt} />
        <meta property="article:modified_time" content={post.modifiedGmt} />
        <link rel="canonical" href={`https://${host}/${path}`} />
      </Head>
      <div>
        <h1>{post.title}</h1>
        {post.featuredImage?.node?.sourceUrl && (
          <img src={post.featuredImage.node.sourceUrl} alt={post.featuredImage.node.altText} />
        )}
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </>
  );
};

export default Post;
