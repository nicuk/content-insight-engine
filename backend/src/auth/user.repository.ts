import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async create(userData: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.userRepository.create({
      id: uuidv4(),
      ...userData,
    });
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}
