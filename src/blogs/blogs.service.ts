import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  private async getFirstThreePaidIds(): Promise<string[]> {
    const paid = await this.blogModel
      .find({ paid: true })
      .sort({ createdAt: 1 }) 
      .limit(3)
      .select('_id')
      .lean();
    return paid.map((p) => p._id.toString());
  }

  async create(dto: CreateBlogDto, authorId?: string): Promise<Blog> {
    const created = new this.blogModel({ ...dto, authorId });
    return created.save();
  }

  async findAllForUser(user?: Partial<UserDocument>) {
  if (user && user.subscription) {
    // subscribed users: return all blogs
    return this.blogModel.find().sort({ createdAt: -1 });
  } else {
    // non-subscribed or anonymous: return free blogs + first 3 paid
    const firstThreePaidIds = await this.getFirstThreePaidIds();
    return this.blogModel
      .find({
        $or: [
          { paid: false },
          { _id: { $in: firstThreePaidIds.map((id) => new Types.ObjectId(id)) } },
        ],
      })
      .sort({ createdAt: -1 });
  }
}


  async findOneForUser(id: string, user?: Partial<UserDocument>) {
    const blog = await this.blogModel.findById(id);
    if (!blog) throw new NotFoundException('Blog not found');

    if (!blog.paid) return blog;

    if (user && user.subscription) return blog;

    const firstThreePaidIds = await this.getFirstThreePaidIds();
    if (firstThreePaidIds.includes(blog.id)) {
  return blog;
}


    throw new ForbiddenException('This blog is only for subscribers');
  }

  async update(id: string, dto: UpdateBlogDto): Promise<Blog> {
    const updated = await this.blogModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new NotFoundException('Blog not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const res = await this.blogModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Blog not found');
  }
}
