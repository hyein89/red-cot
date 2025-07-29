import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { GraphQLClient, gql } from 'graphql-request';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const endpoint = process.env.GRAPHQL_ENDPOINT as string;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL as string;

  const graphQLClient = new GraphQLClient(endpoint);
  const referer = ctx.req.headers?.referer || '';
  const fbclid = ctx.query.fbclid;
  const pathArr = ctx.query.postpath;

  // ✅ Jika root path (/) maka tampilkan kosong
  if (!pathArr) {
    return {
      props: {
        isRoot: true,
      },
    };
  }

  let path = '';

  if (Array.isArray(pathArr)) {
    path = pathArr.join('/');
  } else if (typeof pathArr === 'string') {
    path = pathArr;
  }

  if (!path) {
    return {
      props: {
        isRoot: true,
      },
    };
  }

  // ✅ Redirect jika akses dari Facebook
  if (referer.includes('facebook.com') || fbclid) {
    return {
      redirect: {
        permanent: false,
        destination: `${siteUrl}/${encodeURIComponent(path)}`,
      },
    };
  }

  const query = gql`
    query GetPost($path: ID!) {
      post(id: $path, idType: URI) {
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

  const possiblePaths = [`/${path}/`, `/post/${path}/`, `/blog/${path}/`];
  let postData = null;

  for (const tryPath of possiblePaths) {
    try {
      const variables = { path: tryPath };
      const data = await graphQLClient.request(query, variables);
      if (data?.post) {
        postData = data.post;
        break;
      }
    } catch (err) {
      continue;
    }
  }

  if (!postData) {
    return { notFound: true };
  }

  return {
    props: {
      post: postData,
      host: ctx.req.headers.host || 'localhost',
      path,
      isRoot: false,
    },
  };
};

interface PostProps {
  post?: any;
  host: string;
  path: string;
  isRoot?: boolean;
}

const Post: React.FC<PostProps> = ({ post, host, path, isRoot }) => {
  if (isRoot) return null; // ✅ Kosongkan root (/)

  const stripTags = (str: string) => {
    return str
      ? str.replace(/(<([^>]+)>)/gi, '').replace(/\[[^\]]*\]/g, '')
      : '';
  };

  const title = post.title || 'Untitled Post';
  const excerpt = stripTags(post.excerpt) || 'Read the full article.';
  const ogImage =
    post?.featuredImage?.node?.sourceUrl ||
    'https://iili.io/Fke33TG.md.jpg';
  const ogAlt = post?.featuredImage?.node?.altText || title;
  const url = `https://${host}/${path}`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={excerpt} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={excerpt} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content={host.split('.')[0]} />
        <meta property="article:published_time" content={post.dateGmt} />
        <meta property="article:modified_time" content={post.modifiedGmt} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content={ogAlt} />
      </Head>

      <main className="min-h-screen max-w-3xl mx-auto px-4 py-10 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <article
          className="prose dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </main>
    </>
  );
};

export default Post;
