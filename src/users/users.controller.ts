import { Controller, Get, Param, UseGuards, Post, Body, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {
  }

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.usersService.findOne(id);
  }

  @Post()
  async createUser(@Body() newUser) {
    return await this.usersService.createUser(newUser);
  }

  @Put(':id')
  async updateUser(@Body() newData, @Param('id') id) {
    return await this.usersService.updateUser(newData, id);
  }

  @Delete(':id')
  async disableUser(@Param('id') id) {
    return await this.usersService.disableUser(id);
  }
}
