CREATE TABLE "environment_log" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "environment_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"pond_id" integer NOT NULL,
	"dissolved_oxygen" real NOT NULL,
	"ph" real NOT NULL,
	"water_level" real NOT NULL,
	"temperature" real NOT NULL,
	"has_alert" boolean DEFAULT false NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feeding_log" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "feeding_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"pond_id" integer NOT NULL,
	"feed_type" text NOT NULL,
	"amount_kg" real NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "harvest_log" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "harvest_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"pond_id" integer NOT NULL,
	"species" text NOT NULL,
	"estimated_biomass_kg" real NOT NULL,
	"actual_yield_kg" real NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pond" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pond_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "report_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "environment_log" ADD CONSTRAINT "environment_log_pond_id_pond_id_fk" FOREIGN KEY ("pond_id") REFERENCES "public"."pond"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feeding_log" ADD CONSTRAINT "feeding_log_pond_id_pond_id_fk" FOREIGN KEY ("pond_id") REFERENCES "public"."pond"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "harvest_log" ADD CONSTRAINT "harvest_log_pond_id_pond_id_fk" FOREIGN KEY ("pond_id") REFERENCES "public"."pond"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pond" ADD CONSTRAINT "pond_user_id_user_account_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_user_id_user_account_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_user_account_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_account"("id") ON DELETE no action ON UPDATE no action;