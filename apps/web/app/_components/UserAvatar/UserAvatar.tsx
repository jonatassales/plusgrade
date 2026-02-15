import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/infra/shadcn/components/ui/avatar'

export function UserAvatar() {
  return (
    <Avatar>
      <AvatarImage src="https://github.com/jonatassales.png" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  )
}
