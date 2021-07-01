import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Config } from "./src/.config/config";

const dbConfig = Config.getDb();
const loggingConfig = Config.getLogger();

const typeOrmConfig: TypeOrmModuleOptions = {
	type: (process.env.DB_TYPE as any) || dbConfig.type,
	host: process.env.DB_HOST || dbConfig.host,
	port: (process.env.DB_PORT as any) || dbConfig.port,
	username: process.env.DB_USERNAME || dbConfig.username,
	password: process.env.DB_PASSWORD || dbConfig.password,
	database: process.env.DB_DATABASE || dbConfig.database,
	synchronize: (process.env.TYPEORM_SYNC as any) || dbConfig.synchronize,
	dropSchema: dbConfig.dropSchema || false,
	migrationsRun: false,
	migrations: ["dist/migrations/*.js"],
	cli: {
		migrationsDir: "migrations"
	},
	keepConnectionAlive: true, // prevents AlreadyHasActiveConnectionError, needed for testing // TODO: Check if it should be disabled in production
	logging: loggingConfig.dbErrors ? ["error"] : undefined,
	entities: ["dist/**/*.entity.js"]
};

export default typeOrmConfig;
