-- Enable Realtime Replication for Tables
-- This migration enables Supabase Realtime for the tables used in real-time subscriptions

-- Enable realtime for links table
ALTER PUBLICATION supabase_realtime ADD TABLE links;

-- Enable realtime for link_checks table
ALTER PUBLICATION supabase_realtime ADD TABLE link_checks;

-- Enable realtime for workspaces table
ALTER PUBLICATION supabase_realtime ADD TABLE workspaces;

-- Verify the tables are added to the publication
-- You can check with: SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
