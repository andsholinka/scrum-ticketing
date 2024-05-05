import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('/api/users')
export class UserController {
  constructor(private readonly UserService: UserService) { }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.UserService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  async findAll(@Req() request): Promise<User[]> {
    const filter = request.query.filter as string;
    return await this.UserService.findAll(filter);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  async findOne(@Param('id') id: number): Promise<User> {
    return await this.UserService.findOne(id);
  }

  @Put()
  @UseGuards(AuthGuard())
  async update(@Req() request, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return await this.UserService.update(request.user.id, updateUserDto);
  }

  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    return await this.UserService.login(email, password);
  }
}
