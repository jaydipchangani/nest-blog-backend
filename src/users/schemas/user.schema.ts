import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../common/enums/roles.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string; // hashed

  @Prop({ default: Role.USER, enum: Object.values(Role) })
  role: Role;

  @Prop({ default: false })
  subscription: boolean; // true if user has paid

  @Prop()
  name?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
