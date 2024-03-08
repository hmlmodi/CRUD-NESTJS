// UserController.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/user/dto/update-user.dto';
import { UserService } from 'src/modules/user/user.service';
import { LoginDto } from 'src/modules/user/dto/login-user.dto';
import { generateToken } from 'src/helpers/token.helper';
import * as bcrypt from 'bcrypt';
import { HttpStatusCodes, ResponseMessages } from '../../constant/response.constants';
import { handleErrorResponse } from '../../helpers/response.helper';
import { SortOrder } from 'mongoose';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private config: ConfigService,
  ) { }

  // Create a new user
  @Post("create-user")
  async createUser(@Res() response, @Body() createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.userService.getUserByEmail(createUserDto.email);

      if (existingUser) {
        throw { status: HttpStatusCodes.BAD_REQUEST, message: ResponseMessages.EMAIL_MUST_BE_UNIQUE };
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = await this.userService.createUser({ ...createUserDto, password: hashedPassword });

      const token = await generateToken(newUser);

      return response.status(HttpStatusCodes.CREATED).json({
        message: ResponseMessages.USER_CREATED_SUCCESSFULLY,
        newUser,
        token,
      });
    } catch (error) {
      return handleErrorResponse(response, error, ResponseMessages.ERROR_USER_NOT_CREATED);
    }
  }


  // User login
  @Post('login')
  async loginUser(@Res() response, @Body() loginDto: LoginDto) {
    try {
      const user = await this.userService.getUserByEmail(loginDto.email);

      if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
        throw { status: HttpStatusCodes.UNAUTHORIZED, message: ResponseMessages.INVALID_EMAIL_OR_PASSWORD };
      }

      const token = await generateToken(user);
      return response.status(HttpStatusCodes.OK).json({
        message: ResponseMessages.LOGIN_SUCCESSFUL,
        token,
      });
    } catch (error) {
      return handleErrorResponse(response, error, ResponseMessages.ERROR_LOGIN_FAILED);
    }
  }

  // Update user details
  @Put('update-user/:id')
  @UseGuards(AuthGuard)
  async updateUser(@Res() response, @Param('id') userId: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const existingUser = await this.userService.updateUser(userId, updateUserDto);
      return response.status(HttpStatusCodes.OK).json({
        message: ResponseMessages.USER_UPDATED_SUCCESSFULLY,
        existingUser,
      });
    } catch (error) {
      return handleErrorResponse(response, error);
    }
  }

  // Get all users with pagination, sorting, and search
  @Get('get-all-user')
  @UseGuards(AuthGuard)
  async getUsers(
    @Res() response,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('sortField') sortField: string,
    @Query('sortOrder') sortOrder: SortOrder,
    @Query('search') search: string,
  ) {
    try {
      const userData = await this.userService.getAllUsers(page, limit, sortField, sortOrder, search);
      return response.status(HttpStatusCodes.OK).json({
        message: ResponseMessages.ALL_USERS_DATA_FOUND_SUCCESSFULLY,
        userData,
      });
    } catch (error) {
      return handleErrorResponse(response, error);
    }
  }

  // Get user by ID
  @Get('get-user/:id')
  @UseGuards(AuthGuard)
  async getUser(@Res() response, @Param('id') userId: string) {
    try {
      const existingUser = await this.userService.getUser(userId);

      return response.status(HttpStatusCodes.OK).json({
        message: ResponseMessages.USER_FOUND_SUCCESSFULLY,
        existingUser,
      });
    } catch (error) {
      return handleErrorResponse(response, error);
    }
  }

  // Delete a user by ID
  @Delete('delete-user/:id')
  @UseGuards(AuthGuard)
  async deleteUser(@Res() response, @Param('id') userId: string) {
    try {
      const deletedUser = await this.userService.deleteUser(userId);
      return response.status(HttpStatusCodes.OK).json({
        message: ResponseMessages.USER_DELETED_SUCCESSFULLY,
        deletedUser,
      });
    } catch (error) {
      return handleErrorResponse(response, error);
    }
  }
}
