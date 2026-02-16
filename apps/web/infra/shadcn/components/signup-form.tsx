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

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const titleId = 'signup-form-title'
  const descriptionId = 'signup-form-description'

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle id={titleId}>Create an account</CardTitle>
        <CardDescription id={descriptionId}>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form aria-labelledby={titleId} aria-describedby={descriptionId}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                required
              />
            </Field>
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
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
              />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
              />
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit">Create Account</Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <Link href="/login">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
