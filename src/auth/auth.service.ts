import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { PrismaService } from 'src/prisma.service';

interface IAuth {
  username: string;
  password: string;
}

const JWT_KEY = process.env.JWT_SECRET;

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}
  async signIn({ username, password }: IAuth) {
    const user = await this.prismaService.user.findFirst({
      where: { username },
    });

    if (!user) throw new UnauthorizedException('Wrong username or password');

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch)
      throw new UnauthorizedException('Wrong username or password');

    const token = sign({}, JWT_KEY, {
      subject: user.id,
      expiresIn: '1d',
    });

    return { token };
  }
}
