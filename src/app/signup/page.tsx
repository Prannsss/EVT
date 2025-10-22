
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';

export default function SignupPage() {
  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 h-full">
        <div className="mx-auto grid w-[400px] gap-6">
          <div className="grid gap-2">
            <h1 className="text-3xl font-bold">Sign Up</h1>
            <p className="text-balance text-muted-foreground">
              Enter your information to create an account
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input id="first-name" placeholder="Max" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input id="last-name" placeholder="Robinson" required />
              </div>
            </div>
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
              <Input id="password" type="password" />
            </div>
            <div className="flex items-start space-x-3">
              <Checkbox id="terms" required />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  By creating an account you agree to our{' '}
                  <Link
                    href="#"
                    className="underline"
                  >
                    Terms and Conditions
                  </Link>{' '}
                  and our{' '}
                  <Link
                    href="#"
                    className="underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </div>
      </div>
       <div className="hidden bg-muted lg:flex items-center justify-center relative flex-col text-center grid-pattern">
         <Link href="/" className="absolute top-8 left-8 text-lg font-medium">
          Elimar Spring Garden
        </Link>
        <div className="text-4xl font-bold font-headline tracking-tight">
          A New Chapter Begins
        </div>
        <p className="mt-2 text-lg text-muted-foreground">
          Create your account and unlock a world of tranquility.
        </p>
        <div className="absolute bottom-8 text-sm text-muted-foreground">
           &copy; {new Date().getFullYear()} Elimar Spring Garden. All rights reserved.
        </div>
      </div>
    </div>
  );
}
