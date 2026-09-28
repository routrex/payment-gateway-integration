-- AlterTable
ALTER TABLE `payments` ADD COLUMN `redirect_url` VARCHAR(255) NULL,
    ADD COLUMN `snap_token` VARCHAR(255) NULL;
