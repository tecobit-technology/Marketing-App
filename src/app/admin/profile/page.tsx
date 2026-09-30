import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import ProfilePageClient from "./ProfilePageClient";

export default async function AdminProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "patient") {
    redirect("/portal");
  }

  if (session.user.role === "platform_admin") {
    redirect("/platform-admin");
  }

  return <ProfilePageClient session={session} />;
}
