import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { GraphQLClient, gql } from 'graphql-request';

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
  console.log('Paths JSON:', json);

  const paths = json?.data?.posts?.nodes?.map((post: any) => ({
    params: { slug: post.slug },
  })) || [];

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
  console.log('Post JSON:', json);

  if (!json?.data?.post) {
    return { notFound: true };
  }

  return {
    props: {
      post: json.data.post,
    },
    revalidate: 10,
  };
};
