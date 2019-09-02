import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {
  }

  async findOneFull(username: string): Promise<UsersEntity> {
    return await this.usersRepository.findOne({
      select: [
        'id', 'username', 'password', 'email', 'firstName', 'lastName', 'phone',
      ],
      where: { username, disabled: false },
    });
  }

  async findOne(id: string): Promise<UsersEntity> {
    return await this.usersRepository.findOne(id, { where: { disabled: false } });
  }

  async findAll(): Promise<UsersEntity[]> {
    return await this.usersRepository.find({ where: { disabled: false } });
  }
}
