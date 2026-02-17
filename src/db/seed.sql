-- =============================================
-- FEMUNDO CMS - Datos Iniciales (Seed)
-- Migración del contenido hardcodeado actual
-- =============================================

USE femundo_cms;

-- ===================================
-- USUARIO ADMINISTRADOR INICIAL
-- Password: FemundoAdmin2025! (bcrypt hash)
-- IMPORTANTE: Cambiar password inmediatamente en producción
-- ===================================
INSERT INTO users (email, password_hash, full_name, role, is_active) VALUES
('admin@femundo.org', '$2b$12$P1Aqwig1J6AkQ/xVPn6iJ.md82kQ7O06aITTGsQMqUxLpGazjuz4K', 'Administrador FEMUNDO', 'super_admin', TRUE);

-- ===================================
-- CONFIGURACIÓN DEL SITIO
-- ===================================
INSERT INTO site_settings (setting_key, setting_value, setting_type, category, description_es, description_en) VALUES
('site_title', 'FEMUNDO', 'text', 'general', 'Título del sitio', 'Site title'),
('site_subtitle', 'Federación Mundial de Dominó', 'text', 'general', 'Subtítulo del sitio', 'Site subtitle'),
('site_description_es', 'Sitio oficial de la Federación Mundial de Dominó. Información sobre torneos, eventos y competencias internacionales.', 'text', 'seo', 'Meta descripción en español', 'Spanish meta description'),
('site_description_en', 'Official website of the World Domino Federation. Information about tournaments, events and international competitions.', 'text', 'seo', 'Meta descripción en inglés', 'English meta description'),
('logo_url', '/icono.png', 'image', 'branding', 'Logo del sitio', 'Site logo'),
('logo_full_url', '/FEMUNDO.png', 'image', 'branding', 'Logo completo', 'Full logo'),
('logo_fallback_url', 'https://i.postimg.cc/L5hNTd9X/Femundo-Website-logo.png', 'url', 'branding', 'Logo de respaldo CDN', 'CDN fallback logo'),
('primary_color', '#1e3a8a', 'color', 'branding', 'Color primario', 'Primary color'),
('secondary_color', '#ff8c00', 'color', 'branding', 'Color secundario', 'Secondary color'),
('favicon_url', '/icono.png', 'image', 'branding', 'Favicon', 'Favicon'),
('splash_enabled', 'true', 'boolean', 'general', 'Mostrar splash screen', 'Show splash screen'),
('splash_duration', '3000', 'number', 'general', 'Duración del splash (ms)', 'Splash duration (ms)'),
('team_manager_url', 'https://domino.femundo.org/', 'url', 'general', 'URL del Team Manager externo', 'External Team Manager URL');

-- ===================================
-- ANUNCIO/MODAL
-- ===================================
INSERT INTO announcement (title_es, title_en, image_url, link_url, is_active, display_order) VALUES
('Copa de Naciones Panamá 2026', 'Panama Nations Cup 2026', '/images/events/flyers/panama2026.jpg', '/registro?evento=panama2026', TRUE, 1);

-- ===================================
-- HERO SECTION
-- ===================================
INSERT INTO hero_section (title_es, title_en, subtitle_es, subtitle_en, cta_text_es, cta_text_en, cta_url, is_active) VALUES
('FEDERACIÓN MUNDIAL DE DOMINÓ', 'WORLD DOMINO FEDERATION',
 'Uniendo culturas y naciones a través de la pasión por el dominó. Descubre torneos internacionales, eventos y competencias que reúnen a los mejores jugadores del mundo.',
 'Uniting cultures and nations through the passion for domino. Discover international tournaments, events and competitions that bring together the best players in the world.',
 'Próximos Eventos', 'Upcoming Events', '/eventos', TRUE);

-- ===================================
-- CAROUSEL SLIDES
-- ===================================
INSERT INTO carousel_slides (title_es, title_en, description_es, description_en, image_url, link_url, display_order, is_active, carousel_type) VALUES
('Mundial Barbados 2025', 'Barbados World Championship 2025', 'Próximo', 'Upcoming', '/images/events/flyers/barbados.jpg', '/registro?evento=barbados2025', 1, TRUE, 'hero'),
('Hospedaje Barbados 2025', 'Barbados 2025 Accommodation', 'Hospedaje', 'Accommodation', '/images/events/flyers/barbadoshospedajeespanol.jpg', NULL, 2, TRUE, 'hero'),
('Total en Premios Barbados', 'Barbados Total Prize Pool', 'Total en premios', 'Total Prize Pool', '/images/events/flyers/totalenpremiosbarbadosespanol.jpg', NULL, 3, TRUE, 'hero'),
('Elenco Barbados', 'Barbados Cast', 'Total en premios', 'Total Prize Pool', '/images/events/flyers/espanolelencobarbados.jpg', NULL, 4, TRUE, 'hero');

-- ===================================
-- ABOUT SECTION
-- ===================================
INSERT INTO about_section (title_es, title_en, content_es, content_en, display_order, is_active) VALUES
('Sobre FEMUNDO', 'About FEMUNDO',
 'La Federación Mundial de Dominó (FEMUNDO) es el organismo internacional que regula, promueve y desarrolla el juego de dominó a nivel mundial. Fundada en 2010, nuestra misión es elevar este juego tradicional a un deporte reconocido internacionalmente.',
 'The World Domino Federation (FEMUNDO) is the international body that regulates, promotes and develops the game of domino worldwide. Founded in 2010, our mission is to elevate this traditional game to an internationally recognized sport.',
 1, TRUE),
('Misión FEMUNDO', 'FEMUNDO Mission',
 'FEMUNDO organiza competiciones internacionales, establece reglas oficiales y trabaja con federaciones nacionales para promover el dominó como una actividad que une culturas y generaciones.',
 'FEMUNDO organizes international competitions, establishes official rules and works with national federations to promote domino as an activity that unites cultures and generations.',
 2, TRUE),
('Visión FEMUNDO', 'FEMUNDO Vision',
 'Con presencia en más de 40 países, nuestro objetivo es crear una comunidad global de entusiastas del dominó, desde jugadores profesionales hasta aficionados, preservando las tradiciones mientras innovamos en formatos de competición.',
 'With presence in more than 40 countries, our goal is to create a global community of domino enthusiasts, from professional players to amateurs, preserving traditions while innovating in competition formats.',
 3, TRUE);

