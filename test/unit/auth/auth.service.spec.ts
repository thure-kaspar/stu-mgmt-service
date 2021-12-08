import { AuthInfo } from "../../../src/auth/dto/auth-info.dto";
import { SparkyService } from "../../../src/auth/services/sparky.service";
import { AuthService } from "../../../src/auth/services/auth.service";
import { UserDto, UserUpdateDto } from "../../../src/shared/dto/user.dto";
import { User } from "../../../src/shared/entities/user.entity";
import { UserRole } from "../../../src/shared/enums";
import { UserRepository } from "../../../src/user/repositories/user.repository";
import { USER_STUDENT_JAVA } from "../../mocks/users.mock";
import { convertToEntity, copy } from "../../utils/object-helper";

const mock_UserRepository = (): Partial<UserRepository> => ({
	updateUser: jest.fn(),
	createUser: jest.fn(),
	tryGetUserByUsername: jest.fn()
});

const mock_SparkyService = (): Partial<SparkyService> => ({
	authenticate: jest.fn()
});

function createAuthInfo(data: {
	email: string;
	displayName: string;
	username: string;
	role: "DEFAULT" | "ADMIN" | "SERVICE";
}): AuthInfo {
	return {
		token: null,
		user: {
			passwordDto: null,
			realm: null,
			settings: {
				emailAddress: data.email,
				emailReceive: true,
				wantsAi: true
			},
			role: data.role,
			fullName: data.displayName,
			username: data.username
		}
	};
}

describe("AuthService", () => {
	let service: AuthService;
	let userRepository: UserRepository;
	let sparkyService: SparkyService;
	let userDto: UserDto;

	beforeEach(async () => {
		userRepository = mock_UserRepository() as UserRepository;
		sparkyService = mock_SparkyService() as SparkyService;
		service = new AuthService(userRepository, sparkyService);
		userDto = copy(USER_STUDENT_JAVA);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("createUser", () => {
		let authInfo: AuthInfo;
		let user: User;
		let expectedUserDto: UserDto;

		beforeEach(() => {
			user = convertToEntity(User, userDto);
			authInfo = createAuthInfo({
				displayName: user.displayName,
				email: user.email,
				username: user.username,
				role: "DEFAULT"
			});
			expectedUserDto = {
				id: undefined,
				username: authInfo.user.username,
				displayName: authInfo.user.fullName,
				email: authInfo.user.settings.emailAddress,
				role: UserRole.USER
			};
		});

		it("FullName included -> Creates with FullName as DisplayName", async () => {
			await service.createUser(authInfo);
			expect(userRepository.createUser).toHaveBeenCalledWith<[UserDto]>(expectedUserDto);
		});

		it("FullName not included -> Uses Username as DisplayName", async () => {
			authInfo.user.fullName = null;
			expectedUserDto.displayName = authInfo.user.username;

			await service.createUser(authInfo);
			expect(userRepository.createUser).toHaveBeenCalledWith<[UserDto]>(expectedUserDto);
		});
	});

	describe("updateUser", () => {
		let authInfo: AuthInfo;
		let user: User;
		let expectedUserUpdateDto: UserUpdateDto;

		beforeEach(() => {
			user = convertToEntity(User, userDto);
			authInfo = createAuthInfo({
				email: "changed." + user.email,
				displayName: "Changed " + user.displayName,
				username: user.username,
				role: "DEFAULT"
			});
			expectedUserUpdateDto = {
				...user,
				role: user.role,
				matrNr: user.matrNr,
				displayName: authInfo.user.fullName,
				email: authInfo.user.settings.emailAddress
			};
		});

		it("Updates email", async () => {
			await service.updateUser(user, authInfo);
			expect(userRepository.updateUser).toHaveBeenCalledWith<[string, UserUpdateDto]>(
				user.id,
				expectedUserUpdateDto
			);
		});

		it("FullName included -> Updates DisplayName", async () => {
			await service.updateUser(user, authInfo);
			expect(userRepository.updateUser).toHaveBeenCalledWith<[string, UserUpdateDto]>(
				user.id,
				expectedUserUpdateDto
			);
		});

		it("FullName not included -> Sets Username as DisplayName", async () => {
			authInfo.user.fullName = null;
			expectedUserUpdateDto.displayName = authInfo.user.username;

			await service.updateUser(user, authInfo);

			expect(userRepository.updateUser).toHaveBeenCalledWith<[string, UserUpdateDto]>(
				user.id,
				expectedUserUpdateDto
			);
		});
	});

	describe("userInfoHasChanged", () => {
		let authInfo: AuthInfo;
		let user: User;

		beforeEach(() => {
			user = convertToEntity(User, userDto);
			authInfo = createAuthInfo({
				email: user.email,
				displayName: user.displayName,
				username: user.username,
				role: "DEFAULT"
			});
		});

		it("No changes -> Returns false", () => {
			const result = service.userInfoHasChanged(user, authInfo);
			expect(result).toEqual(false);
		});

		it("Email changed -> Returns true", () => {
			authInfo.user.settings.emailAddress = "a.changed@email";
			const result = service.userInfoHasChanged(user, authInfo);
			expect(result).toEqual(true);
		});

		it("FullName changed -> Returns true", () => {
			authInfo.user.fullName = "Changed FullName";
			const result = service.userInfoHasChanged(user, authInfo);
			expect(result).toEqual(true);
		});
	});
});
