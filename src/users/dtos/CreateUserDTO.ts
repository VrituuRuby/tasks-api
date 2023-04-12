import { IsUUID, Matches, MinLength } from 'class-validator';

export class CreateUserDTO {
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9_.-]{3,}$/, {
    message:
      'Username is invalid. Please enter a username that contains only letters, numbers, dots, underscores or hyphens, and is at least 3 characters long.',
  })
  username: string;

  @MinLength(8)
  password: string;
}
