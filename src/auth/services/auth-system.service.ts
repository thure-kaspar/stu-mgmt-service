import { Injectable, HttpService } from "@nestjs/common";
import { AuthSystemCredentials } from "../dto/auth-credentials.dto";
import * as config from "config";
import { AuthInfo } from "../dto/auth-info.dto";

const authSystemConfig = config.get("authSystem");

@Injectable()
export class AuthSystemService {

	private readonly authSystemUrl = authSystemConfig.url;

	constructor(private http: HttpService) { }

	async checkAuthentication(credentials: AuthSystemCredentials): Promise<AuthInfo> {
		try {
			// Call external auth system's /authenticate/verify method token as query parameter
			const url = `${this.authSystemUrl}/api/v1/authenticate/verify?jwtToken=${credentials.token}`;
			const response = await this.http.get<AuthInfo>(url).toPromise();

			// Return AuthInfo, if user is authenticated
			return response.data;
		} catch(error) {
			// Return null, if authentication failed
			return null;
		}
	}

}
