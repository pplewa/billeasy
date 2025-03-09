'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Mail, ArrowRight, Check } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Link } from '@/i18n/routing';

function SignInContent() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Get the current locale from the URL
      const currentLocale = window.location.pathname.split('/')[1];

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-next-locale': currentLocale, // Add locale header
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setIsSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send login link');
      console.error('Sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
            {isSent ? t('checkEmail') : t('signIn')}
          </CardTitle>
          <CardDescription className="text-center">
            {isSent ? t('emailSent', { email }) : t('noAccountNeeded')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isSent ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
              <div className="rounded-full bg-green-100 p-3">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-center text-muted-foreground">
                {t('emailSentDescription')}
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {t('emailLabel')}
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('emailPlaceholder')}
                      required
                      disabled={isLoading}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                      {tCommon('loading')}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      {t('sendLink')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-0">
          {isSent ? (
            <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
              {t('returnToHome')}
            </Button>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              <p>
                {t('noAccountNeeded')}{' '}
                <Link href="/" className="text-primary hover:underline">
                  {t('tryItOut')}
                </Link>
              </p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-117px)] flex-col items-center justify-center px-4 py-12">
          <Card className="mx-auto w-full max-w-md bg-card/90 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-8">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
