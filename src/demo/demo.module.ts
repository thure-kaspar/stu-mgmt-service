import { Module } from "@nestjs/common";
import { DemoController } from "./demo.controller";

/**
 * Module that provides functionality solely for demo and testing purposes (i.e., resetting database).
 * Should not be imported in `production` environment.
 */
@Module({
	controllers: [DemoController]
})
export class DemoModule {}
