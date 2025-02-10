import { HttpService } from "@nestjs/axios";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { Config } from "../../.config/config";
import { AuthSystemCredentials } from "../dto/auth-credentials.dto";
import { AuthInfo } from "../dto/auth-info.dto";
import { CredentialsDto } from "../dto/credentials.dto";

@Injectable()
export class SparkyService {
	private readonly sparkyUrl = Config.get().authentication.issuer;

	constructor(private http: HttpService) {}

	async checkAuthentication(credentials: AuthSystemCredentials): Promise<AuthInfo> {
		try {
			// Call external /authenticate/verify method token as query parameter
			const url = `${this.sparkyUrl}/api/v1/authenticate/verify?jwtToken=${credentials.token}`;
			const response = await firstValueFrom(this.http.get<AuthInfo>(url));

			// Return AuthInfo, if user is authenticated
			return response.data;
		} catch (error) {
			throw new UnauthorizedException({
				status: error.status,
				message: "Failed to authenticate with Sparkyservice.",
				sparkyError: error.response.data
			});
		}
	}

	async authenticate(credentials: CredentialsDto): Promise<AuthInfo> {
		try {
			const url = `${this.sparkyUrl}/api/v1/authenticate`;
			const response = await firstValueFrom(this.http.post<AuthInfo>(url, credentials));

			// Return AuthInfo, if login was successful
			return response.data;
		} catch (error) {
			throw new UnauthorizedException({
				status: error.status,
				message: "Failed to authenticate with Sparkyservice.",
				sparkyError: error.response.data
			});
		}
	}
}
