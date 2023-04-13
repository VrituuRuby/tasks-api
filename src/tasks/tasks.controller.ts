import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateTaskDTO } from './dtos/CreateTaskDTO';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/users/user.decorator';
import { TasksService } from './tasks.service';
import { UpdateTaskDTO } from './dtos/UpdateTaskDTO';

/*
  [X] Deve ser possível criar uma nova task
  [X] Deve ser possível alterar o estado de isDone
  [X] Deve ser possível alterar o título da task
  [X] Deve ser possível deletar uma task
  [X] Deve ser possível ler uma task 
  [X] Deve ser possível ler todas as tasks do usuário
  [X] Deve ser possível realizar ações acima apenas com o usuário autenticado
*/

interface IUserPayload {
  sub: string;
}
@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private taskService: TasksService) {}

  @Post('create')
  async createTask(
    @User() user: IUserPayload,
    @Body() createTaskDTO: CreateTaskDTO,
  ) {
    return await this.taskService.createTask(user.sub, createTaskDTO);
  }

  @Put('toggleDone/:id')
  async toggleIsDone(@User() user: IUserPayload, @Param('id') task_id: string) {
    return await this.taskService.toggleTaskIsDone(task_id, user.sub);
  }

  @Put('update/:id')
  async updateTaskTitle(
    @User() user: IUserPayload,
    @Param('id') task_id: string,
    @Body() updateTaskDTO: UpdateTaskDTO,
  ) {
    return await this.taskService.updateTaskTitle(
      task_id,
      user.sub,
      updateTaskDTO,
    );
  }

  @Delete('delete/:id')
  async deleteTask(@Param('id') task_id, @User() user: IUserPayload) {
    return this.taskService.deleteTask(task_id, user.sub);
  }

  @Get(':id')
  async getTask(@Param('id') task_id, @User() user: IUserPayload) {
    return this.taskService.getTaskByID(task_id, user.sub);
  }

  @Get()
  async getAllTasks(@User() user: IUserPayload) {
    return this.taskService.getAllTasks(user.sub);
  }
}
