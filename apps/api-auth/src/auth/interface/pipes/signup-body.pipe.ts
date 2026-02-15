import { BadRequestException, PipeTransform } from '@nestjs/common'
import { z } from 'zod'

import { type SignupRequestDto } from '@interface/dto/signup-request.dto'

const signupSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8)
  })
  .strict()

export class SignupBodyPipe
  implements PipeTransform<unknown, SignupRequestDto>
{
  transform(value: unknown): SignupRequestDto {
    const parsed = signupSchema.safeParse(value)

    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues[0]?.message ?? 'Invalid body'
      )
    }

    return parsed.data
  }
}
