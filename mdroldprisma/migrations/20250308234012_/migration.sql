/*
  Warnings:

  - The `sexual_preferences` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "sexual_preferences",
ADD COLUMN     "sexual_preferences" TEXT[];
