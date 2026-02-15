import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema({
  collection: 'refresh_tokens',
  timestamps: true
})
export class RefreshToken {
  @Prop({ required: true, index: true, unique: true })
  userId!: string

  @Prop({ required: true })
  tokenHash!: string

  @Prop({ required: true })
  expiresAt!: Date

  @Prop({ type: Date })
  createdAt!: Date

  @Prop({ type: Date })
  updatedAt!: Date
}

export type RefreshTokenDocument = HydratedDocument<RefreshToken>

export const RefreshTokenSchemaDefinition =
  SchemaFactory.createForClass(RefreshToken)
