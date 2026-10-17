CREATE TABLE `game_results` (
	`game_id` text PRIMARY KEY NOT NULL,
	`report_id` integer NOT NULL,
	`team1` text NOT NULL,
	`team2` text NOT NULL,
	`score1` integer NOT NULL,
	`score2` integer NOT NULL,
	`recorded_at` text NOT NULL,
	FOREIGN KEY (`report_id`) REFERENCES `report_history`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `report_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`submission_id` text NOT NULL,
	`game_id` text NOT NULL,
	`team1` text NOT NULL,
	`team2` text NOT NULL,
	`score1` integer NOT NULL,
	`score2` integer NOT NULL,
	`source` text NOT NULL,
	`recorded_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `report_history_submission_id_unique` ON `report_history` (`submission_id`);