-- ===================================
-- ESTADÍSTICAS
-- ===================================
INSERT INTO statistics (label_es, label_en, value, suffix, icon, display_order, is_active) VALUES
('Países Miembros', 'Member Countries', '15', '+', 'fas fa-globe-americas', 1, TRUE),
('Mundiales Realizados', 'Championships Held', '6', '', 'fas fa-trophy', 2, TRUE),
('Jugadores Afiliados', 'Affiliated Players', '2K', '+', 'fas fa-users', 3, TRUE),
('Eventos Anuales', 'Annual Events', '5', '+', 'fas fa-calendar-alt', 4, TRUE);

-- ===================================
-- VIDEO SECTION
-- ===================================
INSERT INTO video_section (title_es, title_en, subtitle_es, subtitle_en, video_url, video_type, is_active) VALUES
('Últimos Contenidos', 'Latest Content',
 'Descubre más sobre la Federación Mundial de Dominó y nuestros eventos internacionales',
 'Discover more about the World Domino Federation and our international events',
 'https://www.youtube.com/embed/IUeIhXcCock', 'youtube', TRUE);

-- ===================================
-- CONTACTO
-- ===================================
INSERT INTO contact_info (address_es, address_en, phone, email, whatsapp, facebook_url, instagram_url, youtube_url) VALUES
('337 Pienwild Ct Orlando, FL 32828, Estados Unidos',
 '337 Pienwild Ct Orlando, FL 32828, United States',
 '+1 407-232-5635',
 'femundoinfo@gmail.com',
 '+50767802790',
 'https://www.facebook.com/femundodomino',
 'https://www.instagram.com/femundoinfo',
 'https://www.youtube.com/@femundoinfo');

-- ===================================
-- EVENTOS
-- ===================================
INSERT INTO events (slug, name_es, name_en, description_es, description_en, location, country, start_date, end_date, flyer_image_url, cover_image_url, registration_url, gallery_url, status, is_featured, display_order) VALUES
('barbados2025', 'Mundial Barbados 2025', 'Barbados World Championship 2025', 'Campeonato mundial de dominó en Barbados', 'World domino championship in Barbados', 'Barbados', 'Barbados', '2025-11-01', '2025-11-05', '/images/events/flyers/barbados.jpg', '/images/events/flyers/barbados.jpg', '/registro?evento=barbados2025', NULL, 'upcoming', TRUE, 1),
('panama2026', 'Copa de Naciones Panamá 2026', 'Panama Nations Cup 2026', 'Copa de naciones de dominó en Panamá', 'Domino nations cup in Panama', 'Panamá', 'Panamá', '2026-01-01', '2026-01-05', '/images/events/flyers/panama2026.jpg', '/images/events/flyers/panama2026.jpg', '/registro?evento=panama2026', NULL, 'upcoming', TRUE, 2),
('panama2025', 'Copa de Naciones 2025', 'Nations Cup 2025', 'Copa de naciones de dominó en Panamá 2025', 'Domino nations cup in Panama 2025', 'Panamá', 'Panamá', '2025-01-01', '2025-01-05', NULL, '/images/events/panama2025/full/2.jpg', NULL, '/galeria', 'completed', TRUE, 3),
('santodomingo2022', 'Mundial Santo Domingo 2022', 'Santo Domingo World Championship 2022', 'Campeonato mundial de dominó en Santo Domingo', 'World domino championship in Santo Domingo', 'Santo Domingo', 'República Dominicana', '2022-01-01', '2022-01-05', NULL, '/images/events/santodomingo2022/15.jpg', NULL, '/mundialstd2022', 'completed', FALSE, 4);

-- ===================================
-- EVENT PRICING (Ejemplo Barbados 2025)
-- ===================================
INSERT INTO event_pricing (event_id, plan_name_es, plan_name_en, price, currency, description_es, description_en, features_es, features_en, stripe_link, is_active, is_recommended, display_order) VALUES
(1, 'Individual y Equipos', 'Individual and Teams', 258.00, 'USD', 'Acceso al torneo individual y por equipos', 'Access to individual and team tournament', '["Acceso al torneo individual", "Acceso al torneo por equipos"]', '["Individual tournament access", "Team tournament access"]', 'https://buy.stripe.com/6oU6oG8h2eH75ic2kt38406', TRUE, FALSE, 1),
(1, 'Individual y Equipos + Almuerzo + Cena', 'Individual and Teams + Lunch + Dinner', 715.00, 'USD', 'Acceso completo con alimentación', 'Full access with meals', '["Acceso al torneo individual", "Acceso al torneo por equipos", "Almuerzo y Cena de 4 días"]', '["Individual tournament access", "Team tournament access", "4-day Lunch and Dinner"]', 'https://buy.stripe.com/aFa7sK9l6buV6mgaQZ3840a', TRUE, FALSE, 2),
(1, 'Individual y Equipos + Parejas', 'Individual, Teams and Pairs', 310.00, 'USD', 'Acceso a todas las modalidades', 'Access to all modalities', '["Acceso al torneo individual", "Acceso al torneo por equipos", "Acceso al torneo por parejas"]', '["Individual tournament access", "Team tournament access", "Pairs tournament access"]', 'https://buy.stripe.com/fZu9AS40M2YpbGA2kt38407', TRUE, FALSE, 3),
(1, 'Individual y Equipos + Parejas + Almuerzo', 'Individual, Teams, Pairs + Lunch', 540.00, 'USD', 'Acceso completo con almuerzo', 'Full access with lunch', '["Acceso al torneo individual", "Acceso al torneo por equipos", "Acceso al torneo por parejas", "Almuerzo de 4 días"]', '["Individual tournament access", "Team tournament access", "Pairs tournament access", "4-day Lunch"]', 'https://buy.stripe.com/eVqeVc68UcyZeSM3ox38408', TRUE, FALSE, 4),
(1, 'Individual y Equipos + Parejas + Almuerzo + Cena', 'Individual, Teams, Pairs + Lunch + Dinner', 765.00, 'USD', 'Paquete completo recomendado', 'Recommended complete package', '["Acceso al torneo individual", "Acceso al torneo por equipos", "Acceso al torneo por parejas", "Cena de 4 días"]', '["Individual tournament access", "Team tournament access", "Pairs tournament access", "4-day Dinner"]', 'https://buy.stripe.com/dRm4gyeFq0QheSM8IR38409', TRUE, TRUE, 5),
(1, 'Individual y Equipos + Almuerzo', 'Individual and Teams + Lunch', 485.00, 'USD', 'Acceso al torneo con almuerzo', 'Tournament access with lunch', '["Acceso al torneo individual", "Acceso al torneo por equipos", "Almuerzo de 4 días"]', '["Individual tournament access", "Team tournament access", "4-day Lunch"]', 'https://buy.stripe.com/4gM14mbtefLbaCw0cl3840b', TRUE, FALSE, 6);

