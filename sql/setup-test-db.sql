-- Setup test database and tables
CREATE DATABASE fairvia_test;
\c fairvia_test;

-- Enable Row Level Security
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for test data
CREATE POLICY "Public users can view published units" ON units
    FOR SELECT
    USING (status = 'published');

CREATE POLICY "Public users can view public events" ON events
    FOR SELECT
    USING (visibility = 'public');

-- Add test data
INSERT INTO units (id, name, description, status, published_at)
VALUES 
    ('test-unit-published', 'Test Unit', 'A test unit for e2e testing', 'published', NOW());

INSERT INTO events (unit_id, type, content, visibility, content_hash)
VALUES
    ('test-unit-published', 'status_change', 'Unit published', 'public', 'hash1'),
    ('test-unit-published', 'verification', 'Unit verified', 'public', 'hash2');

-- Add indexes for better performance
CREATE INDEX idx_units_status ON units(status);
CREATE INDEX idx_events_visibility ON events(visibility);
CREATE INDEX idx_events_unit_id ON events(unit_id);