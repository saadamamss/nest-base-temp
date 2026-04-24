import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Role, Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateUserDto } from './dtos/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiResponse({ status: 200, description: 'Paginated user list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  async getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.usersService.getUsers(page, limit);
  }

  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.getUserById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async createUser(@Body() user: CreateUserDto) {
    return await this.usersService.createUser(user);
  }

  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return await this.usersService.updateUser(id, dto);
  }

  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async deleteUser(@Param('id') id: string) {
    return await this.usersService.deleteUser(id);
  }
}
