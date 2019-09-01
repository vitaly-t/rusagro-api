import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

export type User = any;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {
  }

  async findOneFull(username): Promise<User> {
    return await this.usersRepository.findOne({
      select: [
        'id', 'username', 'password', 'email', 'firstName', 'lastName', 'phone',
      ],
      where: { username, disabled: false },
    });
  }

  async findOne(id: string): Promise<any> {
    return await this.usersRepository.findOne(id);
  }

  async findAll(): Promise<any> {
    return await this.usersRepository.find();
  }
}