-- ===================================
-- CATEGORÍAS DE EQUIPO/DIRECTIVA
-- ===================================
INSERT INTO team_categories (name_es, name_en, slug, icon, display_order, is_active) VALUES
('Junta Directiva', 'Board of Directors', 'junta-directiva', 'fas fa-crown', 1, TRUE),
('Comisión Ejecutiva', 'Executive Committee', 'comision-ejecutiva', 'fas fa-users-cog', 2, TRUE),
('Tribunal Disciplinario - Consejo de Honor', 'Disciplinary Court - Honor Council', 'tribunal-disciplinario', 'fas fa-balance-scale', 3, TRUE),
('Coordinadores y Vocales', 'Coordinators and Board Members', 'coordinadores', 'fas fa-sitemap', 4, TRUE);

-- ===================================
-- MIEMBROS DEL EQUIPO/DIRECTIVA
-- ===================================

-- Junta Directiva (category_id = 1)
INSERT INTO team_members (category_id, full_name, position_es, position_en, country, country_flag, photo_url, bio_es, bio_en, email, phone, display_order, is_active) VALUES
(1, 'Raymond Henry Ysabel', 'Presidente', 'President', 'USA', '🇺🇸', '/images/directiva/raymondysable.jpg',
 'Ingeniero electricista, técnico industrial y empresario dominicano-estadounidense. COO de KR Construction Group Inc. y presidente de FEMUNDO desde 2016.',
 'Electrical engineer, industrial technician and Dominican-American businessman. COO of KR Construction Group Inc. and president of FEMUNDO since 2016.',
 'rysabel911@gmail.com', '+1 (407) 232-5635', 1, TRUE),

(1, 'Gypsy Córdova', 'Primer Vicepresidente Ejecutivo', 'First Executive Vice President', 'Puerto Rico', '🇵🇷', '/images/directiva/gypsy.jpg',
 'Ingeniero con 40 años en la Industria Eléctrica de PR. Director del Departamento de Alumbrado Público. Miembro fundador de FEMUNDO en 2015.',
 'Engineer with 40 years in the PR Electric Industry. Director of the Public Lighting Department. Founding member of FEMUNDO in 2015.',
 'gypsycordova@hotmail.com', '+1 (787) 444-4343', 2, TRUE),

(1, 'Robinson Parra', 'Tercer Vicepresidente', 'Third Vice President', 'República Dominicana', '🇩🇴', '/images/directiva/parra.jpg',
 'Ingeniero Civil y agrimensor. Presidente de la Federación Dominicana de Dominó (FEDEDODO) desde 2020.',
 'Civil Engineer and surveyor. President of the Dominican Domino Federation (FEDEDODO) since 2020.',
 'fededodo.info@gmail.com', '+1 (809) 979-9197', 3, TRUE),

(1, 'Yasmery González', 'Secretaria General', 'General Secretary', 'Venezuela', '🇻🇪', '/images/directiva/yasmerygon.jpg',
 'Profesora de Metodología jubilada de la Universidad Pedagógica Experimental Libertador. PhD en Educación. Atleta de dominó desde 1997.',
 'Retired Methodology Professor from Libertador Experimental Pedagogical University. PhD in Education. Domino athlete since 1997.',
 'yasmerigonzalez@gmail.com', '+58 414-3110922', 4, TRUE),

(1, 'Stivens Ruiz', 'Tesorero', 'Treasurer', 'Colombia', '🇨🇴', '/images/directiva/stevenrui.jpg',
 'Administrador de Empresas con Especialidad en Alta Gerencia. Experto en desarrollo de redes en telecomunicaciones con +20 años en el sector.',
 'Business Administrator with Specialty in Senior Management. Expert in telecommunications network development with +20 years in the sector.',
 NULL, '+57 316 4030079', 5, TRUE),

(1, 'Gustavo Torres Deco', 'Contralor General', 'General Comptroller', 'USA', '🇺🇸', '/images/directiva/gustavotorres.jpg',
 'Responsable del control y supervisión de las operaciones financieras y administrativas de FEMUNDO.',
 'Responsible for the control and supervision of FEMUNDO''s financial and administrative operations.',
 'contacto@femundo.org', NULL, 6, TRUE);

-- Comisión Ejecutiva (category_id = 2)
INSERT INTO team_members (category_id, full_name, position_es, position_en, country, country_flag, photo_url, bio_es, bio_en, email, phone, display_order, is_active) VALUES
(2, 'Iván Velásquez', 'Secretario Relaciones y Representante Atletas', 'Relations Secretary and Athletes Representative', 'Panamá', '🇵🇦', '/images/directiva/ivanvela.jpg',
 'Magister en administración de empresas. Líder y miembro de la asociación de dominó de Panamá con +20 años representando la selección nacional.',
 'Master in business administration. Leader and member of Panama''s domino association with +20 years representing the national team.',
 'Velasquezivanpanama@gmail.com', '+507 6780-2790', 1, TRUE),

(2, 'Manuel Acevedo', 'Secretario de Asuntos Electrónicos y Redes', 'Secretary of Electronic Affairs and Networks', 'República Dominicana', '🇩🇴', '/images/directiva/manuelacevedo.jpg',
 'Editor deportivo del canal CDN. Narrador y comentarista en ligas deportivas dominicanas. Coordinador de comunicaciones internacionales de FEMUNDO.',
 'Sports editor of CDN channel. Narrator and commentator in Dominican sports leagues. FEMUNDO''s international communications coordinator.',
 'acevedocueto@gmail.com', '+1 (849) 342-4574', 2, TRUE),

(2, 'Juan José Ortiz', 'Secretario de Organización y Mesa Técnica', 'Organization Secretary and Technical Committee', 'Puerto Rico', '🇵🇷', '/images/directiva/juanjoseorti.jpg',
 'Bachillerato en Estadísticas por UPR. 31 años en el servicio público. Director de Informática y programas computarizados para campeonatos de dominó.',
 'Bachelor''s in Statistics from UPR. 31 years in public service. IT Director and computerized programs for domino championships.',
 'juanj.ortiz@yahoo.com', '+1 (787) 354-2240', 3, TRUE),

