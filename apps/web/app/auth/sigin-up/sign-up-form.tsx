import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

import githubIcon from '@/assets/icons/github.svg';
import Image from 'next/image';
import { useFormState } from '@/hooks/use-form-state';
import { useRouter } from 'next/dist/client/components/navigation';
import { signUpAction } from './actions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { signInWithGithub } from '../actions';

export function SignUpForm() {
  const router = useRouter();

  const [{ success, message, errors }, handleSubmit, isPending] = useFormState(
    signUpAction,
    undefined,
    () => {
      router.push('/auth/sign-in');
    }
  );

  return (
    <div className="space-y-4">
      <form className="space-y-4" onSubmit={handleSubmit}>
        {!success && message && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Sign up failed!</AlertTitle>
            <AlertDescription>
              <p>{message}</p>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Name" />
          {errors?.name && (
            <p className="text-xs text-destructive">{errors.name[0]}</p>
          )}
        </div>
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
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Confirm Password"
          />
          {errors?.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword[0]}
            </p>
          )}
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
      </form>
      <Separator />

      <form action={signInWithGithub}>
        <Button type="button" variant="outline" className="w-full">
          <Image
            src={githubIcon}
            alt="Github"
            className="mr-2 size-4 dark:invert"
          />
          Sign Up with Github
        </Button>
      </form>
    </div>
  );
}
