-- =============================================================================
-- CampusConnect Database Schema (v2 — Super Admin Architecture)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS campusconnect
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campusconnect;

-- ─── 1. users ────────────────────────────────────────────────────────────────
-- role:   student (self-register) | admin (created by super_admin) | super_admin (seed only)
-- status: active (default) | inactive — inactive admins cannot login
CREATE TABLE IF NOT EXISTS users (
  id          INT           NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL,
  password    VARCHAR(255)  NOT NULL,
  role        ENUM('student','admin','super_admin') NOT NULL DEFAULT 'student',
  status      ENUM('active','inactive')             NOT NULL DEFAULT 'active',
  department  VARCHAR(100)  DEFAULT NULL,
  roll_number VARCHAR(50)   DEFAULT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── 2. events ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id                     INT          NOT NULL AUTO_INCREMENT,
  title                  VARCHAR(200) NOT NULL,
  description            TEXT         NOT NULL,
  venue                  VARCHAR(200) NOT NULL,
  event_date             DATETIME     NOT NULL,
  last_registration_date DATETIME     DEFAULT NULL,
  max_participants       INT          DEFAULT NULL,
  category               VARCHAR(100) DEFAULT NULL,
  image_url              VARCHAR(500) DEFAULT NULL,
  created_by             INT          NOT NULL,
  created_at             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_events_event_date (event_date),
  KEY idx_events_created_by (created_by),
  CONSTRAINT fk_events_created_by
    FOREIGN KEY (created_by) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── 3. event_form_fields ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_form_fields (
  id            INT          NOT NULL AUTO_INCREMENT,
  event_id      INT          NOT NULL,
  field_label   VARCHAR(200) NOT NULL,
  field_type    ENUM('text','number','email','select','textarea') NOT NULL,
  field_options TEXT         DEFAULT NULL,
  is_required   TINYINT(1)   NOT NULL DEFAULT 1,
  field_order   INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_form_fields_event_id (event_id),
  CONSTRAINT fk_form_fields_event_id
    FOREIGN KEY (event_id) REFERENCES events (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── 4. registrations ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS registrations (
  id            INT       NOT NULL AUTO_INCREMENT,
  event_id      INT       NOT NULL,
  user_id       INT       NOT NULL,
  registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status        ENUM('registered','cancelled') NOT NULL DEFAULT 'registered',
  PRIMARY KEY (id),
  UNIQUE KEY uq_registrations_event_user (event_id, user_id),
  KEY idx_registrations_user_id (user_id),
  CONSTRAINT fk_registrations_event_id
    FOREIGN KEY (event_id) REFERENCES events (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_registrations_user_id
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── 5. form_responses ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS form_responses (
  id              INT  NOT NULL AUTO_INCREMENT,
  registration_id INT  NOT NULL,
  field_id        INT  NOT NULL,
  answer          TEXT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_form_responses_registration_id (registration_id),
  KEY idx_form_responses_field_id (field_id),
  CONSTRAINT fk_form_responses_registration_id
    FOREIGN KEY (registration_id) REFERENCES registrations (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_form_responses_field_id
    FOREIGN KEY (field_id) REFERENCES event_form_fields (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── 6. notifications ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         INT          NOT NULL AUTO_INCREMENT,
  title      VARCHAR(200) NOT NULL,
  message    TEXT         NOT NULL,
  created_by INT          NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_created_at (created_at),
  KEY idx_notifications_created_by (created_by),
  CONSTRAINT fk_notifications_created_by
    FOREIGN KEY (created_by) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── 7. audit_logs ───────────────────────────────────────────────────────────
-- Records administrative actions. actor_id is NOT a foreign key to allow log
-- preservation even if a user is eventually deleted.
CREATE TABLE IF NOT EXISTS audit_logs (
  id          INT          NOT NULL AUTO_INCREMENT,
  actor_id    INT          NOT NULL,
  actor_role  VARCHAR(30)  NOT NULL,
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50)  DEFAULT NULL,
  entity_id   INT          DEFAULT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_actor_id (actor_id),
  KEY idx_audit_action (action),
  KEY idx_audit_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
