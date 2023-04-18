import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

const mockUsers = [
  {
    id: 'd44fc585-08d3-4c1f-be45-d14e10c57d81',
    username: 'existing_user',
    tasks: [],
  },
  {
    id: 'd44fc585-08d3-4c1f-be45-d14e10c57d82',
    username: 'test.user2',
    tasks: [
      {
        id: '4eafb4b3-c490-4bb3-93d4-0585d9e332c0',
        title: 'task2',
        isDone: false,
        createdAt: new Date(),
        updatedAt: null,
        user_id: 'd44fc585-08d3-4c1f-be45-d14e10c57d82',
      },
    ],
  },
  {
    id: 'd44fc585-08d3-4c1f-be45-d14e10c57d83',
    username: 'test.user3',
    tasks: [
      {
        id: '4eafb4b3-c490-4bb3-93d4-0585d9e332c1',
        title: 'task3',
        isDone: false,
        createdAt: new Date(),
        updatedAt: null,
        user_id: 'd44fc585-08d3-4c1f-be45-d14e10c57d83',
      },
    ],
  },
];

let mockPrisma = {
  user: {
    findFirst: jest.fn().mockReturnValue(mockUsers[0]),
    findMany: jest.fn().mockReturnValue(mockUsers),
    create: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UsersService', () => {
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(async () => {
    mockPrisma = {
      user: {
        findFirst: jest.fn().mockReturnValue(mockUsers[0]),
        findMany: jest.fn().mockReturnValue(mockUsers),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };
    jest.resetAllMocks();
  });

  it('Should be able to get all users', async () => {
    const result = await usersService.getAllUsers();
    expect(result).toBe(mockUsers);
  });

  it('Should NOT be able to get a nonexistent user', async () => {
    mockPrisma.user.findFirst = jest.fn().mockResolvedValueOnce(null);
    expect(usersService.getOneUserByID('nonexistent-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('Should not be able to create a new user with an existing username', async () => {
    mockPrisma.user.findFirst = jest.fn().mockReturnValueOnce(mockUsers[0]);
    mockPrisma.user.create = jest
      .fn()
      .mockRejectedValue(new BadRequestException());
    // expect(mockPrisma.user.findFirst).toHaveBeenCalledTimes(1);
    expect(
      async () =>
        await usersService.createUser({
          password: 'password-hash',
          username: 'existing_user',
        }),
    ).rejects.toThrow(BadRequestException);
  });

  it('Should be able to create a new user with nonexistent username', async () => {
    const userData = {
      password: 'password-hash',
      username: 'nonexisting_user',
    };
    mockPrisma.user.create = jest
      .fn()
      .mockReturnValueOnce({ ...userData, id: randomUUID(), tasks: [] });
    const user = await usersService.createUser(userData);
    expect(user).toHaveProperty('id');
  });

  it('Should be able to get an user by its id', async () => {
    mockPrisma.user.findFirst = jest.fn().mockReturnValueOnce(mockUsers[0]);
    const user = await usersService.getOneUserByID(
      'd44fc585-08d3-4c1f-be45-d14e10c57d81',
    );
    expect(user.id).toBe('d44fc585-08d3-4c1f-be45-d14e10c57d81');
  });

  it('Should be able to delete one user by its ID', async () => {
    mockPrisma.user.findFirst = jest.fn().mockReturnValueOnce(mockUsers[0]);
    mockPrisma.user.delete = jest.fn().mockReturnValueOnce(mockUsers[0]);

    const user = await usersService.deleteUser(
      'd44fc585-08d3-4c1f-be45-d14e10c57d81',
    );

    expect(user).toHaveProperty('id');
  });
});
