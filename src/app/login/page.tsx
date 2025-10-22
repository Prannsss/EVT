
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export default function LoginPage() {
  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 h-full">
        <div className="mx-auto grid w-[400px] gap-6">
          <div className="grid gap-2">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:flex items-center justify-center relative flex-col text-center grid-pattern">
         <Link href="/" className="absolute top-8 left-8 text-lg font-medium">
          Elimar Spring Garden
        </Link>
        <div className="text-4xl font-bold font-headline tracking-tight">
          Welcome Back
        </div>
        <p className="mt-2 text-lg text-muted-foreground">
          Your serene escape is just a login away.
        </p>
        <div className="absolute bottom-8 text-sm text-muted-foreground">
           &copy; {new Date().getFullYear()} Elimar Spring Garden. All rights reserved.
        </div>
      </div>
    </div>
  );
}
