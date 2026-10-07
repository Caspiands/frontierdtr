import { redirect } from "next/navigation";
import { ShowcaseApp } from "@/components/showcase/showcase-app";
import { getSession } from "@/lib/auth";
import { readOverrides } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function ShowcasePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const { texts } = await readOverrides();
  return <ShowcaseApp role={session.role} email={session.email} initialTexts={texts} />;
}
