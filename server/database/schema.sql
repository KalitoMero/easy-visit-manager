
-- Create database schema for visitor management system

-- Visitors table
CREATE TABLE IF NOT EXISTS visitors (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    company VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    visitor_number INTEGER NOT NULL UNIQUE,
    check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out_time TIMESTAMP WITH TIME ZONE,
    additional_visitor_count INTEGER DEFAULT 0,
    notes TEXT,
    policy_accepted BOOLEAN DEFAULT FALSE,
    signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Additional visitors table
CREATE TABLE IF NOT EXISTS additional_visitors (
    id UUID PRIMARY KEY,
    visitor_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    visitor_number INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table for all configuration
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Counter table for visitor numbers
CREATE TABLE IF NOT EXISTS counters (
    name VARCHAR(50) PRIMARY KEY,
    value INTEGER NOT NULL DEFAULT 100
);

-- Insert default counter
INSERT INTO counters (name, value) VALUES ('visitor_counter', 100) ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_visitors_visitor_number ON visitors(visitor_number);
CREATE INDEX IF NOT EXISTS idx_visitors_check_in_time ON visitors(check_in_time);
CREATE INDEX IF NOT EXISTS idx_visitors_check_out_time ON visitors(check_out_time);
CREATE INDEX IF NOT EXISTS idx_additional_visitors_visitor_id ON additional_visitors(visitor_id);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
