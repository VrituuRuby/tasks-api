import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

const mockTasks = [
  {
    id: 'existing_task_id',
    title: 'task-1',
    user_id: 'existing_user_id',
    isDone: false,
    createdAt: new Date(),
    updatedAt: null,
  },
  {
    id: 'existing_task_id_1',
    title: 'task-2',
    user_id: 'existing_user_id',
    isDone: false,
    createdAt: new Date(),
    updatedAt: null,
  },
  {
    id: 'existing_task_id_2',
    title: 'task-3',
    user_id: 'existing_user_id',
    isDone: false,
    createdAt: new Date(),
    updatedAt: null,
  },
];

const mockPrisma = {
  task: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
  },
};

describe('TasksService', () => {
  let taskService: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    taskService = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(taskService).toBeDefined();
  });

  it('Should be able to create a new task', async () => {
    mockPrisma.task.create = jest.fn().mockReturnValue(mockTasks[0]);

    const task = await taskService.createTask('existing_user_id', {
      title: 'task',
    });

    expect(task).toHaveProperty('id');
  });

  it('Should be able to get a task by its id if is the same user_id', async () => {
    mockPrisma.task.findFirst = jest.fn().mockReturnValueOnce(mockTasks[0]);
    const task = await taskService.getTaskByID('task_id', 'existing_user_id');
    expect(task).toHaveProperty('id');
  });

  it('Should not be able to get a nonexisting task', async () => {
    mockPrisma.task.findFirst = jest.fn().mockReturnValue(null);
    expect(
      taskService.getTaskByID('nonexistent_task_id', 'any_user_id'),
    ).rejects.toThrow(NotFoundException);
  });

  it('Should not be able to get a task from different user ID', () => {
    mockPrisma.task.findFirst = jest.fn().mockReturnValue(mockTasks[0]);
    expect(
      taskService.getTaskByID('existing_task_id', 'not_authorized_user'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("Should be able to toggle a task's isDone status", async () => {
    mockPrisma.task.findFirst = jest.fn().mockReturnValue(mockTasks[0]);
    mockPrisma.task.update = jest
      .fn()
      .mockReturnValue({ ...mockTasks[0], isDone: !mockTasks[0].isDone });
    const task = await taskService.toggleTaskIsDone(
      'existing_task_id',
      'existing_user_id',
    );

    expect(task.isDone).toBe(true);
  });

  it('Should be able to get  all the tasks from an user', async () => {
    mockPrisma.task.findMany = jest.fn().mockReturnValue(mockTasks);

    const tasks = await taskService.getAllTasks('existing_user_id');

    expect(tasks).toHaveLength(3);
  });

  it("Should be able to delete a task by it's id", async () => {
    mockPrisma.task.findFirst = jest.fn().mockReturnValue(mockTasks[0]);
    mockPrisma.task.delete = jest.fn().mockReturnValue(mockTasks[0]);

    const task = await taskService.deleteTask(
      'existing_task_id',
      'existing_user_id',
    );
    expect(task).toHaveProperty('id');
  });

  it("Should be able to update a task's title", async () => {
    mockPrisma.task.findFirst = jest.fn().mockReturnValue(mockTasks[0]);
    mockPrisma.task.update = jest.fn().mockReturnValue({
      ...mockTasks[0],
      title: 'changed title',
      updatedAt: new Date(),
    });

    const task = await taskService.updateTaskTitle(
      'existing_task_id',
      'existing_user_id',
      { title: 'changed title' },
    );

    expect(task.title).toBe('changed title');
    expect(task.updatedAt).toBeDefined();
  });
});
