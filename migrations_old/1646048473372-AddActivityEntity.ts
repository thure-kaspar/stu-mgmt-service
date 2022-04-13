import { MigrationInterface, QueryRunner } from "typeorm";

export class AddActivityEntity1646048473372 implements MigrationInterface {
	name = "AddActivityEntity1646048473372";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "activity" ("id" SERIAL NOT NULL, "userId" uuid NOT NULL, "courseId" character varying NOT NULL, "date" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_24625a1d6b1b089c8ae206fe467" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`ALTER TABLE "activity" ADD CONSTRAINT "FK_3571467bcbe021f66e2bdce96ea" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "activity" ADD CONSTRAINT "FK_cc80e014837faeecdd7a27bc883" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "activity" DROP CONSTRAINT "FK_cc80e014837faeecdd7a27bc883"`
		);
		await queryRunner.query(
			`ALTER TABLE "activity" DROP CONSTRAINT "FK_3571467bcbe021f66e2bdce96ea"`
		);
		await queryRunner.query(`DROP TABLE "activity"`);
	}
}
