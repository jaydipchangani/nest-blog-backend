import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BlogDocument = Blog & Document;

@Schema({ timestamps: true })
export class Blog {
  @Prop({ required: true })
  title: string;

  @Prop()
  excerpt?: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  paid: boolean; // true if only for subscribed users

  @Prop({ type: Types.ObjectId, ref: 'User' })
  authorId?: Types.ObjectId;

  @Prop({ default: 0 })
  views?: number;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
