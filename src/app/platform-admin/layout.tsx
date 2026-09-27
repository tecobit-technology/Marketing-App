import PlatformAdminProviders from "./PlatformAdminProviders";

export default function PlatformAdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlatformAdminProviders>
      {children}
    </PlatformAdminProviders>
  );
}