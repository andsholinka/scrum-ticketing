import { HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ email: createUserDto.email });
    if (user) throw new HttpException('Email already exists', 409);

    const newUser = new User();
    newUser.email = createUserDto.email;
    newUser.name = createUserDto.name;
    newUser.profilePicUrl = createUserDto.profilePicUrl;
    newUser.password = createUserDto.password;

    const savedUser = await this.userRepository.save(newUser);
    console.log(savedUser);

    return savedUser;
  }

  async findAll(filter?: string): Promise<User[]> {
    const queryBuilder = this.userRepository.createQueryBuilder('users');
    if (filter) {
      queryBuilder.where('users.email LIKE :filter OR users.name LIKE :filter', { filter: `%${filter}%` });
    }
    return await queryBuilder.getMany();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    const queryBuilder = this.userRepository.createQueryBuilder('users');
    queryBuilder.leftJoinAndSelect('users.tickets', 'tickets');
    return await queryBuilder.where('users.id = :id', { id }).getOne();
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('User not found');

    user.email = updateUserDto.email || user.email;
    user.name = updateUserDto.name || user.name;
    user.password = updateUserDto.password || user.password;
    user.profilePicUrl = updateUserDto.profilePicUrl || user.profilePicUrl;

    return await this.userRepository.save(user);
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { userId: user.id };
    const token = this.jwtService.sign(payload);
    return { token };

  }
}
