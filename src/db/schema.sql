-- =============================================
-- FEMUNDO CMS - Esquema de Base de Datos
-- MySQL 8.0+
-- =============================================

CREATE DATABASE IF NOT EXISTS femundo_cms
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE femundo_cms;

-- ===================================
-- TABLA: users (Usuarios del admin)
-- ===================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'admin', 'editor', 'viewer') NOT NULL DEFAULT 'editor',
  avatar_url VARCHAR(500) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  allowed_modules JSON NULL,
  last_login DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_username (username),
  INDEX idx_users_role (role),
  INDEX idx_users_active (is_active)
) ENGINE=InnoDB;

-- ===================================
-- TABLA: site_settings (Config global)
-- ===================================
CREATE TABLE IF NOT EXISTS site_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type ENUM('text', 'image', 'color', 'url', 'number', 'boolean', 'json') DEFAULT 'text',
  category VARCHAR(50) DEFAULT 'general',
  description_es VARCHAR(255),
  description_en VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_settings_key (setting_key),
  INDEX idx_settings_category (category)
) ENGINE=InnoDB;

-- ===================================
-- TABLA: announcement (Modal inicial)
-- ===================================
CREATE TABLE IF NOT EXISTS announcement (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title_es VARCHAR(255),
  title_en VARCHAR(255),
  image_url VARCHAR(500) NOT NULL,
  link_url VARCHAR(500) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  start_date DATE NULL,
  end_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_announcement_active (is_active)
) ENGINE=InnoDB;

-- ===================================
-- TABLA: hero_section
-- ===================================
CREATE TABLE IF NOT EXISTS hero_section (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title_es VARCHAR(500),
  title_en VARCHAR(500),
  subtitle_es TEXT,
  subtitle_en TEXT,
  cta_text_es VARCHAR(100),
  cta_text_en VARCHAR(100),
  cta_url VARCHAR(500),
  background_image_url VARCHAR(500),
  overlay_gradient VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===================================
-- TABLA: carousel_slides
-- ===================================
CREATE TABLE IF NOT EXISTS carousel_slides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title_es VARCHAR(255),
  title_en VARCHAR(255),
  description_es TEXT,
  description_en TEXT,
  image_url VARCHAR(500) NOT NULL,
  link_url VARCHAR(500),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  carousel_type ENUM('hero', 'mini') DEFAULT 'hero',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_carousel_order (display_order),
  INDEX idx_carousel_active (is_active),
  INDEX idx_carousel_type (carousel_type)
) ENGINE=InnoDB;

-- ===================================
-- TABLA: about_section
-- ===================================
CREATE TABLE IF NOT EXISTS about_section (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title_es VARCHAR(255),
  title_en VARCHAR(255),
  content_es TEXT,
  content_en TEXT,
  image_url VARCHAR(500),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===================================
-- TABLA: statistics
-- ===================================
CREATE TABLE IF NOT EXISTS statistics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label_es VARCHAR(100) NOT NULL,
  label_en VARCHAR(100) NOT NULL,
  value VARCHAR(50) NOT NULL,
  suffix VARCHAR(10) DEFAULT '',
  icon VARCHAR(50),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_stats_order (display_order)
) ENGINE=InnoDB;

-- ===================================
-- TABLA: video_section
-- ===================================
CREATE TABLE IF NOT EXISTS video_section (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title_es VARCHAR(255),
  title_en VARCHAR(255),
  subtitle_es TEXT,
  subtitle_en TEXT,
  video_url VARCHAR(500) NOT NULL,
  video_type ENUM('youtube', 'vimeo', 'direct') DEFAULT 'youtube',
  multimedia_video_url VARCHAR(500) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===================================
-- TABLA: contact_info
-- ===================================
CREATE TABLE IF NOT EXISTS contact_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  address_es TEXT,
  address_en TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  whatsapp VARCHAR(50),
  facebook_url VARCHAR(500),
  instagram_url VARCHAR(500),
  youtube_url VARCHAR(500),
  twitter_url VARCHAR(500),
  map_embed_url TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===================================
-- TABLA: articles (Blog/Noticias)
-- ===================================
CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title_es VARCHAR(500) NOT NULL,
  title_en VARCHAR(500),
  excerpt_es TEXT,
  excerpt_en TEXT,
  content_es LONGTEXT,
  content_en LONGTEXT,
  hero_image_url VARCHAR(500),
  category VARCHAR(100),
  tags JSON,
  author_id INT,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  featured_order INT DEFAULT 0,
  views_count INT DEFAULT 0,
  pub_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_articles_slug (slug),
  INDEX idx_articles_status (status),
  INDEX idx_articles_featured (is_featured),
  INDEX idx_articles_pub_date (pub_date),
  INDEX idx_articles_category (category)
) ENGINE=InnoDB;

