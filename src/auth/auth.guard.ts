import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { verify } from 'jsonwebtoken';

interface IRequest {
  rawHeaders: string[];
}

const JWT_SECRET = process.env.JWT_SECRET;

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    this.validateAuth(request);
    return true;
  }

  validateAuth(request: IRequest) {
    const headers: string[] = request.rawHeaders;

    console.log(request);

    const bearer = headers.find((token) => token.includes('Bearer'));

    if (!bearer) throw new UnauthorizedException('Missing token');

    const [_, token] = bearer.split(' ');

    try {
      const decoded = verify(token, JWT_SECRET);
      console.log(decoded);

      return true;
    } catch (err) {
      throw new UnauthorizedException('Wrong token');
    }
  }
}
