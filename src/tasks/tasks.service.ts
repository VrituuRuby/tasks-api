import {
  Body,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { CreateTaskDTO } from './dtos/CreateTaskDTO';
import { PrismaService } from '../prisma.service';
import { UpdateTaskDTO } from './dtos/UpdateTaskDTO';

@Injectable()
export class TasksService {
  constructor(private readonly prismaService: PrismaService) {}
  async createTask(
    userId: string,
    @Body(new ValidationPipe()) createTaskDTO: CreateTaskDTO,
  ) {
    const task = await this.prismaService.task.create({
      data: { user_id: userId, ...createTaskDTO },
    });
    return task;
  }

  async getTaskByID(task_id: string, user_id: string) {
    const task = await this.prismaService.task.findFirst({
      where: { id: task_id },
    });

    if (!task) throw new NotFoundException('Task not found');

    if (task.user_id !== user_id)
      throw new UnauthorizedException('User is not authorized');

    return task;
  }

  async toggleTaskIsDone(task_id: string, user_id: string) {
    const task = await this.getTaskByID(task_id, user_id);

    const updatedTask = await this.prismaService.task.update({
      where: { id: task_id },
      data: { isDone: !task.isDone, updatedAt: new Date() },
    });

    return updatedTask;
  }

  async getAllTasks(user_id: string) {
    const tasks = await this.prismaService.task.findMany({
      where: { user_id },
    });

    return tasks;
  }

  async deleteTask(task_id: string, user_id: string) {
    await this.getTaskByID(task_id, user_id);

    const deletedTask = await this.prismaService.task.delete({
      where: { id: task_id },
    });

    return deletedTask;
  }

  async updateTaskTitle(
    task_id: string,
    user_id: string,
    updateTaskDTO: UpdateTaskDTO,
  ) {
    const task = this.getTaskByID(task_id, user_id);

    const updatedTask = await this.prismaService.task.update({
      where: { id: task_id },
      data: updateTaskDTO,
    });

    return updatedTask;
  }
}
