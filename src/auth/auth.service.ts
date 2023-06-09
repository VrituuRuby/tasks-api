import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UsersService } from '../users/users.service';

interface IAuth {
  username: string;
  password: string;
}

const JWT_KEY = process.env.JWT_SECRET;

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}
  async signIn({ username, password }: IAuth) {
    const user = await this.userService.getOneUserByUsername(username);

    if (!user) throw new UnauthorizedException('Wrong username or password');

    const passwordMatches = await compare(password, user.password);

    if (!passwordMatches)
      throw new UnauthorizedException('Wrong username or password');

    const payload = { username: user.username, sub: user.id };

    return {
      token: await this.jwtService.signAsync(payload),
    };
  }
}
