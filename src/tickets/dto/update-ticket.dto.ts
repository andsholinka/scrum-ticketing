import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';
import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { TicketStatus } from '../ticket.status.enum';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(TicketStatus)
    status?: TicketStatus;

    @IsOptional()
    @IsNumber()
    point?: number;

    @IsOptional()
    @IsNumber()
    assignedUserId?: number;
}
