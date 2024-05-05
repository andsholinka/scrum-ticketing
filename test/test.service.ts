import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TestService {
    constructor(private readonly userRepository: Repository<User>) { }

    async deleteEmployee() {
        await this.userRepository.delete({
            email: 'test@example.com',
        })
    }

    async getEmployee(): Promise<User> {
        return await this.userRepository.findOne({
            where:
                { email: 'test@example.com' }
        });
    }

    async createEmployee() {
        await this.userRepository.create({
            email: 'test@example.com',
            name: 'test',
            password: 'test',
            profilePicUrl: 'test',
        })
    }
}
