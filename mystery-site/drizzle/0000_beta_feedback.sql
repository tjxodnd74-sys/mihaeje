CREATE TABLE beta_feedback (
 id TEXT PRIMARY KEY NOT NULL,
 created_at TEXT NOT NULL,
 game TEXT NOT NULL,
 device TEXT NOT NULL,
 topic TEXT NOT NULL,
 note TEXT NOT NULL,
 flow INTEGER,
 clue INTEGER,
 replay TEXT,
 scene TEXT NOT NULL DEFAULT '',
 client_key TEXT NOT NULL,
 reviewed INTEGER NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE INDEX feedback_created ON beta_feedback(created_at);
--> statement-breakpoint
CREATE INDEX feedback_client_time ON beta_feedback(client_key,created_at);
