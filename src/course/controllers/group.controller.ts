import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UseGuards
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { setTotalCountHeader } from "../../../test/utils/http-utils";
import { PasswordDto } from "../../shared/dto/password.dto";
import { UserId } from "../../shared/entities/user.entity";
import { PaginatedResult, throwIfRequestFailed } from "../../utils/http-utils";
import {
	GetCourse,
	GetGroup,
	GetParticipant,
	GetSelectedParticipant
} from "../decorators/decorators";
import { ParticipantDto } from "../dto/course-participant/participant.dto";
import { GroupCreateBulkDto } from "../dto/group/group-create-bulk.dto";
import { GroupEventDto } from "../dto/group/group-event.dto";
import { GroupFilter } from "../dto/group/group-filter.dto";
import { GroupDto, GroupUpdateDto } from "../dto/group/group.dto";
import { CourseId } from "../entities/course.entity";
import { GroupId } from "../entities/group.entity";
import { CourseMemberGuard } from "../guards/course-member/course-member.guard";
import { GroupGuard } from "../guards/group.guard";
import { SelectedParticipantGuard } from "../guards/selected-participant.guard";
import { Course } from "../models/course.model";
import { Group } from "../models/group.model";
import { Participant } from "../models/participant.model";
import {
	AssignedEvaluatorFilter,
	GroupWithAssignedEvaluatorDto
} from "../../assessment/queries/groups-with-assigned-evaluator/group-with-assigned-evaluator.dto";
import { GroupsWithAssignedEvaluatorQuery } from "../../assessment/queries/groups-with-assigned-evaluator/groups-with-assigned-evaluator.query";
import { GroupService } from "../services/group.service";
import { GroupMemberGuard } from "../guards/group-member.guard";
import { TeachingStaffGuard } from "../guards/teaching-staff.guard";
import { JoinRandomGroupCommand } from "../commands/join-random-group.handler";
import { AssessmentDto } from "../../assessment/dto/assessment.dto";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { Public } from "nest-keycloak-connect";
import { environment } from "src/.config/environment";

@ApiBearerAuth()
@ApiTags("group")
@UseGuards(AuthGuard, CourseMemberGuard)
@Controller("courses/:courseId/groups")
@Public(environment.is("development", "demo", "testing"))
export class GroupController {
	constructor(
		private groupService: GroupService,
		private queryBus: QueryBus,
		private commandBus: CommandBus
	) {}

	@ApiOperation({
		operationId: "createGroup",
		summary: "Create group.",
		description:
			"Creates a new group, if course allows group creation. If request was triggered by student, student is automatically joining the group."
	})
	@Post()
	createGroup(
		@Param("courseId") courseId: CourseId,
		@GetCourse() course: Course,
		@GetParticipant() participant: Participant,
		@Body() groupDto: GroupDto
	): Promise<GroupDto> {
		return this.groupService.createGroup(course, participant, groupDto);
	}

	@ApiOperation({
		operationId: "createMultipleGroups",
		summary: "Create multiple groups.",
		description: "Creates multiple groups with the given names or naming schema and count."
	})
	@Post("bulk")
	@UseGuards(TeachingStaffGuard)
	createMultipleGroups(
		@Param("courseId") courseId: CourseId,
		@Body() groupCreateBulk: GroupCreateBulkDto
	): Promise<GroupDto[]> {
		return this.groupService.createMultipleGroups(courseId, groupCreateBulk);
	}

	@ApiOperation({
		operationId: "joinOrCreateGroup",
		summary: "Join or create group.",
		description:
			"Tries to add the user to an open group with sufficient capacity. If no such group exists, creates a new group and adds the requesting user. Returns the joined group and its members."
	})
	@Post("joinOrCreateGroup")
	joinOrCreateGroup(
		@Param("courseId") courseId: CourseId,
		@GetCourse() course: Course,
		@GetParticipant() participant: Participant
	): Promise<GroupDto> {
		return this.commandBus.execute(new JoinRandomGroupCommand(course, participant));
	}

	@ApiOperation({
		operationId: "addUserToGroup",
		summary: "Add user to group.",
		description: "Adds the user to the group, if constraints are fulfilled."
	})
	@Post(":groupId/users/:userId")
	@UseGuards(SelectedParticipantGuard, GroupGuard)
	addUserToGroup(
		@Param("courseId") courseId: CourseId,
		@Param("groupId") groupId: GroupId,
		@Param("userId") userId: UserId,
		@GetCourse() course: Course,
		@GetGroup() group: Group,
		@GetParticipant() participant: Participant,
		@GetSelectedParticipant() selectedParticipant: Participant,
		@Body() password?: PasswordDto
	): Promise<void> {
		return this.groupService.addUserToGroup(
			course,
			group,
			participant,
			selectedParticipant,
			password.password
		);
	}

