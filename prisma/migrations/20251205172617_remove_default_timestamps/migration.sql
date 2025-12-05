-- CreateTable
CREATE TABLE `Study` (
    `study_id` INTEGER NOT NULL AUTO_INCREMENT,
    `nickname` VARCHAR(255) NOT NULL,
    `study_name` VARCHAR(255) NOT NULL,
    `study_introduction` VARCHAR(255) NULL,
    `password` VARCHAR(255) NULL,
    `background` INTEGER NULL,
    `point_sum` INTEGER NOT NULL DEFAULT 0,
    `concentration_time` VARCHAR(8) NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`study_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Point` (
    `point_pk` INTEGER NOT NULL AUTO_INCREMENT,
    `study_id` INTEGER NOT NULL,
    `point_content` VARCHAR(255) NOT NULL,
    `point` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`point_pk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Habit` (
    `habit_pk` INTEGER NOT NULL AUTO_INCREMENT,
    `study_id` INTEGER NOT NULL,
    `habit_name` VARCHAR(255) NOT NULL,
    `isRemoved` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Habit_study_id_habit_name_key`(`study_id`, `habit_name`),
    PRIMARY KEY (`habit_pk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Habit_Fullfillment` (
    `habit_fullfillment_pk` INTEGER NOT NULL AUTO_INCREMENT,
    `habit_pk` INTEGER NOT NULL,
    `study_id` INTEGER NULL,
    `habit_fullfillment_year` INTEGER NOT NULL,
    `habit_fullfillment_week` INTEGER NOT NULL,
    `habit_fullfillment_day` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`habit_fullfillment_pk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Emoji` (
    `emoji_id` INTEGER NOT NULL AUTO_INCREMENT,
    `study_id` INTEGER NOT NULL,
    `emoji_name` VARCHAR(255) NOT NULL,
    `emoji_hit` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`emoji_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Point` ADD CONSTRAINT `Point_study_id_fkey` FOREIGN KEY (`study_id`) REFERENCES `Study`(`study_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Habit` ADD CONSTRAINT `Habit_study_id_fkey` FOREIGN KEY (`study_id`) REFERENCES `Study`(`study_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Habit_Fullfillment` ADD CONSTRAINT `Habit_Fullfillment_habit_pk_fkey` FOREIGN KEY (`habit_pk`) REFERENCES `Habit`(`habit_pk`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Habit_Fullfillment` ADD CONSTRAINT `Habit_Fullfillment_study_id_fkey` FOREIGN KEY (`study_id`) REFERENCES `Study`(`study_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Emoji` ADD CONSTRAINT `Emoji_study_id_fkey` FOREIGN KEY (`study_id`) REFERENCES `Study`(`study_id`) ON DELETE CASCADE ON UPDATE CASCADE;