(2, 'Rafael Aguilera', 'Asesor Legal', 'Legal Advisor', 'República Dominicana', '🇩🇴', '/images/directiva/rafaelaguila.jpg',
 'Abogado con maestría en derecho administrativo y gestión municipal. Vicepresidente de ADOSADO y presidente del club de Dominó La Torre Los Alcarrizos.',
 'Lawyer with master''s degree in administrative law and municipal management. Vice President of ADOSADO and president of La Torre Los Alcarrizos Domino club.',
 NULL, '+1 (809) 474-2278', 4, TRUE),

(2, 'Geraldo Augusto Colón Olivero', 'Director Técnico (D. T.)', 'Technical Director (T. D.)', 'República Dominicana', '🇩🇴', '/images/directiva/yumarreplace.jpg',
 'Diplomado en Comercio Exterior. Secretario de A/C ADOSADO. Presidente y Capitán del Club de Dominó Paz sin Fronteras.',
 'Graduate in Foreign Trade. Secretary of A/C ADOSADO. President and Captain of the Domino Club Paz sin Fronteras.',
 'colongeraldo@hotmail.com', '+1 (829) 636-2311', 5, TRUE),

(2, 'Domingo Quiroz', 'Fiscal General Federado Interno', 'Internal Federal General Prosecutor', 'USA', '🇺🇸', '/images/directiva/domingoquiroz.jpg',
 'Dominista residente en Orlando. Propietario del club de dominó "Los Temibles". Comerciante y ganadero en Florida y República Dominicana.',
 'Domino player residing in Orlando. Owner of "Los Temibles" domino club. Merchant and rancher in Florida and Dominican Republic.',
 NULL, '+1 (347) 469-2117', 6, TRUE);

-- Tribunal Disciplinario (category_id = 3)
INSERT INTO team_members (category_id, full_name, position_es, position_en, country, country_flag, photo_url, bio_es, bio_en, email, phone, display_order, is_active) VALUES
(3, 'Manuel Tejeda', 'Juez Presidente', 'Presiding Judge', 'República Dominicana', '🇩🇴', '/images/directiva/manueltejeda.jpg',
 'Presidente del Tribunal Disciplinario de FEMUNDO, responsable de la administración de justicia deportiva en la federación.',
 'President of FEMUNDO''s Disciplinary Court, responsible for the administration of sports justice in the federation.',
 NULL, '+1 (809) 419-6476', 1, TRUE),

(3, 'Julio Espedy Suriel', 'Juez Vicepresidente', 'Vice President Judge', 'República Dominicana', '🇩🇴', '/images/directiva/julioespduriel.jpg',
 'Licenciado en Comunicación Social. Relacionista Público de FEDEDODO y Presidente de ADOSADO. Director técnico y ex jefe de árbitros de FEDEDODO.',
 'Bachelor''s in Social Communication. Public Relations of FEDEDODO and President of ADOSADO. Technical director and former chief referee of FEDEDODO.',
 NULL, '+1 (809) 442-7411', 2, TRUE),

(3, 'Denys Pou', 'Juez Secretario', 'Secretary Judge', 'República Dominicana', '🇩🇴', '/images/directiva/denyspou.jpg',
 'Técnico contable con diplomado en etiqueta, protocolo y montaje de eventos. Entrenadora de ping pong en el club Banreservas.',
 'Accounting technician with diploma in etiquette, protocol and event management. Ping pong trainer at Banreservas club.',
 'denys_rivas@hotmail.com', '+1 (809) 839-3555', 3, TRUE);

-- Coordinadores y Vocales (category_id = 4)
INSERT INTO team_members (category_id, full_name, position_es, position_en, country, country_flag, photo_url, bio_es, bio_en, email, phone, display_order, is_active) VALUES
(4, 'Margarita Álvarez', 'Primer Vocal', 'First Board Member', 'Venezuela', '🇻🇪', '/images/directiva/margaritaalva.jpg',
 'Representante vocal de Venezuela en la junta directiva de FEMUNDO.',
 'Venezuela''s board representative in FEMUNDO''s board of directors.',
 NULL, NULL, 1, TRUE),

(4, 'Glen Caven', 'Segundo Vocal', 'Second Board Member', 'Jamaica', '🇯🇲', '/images/directiva/glencaven.jpg',
 'Organizador y promotor del dominó en el sur de Florida durante 20 años. Anfitrión del torneo de dominó para adultos mayores del estado de Florida.',
 'Organizer and promoter of domino in South Florida for 20 years. Host of Florida state seniors domino tournament.',
 NULL, '+1 (407) 701-7829', 2, TRUE),

(4, 'Christiand Romel Grain M', 'Tercer Vocal', 'Third Board Member', 'Panamá', '🇵🇦', '/images/directiva/christiandr.jpg',
 'Representante vocal de Panamá en la estructura organizacional de FEMUNDO.',
 'Panama''s board representative in FEMUNDO''s organizational structure.',
 NULL, NULL, 3, TRUE),

(4, 'Joan H. Santos Soto', 'Coordinador Internacional', 'International Coordinator', 'República Dominicana', '🇩🇴', '/images/directiva/juansantos.png',
 'BBA, MBA. Autor del libro "Dominó Moderno versus Dominó Tradicional". Educador y promotor del deporte con +12 años en eventos internacionales.',
 'BBA, MBA. Author of the book "Modern Domino versus Traditional Domino". Educator and sport promoter with +12 years in international events.',
 'joan.santos.soto@gmail.com', '+1 (787) 484-7320', 4, TRUE),

(4, 'Luis Felipe Sardo', 'Coordinador Internacional de Clubes', 'International Clubs Coordinator', 'Chile', '🇨🇱', '/images/directiva/luisfelipes.jpg',
 'Coordinador de clubes de dominó a nivel internacional para el continente sudamericano, representando a Chile.',
 'International domino clubs coordinator for South America, representing Chile.',
 NULL, NULL, 5, TRUE),

