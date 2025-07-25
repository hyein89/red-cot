import type { GetServerSideProps } from 'next';
import { gql, GraphQLClient } from 'graphql-request';
import Head from 'next/head';

interface Post {
	id: string;
	excerpt: string;
	title: string;
	link: string;
	dateGmt: string;
	modifiedGmt: string;
	content: string;
	author: {
		node: {
			name: string;
		};
	};
	featuredImage: {
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
	const postpath = ctx.params?.postpath;
	if (!postpath || !Array.isArray(postpath)) {
		return { notFound: true };
	}

	const path = postpath.join('/');
	const graphQLClient = new GraphQLClient(process.env.WP_GRAPHQL_URL || '');

	const query = gql`
		query GetPostByUri($uri: ID!) {
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
		const data = await graphQLClient.request<{ post: Post }>(query, {
			uri: `/${path}/`,
		});

		if (!data.post) {
			return { notFound: true };
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
					<meta property="og:description" content={post.excerpt.replace(/<[^>]*>?/gm, '')} />
				)}
			</Head>
			<main>
				<h1>{post.title}</h1>
				<div dangerouslySetInnerHTML={{ __html: post.content }} />
			</main>
		</>
	);
}
