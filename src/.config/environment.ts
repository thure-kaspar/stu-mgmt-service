type EnvironmentName = "development" | "demo" | "production" | "testing";

/**
 * Contains the possible environments that this application might run in, as well as
 * some utility methods for checking the current environment.
 *
 * See the `/config` directory to view the corresponding configuration settings.
 */
export const environment = {
	development: "development",
	demo: "demo",
	production: "production",
	testing: "testing",

	/**
	 * Determines, whether the current environment is one of the specified environments.
	 *
	 * @param environments One or multiple environment names.
	 * @returns `true`, if the current environment is one of the given environments.
	 */
	is: (...environments: EnvironmentName[]): boolean =>
		(environments as string[]).includes(process.env.NODE_ENV),

	/** Returns the current environment (`process.env.NODE_ENV`). */
	current: () => process.env.NODE_ENV
} as const;
