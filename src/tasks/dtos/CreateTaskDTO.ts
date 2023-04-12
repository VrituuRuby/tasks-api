import { MinLength } from 'class-validator';

export class CreateTaskDTO {
  @MinLength(3)
  title: string;

  isDone: boolean;

  createAt: Date;

  updatedAt?: Date;

  user_id: string;
}
