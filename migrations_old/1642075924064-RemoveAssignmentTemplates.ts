import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveAssignmentTemplates1642075924064 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable("assignment_template");
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// nothing
	}
}
