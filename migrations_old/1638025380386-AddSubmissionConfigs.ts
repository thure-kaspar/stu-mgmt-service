import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubmissionConfigs1638025380386 implements MigrationInterface {
	name = "AddSubmissionConfigs1638025380386";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "public"."assignments" ADD "configs" json`);
		await queryRunner.query(
			`ALTER TABLE "public"."user_settings" DROP CONSTRAINT "FK_986a2b6d3c05eb4091bb8066f78"`
		);
		await queryRunner.query(
			`ALTER TABLE "public"."user_settings" ADD CONSTRAINT "UQ_986a2b6d3c05eb4091bb8066f78" UNIQUE ("userId")`
		);
		await queryRunner.query(
			`ALTER TABLE "public"."user_settings" ADD CONSTRAINT "FK_986a2b6d3c05eb4091bb8066f78" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "public"."user_settings" DROP CONSTRAINT "FK_986a2b6d3c05eb4091bb8066f78"`
		);
		await queryRunner.query(
			`ALTER TABLE "public"."user_settings" DROP CONSTRAINT "UQ_986a2b6d3c05eb4091bb8066f78"`
		);
		await queryRunner.query(
			`ALTER TABLE "public"."user_settings" ADD CONSTRAINT "FK_986a2b6d3c05eb4091bb8066f78" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(`ALTER TABLE "public"."assignments" DROP COLUMN "configs"`);
	}
}
