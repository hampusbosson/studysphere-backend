/*
  Warnings:

  - You are about to drop the column `lectureId` on the `Lecture` table. All the data in the column will be lost.
  - Added the required column `classId` to the `Lecture` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Lecture" DROP CONSTRAINT "Lecture_lectureId_fkey";

-- AlterTable
ALTER TABLE "Lecture" DROP COLUMN "lectureId",
ADD COLUMN     "classId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
