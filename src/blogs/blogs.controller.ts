import { Controller, Get, Post, Body, Param, Patch, Delete, Req, UseGuards, UploadedFile, UseInterceptors ,Res, Query} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../common/enums/roles.enum';
import type { Response } from 'express';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  // Public / User
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Req() req,
    @Query('search') search?: string,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.blogsService.findAllForUser(
      req.user,
      search,
      sortBy,
      sortOrder,
      page,
      limit,
    );
  }

  @Get(':id')
   @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Req() req) {
    return this.blogsService.findOneForUser(id, req.user);
  }

  // Admin-only CRUD
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
async create(
  @UploadedFile() file: Express.Multer.File,
  @Body() body: any,
  @Req() req
) {
  console.log("Raw body from multer:", body);
  return this.blogsService.create(body, req.user.userId, file);
}


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image')) 
async update(
  @Param('id') id: string,
  @Body() dto: UpdateBlogDto,
  @UploadedFile() file: Express.Multer.File,
) {
  return this.blogsService.update(id, dto, file);
}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.blogsService.remove(id);
  }

  @Get(':id/image')
async getImage(@Param('id') id: string, @Res() res: Response) {
  const blog = await this.blogsService.findById(id);

  if (!blog || !blog.image) {
    return res.status(404).send('Image not found');
  }

  res.setHeader('Content-Type', blog.imageType || 'image/png');
  res.send(blog.image);
}

}
