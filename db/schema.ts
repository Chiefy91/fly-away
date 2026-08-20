import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const programs = sqliteTable("programs", {
  id: text("id").primaryKey(),
  region: text("region").notNull(),
  city: text("city").notNull(),
  university: text("university").notNull(),
  school: text("school").notNull(),
  program: text("program").notNull(),
  category: text("category").notNull(),
  direction: text("direction").notNull().default(""),
  background: text("background").notNull(),
  cycle: text("cycle").notNull(),
  intake: text("intake").notNull(),
  duration: text("duration").notNull(),
  updated: text("updated").notNull(),
  academic: text("academic").notNull(),
  language: text("language").notNull(),
  tests: text("tests").notNull(),
  prerequisites: text("prerequisites").notNull(),
  deadline: text("deadline").notNull(),
  deadlineNote: text("deadline_note").notNull(),
  tuition: text("tuition").notNull().default(""),
  applicationRequirements: text("application_requirements").notNull().default(""),
  interview: text("interview").notNull().default(""),
  rentBudget: text("rent_budget").notNull().default(""),
  positioning: text("positioning").notNull().default(""),
  source: text("source").notNull(),
  sourceLabel: text("source_label").notNull().default(""),
  requirementsJson: text("requirements_json").notNull().default("[]"),
  documentsJson: text("documents_json").notNull().default("[]"),
  notesJson: text("notes_json").notNull().default("[]"),
  sourcesJson: text("sources_json").notNull().default("[]"),
  sourcePayloadJson: text("source_payload_json").notNull().default("{}"),
}, (table) => [
  index("programs_region_idx").on(table.region),
  index("programs_category_idx").on(table.category),
  index("programs_university_idx").on(table.university),
]);

export const guides = sqliteTable("guides", {
  id: text("id").primaryKey(),
  section: text("section").notNull(),
  payloadJson: text("payload_json").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  updated: text("updated").notNull(),
}, (table) => [index("guides_section_idx").on(table.section)]);

/**
 * A user's saved application plan.  The client keeps a short-lived local copy
 * for offline use, but D1 is the authoritative store when Sites identity is
 * available.
 */
export const applicationPlans = sqliteTable("application_plans", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  programId: text("program_id").notNull(),
  stage: text("stage").notNull().default("研究中"),
  documentsJson: text("documents_json").notNull().default("{}"),
  reminderJson: text("reminder_json").notNull().default("{}"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  index("application_plans_user_updated_idx").on(table.userId, table.updatedAt),
  index("application_plans_program_idx").on(table.programId),
]);

/** The latest known state of a project's primary official application page. */
export const sourceMonitors = sqliteTable("source_monitors", {
  id: text("id").primaryKey(),
  programId: text("program_id").notNull(),
  sourceUrl: text("source_url").notNull(),
  sourceLabel: text("source_label").notNull().default("项目官网"),
  lastCheckedAt: text("last_checked_at").notNull().default(""),
  lastStatus: text("last_status").notNull().default("待巡检"),
  lastHttpStatus: integer("last_http_status"),
  lastContentHash: text("last_content_hash").notNull().default(""),
  lastChangedAt: text("last_changed_at").notNull().default(""),
  openSignal: integer("open_signal").notNull().default(0),
  note: text("note").notNull().default(""),
}, (table) => [
  index("source_monitors_program_idx").on(table.programId),
  index("source_monitors_status_checked_idx").on(table.lastStatus, table.lastCheckedAt),
]);

/** Append-only audit trail for source checks; page content is never stored. */
export const sourceSnapshots = sqliteTable("source_snapshots", {
  id: text("id").primaryKey(),
  monitorId: text("monitor_id").notNull(),
  programId: text("program_id").notNull(),
  sourceUrl: text("source_url").notNull(),
  checkedAt: text("checked_at").notNull(),
  httpStatus: integer("http_status"),
  status: text("status").notNull(),
  contentHash: text("content_hash").notNull().default(""),
  pageTitle: text("page_title").notNull().default(""),
  openSignal: integer("open_signal").notNull().default(0),
  note: text("note").notNull().default(""),
}, (table) => [
  index("source_snapshots_program_checked_idx").on(table.programId, table.checkedAt),
  index("source_snapshots_monitor_checked_idx").on(table.monitorId, table.checkedAt),
]);
