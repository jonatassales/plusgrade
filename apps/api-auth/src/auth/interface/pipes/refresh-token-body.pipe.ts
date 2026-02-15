import { BadRequestException, PipeTransform } from '@nestjs/common'
import { z } from 'zod'

import { type RefreshTokenRequestDto } from '@interface/dto/refresh-token-request.dto'

const refreshTokenSchema = z
  .object({
    refreshToken: z.string().min(1)
  })
  .strict()

export class RefreshTokenBodyPipe
  implements PipeTransform<unknown, RefreshTokenRequestDto>
{
  transform(value: unknown): RefreshTokenRequestDto {
    const parsed = refreshTokenSchema.safeParse(value)

    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues[0]?.message ?? 'Invalid body'
      )
    }

    return parsed.data
  }
}
