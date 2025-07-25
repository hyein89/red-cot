// pages/[slug].tsx
import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'

export default function PostPage({ title }: { title: string }) {
  const router = useRouter()

  if (router.isFallback) return <p>Loading...</p>

  return (
    <div>
      <h1>{title}</h1>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Fetch all slugs
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
      `
    })
  })

  const json = await res.json()
  const slugs = json.data.posts.nodes

  const paths = slugs.map((post: any) => ({
    params: { slug: post.slug }
  }))

  return { paths, fallback: true }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const res = await fetch('https://bonteng.infy.uk/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query GetPostBySlug($slug: String!) {
          postBy(slug: $slug) {
            title
          }
        }
      `,
      variables: {
        slug: params?.slug
      }
    })
  })

  const json = await res.json()
  const post = json.data.postBy

  if (!post) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      title: post.title
    },
    revalidate: 10
  }
}
