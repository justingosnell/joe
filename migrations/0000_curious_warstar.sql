CREATE TABLE `locations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`category` text NOT NULL,
	`state` text NOT NULL,
	`city` text DEFAULT '',
	`zip_code` text DEFAULT '',
	`photo_url` text NOT NULL,
	`photo_id` text NOT NULL,
	`tagged_date` text NOT NULL,
	`custom_fields` text DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`original_name` text NOT NULL,
	`url` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` text NOT NULL,
	`width` text,
	`height` text,
	`alt` text DEFAULT '',
	`caption` text DEFAULT '',
	`uploaded_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`uploaded_by` text,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);