(4, 'Said Ashuba', 'Coordinador Continente Europeo y Asia', 'European and Asian Continent Coordinator', 'Abjasia', '🇬🇪', '/images/directiva/saidashuba.jpg',
 'Presidente del club internacional de dominó "Sukhum". Entrenador principal del equipo nacional de Abjasia. Diputado de la Asamblea de la Ciudad de Sukhumi.',
 'President of the international domino club "Sukhum". Head coach of Abkhazia''s national team. Deputy of Sukhumi City Assembly.',
 NULL, NULL, 6, TRUE),

(4, 'Gustavo Adolfo Romero', 'Coordinador Internacional de Clubes USA', 'USA International Clubs Coordinator', 'USA', '🇺🇸', '/images/directiva/gustavoadolfo.jpg',
 'Mejor jugador de USA 2023. Ganador de eliminatorias del club de Tampa por 6 años consecutivos. Medalla de bronce en el IV Mundial de Barranquilla, Colombia.',
 'Best USA player 2023. Winner of Tampa club qualifiers for 6 consecutive years. Bronze medal at the IV World Championship in Barranquilla, Colombia.',
 NULL, '+1 (727) 743-5655', 7, TRUE),

(4, 'Ivan Tomás Britton Livingston', 'Coordinador Islas Colombia', 'Colombia Islands Coordinator', 'Colombia - San Andrés', '🇨🇴', '/images/directiva/ivanbrito.jpg',
 'Magíster y presidente del Club deportivo de Dominó Big Boys en San Andrés Isla. Contratista Profesional en la Gobernación en el Área de Educación.',
 'Master''s degree and president of Big Boys Sports Domino Club in San Andrés Island. Professional Contractor at the Governor''s Office in the Education Area.',
 'ivtoli@hotmail.com', '+57 315 758 7389', 8, TRUE),

(4, 'Mayra Rodríguez', 'Coordinadora Eventos Femeninos', 'Women''s Events Coordinator', 'Puerto Rico', '🇵🇷', '/images/directiva/nouser.jpg',
 'Licenciada en patología del habla y lenguaje. Primera mujer árbitro internacional, primera mujer presidente de la Federación de dominó de PR y primera mujer presidente de FEMUNDO.',
 'Licensed in speech and language pathology. First woman international referee, first woman president of PR''s domino Federation and first woman president of FEMUNDO.',
 NULL, '+1 (787) 632-3735', 9, TRUE);

-- ===================================
-- GALERÍA - ÁLBUMS
-- ===================================
INSERT INTO gallery_albums (slug, title_es, title_en, description_es, description_en, cover_image_url, event_id, is_active, display_order) VALUES
('panama2025', 'Copa de Naciones 2025', 'Nations Cup 2025', 'Galería oficial del evento más prestigioso del dominó internacional', 'Official gallery of the most prestigious international domino event', '/images/events/panama2025/full/2.jpg', 3, TRUE, 1),
('santodomingo2022', 'Mundial Santo Domingo 2022', 'Santo Domingo World Championship 2022', 'Campeonato mundial de dominó 2022', 'World domino championship 2022', '/images/events/santodomingo2022/15.jpg', 4, TRUE, 2);

-- ===================================
-- GALERÍA - IMÁGENES (Copa de Naciones Panama 2025)
-- ===================================
INSERT INTO gallery_images (album_id, image_url, thumbnail_url, display_order) VALUES
(1, '/images/events/panama2025/full/2.jpg', '/images/events/panama2025/thumbs/2.jpg', 1),
(1, '/images/events/panama2025/full/3.jpg', '/images/events/panama2025/thumbs/3.jpg', 2),
(1, '/images/events/panama2025/full/4.jpg', '/images/events/panama2025/thumbs/4.jpg', 3),
(1, '/images/events/panama2025/full/5.jpg', '/images/events/panama2025/thumbs/5.jpg', 4),
(1, '/images/events/panama2025/full/6.jpg', '/images/events/panama2025/thumbs/6.jpg', 5),
(1, '/images/events/panama2025/full/7.jpg', '/images/events/panama2025/thumbs/7.jpg', 6),
(1, '/images/events/panama2025/full/8.jpg', '/images/events/panama2025/thumbs/8.jpg', 7),
(1, '/images/events/panama2025/full/10.jpg', '/images/events/panama2025/thumbs/10.jpg', 8),
(1, '/images/events/panama2025/full/11.jpg', '/images/events/panama2025/thumbs/11.jpg', 9),
(1, '/images/events/panama2025/full/12.jpg', '/images/events/panama2025/thumbs/12.jpg', 10),
(1, '/images/events/panama2025/full/13.jpg', '/images/events/panama2025/thumbs/13.jpg', 11),
(1, '/images/events/panama2025/full/14.jpg', '/images/events/panama2025/thumbs/14.jpg', 12),
(1, '/images/events/panama2025/full/15.jpg', '/images/events/panama2025/thumbs/15.jpg', 13),
(1, '/images/events/panama2025/full/16.jpg', '/images/events/panama2025/thumbs/16.jpg', 14),
(1, '/images/events/panama2025/full/17.jpg', '/images/events/panama2025/thumbs/17.jpg', 15),
(1, '/images/events/panama2025/full/18.jpg', '/images/events/panama2025/thumbs/18.jpg', 16),
(1, '/images/events/panama2025/full/19.jpg', '/images/events/panama2025/thumbs/19.jpg', 17),
(1, '/images/events/panama2025/full/21.jpg', '/images/events/panama2025/thumbs/21.jpg', 18),
(1, '/images/events/panama2025/full/22.jpg', '/images/events/panama2025/thumbs/22.jpg', 19),
(1, '/images/events/panama2025/full/23.jpg', '/images/events/panama2025/thumbs/23.jpg', 20),
(1, '/images/events/panama2025/full/24.jpg', '/images/events/panama2025/thumbs/24.jpg', 21),
(1, '/images/events/panama2025/full/25.jpg', '/images/events/panama2025/thumbs/25.jpg', 22),
(1, '/images/events/panama2025/full/26.jpg', '/images/events/panama2025/thumbs/26.jpg', 23),
(1, '/images/events/panama2025/full/27.jpg', '/images/events/panama2025/thumbs/27.jpg', 24),
(1, '/images/events/panama2025/full/28.jpg', '/images/events/panama2025/thumbs/28.jpg', 25),
(1, '/images/events/panama2025/full/29.jpg', '/images/events/panama2025/thumbs/29.jpg', 26),
(1, '/images/events/panama2025/full/30.jpg', '/images/events/panama2025/thumbs/30.jpg', 27),
(1, '/images/events/panama2025/full/31.jpg', '/images/events/panama2025/thumbs/31.jpg', 28),
(1, '/images/events/panama2025/full/32.jpg', '/images/events/panama2025/thumbs/32.jpg', 29),
(1, '/images/events/panama2025/full/33.jpg', '/images/events/panama2025/thumbs/33.jpg', 30),
(1, '/images/events/panama2025/full/34.jpg', '/images/events/panama2025/thumbs/34.jpg', 31),
(1, '/images/events/panama2025/full/36.jpg', '/images/events/panama2025/thumbs/36.jpg', 32);

