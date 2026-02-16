import Link from 'next/link'

import { Button } from '@/infra/shadcn/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/infra/shadcn/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from '@/infra/shadcn/components/ui/field'
import { Input } from '@/infra/shadcn/components/ui/input'
import { cn } from '@/infra/shadcn/lib/utils'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const titleId = 'login-form-title'
  const descriptionId = 'login-form-description'

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle id={titleId}>Login to your account</CardTitle>
          <CardDescription id={descriptionId}>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form aria-labelledby={titleId} aria-describedby={descriptionId}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john.doe@plusgrade.com"
                  autoComplete="email"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </Field>
              <Field>
                <Button type="submit">Login</Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
