import { Controller, Get, Post, Body, Param, Patch, Delete, Req, UseGuards } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../common/enums/roles.enum';

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
  async create(@Body() dto: CreateBlogDto, @Req() req) {
    return this.blogsService.create(dto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.blogsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.blogsService.remove(id);
  }
}
