CREATE TABLE `application_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`program_id` text NOT NULL,
	`stage` text DEFAULT '研究中' NOT NULL,
	`documents_json` text DEFAULT '{}' NOT NULL,
	`reminder_json` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `application_plans_user_updated_idx` ON `application_plans` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX `application_plans_program_idx` ON `application_plans` (`program_id`);--> statement-breakpoint
CREATE TABLE `source_monitors` (
	`id` text PRIMARY KEY NOT NULL,
	`program_id` text NOT NULL,
	`source_url` text NOT NULL,
	`source_label` text DEFAULT '项目官网' NOT NULL,
	`last_checked_at` text DEFAULT '' NOT NULL,
	`last_status` text DEFAULT '待巡检' NOT NULL,
	`last_http_status` integer,
	`last_content_hash` text DEFAULT '' NOT NULL,
	`last_changed_at` text DEFAULT '' NOT NULL,
	`open_signal` integer DEFAULT 0 NOT NULL,
	`note` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `source_monitors_program_idx` ON `source_monitors` (`program_id`);--> statement-breakpoint
CREATE INDEX `source_monitors_status_checked_idx` ON `source_monitors` (`last_status`,`last_checked_at`);--> statement-breakpoint
CREATE TABLE `source_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`monitor_id` text NOT NULL,
	`program_id` text NOT NULL,
	`source_url` text NOT NULL,
	`checked_at` text NOT NULL,
	`http_status` integer,
	`status` text NOT NULL,
	`content_hash` text DEFAULT '' NOT NULL,
	`page_title` text DEFAULT '' NOT NULL,
	`open_signal` integer DEFAULT 0 NOT NULL,
	`note` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `source_snapshots_program_checked_idx` ON `source_snapshots` (`program_id`,`checked_at`);--> statement-breakpoint
CREATE INDEX `source_snapshots_monitor_checked_idx` ON `source_snapshots` (`monitor_id`,`checked_at`);