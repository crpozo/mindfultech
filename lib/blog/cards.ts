import { POSTS } from "./posts";
import type { PostCard } from "@/components/concepts/Cerebrium";

/** Server-side only: the latest post cards without their bodies (see Cerebrium's `posts` prop). */
export const latestPostCards = (n = 3): PostCard[] =>
  POSTS.slice(0, n).map(({ slug, dateLabel, tag, title }) => ({ slug, dateLabel, tag, title }));