-- ===================================
-- FEDERACIONES NACIONALES
-- ===================================
INSERT INTO federations (country, country_flag, name_es, name_en, president, description_es, description_en, is_active, display_order) VALUES
('Estados Unidos', '🇺🇸', 'Federación de Dominó de Estados Unidos', 'United States Domino Federation', NULL, 'Federación nacional de dominó de los Estados Unidos, con clubes activos en Florida, Nueva York y otras ciudades.', 'National domino federation of the United States, with active clubs in Florida, New York and other cities.', TRUE, 1),
('Puerto Rico', '🇵🇷', 'Federación de Dominó de Puerto Rico', 'Puerto Rico Domino Federation', NULL, 'Federación puertorriqueña de dominó con una rica tradición en el deporte y participación activa en competencias internacionales.', 'Puerto Rican domino federation with a rich tradition in the sport and active participation in international competitions.', TRUE, 2),
('República Dominicana', '🇩🇴', 'Federación Dominicana de Dominó (FEDEDODO)', 'Dominican Domino Federation (FEDEDODO)', 'Robinson Parra', 'Federación Dominicana de Dominó, una de las más activas en el circuito internacional con múltiples clubes y ligas.', 'Dominican Domino Federation, one of the most active in the international circuit with multiple clubs and leagues.', TRUE, 3),
('Colombia', '🇨🇴', 'Federación Colombiana de Dominó', 'Colombian Domino Federation', NULL, 'Federación de dominó de Colombia, con fuerte presencia en torneos internacionales y desarrollo del deporte a nivel nacional.', 'Colombian domino federation, with strong presence in international tournaments and national sport development.', TRUE, 4),
('Venezuela', '🇻🇪', 'Federación Venezolana de Dominó', 'Venezuelan Domino Federation', NULL, 'Federación venezolana de dominó, cuna de grandes jugadores con una larga historia en el deporte.', 'Venezuelan domino federation, birthplace of great players with a long history in the sport.', TRUE, 5),
('Panamá', '🇵🇦', 'Asociación de Dominó de Panamá', 'Panama Domino Association', NULL, 'Asociación panameña de dominó, anfitrión de múltiples eventos internacionales incluyendo la Copa de Naciones.', 'Panamanian domino association, host of multiple international events including the Nations Cup.', TRUE, 6),
('Jamaica', '🇯🇲', 'Federación de Dominó de Jamaica', 'Jamaica Domino Federation', NULL, 'Federación jamaiquina de dominó con participación activa en competencias del Caribe e internacionales.', 'Jamaican domino federation with active participation in Caribbean and international competitions.', TRUE, 7),
('Chile', '🇨🇱', 'Federación Chilena de Dominó', 'Chilean Domino Federation', NULL, 'Federación de dominó de Chile, representando al cono sur en las competencias internacionales de FEMUNDO.', 'Chilean domino federation, representing the southern cone in FEMUNDO international competitions.', TRUE, 8),
('Abjasia', '🇬🇪', 'Club Internacional de Dominó Sukhum', 'Sukhum International Domino Club', 'Said Ashuba', 'Club internacional de dominó con sede en Sukhum, representando la región en competencias europeas y asiáticas.', 'International domino club based in Sukhum, representing the region in European and Asian competitions.', TRUE, 9);

-- ===================================
-- NAVEGACIÓN
-- ===================================
INSERT INTO navigation_items (label_es, label_en, url, target, icon, display_order, is_active, location) VALUES
('Inicio', 'Home', '/#inicio', '_self', NULL, 1, TRUE, 'both'),
('Reglas', 'Rules', '/reglamento', '_self', NULL, 2, TRUE, 'header'),
('Eventos', 'Events', '/eventos', '_self', NULL, 3, TRUE, 'both'),
('Nosotros', 'About Us', '/#nosotros', '_self', NULL, 4, TRUE, 'both'),
('Directiva', 'Board', '/directiva', '_self', NULL, 5, TRUE, 'header'),
('Federaciones', 'Federations', '/federaciones', '_self', NULL, 6, TRUE, 'header'),
('Multimedia', 'Multimedia', '/multimedia', '_self', NULL, 7, TRUE, 'header'),
('Contacto', 'Contact', '/#contacto', '_self', NULL, 8, TRUE, 'both'),
('Noticias', 'News', '/noticias', '_self', NULL, 9, TRUE, 'header'),
('Team Manager.', 'Team Manager.', 'https://domino.femundo.org/', '_blank', NULL, 10, TRUE, 'header');

-- ===================================
-- FOOTER CONTENT
-- ===================================
INSERT INTO footer_content (section_key, title_es, title_en, content_es, content_en, display_order, is_active) VALUES
('description', 'FEMUNDO', 'FEMUNDO', 'Federación Mundial de Dominó, uniendo culturas y jugadores alrededor del mundo desde 2010.', 'World Domino Federation, uniting cultures and players around the world since 2010.', 1, TRUE),
('quick_links', 'Enlaces rápidos', 'Quick Links', NULL, NULL, 2, TRUE),
('resources', 'Recursos', 'Resources', NULL, NULL, 3, TRUE),
('newsletter', 'Boletín informativo', 'Newsletter', 'Suscríbete para recibir noticias y actualizaciones', 'Subscribe to receive news and updates', 4, TRUE),
('copyright', 'Copyright', 'Copyright', '© 2025 FEMUNDO - Federación Mundial de Dominó. Todos los derechos reservados.', '© 2025 FEMUNDO - World Domino Federation. All rights reserved.', 5, TRUE);

