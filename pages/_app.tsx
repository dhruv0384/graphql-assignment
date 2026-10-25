import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

const client = new ApolloClient({
  uri: "http://localhost:4000/",
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
