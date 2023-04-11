import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDTO } from './dtos/CreateUserDTO';
import { UsersService } from './users.service';
import { hash } from 'bcrypt';
import { UpdateUserDTO } from './dtos/UpdateUserDTO';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('create')
  async createUser(@Body(new ValidationPipe()) createUserDTO: CreateUserDTO) {
    return await this.userService.createUser({
      ...createUserDTO,
      password: await hash(createUserDTO.password, 8),
    });
  }

  @Put('update/:id')
  async updateUser(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateUserDTO: UpdateUserDTO,
  ) {
    return this.userService.updateUser(id, {
      ...updateUserDTO,
      password: await hash(updateUserDTO.password, 8),
    });
  }

  @Get()
  async getUsers() {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return await this.userService.getOneUserByID(id);
  }
}
