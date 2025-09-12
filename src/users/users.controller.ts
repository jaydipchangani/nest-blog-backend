import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // apply globally to all routes
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('admin') // only admin can create users
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('admin') // only admin can fetch all users
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('admin') // only admin can fetch single user
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin') // only admin can update
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin') // only admin can delete
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/subscription')
  @Roles('admin') // only admin can change subscription
  async setSubscription(@Param('id') id: string, @Body() body: { subscription: boolean }) {
    return this.usersService.setSubscription(id, body.subscription);
  }
}
