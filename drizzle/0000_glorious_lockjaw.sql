CREATE TABLE `enquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`created_at` integer NOT NULL,
	`intent` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`location` text NOT NULL,
	`details` text NOT NULL,
	`ip_hash` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_enquiries_ip_created` ON `enquiries` (`ip_hash`,`created_at`);