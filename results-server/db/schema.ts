import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
export const reportHistory=sqliteTable("report_history",{
 id:integer("id").primaryKey({autoIncrement:true}),submissionId:text("submission_id").notNull().unique(),
 gameId:text("game_id").notNull(),team1:text("team1").notNull(),team2:text("team2").notNull(),
 score1:integer("score1").notNull(),score2:integer("score2").notNull(),source:text("source").notNull(),recordedAt:text("recorded_at").notNull()
});
export const gameResults=sqliteTable("game_results",{
 gameId:text("game_id").primaryKey(),reportId:integer("report_id").notNull().references(()=>reportHistory.id),
 team1:text("team1").notNull(),team2:text("team2").notNull(),score1:integer("score1").notNull(),score2:integer("score2").notNull(),
 recordedAt:text("recorded_at").notNull()
});
