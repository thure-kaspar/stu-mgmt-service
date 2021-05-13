import { LogLevel } from "@nestjs/common";
import * as config from "config";
import { SubscribedEvents } from "../notification/subscriber/subscriber.dto";

export class Config {
	static getServer(): Server {
		return config.get("server");
	}

	static getDb(): Db {
		return config.get("db");
	}

	static getAuthentication(): Authentication {
		return config.get("authentication");
	}

	static getMailing(): Mailing {
		return config.get("mailing");
	}

	static getNotifications(): Notifications {
		return config.get("notifications");
	}

	static getLogger(): Logger {
		return config.get("logger");
	}
}

type Server = {
	port: number;
};

type Db = {
	/** The type of database, i.e., "postgres". */
	type: "postgres";
	port: number;
	/** Name of the database, i.e. "StudentMgmtDb".  */
	database: string;
	host: string;
	username: string;
	password: string;
	/** If `true`, will automatically update the database schema on startup. Should be disabled in production. */
	synchronize: boolean;
	/** If `true`, will drop all tables. Should be disabled in production. */
	dropSchema: boolean;
};

type Authentication = {
	url: string;
};

type Mailing = {
	enabled: boolean;
	smtp: {
		server: string;
		useSecureConnection: boolean;
		username: string;
		password: string;
		port: number;
	};
};

type Notifications = {
	enabled: boolean;
	subscribers: Subscriber[];
};

type Subscriber = {
	courseId: string;
	name: string;
	url: string;
	events: SubscribedEvents;
};

type Logger = {
	/** Possible levels: `log`, `verbose`, `debug`, `warn`, `error`. */
	levels: LogLevel[];
	/** If `true`, logs incoming request and their response. May be used for debugging purposes. */
	requests: boolean;
	/** If `true`, logs database errors. */
	dbErrors: boolean;
};
