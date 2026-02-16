import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/infra/shadcn/components/ui/avatar'

export function UserAvatar() {
  return (
    <Avatar>
      <AvatarImage src="/profile.webp" alt="User avatar" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  )
}
