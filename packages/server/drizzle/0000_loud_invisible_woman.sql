CREATE TABLE `character` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role` text NOT NULL,
	`name` text NOT NULL,
	`physical_traits` text NOT NULL,
	`personality_traits` text NOT NULL,
	`random` text NOT NULL,
	`seed` integer NOT NULL,
	`headshot` text,
	`fullbody` text,
	`location_id` integer NOT NULL,
	`scene_id` integer,
	`health` integer DEFAULT 100 NOT NULL,
	`energy` integer DEFAULT 100 NOT NULL,
	`currency` integer DEFAULT 0 NOT NULL,
	`strength` integer DEFAULT 10 NOT NULL,
	`dexterity` integer DEFAULT 10 NOT NULL,
	`constitution` integer DEFAULT 10 NOT NULL,
	`intelligence` integer DEFAULT 10 NOT NULL,
	`wisdom` integer DEFAULT 10 NOT NULL,
	`charisma` integer DEFAULT 10 NOT NULL,
	FOREIGN KEY (`location_id`) REFERENCES `location`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`scene_id`) REFERENCES `scene`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `character_relationship` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`character_id_1` integer NOT NULL,
	`character_id_2` integer NOT NULL,
	`type` text DEFAULT 'stranger' NOT NULL,
	`journal` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`character_id_1`) REFERENCES `character`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`character_id_2`) REFERENCES `character`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `city` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`geographic_traits` text NOT NULL,
	`development_traits` text NOT NULL,
	`random` text NOT NULL,
	`seed` integer NOT NULL,
	`landscape` text,
	`region_id` integer NOT NULL,
	FOREIGN KEY (`region_id`) REFERENCES `region`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `city_edge` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`city_id_1` integer NOT NULL,
	`city_id_2` integer NOT NULL,
	`distance` integer NOT NULL,
	FOREIGN KEY (`city_id_1`) REFERENCES `city`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`city_id_2`) REFERENCES `city`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`distance`) REFERENCES `city`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`character_id` integer NOT NULL,
	`item_id` integer NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`character_id`, `item_id`),
	FOREIGN KEY (`character_id`) REFERENCES `character`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`item_id`) REFERENCES `item`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`physical_traits` text NOT NULL,
	`development_traits` text NOT NULL,
	`effect` text NOT NULL,
	`type` text NOT NULL,
	`value` integer DEFAULT 0 NOT NULL,
	`rarity` text DEFAULT 'common' NOT NULL,
	`weight` integer DEFAULT 0 NOT NULL,
	`seed` integer NOT NULL,
	`image` text,
	`multiplier` real DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `location` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`physical_traits` text NOT NULL,
	`development_traits` text NOT NULL,
	`seed` integer NOT NULL,
	`landscape` text,
	`city_id` integer,
	`city_edge_id` integer,
	FOREIGN KEY (`city_id`) REFERENCES `city`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`city_edge_id`) REFERENCES `city_edge`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `message` (
	`character_id` integer,
	`scene_id` integer NOT NULL,
	`message` text NOT NULL,
	`timestamp_in_game` integer NOT NULL,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `character`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`scene_id`) REFERENCES `scene`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `organization` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`random` text NOT NULL,
	`development_traits` text NOT NULL,
	`seed` integer NOT NULL,
	`logo` text,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `organization_character` (
	`role` text NOT NULL,
	`status` text DEFAULT 'good standing' NOT NULL,
	`organization_id` integer NOT NULL,
	`character_id` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`character_id`) REFERENCES `character`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quest` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`location_id` integer,
	`character_id` integer,
	`status` text DEFAULT 'active' NOT NULL,
	FOREIGN KEY (`location_id`) REFERENCES `location`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`character_id`) REFERENCES `character`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `region` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`geographic_traits` text NOT NULL,
	`development_traits` text NOT NULL,
	`random` text NOT NULL,
	`seed` integer NOT NULL,
	`landscape` text
);
--> statement-breakpoint
CREATE TABLE `scene` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`summary` text,
	`type` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`location_id` integer NOT NULL,
	FOREIGN KEY (`location_id`) REFERENCES `location`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `skill` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`energy_cost` integer DEFAULT 0 NOT NULL,
	`multiplier` real DEFAULT 1 NOT NULL,
	`seed` integer NOT NULL,
	`icon` text
);
--> statement-breakpoint
CREATE TABLE `skill_character` (
	`skill_id` integer NOT NULL,
	`character_id` integer NOT NULL,
	FOREIGN KEY (`skill_id`) REFERENCES `skill`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`character_id`) REFERENCES `character`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `item_name_unique` ON `item` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `skill_id_unique` ON `skill` (`id`);