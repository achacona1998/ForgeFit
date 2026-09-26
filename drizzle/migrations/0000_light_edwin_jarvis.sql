CREATE TABLE `exerciseTemplates` (
	`id` text PRIMARY KEY NOT NULL,
	`trainingDayId` text NOT NULL,
	`exerciseId` text NOT NULL,
	`order` integer NOT NULL,
	`sets` integer NOT NULL,
	`repRangeMin` integer,
	`repRangeMax` integer,
	`targetWeight` real,
	`targetRIRMin` integer,
	`targetRIRMax` integer,
	`targetRPE` real,
	`restMinSeconds` integer,
	`restMaxSeconds` integer,
	`tempo` text,
	`progressionType` text,
	`supersetGroup` text,
	`priority` text,
	`notes` text,
	`enabled` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`trainingDayId`) REFERENCES `trainingDays`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exerciseId`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text,
	`muscleGroups` text,
	`equipment` text,
	`instructions` text,
	`isCustom` integer DEFAULT false NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `measurements` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`weight` real,
	`bodyFatPercentage` real,
	`values` text,
	`notes` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `personalRecords` (
	`id` text PRIMARY KEY NOT NULL,
	`exerciseId` text NOT NULL,
	`sessionId` text,
	`recordType` text NOT NULL,
	`weight` real,
	`reps` integer,
	`volume` real,
	`estimatedPerformance` real,
	`achievedAt` text NOT NULL,
	FOREIGN KEY (`exerciseId`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `routineVersions` (
	`id` text PRIMARY KEY NOT NULL,
	`routineId` text NOT NULL,
	`versionNumber` integer NOT NULL,
	`effectiveFrom` text,
	`effectiveTo` text,
	`notes` text,
	`mesocycleId` text,
	`microcycleId` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`routineId`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `routines` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`goal` text,
	`active` integer DEFAULT false NOT NULL,
	`daysPerWeek` integer,
	`startDate` text,
	`endDate` text,
	`currentVersionId` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessionExercises` (
	`id` text PRIMARY KEY NOT NULL,
	`sessionId` text NOT NULL,
	`exerciseId` text NOT NULL,
	`templateSnapshot` text,
	`order` integer NOT NULL,
	`status` text DEFAULT 'pending',
	`notes` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exerciseId`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`routineId` text,
	`routineVersionId` text,
	`trainingDayId` text,
	`date` text NOT NULL,
	`status` text NOT NULL,
	`startedAt` text,
	`completedAt` text,
	`durationSeconds` integer,
	`sessionNotes` text,
	`recoveryContext` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `setLogs` (
	`id` text PRIMARY KEY NOT NULL,
	`sessionExerciseId` text NOT NULL,
	`setNumber` integer NOT NULL,
	`type` text DEFAULT 'working' NOT NULL,
	`plannedWeight` real,
	`plannedRepsMin` integer,
	`plannedRepsMax` integer,
	`plannedRIR` integer,
	`actualWeight` real,
	`actualReps` integer,
	`actualRIR` integer,
	`actualRPE` real,
	`techniqueRating` text,
	`restPlannedSeconds` integer,
	`restActualSeconds` integer,
	`completedAt` text,
	`skipped` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`sessionExerciseId`) REFERENCES `sessionExercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trainingDays` (
	`id` text PRIMARY KEY NOT NULL,
	`routineVersionId` text NOT NULL,
	`name` text NOT NULL,
	`dayOfWeek` integer,
	`order` integer NOT NULL,
	FOREIGN KEY (`routineVersionId`) REFERENCES `routineVersions`(`id`) ON UPDATE no action ON DELETE cascade
);
