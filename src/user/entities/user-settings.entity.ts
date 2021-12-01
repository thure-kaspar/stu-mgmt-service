import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Event } from "../../course/events/events";
import { User, UserId } from "../../shared/entities/user.entity";
import { ToDto } from "../../shared/interfaces/to-dto.interface";
import { Language } from "../../shared/language";
import { UserSettingsDto } from "../dto/user-settings.dto";

@Entity()
export class UserSettings implements ToDto<UserSettingsDto> {
	@OneToOne(() => User, user => user.settings, { onDelete: "CASCADE" })
	@JoinColumn({ name: "userId", referencedColumnName: "id" })
	user?: User;

	@Column()
	@PrimaryColumn()
	userId: UserId;

	@Column({ type: "enum", enum: Language, default: Language.DE })
	language: Language;

	@Column({ default: true })
	allowEmails: boolean;

	@Column({ type: "json", nullable: true })
	blacklistedEvents?: { [key in Event]?: boolean };

	toDto(): UserSettingsDto {
		return {
			language: this.language,
			allowEmails: this.allowEmails,
			blacklistedEvents: this.blacklistedEvents
		};
	}
}
