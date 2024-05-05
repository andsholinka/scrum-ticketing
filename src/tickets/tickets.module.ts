import { Module } from '@nestjs/common';
import { Ticket } from './entities/ticket.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { TicketController } from './tickets.controller';
import { TicketService } from './tickets.service';
import { User } from 'src/users/entities/user.entity';
import { UserService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') },
      })
    }),
    AuthModule,
    TypeOrmModule.forFeature([Ticket, User]),
  ],
  controllers: [TicketController],
  providers: [TicketService, UserService],
})
export class TicketsModule { }
