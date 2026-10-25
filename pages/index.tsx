import { Destinations } from "@/components/destinations";
import { Header } from "@/components/Header";


export default function Home() {
  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col gap-4 p-4">
      {/* <BrowserRouter> */}
        <Header />
        <Destinations />
      {/* </BrowserRouter> */}
    </div>
  );
}
