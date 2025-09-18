import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Buffer } from 'buffer';


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

async create(dto: any, authorId: string, file?: Express.Multer.File) {
  const created = new this.blogModel({
    ...dto,
    authorId,
    image: file ? file.buffer : undefined,
    imageType: file ? file.mimetype : undefined,
  });
  return created.save();
}

  async findAllForUser(user?: Partial<UserDocument>) {
  const blogs = await this.blogModel.find().sort({ createdAt: -1 }).lean();

  return blogs.map(blog => {
    return {
      ...blog,
      imageBase64: blog.image
        ? `data:${blog.imageType};base64,${blog.image.toString('base64')}`
        : null,
    };
  });
}



async findOneForUser(id: string, user?: Partial<UserDocument>) {
  const blog = await this.blogModel.findById(id).exec();
  if (!blog) throw new NotFoundException('Blog not found');

  const formatBlog = (blogDoc: BlogDocument) => {
    return {
      ...blogDoc.toObject(),
      imageBase64: blogDoc.image
        ? `data:${blogDoc.imageType};base64,${blogDoc.image.toString('base64')}`
        : null,
    };
  };

  if (!blog.paid) return formatBlog(blog);

  if (user && user.subscription) return formatBlog(blog);

  const firstThreePaidIds = await this.getFirstThreePaidIds();

  const blogIdStr = (blog._id as unknown as Types.ObjectId).toString();

  if (firstThreePaidIds.includes(blogIdStr)) {
    return formatBlog(blog);
  }

  throw new ForbiddenException('This blog is only for subscribers');
}


  async update(id: string, dto: UpdateBlogDto, file?: Express.Multer.File): Promise<Blog> {
  const updateData: any = { ...dto };

  if (file) {
    updateData.image = Buffer.from(file.buffer); // convert to Node Buffer
    updateData.imageType = file.mimetype;
  }

  const updated = await this.blogModel.findByIdAndUpdate(id, updateData, { new: true });

  if (!updated) throw new NotFoundException('Blog not found');

  return updated;
}

  async remove(id: string): Promise<void> {
    const res = await this.blogModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Blog not found');
  }

  async findById(id: string) {
  const blog = await this.blogModel.findById(id).lean();
  if (!blog) throw new NotFoundException('Blog not found');

  return {
    ...blog,
    imageBase64: blog.image
      ? `data:${blog.imageType};base64,${blog.image.toString('base64')}`
      : null,
  };
}


}