-- ===================================
-- TABLA: featured_articles
-- ===================================
CREATE TABLE IF NOT EXISTS featured_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  display_order INT DEFAULT 0,
  custom_title_es VARCHAR(500),
  custom_title_en VARCHAR(500),
  custom_image_url VARCHAR(500),
  highlight_color VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  INDEX idx_featured_order (display_order),
  INDEX idx_featured_active (is_active)
) ENGINE=InnoDB;

-- ===================================
-- TABLA: events (Eventos)
-- ===================================
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  name_es VARCHAR(500) NOT NULL,
  name_en VARCHAR(500),
  description_es TEXT,
  description_en TEXT,
  location VARCHAR(255),
  country VARCHAR(100),
  start_date DATE,
  end_date DATE,
  flyer_image_url VARCHAR(500),
  cover_image_url VARCHAR(500),
  registration_url VARCHAR(500),
  gallery_url VARCHAR(500),
  status ENUM('upcoming', 'active', 'completed', 'cancelled') DEFAULT 'upcoming',
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_events_slug (slug),
  INDEX idx_events_status (status),
  INDEX idx_events_featured (is_featured),
  INDEX idx_events_dates (start_date, end_date)
) ENGINE=InnoDB;

-- ===================================
-- TABLA: event_pricing
-- ===================================
CREATE TABLE IF NOT EXISTS event_pricing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  plan_name_es VARCHAR(255),
  plan_name_en VARCHAR(255),
  price DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'USD',
  description_es TEXT,
  description_en TEXT,
  features_es JSON,
  features_en JSON,
  stripe_link VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  is_recommended BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_pricing_event (event_id),
  INDEX idx_pricing_active (is_active)
) ENGINE=InnoDB;

-- ===================================
-- TABLA: team_categories
-- ===================================
CREATE TABLE IF NOT EXISTS team_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name_es VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  slug VARCHAR(255) NOT NULL UNIQUE,
  icon VARCHAR(50),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_team_cat_slug (slug),
  INDEX idx_team_cat_order (display_order)
) ENGINE=InnoDB;

-- ===================================
-- TABLA: team_members (Directiva)
-- ===================================
CREATE TABLE IF NOT EXISTS team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  full_name VARCHAR(255) NOT NULL,
  position_es VARCHAR(255),
  position_en VARCHAR(255),
  country VARCHAR(100),
  country_flag VARCHAR(10),
  photo_url VARCHAR(500),
  bio_es TEXT,
  bio_en TEXT,
  email VARCHAR(255),
  phone VARCHAR(50),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES team_categories(id) ON DELETE SET NULL,
  INDEX idx_team_category (category_id),
  INDEX idx_team_order (display_order)
) ENGINE=InnoDB;

-- ===================================
-- TABLA: gallery_albums
-- ===================================
CREATE TABLE IF NOT EXISTS gallery_albums (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title_es VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  description_es TEXT,
  description_en TEXT,
  cover_image_url VARCHAR(500),
  event_id INT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
  INDEX idx_gallery_slug (slug),
  INDEX idx_gallery_order (display_order)
) ENGINE=InnoDB;

