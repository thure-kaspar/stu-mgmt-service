/* eslint-disable quotes */
import { MigrationInterface, QueryRunner } from "typeorm";

export class OldSchemaToNewSchema1623499898868 implements MigrationInterface {
	name = "OldSchemaToNewSchema1623499898868";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "admission_from_previous_semester" ("id" SERIAL NOT NULL, "courseConfigId" integer NOT NULL, "admissionFromPreviousSemester" json, CONSTRAINT "REL_c7d9fe97ae1efc48b05e2d5297" UNIQUE ("courseConfigId"), CONSTRAINT "PK_dd698a0a3a49254ffff251cbb78" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(`CREATE TYPE "user_settings_language_enum" AS ENUM('EN', 'DE')`);
		await queryRunner.query(
			`CREATE TABLE "user_settings" ("userId" uuid NOT NULL, "language" "user_settings_language_enum" NOT NULL DEFAULT 'DE', "allowEmails" boolean NOT NULL DEFAULT true, "blacklistedEvents" json, CONSTRAINT "REL_986a2b6d3c05eb4091bb8066f7" UNIQUE ("userId"), CONSTRAINT "PK_986a2b6d3c05eb4091bb8066f78" PRIMARY KEY ("userId"))`
		);
		await queryRunner.query(
			`CREATE TABLE "subscriber" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "courseId" character varying NOT NULL, "url" character varying NOT NULL, "events" json NOT NULL, "updateDate" TIMESTAMP NOT NULL, CONSTRAINT "PK_1c52b7ddbaf79cd2650045b79c7" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX "IDX_Name_CourseId" ON "subscriber" ("name", "courseId") `
		);
		await queryRunner.query(
			`CREATE TABLE "submission" ("id" SERIAL NOT NULL, "assignmentId" uuid NOT NULL, "userId" uuid NOT NULL, "courseId" character varying NOT NULL, "date" TIMESTAMP NOT NULL DEFAULT now(), "groupId" uuid, "links" json, "payload" json, CONSTRAINT "PK_7faa571d0e4a7076e85890c9bd0" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(`ALTER TABLE "course_config" DROP COLUMN "subscriptionUrl"`);
		await queryRunner.query(`ALTER TABLE "partial_assessment" DROP COLUMN "line"`);
		await queryRunner.query(`ALTER TABLE "partial_assessment" DROP COLUMN "path"`);
		await queryRunner.query(`ALTER TABLE "partial_assessment" DROP COLUMN "type"`);
		await queryRunner.query(`ALTER TABLE "partial_assessment" DROP COLUMN "severity"`);
		await queryRunner.query(`ALTER TABLE "user" ADD "matrNr" integer`);
		await queryRunner.query(
			`ALTER TABLE "partial_assessment" ADD "key" character varying NOT NULL DEFAULT substring(md5(random()::text), 0, 8)`
		);
		await queryRunner.query(
			`ALTER TABLE "partial_assessment" ADD "draftOnly" boolean NOT NULL DEFAULT false`
		);
		await queryRunner.query(`ALTER TABLE "partial_assessment" ADD "markers" json`);
		await queryRunner.query(
			`ALTER TABLE "assessments" ADD "isDraft" boolean NOT NULL DEFAULT false`
		);
		await queryRunner.query(
			`ALTER TABLE "assessments" ALTER COLUMN "achievedPoints" DROP NOT NULL`
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX "IDX_AssessmentId_Key" ON "partial_assessment" ("assessmentId", "key") `
		);
		await queryRunner.query(
			`ALTER TABLE "admission_from_previous_semester" ADD CONSTRAINT "FK_c7d9fe97ae1efc48b05e2d52970" FOREIGN KEY ("courseConfigId") REFERENCES "course_config"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "user_settings" ADD CONSTRAINT "FK_986a2b6d3c05eb4091bb8066f78" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "subscriber" ADD CONSTRAINT "FK_4d2009596aca55b129e55972e3a" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "submission" ADD CONSTRAINT "FK_ef99745f278ca701c5efe5d8ddd" FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "submission" ADD CONSTRAINT "FK_7bd626272858ef6464aa2579094" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "submission" ADD CONSTRAINT "FK_497c52c7cc9496b41fce5afae6d" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "submission" ADD CONSTRAINT "FK_9a7928e5935c4cd5f02edaaa139" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "submission" DROP CONSTRAINT "FK_9a7928e5935c4cd5f02edaaa139"`
		);
		await queryRunner.query(
			`ALTER TABLE "submission" DROP CONSTRAINT "FK_497c52c7cc9496b41fce5afae6d"`
		);
		await queryRunner.query(
			`ALTER TABLE "submission" DROP CONSTRAINT "FK_7bd626272858ef6464aa2579094"`
		);
		await queryRunner.query(
			`ALTER TABLE "submission" DROP CONSTRAINT "FK_ef99745f278ca701c5efe5d8ddd"`
		);
		await queryRunner.query(
			`ALTER TABLE "subscriber" DROP CONSTRAINT "FK_4d2009596aca55b129e55972e3a"`
		);
		await queryRunner.query(
			`ALTER TABLE "user_settings" DROP CONSTRAINT "FK_986a2b6d3c05eb4091bb8066f78"`
		);
		await queryRunner.query(
			`ALTER TABLE "admission_from_previous_semester" DROP CONSTRAINT "FK_c7d9fe97ae1efc48b05e2d52970"`
		);
		await queryRunner.query(`DROP INDEX "IDX_AssessmentId_Key"`);
		await queryRunner.query(
			`ALTER TABLE "assessments" ALTER COLUMN "achievedPoints" SET NOT NULL`
		);
		await queryRunner.query(`ALTER TABLE "assessments" DROP COLUMN "isDraft"`);
		await queryRunner.query(`ALTER TABLE "partial_assessment" DROP COLUMN "markers"`);
		await queryRunner.query(`ALTER TABLE "partial_assessment" DROP COLUMN "draftOnly"`);
		await queryRunner.query(`ALTER TABLE "partial_assessment" DROP COLUMN "key"`);
		await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "matrNr"`);
		await queryRunner.query(
			`ALTER TABLE "partial_assessment" ADD "severity" character varying`
		);
		await queryRunner.query(`ALTER TABLE "partial_assessment" ADD "type" character varying`);
		await queryRunner.query(`ALTER TABLE "partial_assessment" ADD "path" character varying`);
		await queryRunner.query(`ALTER TABLE "partial_assessment" ADD "line" integer`);
		await queryRunner.query(
			`ALTER TABLE "course_config" ADD "subscriptionUrl" character varying`
		);
		await queryRunner.query(`DROP TABLE "submission"`);
		await queryRunner.query(`DROP INDEX "IDX_Name_CourseId"`);
		await queryRunner.query(`DROP TABLE "subscriber"`);
		await queryRunner.query(`DROP TABLE "user_settings"`);
		await queryRunner.query(`DROP TYPE "user_settings_language_enum"`);
		await queryRunner.query(`DROP TABLE "admission_from_previous_semester"`);
	}
}
