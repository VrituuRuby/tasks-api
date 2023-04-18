import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDTO } from './dtos/CreateUserDTO';
import { UpdateUserDTO } from './dtos/UpdateUserDTO';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async getOneUserByID(id: string) {
    const userExists = await this.prismaService.user.findFirst({
      where: { id },
      select: {
        id: true,
        username: true,
        password: false,
        tasks: true,
      },
    });

    if (!userExists) throw new NotFoundException('User Not Found');
    return userExists;
  }

  async createUser(createUserDTO: CreateUserDTO) {
    const userExists = await this.prismaService.user.findFirst({
      where: { username: createUserDTO.username },
    });

    if (userExists) throw new BadRequestException('Username is already in use');

    const user = await this.prismaService.user.create({
      data: createUserDTO,
      select: { id: true, tasks: true, username: true, password: false },
    });

    return user;
  }

  async updateUser(id: string, updateUserDTO: UpdateUserDTO) {
    this.getOneUserByID(id);
    const user = await this.prismaService.user.update({
      where: { id },
      data: updateUserDTO,
      select: {
        id: true,
        username: true,
        password: false,
        tasks: true,
      },
    });

    return user;
  }

  async deleteUser(id: string) {
    this.getOneUserByID(id);
    const user = await this.prismaService.user.delete({ where: { id } });

    return user;
  }

  async getAllUsers() {
    const users = await this.prismaService.user.findMany({
      select: {
        id: true,
        tasks: false,
        username: true,
      },
    });
    return users;
  }

  async getOneUserByUsername(username: string) {
    const user = await this.prismaService.user.findFirst({
      where: { username },
    });

    if (!user) throw new NotFoundException('User Not Found');

    return user;
  }
}
