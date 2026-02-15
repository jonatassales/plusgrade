import { BadRequestException, PipeTransform } from '@nestjs/common'
import { z } from 'zod'

import { type LoginRequestDto } from '@interface/dto/login-request.dto'

const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1)
  })
  .strict()

export class LoginBodyPipe implements PipeTransform<unknown, LoginRequestDto> {
  transform(value: unknown): LoginRequestDto {
    const parsed = loginSchema.safeParse(value)

    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues[0]?.message ?? 'Invalid body'
      )
    }

    return parsed.data
  }
}