	@ApiOperation({
		operationId: "getGroupsOfCourse",
		summary: "Get groups of course.",
		description: "Retrieves all groups that belong to the course."
	})
	@Get()
	async getGroupsOfCourse(
		@Req() request: Request,
		@Param("courseId") courseId: CourseId,
		@GetParticipant() participant: Participant,
		@Query() filter?: GroupFilter
	): Promise<GroupDto[]> {
		const groups = await PaginatedResult(
			this.groupService.getGroupsOfCourse(courseId, new GroupFilter(filter)),
			request
		);

		if (participant.isStudent()) {
			groups.forEach(group => (group.members = undefined));
		}

		return groups;
	}

	@ApiOperation({
		operationId: "getGroupHistoryOfCourse",
		summary: "Get group history of course.",
		description: "Retrieves all group events of the course."
	})
	@Get("history")
	@UseGuards(TeachingStaffGuard)
	getGroupHistoryOfCourse(@Param("courseId") courseId: CourseId): Promise<GroupEventDto[]> {
		return this.groupService.getGroupHistoryOfCourse(courseId);
	}

	@ApiOperation({
		operationId: "getGroupsWithAssignedEvaluator",
		summary: "Get groups with assigned evaluator.",
		description: "Retrieves groups with their assigned evaluator for an assignment"
	})
	@UseGuards(TeachingStaffGuard)
	@Get("assignments/:assignmentId/with-assigned-evaluator")
	async getGroupsWithAssignedEvaluator(
		@Req() request: Request,
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@Query() filter?: AssignedEvaluatorFilter
	): Promise<GroupWithAssignedEvaluatorDto[]> {
		const [groups, count] = await this.queryBus.execute(
			new GroupsWithAssignedEvaluatorQuery(
				courseId,
				assignmentId,
				new AssignedEvaluatorFilter(filter)
			)
		);
		setTotalCountHeader(request, count);
		return groups;
	}

	@ApiOperation({
		operationId: "getGroup",
		summary: "Get group.",
		description: "Returns the group with its members."
	})
	@Get(":groupId")
	@UseGuards(GroupGuard, GroupMemberGuard)
	getGroup(
		@Param("courseId") courseId: CourseId,
		@Param("groupId") groupId: GroupId
	): Promise<GroupDto> {
		return this.groupService.getGroup(groupId);
	}

	@ApiOperation({
		operationId: "getUsersOfGroup",
		summary: "Get users of group.",
		description: "Retrieves all users that are members of the group."
	})
	@Get(":groupId/users")
	@UseGuards(GroupGuard, GroupMemberGuard)
	getUsersOfGroup(
		@Param("courseId") courseId: CourseId,
		@Param("groupId") groupId: GroupId
	): Promise<ParticipantDto[]> {
		return this.groupService.getUsersOfGroup(groupId);
	}

	@ApiOperation({
		operationId: "getAssessmentsOfGroup",
		summary: "Get assessments of group.",
		description: "Retrieves all assessments of this group."
	})
	@Get(":groupId/assessments")
	@UseGuards(TeachingStaffGuard, GroupGuard)
	getAssessmentsOfGroup(
		@Param("courseId") courseId: CourseId,
		@Param("groupId") groupId: GroupId
	): Promise<AssessmentDto[]> {
		return this.groupService.getAssessmentsOfGroup(groupId);
	}

	@ApiOperation({
		operationId: "updateGroup",
		summary: "Update group.",
		description: "Updates the group partially."
	})
	@Patch(":groupId")
	@UseGuards(GroupGuard, GroupMemberGuard)
	updateGroup(
		@Param("courseId") courseId: CourseId,
		@Param("groupId") groupId: GroupId,
		@GetCourse() course: Course,
		@GetGroup() group: Group,
		@Body() update: GroupUpdateDto
	): Promise<GroupDto> {
		return this.groupService.updateGroup(course, group, update);
	}

	@ApiOperation({
		operationId: "removeUserFromGroup",
		summary: "Remove user.",
		description: "Removes the user from the group."
	})
	@Delete(":groupId/users/:userId")
	@UseGuards(GroupGuard, SelectedParticipantGuard)
	removeUserFromGroup(
		@Param("courseId") courseId: CourseId,
		@Param("groupId") groupId: GroupId,
		@Param("userId") userId: UserId,
		@GetCourse() course: Course,
		@GetGroup() group: Group,
		@GetParticipant() participant: Participant,
		@GetSelectedParticipant() selectedParticipant: Participant,
		@Body("reason") reason?: string
	): Promise<void> {
		return this.groupService.removeUser(
			course,
			group,
			participant,
			selectedParticipant,
			reason
		);
	}

	@ApiOperation({
		operationId: "deleteGroup",
		summary: "Delete group.",
		description: "Deletes the group."
	})
	@Delete(":groupId")
	@UseGuards(GroupGuard, GroupMemberGuard)
	deleteGroup(
		@Param("courseId") courseId: CourseId,
		@Param("groupId") groupId: GroupId,
		@GetCourse() course: Course,
		@GetGroup() group: Group,
		@GetParticipant() participant: Participant
	): Promise<void> {
		return throwIfRequestFailed(
			this.groupService.deleteGroup(course, group, participant),
			`Failed to delete group (${groupId})`
		);
	}
}
