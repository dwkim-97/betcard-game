-- BetCard Game Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'PLAYING', 'FINISHED')),
  current_round SMALLINT NOT NULL DEFAULT 0,
  current_phase TEXT CHECK (current_phase IN ('BET', 'BET_REBID', 'GIVE', 'USE', 'RESOLVE', 'ROUND_END')),
  phase_deadline TIMESTAMPTZ,
  player1_id TEXT NOT NULL,
  player2_id TEXT,
  player1_nickname TEXT NOT NULL DEFAULT 'Player 1',
  player2_nickname TEXT NOT NULL DEFAULT 'Player 2',
  player1_total_score INT NOT NULL DEFAULT 0,
  player2_total_score INT NOT NULL DEFAULT 0,
  player1_pool INT NOT NULL DEFAULT 5,
  player2_pool INT NOT NULL DEFAULT 5,
  winner_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_matches_invite_code ON matches(invite_code);
CREATE INDEX idx_matches_status ON matches(status);

-- Rounds table
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  round_number SMALLINT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'NORMAL' CHECK (mode IN ('NORMAL', 'SUDDEN_DEATH')),
  player1_bet SMALLINT,
  player2_bet SMALLINT,
  bet_tie_count SMALLINT NOT NULL DEFAULT 0,
  first_player_id TEXT,
  player1_give_card SMALLINT,
  player2_give_card SMALLINT,
  player1_use_card SMALLINT,
  player2_use_card SMALLINT,
  player1_result INT,
  player2_result INT,
  player1_round_score INT,
  player2_round_score INT,
  player1_bet_score INT,
  player2_bet_score INT,
  player1_prediction_bonus SMALLINT NOT NULL DEFAULT 0,
  player2_prediction_bonus SMALLINT NOT NULL DEFAULT 0,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(match_id, round_number)
);

CREATE INDEX idx_rounds_match_id ON rounds(match_id);

-- Enable Row Level Security (all access through service role key from API routes)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (API routes use service role key)
CREATE POLICY "Service role full access on matches" ON matches
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on rounds" ON rounds
  FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for matches table (for broadcast channel)
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
