import { PartialType } from "@nestjs/swagger";
import { GroupSettingsDto } from "./group-settings.dto";

/** Version of GroupSettingsDto that only contains editable properties. */
export class GroupSettingsUpdateDto extends PartialType(GroupSettingsDto) { }
