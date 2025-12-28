ALTER TABLE "users" ADD COLUMN "role" text NOT NULL DEFAULT 'manager';
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_locked" text NOT NULL DEFAULT 'false';
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "failed_login_attempts" text NOT NULL DEFAULT '0';
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_failed_login" text;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_password_change" text NOT NULL DEFAULT CURRENT_TIMESTAMP;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "must_change_password" text NOT NULL DEFAULT 'false';
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" text NOT NULL DEFAULT CURRENT_TIMESTAMP;