'use client';

import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/auth-store';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Zap, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

function VerifyContent() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  const { setUser } = useAuthStore();

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setStatus('error');
        setError(t('invalidLink'));
        return;
      }

      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Verification failed');
        }

        // Set the user in the global state
        if (data.user) {
          setUser(data.user);
        }

        setStatus('success');

        // Redirect to invoices after a short delay
        setTimeout(() => {
          router.push('/invoices');
        }, 2000);
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Verification failed');
        console.error('Verification error:', err);
      }
    }

    verifyToken();
  }, [token, router, setUser, t]);

  return (
    <div className="flex min-h-[calc(100vh-117px)] flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex items-center justify-center">
        <div className="bg-primary/10 p-3 rounded-full">
          <Zap className="h-8 w-8 text-primary" />
        </div>
      </div>

      <Card className="mx-auto w-full max-w-md bg-card/90 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {status === 'loading' && t('verify')}
            {status === 'success' && t('success')}
            {status === 'error' && t('error')}
          </CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' && 'Please wait while we verify your credentials'}
            {status === 'success' && 'Your sign-in was successful'}
            {status === 'error' && "We couldn't verify your sign-in link"}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center py-6">
          {status === 'loading' && (
            <div className="flex items-center justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-primary/70" />
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Redirecting to your dashboard...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="rounded-full bg-red-100 p-4">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
              <p className="text-sm text-destructive text-center font-medium">{error}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          {status === 'error' && (
            <Button onClick={() => router.push('/signin')} className="min-w-[200px]">
              {t('tryAgain')}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-117px)] flex-col items-center justify-center px-4 py-12">
          <Card className="mx-auto w-full max-w-md bg-card/90 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Verifying...</CardTitle>
              <CardDescription className="text-center">
                Please wait while we process your sign-in
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
