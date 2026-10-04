import type { Metadata } from "next";
import { OfficeDemo } from "@/components/office/OfficeDemo";

// the people's bodies and clips: fetched from the head so they arrive while the scripts load
const AVATAR_FILES = ["m-body", "f-body", "m-idle", "f-idle", "m-walk", "f-walk", "m-talk", "f-talk"];

export const metadata: Metadata = {
  title: "AI Management Office · MindfulTech",
  description: "Demo: a team of AI employees working in a 3D office. Click anyone to see their live screen and chat with them. Available in English and Spanish.",
  // client demo — not for search engines
  robots: { index: false, follow: false },
};

export default function OfficeDemoPage() {
  return (
    <>
      {AVATAR_FILES.map((f) => (
        <link key={f} rel="preload" as="fetch" crossOrigin="anonymous" href={`/office/avatars/${f}.glb`} />
      ))}
      <OfficeDemo />
    </>
  );
}
