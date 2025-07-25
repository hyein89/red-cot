import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
         <meta property="og:url" content="https://red-cot.vercel.app" />
        <meta property="og:image" content="https://red-cot.vercel.app/preview.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content=" " />
        <meta property="og:description" content=" " />
        <meta property="og:type" content="website" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
