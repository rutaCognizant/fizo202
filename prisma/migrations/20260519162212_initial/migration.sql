-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Activity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pushups` INTEGER NOT NULL DEFAULT 0,
    `crunches` INTEGER NOT NULL DEFAULT 0,
    `running` INTEGER NOT NULL DEFAULT 0,
    `userId` INTEGER NOT NULL,
    `userAge` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PushupPoints` (
    `age` INTEGER NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL,
    `points` INTEGER NOT NULL,

    PRIMARY KEY (`age`, `gender`, `count`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CrunchesPoints` (
    `age` INTEGER NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL,
    `points` INTEGER NOT NULL,

    PRIMARY KEY (`age`, `gender`, `count`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RunningPoints` (
    `age` INTEGER NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `seconds` INTEGER NOT NULL,
    `points` INTEGER NOT NULL,

    PRIMARY KEY (`age`, `gender`, `seconds`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Activity` ADD CONSTRAINT `Activity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
