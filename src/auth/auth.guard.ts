import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable, pairwise } from 'rxjs';
import { AuthService } from './auth.service';
import { verify } from 'jsonwebtoken';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

interface IRequest {
  rawHeaders: string[];
}

const JWT_SECRET = process.env.JWT_SECRET;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromRequestHeaders(request);

    if (!token) throw new UnauthorizedException('Missing token');

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      request['user'] = payload;
      console.log(payload);
    } catch (err) {
      throw new UnauthorizedException('Wrong or expired token');
    }
    return true;
  }

  private extractTokenFromRequestHeaders(request: Request) {
    const bearerToken = request.rawHeaders.find((header) =>
      header.includes('Bearer'),
    );

    const [_, token] = bearerToken.split(' ');

    return token;
  }
}
