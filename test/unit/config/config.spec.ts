import { ValidationError } from "yup";
import { Config, configSchema, configValidationSchemas } from "../../../src/.config/config";
import * as y from "yup";
import { DeepPartial } from "typeorm";

const validConfig = {
	server: {
		basePath: "http://localhost:3000",
		port: 3000
	},
	db: {
		type: "postgres",
		port: 5432,
		database: "StudentMgmtDb",
		host: "localhost",
		username: "postgres",
		password: "admin",
		synchronize: false,
		dropSchema: false
	},
	notifications: {
		enabled: false,
		subscribers: []
	},
	mailing: {
		enabled: false
	},
	authentication: {
		issuer: "http://localhost:8081",
		realm: "oidctest",
		clientId: "stumgmt-dev-thure",
		clientSecret: "QvRTymbqczt5z2ryYYnq0EkZKBpcToWc"
	},
	logger: {
		levels: ["error", "warn", "debug", "verbose"],
		requests: false,
		dbErrors: false
	}
};

it("Config Creation", () => {
	const cfg = Config.get();
	expect(cfg).toBeDefined();
	expect(cfg.db).toBeDefined();
	expect(cfg.server).toBeDefined();
	expect(cfg.notifications).toBeDefined();
	expect(cfg.mailing).toBeDefined();
	expect(cfg.authentication).toBeDefined();
	expect(cfg.logger).toBeDefined();
});

describe("Config Validation", () => {
	describe("Valid", () => {
		it("Testing Config: Config.validate", () => {
			try {
				Config.validate();
				expect(true).toEqual(true);
			} catch (error) {
				expect(error).toBeUndefined();
			}
		});

		it("Valid Config: configSchema.validateSync", () => {
			try {
				configSchema.validateSync(validConfig, { abortEarly: false });
				expect(true).toEqual(true);
			} catch (error) {
				expect(error).toBeUndefined();
			}
		});

		it("Coerces strings to numbers", () => {
			// This behavior is default, can be disabled with `strict: true` as second argument
			expect(y.number().isValidSync("123")).toEqual(true);
		});

		it("Coerces 'true' to true", () => {
			// This behavior is default, can be disabled with `strict: true` as second argument
			expect(y.boolean().isValidSync("true")).toEqual(true);
		});
	});

	describe("Invalid", () => {
		it("null", () => {
			try {
				configSchema.validateSync(null, { abortEarly: false });
			} catch (error) {
				if (error instanceof ValidationError) {
					expect(error.errors).toHaveLength(1);
				}
			}
		});
		it("Empty Object -> 20 errors", () => {
			try {
				configSchema.validateSync({}, { abortEarly: false });
			} catch (error) {
				if (error instanceof ValidationError) {
					expect(error.errors).toHaveLength(20);
				}
			}
		});

		it("Empty Object for each key -> 20 errors", () => {
			const emptyConfig: DeepPartial<ReturnType<typeof Config["get"]>> = {
				authentication: {},
				db: {},
				logger: {},
				mailing: {},
				notifications: {},
				server: {}
			};

			try {
				configSchema.validateSync(emptyConfig, { abortEarly: false });
			} catch (error) {
				if (error instanceof ValidationError) {
					expect(error.errors).toHaveLength(20);
				}
			}
		});
	});
});

describe("Mailing Config Validation", () => {
	describe("Valid", () => {
		it("enabled: false -> No more configuration necessary", () => {
			const mailingConfig = {
				enabled: false
			};

			try {
				configValidationSchemas.mailing.validateSync(mailingConfig);
				expect(true).toEqual(true);
			} catch (error) {
				expect(error).toBeUndefined();
			}
		});

		it("enabled: true with smtp + from + clientBasePath", () => {
			const mailingConfig = {
				enabled: true,
				clientBasePath: "http://localhost:4200",
				from: "from@here",
				smtp: {
					host: "smtp.server",
					useSecureConnection: false,
					username: "username",
					password: "password",
					port: 587
				}
			};

			try {
				configValidationSchemas.mailing.validateSync(mailingConfig);
				expect(true).toEqual(true);
			} catch (error) {
				expect(error).toBeUndefined();
			}
		});
	});
	describe("Invalid", () => {
		it("Empty", () => {
			const mailingConfig = {};
			const isValid = configValidationSchemas.mailing.isValidSync(mailingConfig);
			expect(isValid).toEqual(false);
		});

		it("Enabled but smtp and from is missing", () => {
			const mailingConfig = {
				enabled: true
			};
			const isValid = configValidationSchemas.mailing.isValidSync(mailingConfig);
			expect(isValid).toEqual(false);
		});
	});
});
