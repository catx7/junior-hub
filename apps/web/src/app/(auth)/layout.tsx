import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Simple Header */}
      <header className="border-b">
        <div className="container-custom flex h-16 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-white">L</span>
            </div>
            <span className="font-semibold">LocalServices</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center bg-muted/30 px-4 py-12">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="border-t py-6">
        <div className="container-custom text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} LocalServices. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
