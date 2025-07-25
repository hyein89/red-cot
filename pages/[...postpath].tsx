import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { GraphQLClient, gql } from 'graphql-request';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const endpoint = process.env.GRAPHQL_ENDPOINT as string;
	const graphQLClient = new GraphQLClient(endpoint);

	const referringURL = ctx.req.headers?.referer || null;
	const pathArr = ctx.query.postpath as Array<string>;
	const path = pathArr?.join('/') || '';
	const fbclid = ctx.query.fbclid;

	// Redirect jika dari Facebook
	if (referringURL?.includes('facebook.com') || fbclid) {
		return {
			redirect: {
				permanent: false,
				destination: `${
					endpoint.replace(/\/graphql\/?$/, '/') + encodeURI(path)
				}`,
			},
		};
	}

	// GraphQL query
	const query = gql`
		{
			post(id: "/${path}/", idType: URI) {
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

	let data;
try {
  data = await graphQLClient.request(query);
} catch (error) {
  console.error('❌ Error saat fetch GraphQL:', error);
  return {
    notFound: true,
  };
}


		return {
			props: {
				path,
				post: data.post,
				host: ctx.req.headers.host || '',
			},
		};
	} catch (error) {
		console.error('GraphQL error:', error);
		return { notFound: true }; // Penting: hindari error 500
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
		return str.replace(/(<([^>]+)>)/gi, '').replace(/\[[^\]]*\]/, '');
	};

	return (
		<>
			<Head>
				<meta property="og:title" content={post.title} />
				<link rel="canonical" href={`https://${host}/${path}`} />
				<meta property="og:description" content={removeTags(post.excerpt)} />
				<meta property="og:url" content={`https://${host}/${path}`} />
				<meta property="og:type" content="article" />
				<meta property="og:locale" content="en_US" />
				<meta property="og:site_name" content={host.split('.')[0]} />
				<meta property="article:published_time" content={post.dateGmt} />
				<meta property="article:modified_time" content={post.modifiedGmt} />
				<meta property="og:image" content={post.featuredImage.node.sourceUrl} />
				<meta
					property="og:image:alt"
					content={post.featuredImage.node.altText || post.title}
				/>
				<title>{post.title}</title>
			</Head>
			<div className="post-container">
				<h1>{post.title}</h1>
				<img
					src={post.featuredImage.node.sourceUrl}
					alt={post.featuredImage.node.altText || post.title}
				/>
				<article dangerouslySetInnerHTML={{ __html: post.content }} />
			</div>
		</>
	);
};

export default Post;
