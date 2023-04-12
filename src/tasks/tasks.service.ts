import { Body, Injectable, ValidationPipe } from '@nestjs/common';
import { CreateTaskDTO } from './dtos/CreateTaskDTO';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TasksService {
  constructor(private readonly prismaService: PrismaService) {}
  async createTask(@Body(new ValidationPipe()) createTaskDTO: CreateTaskDTO) {
    const task = await this.prismaService.task.create({ data: createTaskDTO });
    return task;
  }
}
