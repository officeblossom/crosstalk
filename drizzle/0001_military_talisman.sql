ALTER TABLE `events` ADD `address` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `locations` ADD `address` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `locations` ADD `key_color` text DEFAULT '#42210b' NOT NULL;--> statement-breakpoint
UPDATE `locations` SET `address` = '福岡県北九州市小倉北区馬借1丁目5-25 ホラヤビル4F', `key_color` = '#f1e6d4' WHERE lower(`name`) = 'tanga';--> statement-breakpoint
UPDATE `locations` SET `address` = '福岡県北九州市八幡西区折尾1丁目5-6', `key_color` = '#42210b' WHERE lower(`name`) = 'orio';--> statement-breakpoint
UPDATE `locations` SET `address` = '福岡県北九州市門司区中町1-14', `key_color` = '#c1272d' WHERE lower(`name`) = 'moji';--> statement-breakpoint
UPDATE `events` SET `address` = (SELECT `address` FROM `locations` WHERE `locations`.`id` = `events`.`location_id`) WHERE `address` = '';
