import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema({
  collection: 'users',
  timestamps: true
})
export class User {
  @Prop({ required: true, unique: true })
  email!: string

  @Prop({ required: true })
  passwordHash!: string

  @Prop({ type: String, default: null })
  refreshTokenHash!: string | null

  @Prop({ type: Date })
  createdAt!: Date

  @Prop({ type: Date })
  updatedAt!: Date
}

export type UserDocument = HydratedDocument<User>

export const UserSchemaDefinition = SchemaFactory.createForClass(User)
