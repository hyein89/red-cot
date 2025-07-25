export const getStaticProps: GetStaticProps = async ({ params }) => {
  const endpoint = process.env.GRAPHQL_ENDPOINT!;
  const slug = params?.slug;

  const res = await fetch(endpoint, {
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
      variables: { slug },
    }),
  });

  const json = await res.json();

  if (!json?.data?.post) {
    return { notFound: true };
  }

  return {
    props: { post: json.data.post },
    revalidate: 10,
  };
};
