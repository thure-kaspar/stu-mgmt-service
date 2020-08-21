import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CourseModule } from "../course/course.module";
import { CsvConverterService } from "./services/csv-converter.service";
import { CsvController } from "./controllers/csv.controller";

@Module({
	imports: [AuthModule, CourseModule],
	providers: [CsvConverterService],
	controllers: [CsvController]
})
export class CsvModule {}
