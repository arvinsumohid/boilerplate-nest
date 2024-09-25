import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password } = createUserDto;
    const saltRounds = parseInt(this.configService.get('SALT_HASH') ?? '10');
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    const result = await createdUser.save();
    return result;
  }

  findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  findOne(id: number): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, updateUserDto).exec();
  }

  remove(id: number): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
