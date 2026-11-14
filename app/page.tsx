import { Cerebrium } from "@/components/concepts/Cerebrium";
import { latestPostCards } from "@/lib/blog/cards";

export default function HomePage() {
  return <Cerebrium posts={latestPostCards()} />;
}
