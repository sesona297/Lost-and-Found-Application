CREATE DATABASE IF NOT EXISTS lost_and_found_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lost_and_found_db;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(160) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  student_number VARCHAR(32) UNIQUE,
  staff_number VARCHAR(32) UNIQUE,
  phone VARCHAR(32),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS campuses (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS items (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  title VARCHAR(180) NOT NULL,
  category VARCHAR(80) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  campus_id CHAR(36),
  location VARCHAR(255) NOT NULL,
  item_type ENUM('lost', 'found') NOT NULL,
  status ENUM('lost', 'found', 'claimed', 'returned') NOT NULL,
  date_event DATE NOT NULL,
  additional_details TEXT,
  received_by CHAR(36),
  received_at TIMESTAMP NULL,
  returned_to CHAR(36),
  returned_by CHAR(36),
  returned_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_items_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_items_campus FOREIGN KEY (campus_id) REFERENCES campuses(id) ON DELETE SET NULL,
  CONSTRAINT fk_items_received_by FOREIGN KEY (received_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_items_returned_to FOREIGN KEY (returned_to) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_items_returned_by FOREIGN KEY (returned_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_items_created (created_at),
  INDEX idx_items_status_type (status, item_type),
  FULLTEXT INDEX idx_items_search (title, description, location)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS finder_reports (
  id CHAR(36) PRIMARY KEY,
  item_id CHAR(36) NOT NULL,
  finder_id CHAR(36) NOT NULL,
  found_location VARCHAR(255) NOT NULL,
  found_date DATE NOT NULL,
  additional_details TEXT,
  received_by CHAR(36),
  received_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_finder_reports_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  CONSTRAINT fk_finder_reports_finder FOREIGN KEY (finder_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_finder_reports_received_by FOREIGN KEY (received_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_finder_reports_item (item_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS claims (
  id CHAR(36) PRIMARY KEY,
  item_id CHAR(36) NOT NULL,
  claimant_id CHAR(36) NOT NULL,
  reason TEXT NOT NULL,
  identifying_details TEXT NOT NULL,
  additional_info TEXT,
  contact_details VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  verification_notes TEXT,
  verified_by CHAR(36),
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_claims_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  CONSTRAINT fk_claims_claimant FOREIGN KEY (claimant_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_claims_verifier FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_claims_status (status),
  INDEX idx_claims_claimant (claimant_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admin_actions (
  id CHAR(36) PRIMARY KEY,
  admin_id CHAR(36) NOT NULL,
  action VARCHAR(80) NOT NULL,
  item_id CHAR(36),
  claim_id CHAR(36),
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_actions_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_actions_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL,
  CONSTRAINT fk_actions_claim FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE SET NULL,
  INDEX idx_actions_created (created_at)
) ENGINE=InnoDB;

INSERT IGNORE INTO campuses (id, name) VALUES
  ('00000000-0000-4000-8000-000000000001', 'Bellville'),
  ('00000000-0000-4000-8000-000000000002', 'District Six'),
  ('00000000-0000-4000-8000-000000000003', 'Mowbray'),
  ('00000000-0000-4000-8000-000000000004', 'Wellington');