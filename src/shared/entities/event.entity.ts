import { BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

export class EventEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	event: string;

	@Column({ type: "json", nullable: true })
	payload: object;

	@CreateDateColumn()
	timestamp: Date;
}
