import Link from 'next/link';
import { RecaptchaProvider } from '@/components/auth/recaptcha-provider';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Simple Header */}
      <header className="border-b">
        <div className="container-custom flex h-16 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <span className="text-lg font-bold text-white">J</span>
            </div>
            <span className="font-semibold">JuniorHub</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-muted/30 flex flex-1 items-center justify-center px-4 py-12">
        <RecaptchaProvider>{children}</RecaptchaProvider>
      </main>

      {/* Simple Footer */}
      <footer className="border-t py-6">
        <div className="container-custom text-muted-foreground text-center text-sm">
          &copy; {new Date().getFullYear()} JuniorHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
