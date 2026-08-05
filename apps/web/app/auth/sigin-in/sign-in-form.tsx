'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { signInWithEmailAndPassword } from './actions';
import githubIcon from '@/assets/icons/github.svg';
import Image from 'next/image';

export function SignInForm() {
  return (
    <form action={signInWithEmailAndPassword as any} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" placeholder="E-mail" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Password" />
        <Link
          href="/auth/forgot-password"
          className="text-xs font-medium text-foreground hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="w-full">
        Sign In with email
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
