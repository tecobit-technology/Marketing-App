import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin Panel | mysaas",
  description: "Admin dashboard and practice management.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-page font-sans text-text-body">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
