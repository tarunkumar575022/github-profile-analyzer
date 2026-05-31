CREATE DATABASE IF NOT EXISTS github_analyzer;
USE github_analyzer;

CREATE TABLE `profiles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL,
  `name` VARCHAR(200),
  `bio` TEXT,
  `avatar_url` VARCHAR(500),
  `github_url` VARCHAR(500),
  `public_repos` INT,
  `followers` INT,
  `following` INT,
  `total_stars` INT DEFAULT 0,
  `total_forks` INT DEFAULT 0,
  `most_used_language` VARCHAR(100),
  `top_repo_name` VARCHAR(200),
  `top_repo_stars` INT DEFAULT 0,
  `account_created_at` DATETIME,
  `last_analyzed_at` DATETIME,
  `top_languages` JSON,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
);

CREATE TABLE `repositories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `profile_id` INT NOT NULL,
  `repo_name` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `language` VARCHAR(100),
  `stars` INT DEFAULT 0,
  `forks` INT DEFAULT 0,
  `watchers` INT DEFAULT 0,
  `is_forked` TINYINT(1) DEFAULT 0,
  `repo_url` VARCHAR(500),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `profile_id` (`profile_id`),
  CONSTRAINT `repositories_ibfk_1` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Sample Data Insert
INSERT INTO `profiles` (`username`, `name`, `public_repos`, `followers`, `total_stars`, `most_used_language`) 
VALUES ('sampleuser', 'Sample User', 10, 50, 100, 'JavaScript');

INSERT INTO `repositories` (`profile_id`, `repo_name`, `language`, `stars`, `forks`) 
VALUES (1, 'sample-repo-1', 'JavaScript', 60, 10), 
       (1, 'sample-repo-2', 'TypeScript', 40, 5);
