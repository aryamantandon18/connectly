/*
  Warnings:

  - You are about to drop the column `image` on the `Profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[inviteCode]` on the table `Server` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Profile` DROP COLUMN `image`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `imageUrl` TEXT NULL;

-- AlterTable
ALTER TABLE `Server` MODIFY `inviteCode` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `emailVerified` DATETIME(3) NULL,
    MODIFY `email` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Server_inviteCode_key` ON `Server`(`inviteCode`);
