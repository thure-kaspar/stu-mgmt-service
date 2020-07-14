import { Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export class EventEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	event: string;

	@Column({ type: "json", nullable: true })
	payload: object;

	@CreateDateColumn()
	timestamp: Date;
}
