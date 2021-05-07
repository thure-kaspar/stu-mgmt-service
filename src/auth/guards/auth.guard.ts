import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthStrategy } from "./auth.strategy";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private strategy: AuthStrategy) {}

	canActivate(context: ExecutionContext): boolean | Promise<boolean> {
		return this.strategy.canActivate(context);
	}
}
