ALTER TABLE "categories" ADD COLUMN "background_image_url" text;
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "overlay_color" text DEFAULT '#000000';
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "overlay_opacity" text DEFAULT '0.5';
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "text_color" text DEFAULT '#ffffff';
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "custom_icon_url" text;
