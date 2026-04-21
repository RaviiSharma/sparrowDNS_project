import RecordsPage from "@/components/records-comps";
import { Suspense } from "react";


const Page = async ({ params }: { params: any }) => {
  const { slug } = await params;
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <RecordsPage slug={slug} />
      </Suspense>
    </div>
  );
};

export default Page;