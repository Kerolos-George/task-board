import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<Pick<UsersService, 'create' | 'validatePassword'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;

  beforeEach(() => {
    usersService = {
      create: jest.fn(),
      validatePassword: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('test-token'),
    };
    authService = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
    );
  });

  it('registers a user and returns an access token', async () => {
    const dto: RegisterDto = {
      name: 'Jane',
      email: 'jane@example.com',
      password: 'password123',
    };
    usersService.create.mockResolvedValue({
      id: 'u1',
      email: dto.email,
      name: dto.name,
      role: Role.MEMBER,
      createdAt: new Date(),
    });

    const result = await authService.register(dto);

    expect(usersService.create).toHaveBeenCalledWith({
      email: dto.email,
      password: dto.password,
      name: dto.name,
    });
    expect(result.accessToken).toBe('test-token');
    expect(result.user.email).toBe(dto.email);
  });

  it('logs in with valid credentials', async () => {
    usersService.validatePassword.mockResolvedValue({
      id: 'u1',
      email: 'jane@example.com',
      name: 'Jane',
      role: Role.MEMBER,
      passwordHash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await authService.login({
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(result.accessToken).toBe('test-token');
    expect(result.user.id).toBe('u1');
  });

  it('rejects invalid login credentials', async () => {
    usersService.validatePassword.mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'jane@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('surfaces conflict when email already exists', async () => {
    usersService.create.mockRejectedValue(
      new ConflictException('Email already registered'),
    );

    await expect(
      authService.register({
        name: 'Jane',
        email: 'jane@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
