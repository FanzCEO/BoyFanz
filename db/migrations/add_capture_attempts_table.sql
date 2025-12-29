-- Migration: Add capture_attempts table for screenshot protection logging

CREATE TABLE IF NOT EXISTS capture_attempts (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(50) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  attempt_number INTEGER NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  user_agent TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_capture_platform (platform),
  INDEX idx_capture_user (user_id),
  INDEX idx_capture_timestamp (timestamp)
);

-- Add comment
COMMENT ON TABLE capture_attempts IS 'Logs all screenshot and screen recording attempts for security monitoring';
