import NextAuth from "next-auth";
import { platformAdminAuthOptions } from "@/lib/platform-admin-auth";

const handler = NextAuth(platformAdminAuthOptions);

export { handler as GET, handler as POST };