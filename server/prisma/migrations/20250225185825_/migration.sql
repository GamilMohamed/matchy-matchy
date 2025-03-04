/*
  Warnings:

  - You are about to drop the column `orientation` on the `User` table. All the data in the column will be lost.
  - Added the required column `birthDate` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "orientation",
ADD COLUMN     "biography" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "interests" TEXT[],
ADD COLUMN     "location" TEXT,
ADD COLUMN     "pictures" TEXT[],
ADD COLUMN     "profilePicture" TEXT,
ADD COLUMN     "sexualPreferences" TEXT NOT NULL DEFAULT 'both',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
