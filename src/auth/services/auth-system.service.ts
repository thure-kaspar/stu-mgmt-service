import { Injectable, HttpService } from "@nestjs/common";
import { AuthSystemCredentials } from "../dto/auth-credentials.dto";
import * as config from "config";
import { AuthInfo } from "../dto/auth-info.dto";

const authSystemConfig = config.get("authSystem");

@Injectable()
export class AuthSystemService {

	private readonly authenticateCheckUrl = authSystemConfig.url;

	constructor(private http: HttpService) { }

	async checkAuthentication(credentials: AuthSystemCredentials): Promise<AuthInfo> {
		try {
			// Call external auth system's /authenticate/check method with token in Authorization-Header
			const response = await this.http.get<AuthInfo>(this.authenticateCheckUrl,
				{ headers: { "Authorization": "Bearer " + credentials.token } }).toPromise();

			// Return AuthInfo, if user is authenticated
			return response.data;
		} catch(error) {
			// Return null, if authentication failed
			return null;
		}
	}

}
