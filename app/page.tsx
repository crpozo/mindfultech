import { Home } from "@/components/site/Home";
import { Shell } from "@/components/site/Shell";

export default function HomePage() {
  return (
    <Shell active="home">
      <Home />
    </Shell>
  );
}
