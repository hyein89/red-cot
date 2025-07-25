import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { GraphQLClient, gql } from 'graphql-request';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const endpoint = process.env.GRAPHQL_ENDPOINT as string;
	const graphQLClient = new GraphQLClient(endpoint);

	const referringURL = ctx.req.headers?.referer || null;
	const fbclid = ctx.query.fbclid;
	const pathArr = ctx.query.postpath as Array<string>;

	// Join path and ensure it ends with slash (trailing slash is required by WordPress)
	let path = pathArr.join('/');
	if (!path.endsWith('/')) {
		path += '/';
	}
	console.log('Fetching post path:', path);

	// Redirect to WordPress if coming from Facebook
	if (referringURL?.includes('facebook.com') || fbclid) {
		return {
			redirect: {
				permanent: false,
				destination: endpoint.replace(/\/graphql\/?$/, '/') + encodeURI(path),
			},
		};
	}

	// GraphQL query
	const query = gql`
		query GetPostByPath {
			post(id: "/${path}", idType: URI) {
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
		const data = await graphQLClient.request(query);
		if (!data?.post) {
			return { notFound: true };
		}

		return {
			props: {
				path,
				post: data.post,
				host: ctx.req.headers.host,
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
	const removeTags = (str: string) =>
		str?.replace(/(<([^>]+)>)/gi, '').replace(/\[[^\]]*\]/, '') || '';

	return (
		<>
			<Head>
				<title>{post.title}</title>
				<meta property="og:title" content={post.title} />
				<link rel="canonical" href={`https://${host}/${path}`} />
				<meta property="og:description" content={removeTags(post.excerpt)} />
				<meta property="og:url" content={`https://${host}/${path}`} />
				<meta property="og:type" content="article" />
				<meta property="og:locale" content="en_US" />
				<meta property="og:site_name" content={host.split('.')[0]} />
				<meta property="article:published_time" content={post.dateGmt} />
				<meta property="article:modified_time" content={post.modifiedGmt} />
				<meta property="og:image" content={post.featuredImage?.node?.sourceUrl} />
				<meta
					property="og:image:alt"
					content={post.featuredImage?.node?.altText || post.title}
				/>
			</Head>
			<div className="post-container">
				<h1>{post.title}</h1>
				{post.featuredImage?.node?.sourceUrl && (
					<img
						src={post.featuredImage.node.sourceUrl}
						alt={post.featuredImage.node.altText || post.title}
					/>
				)}
				<article dangerouslySetInnerHTML={{ __html: post.content }} />
			</div>
		</>
	);
};

export default Post;
