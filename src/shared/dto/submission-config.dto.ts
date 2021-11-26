import { IsNotEmpty } from "class-validator";

export class SubmissionConfigDto {
	@IsNotEmpty()
    tool: string;
    @IsNotEmpty()
	config: string;
}
