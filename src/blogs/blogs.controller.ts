import { Controller, Get, Post, Body, Param, Patch, Delete, Req, UseGuards, UploadedFile, UseInterceptors ,BadRequestException,UsePipes, ValidationPipe} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../common/enums/roles.enum';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  // Public / User
  @Get()
   @UseGuards(JwtAuthGuard)
  async findAll(@Req() req) {
    //console.log('Decoded req.user:', req.user);
    return this.blogsService.findAllForUser(req.user);
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
}
