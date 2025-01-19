-- DropForeignKey
ALTER TABLE "Lecture" DROP CONSTRAINT "Lecture_classId_fkey";

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
