import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

import githubIcon from '@/assets/icons/github.svg';
import Image from 'next/image';

export default function SignUpPage() {
  return (
    <form className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Name" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" placeholder="E-mail" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Password" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="Confirm Password"
        />
      </div>

      <Button type="submit" className="w-full">
        Create account
      </Button>

      <Button
        variant="link"
        type="button"
        className="w-full"
        render={<Link href="/auth/sign-in">Already registered? Sign in</Link>}
      />
  
      <Separator />

      <Button type="button" variant="outline" className="w-full">
        <Image
          src={githubIcon}
          alt="Github"
          className="mr-2 size-4 dark:invert"
        />
        Sign Up with Github
      </Button>
    </form>
  );
}
