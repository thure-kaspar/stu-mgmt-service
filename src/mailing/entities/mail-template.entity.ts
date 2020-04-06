import {Column, Entity, PrimaryGeneratedColumn, Unique} from "typeorm";

@Entity()
@Unique(["key"])
export class MailTemplate {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	key: string;

	@Column()
	subject: string;

	@Column()
	text: string;

	@Column()
	html: string;
}
