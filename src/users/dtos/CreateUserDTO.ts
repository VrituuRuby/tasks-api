import { IsUUID, MinLength } from 'class-validator';

export class CreateUserDTO {
  @MinLength(3)
  username: string;

  @MinLength(8)
  password: string;
}
