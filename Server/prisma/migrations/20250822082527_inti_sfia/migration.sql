/*
  Warnings:

  - You are about to drop the `Asset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AssetInstance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Operation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RolePermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `AssetInstance` DROP FOREIGN KEY `AssetInstance_assetId_fkey`;

-- DropForeignKey
ALTER TABLE `Permission` DROP FOREIGN KEY `Permission_assetId_fkey`;

-- DropForeignKey
ALTER TABLE `Permission` DROP FOREIGN KEY `Permission_operationId_fkey`;

-- DropForeignKey
ALTER TABLE `Profile` DROP FOREIGN KEY `Profile_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Role` DROP FOREIGN KEY `Role_parentRoleId_fkey`;

-- DropForeignKey
ALTER TABLE `RolePermission` DROP FOREIGN KEY `RolePermission_permissionId_fkey`;

-- DropForeignKey
ALTER TABLE `RolePermission` DROP FOREIGN KEY `RolePermission_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `Session_userId_fkey`;

-- DropForeignKey
ALTER TABLE `UserRole` DROP FOREIGN KEY `UserRole_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `UserRole` DROP FOREIGN KEY `UserRole_userId_fkey`;

-- DropTable
DROP TABLE `Asset`;

-- DropTable
DROP TABLE `AssetInstance`;

-- DropTable
DROP TABLE `Log`;

-- DropTable
DROP TABLE `Operation`;

-- DropTable
DROP TABLE `Permission`;

-- DropTable
DROP TABLE `Profile`;

-- DropTable
DROP TABLE `Role`;

-- DropTable
DROP TABLE `RolePermission`;

-- DropTable
DROP TABLE `Session`;

-- DropTable
DROP TABLE `User`;

-- DropTable
DROP TABLE `UserRole`;

-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` TEXT NULL,
    `subcategoryId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subcategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Skill` (
    `code` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NULL,
    `overview` TEXT NULL,
    `note` TEXT NULL,
    `levelId` INTEGER NULL,
    `categoryId` INTEGER NULL,

    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Level` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `skillCode` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Description` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `text` TEXT NULL,
    `levelId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubSkill` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `skillCode` VARCHAR(255) NOT NULL,
    `descriptionId` INTEGER NOT NULL,
    `text` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Information` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `text` VARCHAR(255) NULL,
    `subSkillId` INTEGER NULL,
    `dataCollectionId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approvalStatus` ENUM('APPROVED', 'NOT_APPROVED') NOT NULL DEFAULT 'NOT_APPROVED',
    `evidenceUrl` VARCHAR(1000) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DataCollection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` CHAR(36) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SfiaSummary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userEmail` VARCHAR(255) NULL,
    `skillCode` VARCHAR(191) NULL,
    `levelId` INTEGER NULL,
    `skillPercent` DECIMAL(5, 2) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_subcategoryId_fkey` FOREIGN KEY (`subcategoryId`) REFERENCES `Subcategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Skill` ADD CONSTRAINT `Skill_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Level` ADD CONSTRAINT `Level_skillCode_fkey` FOREIGN KEY (`skillCode`) REFERENCES `Skill`(`code`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Description` ADD CONSTRAINT `Description_levelId_fkey` FOREIGN KEY (`levelId`) REFERENCES `Level`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubSkill` ADD CONSTRAINT `SubSkill_skillCode_fkey` FOREIGN KEY (`skillCode`) REFERENCES `Skill`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubSkill` ADD CONSTRAINT `SubSkill_descriptionId_fkey` FOREIGN KEY (`descriptionId`) REFERENCES `Description`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Information` ADD CONSTRAINT `Information_subSkillId_fkey` FOREIGN KEY (`subSkillId`) REFERENCES `SubSkill`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Information` ADD CONSTRAINT `Information_dataCollectionId_fkey` FOREIGN KEY (`dataCollectionId`) REFERENCES `DataCollection`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SfiaSummary` ADD CONSTRAINT `SfiaSummary_skillCode_fkey` FOREIGN KEY (`skillCode`) REFERENCES `Skill`(`code`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SfiaSummary` ADD CONSTRAINT `SfiaSummary_levelId_fkey` FOREIGN KEY (`levelId`) REFERENCES `Level`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
