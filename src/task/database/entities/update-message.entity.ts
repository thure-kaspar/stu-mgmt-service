import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { AffectedObject, EventType } from "../../tasks/update.service";

@Entity()
export class UpdateMessage extends BaseEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "enum", enum: EventType })
	type: EventType;

	@Column({ type: "enum", enum: AffectedObject })
	affectedObject: AffectedObject;

	@Column()
	courseId: string;

	@Column()
	entityId: string;

	@Column({ nullable: true })
	entityId_relation?: string;
	
	@CreateDateColumn()
	date: Date

}