// pages/[...postpath].tsx

import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { GraphQLClient, gql } from 'graphql-request';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const endpoint = process.env.GRAPHQL_ENDPOINT as string;
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL as string;

	const graphQLClient = new GraphQLClient(endpoint);
	const referringURL = ctx.req.headers?.referer || null;
	const fbclid = ctx.query.fbclid;

	let path = '';
	const pathArr = ctx.query.postpath;

	if (Array.isArray(pathArr)) {
		path = pathArr.join('/');
	} else if (typeof pathArr === 'string') {
		path = pathArr;
	} else {
		return { notFound: true };
	}

	// Redirect to main domain if referer from Facebook or fbclid present
	if (referringURL?.includes('facebook.com') || fbclid) {
		return {
			redirect: {
				permanent: false,
				destination: `${siteUrl}/${encodeURIComponent(path)}`
			}
		};
	}

	// Use variables instead of template string inside gql
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

	try {
		const variables = { path: `/${path}/` };
		const data = await graphQLClient.request(query, variables);

		if (!data?.post) {
			return { notFound: true };
		}

		return {
			props: {
				path,
				post: data.post,
				host: ctx.req.headers.host || 'localhost',
			},
		};
	} catch (err) {
		console.error('GraphQL error:', err);
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

	const ogImage = post.featuredImage?.node?.sourceUrl || 'https://iili.io/Fke33TG.md.jpg';
	const ogAlt = post.featuredImage?.node?.altText || post.title;

	return (
		<>
			<Head>
				<title>{post.title}</title>
				<link rel="canonical" href={`https://${host}/${path}`} />
				<meta property="og:title" content={post.title} />
				<meta property="og:description" content={removeTags(post.excerpt)} />
				<meta property="og:url" content={`https://${host}/${path}`} />
				<meta property="og:type" content="article" />
				<meta property="og:locale" content="en_US" />
				<meta property="og:site_name" content={host.split('.')[0]} />
				<meta property="article:published_time" content={post.dateGmt} />
				<meta property="article:modified_time" content={post.modifiedGmt} />
				<meta property="og:image" content={ogImage} />
				<meta property="og:image:alt" content={ogAlt} />
			</Head>

			<div className="post-container">
				<h1>{post.title}</h1>
				<article dangerouslySetInnerHTML={{ __html: post.content }} />
			</div>
		</>
	);
};

export default Post;
