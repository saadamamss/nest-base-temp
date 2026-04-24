import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { Role } from '../generated/prisma/client';
import {
  paginate,
  PaginatedResult,
  getPrismaSkipTake,
} from '../common/helpers/pagination.helper';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dtos/update-user.dto';

type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUsers(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<PublicUser>> {
    const { skip, take } = getPrismaSkipTake({ page, limit });

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return paginate(users, total, { page, limit });
  }

  async createUser(user: CreateUserDto): Promise<PublicUser | null> {
    const hashed = await bcrypt.hash(user.password, 12);
    const u = await this.prisma.user.create({
      data: { ...user, password: hashed },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = u;
    return result;
  }

  async getUserById(id: string): Promise<PublicUser | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<PublicUser> {
    const data = { ...dto };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }
    const updated = await this.prisma.user.update({
      where: { id },
      data: data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return updated;
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    await this.prisma.user.delete({ where: { id } });
    return { message: `User ${id} deleted successfully` };
  }
}
