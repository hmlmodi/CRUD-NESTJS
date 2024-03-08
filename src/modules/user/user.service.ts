import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './users.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser = await new this.userModel(createUserDto);
    return newUser.save();
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true });
    if (!existingUser) {
      throw new NotFoundException(`User #${userId} not found`);
    }
    return existingUser;
  }

  async getAllUsers(
    page: number,
    limit: number,
    sortField: string = 'createdAt',
    sortOrder: SortOrder = 'asc',
    searchQuery?: string,
  ): Promise<User[]> {
    const skip = (page - 1) * limit;
  
    const sortObject: { [key: string]: SortOrder } = {};
    sortObject[sortField] = sortOrder;
  
    let query = this.userModel.find().sort(sortObject).skip(skip).limit(limit);
  
    if (searchQuery) {
      const searchRegExp = new RegExp(searchQuery, 'i');
      query = query.find({ name: { $regex: searchRegExp } });
    }
  
    const userData = await query.exec();
  
    if (!userData || userData.length === 0) {
      throw new NotFoundException('Users data not found!');
    }
  
    return userData;
  }

  async getUser(userId: string): Promise<User> {
    const existingUser = await this.userModel.findById(userId).exec();
    if (!existingUser) {
      throw new NotFoundException(`User #${userId} not found`);
    }
    return existingUser;
  }

  async deleteUser(userId: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new NotFoundException(`User #${userId} not found`);
    }
    return deletedUser;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return user;
  }
}