-- ===================================
-- TRADUCCIONES (del translations.js)
-- ===================================
INSERT INTO translations (translation_key, value_es, value_en, category) VALUES
-- Navegación
('nav.inicio', 'Inicio', 'Home', 'nav'),
('nav.reglas', 'Reglas', 'Rules', 'nav'),
('nav.eventos', 'Eventos', 'Events', 'nav'),
('nav.nosotros', 'Nosotros', 'About Us', 'nav'),
('nav.contacto', 'Contacto', 'Contact', 'nav'),
('nav.teamManager', 'Team Manager.', 'Team Manager.', 'nav'),
-- Hero
('hero.title', 'FEDERACIÓN MUNDIAL DE DOMINÓ', 'WORLD DOMINO FEDERATION', 'hero'),
('hero.subtitle', 'Uniendo culturas y naciones a través de la pasión por el dominó. Descubre torneos internacionales, eventos y competencias que reúnen a los mejores jugadores del mundo.', 'Uniting cultures and nations through the passion for domino. Discover international tournaments, events and competitions that bring together the best players in the world.', 'hero'),
('hero.cta', 'Próximos Eventos', 'Upcoming Events', 'hero'),
-- Eventos
('events.title', 'Eventos Destacados', 'Featured Events', 'events'),
('events.copa2025', 'Copa de Naciones 2025', 'Nations Cup 2025', 'events'),
('events.viewGallery', 'Ver Galería', 'View Gallery', 'events'),
-- About
('about.title', 'Sobre FEMUNDO', 'About FEMUNDO', 'about'),
('about.paragraph1', 'La Federación Mundial de Dominó (FEMUNDO) es el organismo internacional que regula, promueve y desarrolla el juego de dominó a nivel mundial. Fundada en 2010, nuestra misión es elevar este juego tradicional a un deporte reconocido internacionalmente.', 'The World Domino Federation (FEMUNDO) is the international body that regulates, promotes and develops the game of domino worldwide. Founded in 2010, our mission is to elevate this traditional game to an internationally recognized sport.', 'about'),
('about.paragraph2', 'FEMUNDO organiza competiciones internacionales, establece reglas oficiales y trabaja con federaciones nacionales para promover el dominó como una actividad que une culturas y generaciones.', 'FEMUNDO organizes international competitions, establishes official rules and works with national federations to promote domino as an activity that unites cultures and generations.', 'about'),
('about.paragraph3', 'Con presencia en más de 40 países, nuestro objetivo es crear una comunidad global de entusiastas del dominó, desde jugadores profesionales hasta aficionados, preservando las tradiciones mientras innovamos en formatos de competición.', 'With presence in more than 40 countries, our goal is to create a global community of domino enthusiasts, from professional players to amateurs, preserving traditions while innovating in competition formats.', 'about'),
-- Stats
('stats.countries', 'Países Miembros', 'Member Countries', 'stats'),
('stats.championships', 'Mundiales Realizados', 'Championships Held', 'stats'),
('stats.players', 'Jugadores Afiliados', 'Affiliated Players', 'stats'),
('stats.events', 'Eventos Anuales', 'Annual Events', 'stats'),
-- Video
('video.title', 'Últimos Contenidos', 'Latest Content', 'video'),
('video.subtitle', 'Descubre más sobre la Federación Mundial de Dominó y nuestros eventos internacionales', 'Discover more about the World Domino Federation and our international events', 'video'),
-- Contact
('contact.title', 'Contáctanos', 'Contact Us', 'contact'),
('contact.subtitle', '¿Tienes alguna pregunta o comentario? Estamos aquí para ayudarte.', 'Do you have any questions or comments? We are here to help you.', 'contact'),
('contact.address', 'Dirección', 'Address', 'contact'),
('contact.phone', 'Teléfono', 'Phone', 'contact'),
('contact.email', 'Email', 'Email', 'contact'),
-- Footer
('footer.quickLinks', 'Enlaces rápidos', 'Quick Links', 'footer'),
('footer.resources', 'Recursos', 'Resources', 'footer'),
('footer.newsletter', 'Boletín informativo', 'Newsletter', 'footer'),
('footer.newsletterText', 'Suscríbete para recibir noticias y actualizaciones', 'Subscribe to receive news and updates', 'footer'),
('footer.subscribe', 'Suscribirse', 'Subscribe', 'footer'),
('footer.emailPlaceholder', 'Tu correo electrónico', 'Your email address', 'footer'),
('footer.description', 'Federación Mundial de Dominó, uniendo culturas y jugadores alrededor del mundo desde 2010.', 'World Domino Federation, uniting cultures and players around the world since 2010.', 'footer'),
('footer.copyright', '© 2025 FEMUNDO - Federación Mundial de Dominó. Todos los derechos reservados.', '© 2025 FEMUNDO - World Domino Federation. All rights reserved.', 'footer'),
('footer.officialRules', 'Reglas oficiales', 'Official Rules', 'footer'),
('footer.eventCalendar', 'Calendario de eventos', 'Event Calendar', 'footer'),
('footer.nationalFederations', 'Federaciones nacionales', 'National Federations', 'footer'),
('footer.featuredPlayers', 'Jugadores destacados', 'Featured Players', 'footer'),
('footer.results', 'Resultados', 'Results', 'footer'),
-- General
('general.readMore', 'Leer más', 'Read more', 'general'),
('general.viewAll', 'Ver todos', 'View all', 'general'),
('general.loading', 'Cargando...', 'Loading...', 'general'),
('general.register', 'Inscribirse', 'Register', 'general'),
('general.backToHome', 'Volver al inicio', 'Back to Home', 'general');

-- ===================================
-- ARTÍCULOS DE EJEMPLO
-- ===================================
INSERT INTO articles (slug, title_es, title_en, excerpt_es, excerpt_en, content_es, content_en, hero_image_url, category, status, is_featured, pub_date, author_id) VALUES
('mundial-barbados-2025-anuncio',
 'FEMUNDO anuncia el Mundial de Dominó Barbados 2025',
 'FEMUNDO announces the Barbados 2025 World Domino Championship',
 'La Federación Mundial de Dominó confirma la celebración del próximo campeonato mundial en Barbados, programado para noviembre de 2025.',
 'The World Domino Federation confirms the next world championship in Barbados, scheduled for November 2025.',
 '<p>La Federación Mundial de Dominó (FEMUNDO) se complace en anunciar oficialmente la celebración del <strong>Campeonato Mundial de Dominó Barbados 2025</strong>, que se llevará a cabo del 1 al 5 de noviembre de 2025.</p><p>Este evento reunirá a los mejores jugadores de dominó del mundo, representando a más de 15 países en diversas modalidades: individual, por equipos y por parejas.</p><p>Las inscripciones ya están abiertas a través de nuestra plataforma oficial. Los participantes pueden elegir entre diferentes paquetes que incluyen acceso al torneo, alimentación y hospedaje.</p><p>FEMUNDO invita a todas las federaciones nacionales afiliadas a preparar sus selecciones para este importante evento que promete ser el más grande en la historia de nuestra organización.</p>',
 '<p>The World Domino Federation (FEMUNDO) is pleased to officially announce the <strong>Barbados 2025 World Domino Championship</strong>, to be held from November 1-5, 2025.</p><p>This event will bring together the best domino players in the world, representing more than 15 countries in various modalities: individual, teams and pairs.</p><p>Registrations are now open through our official platform. Participants can choose from different packages that include tournament access, meals and accommodation.</p><p>FEMUNDO invites all affiliated national federations to prepare their teams for this important event that promises to be the largest in our organization''s history.</p>',
 '/images/events/flyers/barbados.jpg', 'eventos', 'published', TRUE, '2025-06-01 10:00:00', 1),

