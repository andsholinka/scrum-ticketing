import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'tickets' })
export class Ticket {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({ type: 'enum', enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] })
    status: string;

    @Column()
    point: number;

    @Column({ type: 'json' })
    histories: { date: Date; title: string; userId: number }[];

    @ManyToOne(() => User, (user) => user.tickets)
    @JoinColumn({ name: 'assignedUserId' })
    assignedUser: User;

    addHistoryEntry(title: string, user: User) {
        this.histories.push({ date: new Date(), title, userId: user.id });
    }
}
