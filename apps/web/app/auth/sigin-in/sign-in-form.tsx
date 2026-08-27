'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { signInWithEmailAndPassword } from './actions';
import githubIcon from '@/assets/icons/github.svg';
import Image from 'next/image';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFormState } from '@/hooks/use-form-state';
import { useRouter } from 'next/navigation';

export function SignInForm() {
  const router = useRouter();

  const [{ success, message, errors }, handleSubmit, isPending] = useFormState(
    signInWithEmailAndPassword,
    undefined,
    () => {
      router.push('/');
    }
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!success && message && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Sign in failed!</AlertTitle>
          <AlertDescription>
            <p>{message}</p>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-1">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" placeholder="E-mail" />

        {errors?.email && (
          <p className="text-xs text-destructive">{errors.email[0]}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Password" />
        {errors?.password && (
          <p className="text-xs text-destructive">{errors.password[0]}</p>
        )}
        <Link
          href="/auth/forgot-password"
          className="text-xs font-medium text-foreground hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="w-full">
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          'Sign In with email'
        )}
      </Button>

      <Separator />

      <Button type="button" variant="outline" className="w-full">
        <Image
          src={githubIcon}
          alt="Github"
          className="mr-2 size-4 dark:invert"
        />
        Sign In with Github
      </Button>
    </form>
  );
}
