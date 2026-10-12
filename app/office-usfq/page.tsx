import type { Metadata } from "next";
import { OfficeDemo } from "@/components/office/OfficeDemo";

const AVATAR_FILES = ["m-body", "f-body", "m-idle", "f-idle", "m-walk", "f-walk", "m-talk", "f-talk"];

export const metadata: Metadata = {
  title: "USFQ · AI Office · USFQ NEXT",
  description: "The USFQ leadership as AI agents in a 3D office; Alejandro Andrade (USFQ NEXT) presents the donations dashboard.",
  robots: { index: false, follow: false },
};

export default function OfficeUsfqPage() {
  return (
    <>
      {AVATAR_FILES.map((f) => (
        <link key={f} rel="preload" as="fetch" crossOrigin="anonymous" href={`/office/avatars/${f}.glb`} />
      ))}
      <OfficeDemo brand="usfq" />
    </>
  );
}