-- ===================================
-- TABLA: gallery_images
-- ===================================
CREATE TABLE IF NOT EXISTS gallery_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  album_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  caption_es VARCHAR(500),
  caption_en VARCHAR(500),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (album_id) REFERENCES gallery_albums(id) ON DELETE CASCADE,
  INDEX idx_gallery_img_album (album_id),
  INDEX idx_gallery_img_order (display_order)
) ENGINE=InnoDB;

-- ===================================
-- TABLA: federations (Federaciones Nacionales)
-- ===================================
CREATE TABLE IF NOT EXISTS federations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  country VARCHAR(100) NOT NULL,
  country_flag VARCHAR(10),
  name_es VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  president VARCHAR(255),
  website_url VARCHAR(500),
  facebook_url VARCHAR(500),
  instagram_url VARCHAR(500),
  logo_url VARCHAR(500),
  description_es TEXT,
  description_en TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_federations_country (country),
  INDEX idx_federations_order (display_order),
  INDEX idx_federations_active (is_active)
) ENGINE=InnoDB;

-- ===================================
-- TABLA: event_results (Resultados de Eventos)
-- ===================================
CREATE TABLE IF NOT EXISTS event_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  category_es VARCHAR(255),
  category_en VARCHAR(255),
  position INT,
  player_name VARCHAR(255),
  team_name VARCHAR(255),
  country VARCHAR(100),
  country_flag VARCHAR(10),
  prize VARCHAR(100),
  notes TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_results_event (event_id),
  INDEX idx_results_position (position)
) ENGINE=InnoDB;

-- ===================================
-- TABLA: navigation_items
-- ===================================
CREATE TABLE IF NOT EXISTS navigation_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label_es VARCHAR(100) NOT NULL,
  label_en VARCHAR(100),
  url VARCHAR(500) NOT NULL,
  target ENUM('_self', '_blank') DEFAULT '_self',
  icon VARCHAR(50),
  parent_id INT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  location ENUM('header', 'footer', 'both') DEFAULT 'header',
  FOREIGN KEY (parent_id) REFERENCES navigation_items(id) ON DELETE CASCADE,
  INDEX idx_nav_order (display_order),
  INDEX idx_nav_location (location)
) ENGINE=InnoDB;

-- ===================================
-- TABLA: footer_content
-- ===================================
CREATE TABLE IF NOT EXISTS footer_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_key VARCHAR(50) NOT NULL UNIQUE,
  title_es VARCHAR(255),
  title_en VARCHAR(255),
  content_es TEXT,
  content_en TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===================================
-- TABLA: translations
-- ===================================
CREATE TABLE IF NOT EXISTS translations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  translation_key VARCHAR(255) NOT NULL UNIQUE,
  value_es TEXT NOT NULL,
  value_en TEXT,
  category VARCHAR(50) DEFAULT 'general',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_translations_key (translation_key),
  INDEX idx_translations_category (category)
) ENGINE=InnoDB;

-- ===================================
-- TABLA: media (Archivos subidos)
-- ===================================
CREATE TABLE IF NOT EXISTS media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  mime_type VARCHAR(100),
  file_size INT,
  file_path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500),
  alt_text_es VARCHAR(255),
  alt_text_en VARCHAR(255),
  uploaded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_media_type (mime_type),
  INDEX idx_media_date (created_at)
) ENGINE=InnoDB;

-- ===================================
-- TABLA: activity_log (Auditoría)
-- ===================================
CREATE TABLE IF NOT EXISTS activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  details JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_activity_user (user_id),
  INDEX idx_activity_date (created_at),
  INDEX idx_activity_entity (entity_type, entity_id)
) ENGINE=InnoDB;

-- ===================================
-- TABLA: regulation_sections (Reglamento)
-- ===================================
CREATE TABLE IF NOT EXISTS regulation_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_key VARCHAR(100) NOT NULL,
  title_es VARCHAR(500),
  title_en VARCHAR(500),
  content_es LONGTEXT,
  content_en LONGTEXT,
  icon VARCHAR(50) DEFAULT NULL,
  section_type ENUM('article', 'card_system', 'commission', 'final') DEFAULT 'article',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reg_order (display_order),
  INDEX idx_reg_active (is_active)
) ENGINE=InnoDB;
