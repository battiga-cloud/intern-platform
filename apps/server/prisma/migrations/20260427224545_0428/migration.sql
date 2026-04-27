/*
  Warnings:

  - You are about to drop the column `schoolId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[account]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `account` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_schoolId_fkey";

-- DropIndex
DROP INDEX "User_userName_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "schoolId",
DROP COLUMN "userName",
ADD COLUMN     "account" TEXT NOT NULL,
ADD COLUMN     "manageSchoolId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_account_key" ON "User"("account");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_manageSchoolId_fkey" FOREIGN KEY ("manageSchoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
