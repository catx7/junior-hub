'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      alert('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement Firebase password reset
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch (error) {
      alert('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-muted/50 flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-foreground mb-2 text-2xl font-bold">Check Your Email</h1>
          <p className="text-muted-foreground mb-6">
            We have sent a password reset link to <strong>{email}</strong>. Please check your inbox
            and follow the instructions.
          </p>
          <p className="text-muted-foreground mb-6 text-sm">
            Did not receive the email? Check your spam folder or{' '}
            <button onClick={() => setIsSubmitted(false)} className="text-primary hover:underline">
              try again
            </button>
          </p>
          <Link href="/login">
            <Button className="w-full">Back to Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-muted/50 flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <Link
          href="/login"
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center text-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Link>

        <h1 className="text-foreground mb-2 text-2xl font-bold">Forgot Password?</h1>
        <p className="text-muted-foreground mb-6">
          No worries! Enter your email address and we will send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="relative mt-2">
              <Mail className="text-muted-foreground absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="pl-10"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Remember your password?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