('copa-naciones-panama-2025-resultados',
 'Exitosa Copa de Naciones Panamá 2025',
 'Successful Panama Nations Cup 2025',
 'La Copa de Naciones 2025 celebrada en Panamá fue un éxito rotundo con la participación de delegaciones de múltiples países.',
 'The 2025 Nations Cup held in Panama was a resounding success with delegations from multiple countries.',
 '<p>La <strong>Copa de Naciones 2025</strong> celebrada en la Ciudad de Panamá concluyó con gran éxito, consolidando a FEMUNDO como la principal organización mundial del dominó.</p><p>El evento contó con la participación de delegaciones de Estados Unidos, Puerto Rico, República Dominicana, Colombia, Venezuela, Panamá, Jamaica y Chile, entre otros países.</p><p>Durante cuatro días de intensa competencia, los jugadores demostraron el más alto nivel del dominó internacional en las modalidades individual, por equipos y por parejas.</p><p>FEMUNDO agradece a la Asociación de Dominó de Panamá por su excelente organización y hospitalidad, así como a todos los atletas, árbitros y voluntarios que hicieron posible este evento.</p>',
 '<p>The <strong>2025 Nations Cup</strong> held in Panama City concluded with great success, consolidating FEMUNDO as the main world domino organization.</p><p>The event featured delegations from the United States, Puerto Rico, Dominican Republic, Colombia, Venezuela, Panama, Jamaica and Chile, among other countries.</p><p>During four days of intense competition, players demonstrated the highest level of international domino in individual, team and pairs modalities.</p><p>FEMUNDO thanks the Panama Domino Association for their excellent organization and hospitality, as well as all athletes, referees and volunteers who made this event possible.</p>',
 '/images/events/panama2025/full/2.jpg', 'eventos', 'published', TRUE, '2025-02-15 09:00:00', 1),

('femundo-crecimiento-2025',
 'FEMUNDO continúa su expansión internacional en 2025',
 'FEMUNDO continues its international expansion in 2025',
 'La federación suma nuevos países miembros y fortalece su presencia en Europa y Asia a través de coordinadores regionales.',
 'The federation adds new member countries and strengthens its presence in Europe and Asia through regional coordinators.',
 '<p>En su compromiso constante con el crecimiento del dominó a nivel mundial, <strong>FEMUNDO</strong> continúa expandiendo su presencia internacional durante 2025.</p><p>La federación ha fortalecido sus lazos con organizaciones de dominó en Europa y Asia, gracias al trabajo de coordinadores como Said Ashuba, quien lidera las operaciones en el continente europeo y asiático desde Abjasia.</p><p>En América Latina, las federaciones de Colombia, Chile y Venezuela han reportado un incremento significativo en la cantidad de jugadores federados, lo que demuestra el creciente interés por el dominó competitivo en la región.</p><p>FEMUNDO reafirma su misión de elevar el dominó a la categoría de deporte reconocido internacionalmente, preservando las tradiciones culturales mientras innova en formatos de competición.</p>',
 '<p>In its constant commitment to the growth of domino worldwide, <strong>FEMUNDO</strong> continues to expand its international presence during 2025.</p><p>The federation has strengthened its ties with domino organizations in Europe and Asia, thanks to the work of coordinators like Said Ashuba, who leads operations in the European and Asian continent from Abkhazia.</p><p>In Latin America, the federations of Colombia, Chile and Venezuela have reported a significant increase in the number of federated players, demonstrating the growing interest in competitive domino in the region.</p><p>FEMUNDO reaffirms its mission to elevate domino to the category of internationally recognized sport, preserving cultural traditions while innovating in competition formats.</p>',
 '/images/events/flyers/barbados.jpg', 'institucional', 'published', FALSE, '2025-04-10 14:00:00', 1),

('reglamento-oficial-actualizacion',
 'Actualización del Reglamento Oficial de Dominó FEMUNDO',
 'Update of FEMUNDO Official Domino Rules',
 'FEMUNDO publica la versión actualizada del reglamento oficial que regirá las competencias internacionales a partir de 2025.',
 'FEMUNDO publishes the updated version of the official rules that will govern international competitions from 2025.',
 '<p>FEMUNDO ha publicado la versión actualizada de su <strong>Reglamento Oficial de Dominó</strong>, el cual entrará en vigencia para todas las competencias internacionales a partir del año 2025.</p><p>Las principales actualizaciones incluyen ajustes en los tiempos de juego, clarificaciones sobre las reglas de parejas y equipos, y nuevos protocolos para la mesa técnica y el arbitraje electrónico.</p><p>El comité técnico, liderado por Juan José Ortiz, trabajó durante varios meses en la revisión del documento, incorporando sugerencias de árbitros y jugadores de diferentes países.</p><p>El reglamento completo está disponible para descarga en la sección de Reglas de nuestro sitio web oficial.</p>',
 '<p>FEMUNDO has published the updated version of its <strong>Official Domino Rules</strong>, which will take effect for all international competitions starting in 2025.</p><p>The main updates include adjustments to game times, clarifications on pairs and team rules, and new protocols for the technical table and electronic refereeing.</p><p>The technical committee, led by Juan José Ortiz, worked for several months on reviewing the document, incorporating suggestions from referees and players from different countries.</p><p>The complete rules are available for download in the Rules section of our official website.</p>',
 NULL, 'reglamento', 'published', FALSE, '2025-01-20 08:00:00', 1);
