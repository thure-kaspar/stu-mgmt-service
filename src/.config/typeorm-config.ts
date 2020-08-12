import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as config from "config";

const dbConfig = config.get("db");
const loggingConfig = config.get("logger");

export const typeOrmConfig: TypeOrmModuleOptions = {
	type: process.env.DB_TYPE || dbConfig.type,
	host: process.env.DB_HOST || dbConfig.host,
	port: process.env.DB_PORT || dbConfig.port,
	username: process.env.DB_USERNAME || dbConfig.username,
	password: process.env.DB_PASSWORD || dbConfig.password,
	database: process.env.DB_DATABASE || dbConfig.database,
	synchronize: process.env.TYPEORM_SYNC || dbConfig.synchronize,
	dropSchema: dbConfig.dropSchema || false,
	keepConnectionAlive: true, // prevents AlreadyHasActiveConnectionError, needed for testing // TODO: Check if it should be disabled in production
	entities: [__dirname + "/../**/*.entity.{js,ts}"],
	logging: loggingConfig.dbErrors ? ["error"] : undefined
};
