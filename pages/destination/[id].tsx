// components
import { Detail } from "@/components/detail";
import { Header } from "@/components/Header";

// types
import { GetServerSideProps } from "next";

export default function Destination({ id }: { id: string }) {
  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col gap-4 p-4">
      <Header />
      <Detail id={id} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<{
  id: string;
}> = async (context) => {
  if (!context.params?.id) {
    return { notFound: true };
  }

  return { props: { id: context.params?.id as string } };
};
