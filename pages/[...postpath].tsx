import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { GraphQLClient, gql } from 'graphql-request';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const endpoint = process.env.GRAPHQL_ENDPOINT as string;
	const graphQLClient = new GraphQLClient(endpoint);
	const referer = ctx.req.headers.referer || '';
	const slug = ctx.params?.slug as string;
	const fbclid = ctx.query.fbclid;

	if (referer.includes('facebook.com') || fbclid) {
		return {
			redirect: {
				permanent: false,
				destination: `https://bonteng.infy.uk/${slug}`,
			},
		};
	}

	const query = gql`
		query GetPost($slug: ID!) {
			post(id: $slug, idType: SLUG) {
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
		const data = await graphQLClient.request(query, { slug });

		if (!data.post) {
			return { notFound: true };
		}

		return {
			props: {
				post: data.post,
				host: ctx.req.headers.host,
				slug,
			},
		};
	} catch (error) {
		console.error('GraphQL Error:', error);
		return { notFound: true };
	}
};

interface Props {
	post: any;
	host: string;
	slug: string;
}

const PostPage: React.FC<Props> = ({ post, host, slug }) => {
	const removeTags = (str: string) =>
		str ? str.replace(/(<([^>]+)>)/gi, '').replace(/\[[^\]]*\]/g, '') : '';

	return (
		<>
			<Head>
				<title>{post.title}</title>
				<meta property="og:title" content={post.title} />
				<meta property="og:description" content={removeTags(post.excerpt)} />
				<meta property="og:url" content={`https://${host}/${slug}`} />
				<meta property="og:image" content={post.featuredImage?.node?.sourceUrl} />
				<meta property="og:image:alt" content={post.featuredImage?.node?.altText || post.title} />
			</Head>
			<main>
				<h1>{post.title}</h1>
				{post.featuredImage?.node?.sourceUrl && (
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

export default PostPage;
