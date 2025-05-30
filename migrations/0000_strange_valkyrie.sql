CREATE TABLE "document_matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"lost_document_id" integer NOT NULL,
	"found_document_id" integer NOT NULL,
	"match_confidence" integer NOT NULL,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "found_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"document_type" text NOT NULL,
	"date_found" timestamp NOT NULL,
	"location_found" text NOT NULL,
	"description" text,
	"has_image" boolean DEFAULT false,
	"image_url" text,
	"ai_analysis" json,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lost_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"document_type" text NOT NULL,
	"name_on_document" text NOT NULL,
	"date_lost" timestamp NOT NULL,
	"location_lost" text NOT NULL,
	"description" text,
	"has_image" boolean DEFAULT false,
	"image_url" text,
	"ai_analysis" json,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false,
	"type" text NOT NULL,
	"related_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"password" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"email" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
