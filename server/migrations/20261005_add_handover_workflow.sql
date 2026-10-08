USE lost_and_found_db;

ALTER TABLE items
  ADD COLUMN received_by VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  ADD COLUMN received_at TIMESTAMP NULL,
  ADD COLUMN returned_to VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  ADD COLUMN returned_by VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  ADD COLUMN returned_at TIMESTAMP NULL,
  ADD CONSTRAINT fk_items_received_by FOREIGN KEY (received_by) REFERENCES users(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_items_returned_to FOREIGN KEY (returned_to) REFERENCES users(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_items_returned_by FOREIGN KEY (returned_by) REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE finder_reports (
  id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci PRIMARY KEY,
  item_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  finder_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  found_location VARCHAR(255) NOT NULL,
  found_date DATE NOT NULL,
  additional_details TEXT,
  received_by VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  received_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_finder_reports_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  CONSTRAINT fk_finder_reports_finder FOREIGN KEY (finder_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_finder_reports_received_by FOREIGN KEY (received_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_finder_reports_item (item_id, created_at)
) ENGINE=InnoDB;