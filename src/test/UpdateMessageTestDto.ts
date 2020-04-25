import { ApiProperty } from "@nestjs/swagger";
import { UpdateMessage } from "../shared/dto/update-message.dto";

export class UpdateMessageTestDto {
	@ApiProperty({ description: "URL of the Server that should receive the UpdateMessage.", example: "http://127.0.0.1:1111/rest/update" })
	url: string;

	//@ApiProperty({ description: "The UpdateMessage that should be send to the specified URL. Use (GET) /notifications for examples." })
	message: UpdateMessage;
}
