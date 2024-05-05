import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateTicketDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    point: number;

    @IsOptional()
    @IsNumber()
    assignedUserId: number;
}
