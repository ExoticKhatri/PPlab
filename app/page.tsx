import { Suspense } from "react";
import HomeTabs from "./_components/home-tabs/HomeTabs";

export default function Home() {
  return (
    <Suspense>
      <HomeTabs />
    </Suspense>
  );
}
