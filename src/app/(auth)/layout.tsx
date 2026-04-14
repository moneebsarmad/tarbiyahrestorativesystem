export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-primary">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,106,79,0.14),transparent_32%),linear-gradient(135deg,rgba(183,149,11,0.08),transparent_45%)]" />
      <div className="absolute inset-y-0 left-0 hidden w-1/2 bg-scholarly-grid opacity-50 [background-size:24px_24px] lg:block" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
