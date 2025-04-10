/*
  # Create high scores table

  1. New Tables
    - `high_scores`
      - `id` (uuid, primary key)
      - `username` (text, unique) - Player's username
      - `wpm` (integer) - Words per minute score
      - `accuracy` (integer) - Typing accuracy percentage
      - `time` (integer) - Time taken in seconds
      - `created_at` (timestamp) - When the score was recorded

  2. Security
    - Enable RLS on `high_scores` table
    - Add policies for:
      - Anyone can read high scores
      - Authenticated users can insert their own scores
*/

CREATE TABLE IF NOT EXISTS high_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  wpm integer NOT NULL,
  accuracy integer NOT NULL,
  time integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE high_scores ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read high scores
CREATE POLICY "High scores are viewable by everyone" 
ON high_scores FOR SELECT 
TO public 
USING (true);

-- Allow authenticated users to insert scores
CREATE POLICY "Users can insert their own scores" 
ON high_scores FOR INSERT 
TO public 
WITH CHECK (true);

-- Create index for efficient sorting
CREATE INDEX high_scores_wpm_idx ON high_scores (wpm DESC);