"use client";

import dynamic from "next/dynamic";
import { HUD } from "@/components/HUD";
import { ProjectModal } from "@/components/ProjectModal";

const Experience = dynamic(
  () => import("@/components/Experience").then((mod) => mod.Experience),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-black">
      <Experience />
      <HUD />
      <ProjectModal />
    </div>
  );
}
