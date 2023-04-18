import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma.service';
import { hash } from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
  },
};

const JWT_SECRET_TEST = 'test';

async function createAuthenticatedUser() {
  const hashedPassword = await hash('password', 8);
  return {
    username: 'authenticated_user',
    password: hashedPassword,
  };
}

let authenticated_user;

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  beforeAll(async () => {
    authenticated_user = await createAuthenticatedUser();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('Should return token if credentials are valid', async () => {
    const token = 'mock-token';
    mockPrisma.user.findFirst = jest.fn().mockResolvedValue(authenticated_user);

    (jwtService.signAsync as jest.Mock).mockResolvedValue(token);

    const result = await authService.signIn({
      username: 'authenticated_user',
      password: 'password',
    });

    expect(result.token).toBe('mock-token');
  });

  it('Should be thrown an UnauthorizedException if credentials are invalid', async () => {
    const token = 'mock-token';
    mockPrisma.user.findFirst = jest.fn().mockResolvedValue(authenticated_user);

    (jwtService.signAsync as jest.Mock).mockResolvedValue(token);

    expect(
      authService.signIn({
        username: 'authenticated_use',
        password: 'passwod',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
