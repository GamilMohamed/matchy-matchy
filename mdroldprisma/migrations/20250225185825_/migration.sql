/*
  Warnings:

  - You are about to drop the column `orientation` on the `User` table. All the data in the column will be lost.
  - Added the required column `birth_date` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "orientation",
ADD COLUMN     "biography" TEXT,
ADD COLUMN     "birth_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "interests" TEXT[],
ADD COLUMN     "location" TEXT,
ADD COLUMN     "pictures" TEXT[],
ADD COLUMN     "profile_picture" TEXT,
ADD COLUMN     "sexual_preferences" TEXT NOT NULL DEFAULT 'both',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
