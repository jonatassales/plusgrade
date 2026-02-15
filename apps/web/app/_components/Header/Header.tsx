import { Logo, UserDropdownMenu } from '@/app/_components'

export function Header() {
  return (
    <div className="flex w-full h-14 items-center justify-between screen-padding border-b-2 border-gray-300 sticky top-0 bg-card z-10">
      <Logo />
      <UserDropdownMenu />
    </div>
  )
}
