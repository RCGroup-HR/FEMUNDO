import type { APIRoute } from 'astro';
import { query, execute } from '../../../db/connection';
import { authMiddleware, requireRole, logActivity, getClientIP, jsonResponse, errorResponse } from '../../../lib/auth';
import { parseBody } from '../../../lib/helpers';

export const prerender = false;

// Auto-create table and seed default data if table doesn't exist
async function ensureTable() {
  try {
    await query('SELECT 1 FROM regulation_sections LIMIT 1');
  } catch {
    // Table doesn't exist — create it
    await execute(`
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
      ) ENGINE=InnoDB
    `);

    // Seed default data from hardcoded content
    const seeds = getDefaultSeeds();
    for (const s of seeds) {
      await execute(
        `INSERT INTO regulation_sections (section_key, title_es, title_en, content_es, content_en, icon, section_type, display_order, is_active) VALUES (?,?,?,?,?,?,?,?,?)`,
        [s.section_key, s.title_es, s.title_en, s.content_es, s.content_en, s.icon || null, s.section_type, s.display_order, 1]
      );
    }
  }
}

function getDefaultSeeds() {
  return [
    {
      section_key: 'objetivo',
      title_es: 'Articulo 1: Objetivo',
      title_en: 'Article 1: Objective',
      content_es: '<p>Los Campeonatos Mundiales de FEMUNDO, tiene por objetivo promover la sana competencia, el juego limpio, la amistad, el respeto y el reencuentro con otros atletas del mundo. Todos estos valores son supremos, y por tal razon los involucrados deben hacer su maximo esfuerzo para tal fin.</p>',
      content_en: '<p>The FEMUNDO World Championships aim to promote healthy competition, fair play, friendship, respect and reunion with other athletes from around the world. All these values are supreme, and for this reason those involved must make their maximum effort for this purpose.</p>',
      icon: '1',
      section_type: 'article',
      display_order: 1,
    },
    {
      section_key: 'modalidades',
      title_es: 'Articulo 2: Modalidades de Competencia',
      title_en: 'Article 2: Competition Modalities',
      content_es: `<p>La competencia sera en dos modalidades:</p>
<ul>
  <li><strong>a) Individual</strong></li>
  <li><strong>b) Por equipos</strong> conformados por cuatro (4) atletas</li>
</ul>
<p>En caso de alguna eventualidad, la Comision Tecnica se reservara el derecho de asignar atletas sustitutos, si fuera necesario (enfermedad, retiro o alguna otra fuerza mayor distinta a la expulsion por violacion a este reglamento).</p>`,
      content_en: `<p>The competition will be in two modalities:</p>
<ul>
  <li><strong>a) Individual</strong></li>
  <li><strong>b) By teams</strong> consisting of four (4) athletes</li>
</ul>
<p>In case of any eventuality, the Technical Commission reserves the right to assign substitute athletes, if necessary (illness, withdrawal or any other force majeure other than expulsion for violation of these regulations).</p>`,
      icon: '2',
      section_type: 'article',
      display_order: 2,
    },
    {
      section_key: 'clasificacion',
      title_es: 'Articulo 3: Criterios de Clasificacion',
      title_en: 'Article 3: Classification Criteria',
      content_es: `<p>La clasificacion, sera de acuerdo con los siguientes criterios:</p>
<ol>
  <li>Partidas ganadas</li>
  <li>Efectividad</li>
  <li>Puntos a favor</li>
</ol>
<div class="alert-reglamento alert-info-r">
  <strong>Recomendacion:</strong> Se recomienda anotar todos los puntos que se obtengan en cada partida.
</div>`,
      content_en: `<p>The classification will be according to the following criteria:</p>
<ol>
  <li>Games won</li>
  <li>Effectiveness</li>
  <li>Points in favor</li>
</ol>
<div class="alert-reglamento alert-info-r">
  <strong>Recommendation:</strong> It is recommended to record all points obtained in each game.
</div>`,
      icon: '3',
      section_type: 'article',
      display_order: 3,
    },
    {
      section_key: 'uniforme',
      title_es: 'Articulo 4: Uniforme',
      title_en: 'Article 4: Uniform',
      content_es: `<h4>Parte superior:</h4>
<p>Es obligatorio, el uso de chemisse, polo, camisa, camiseta con mangas, que identifiquen el equipo.</p>
<h4>Parte inferior:</h4>
<ul>
  <li>Pantalon largo deportivos</li>
  <li>Jeans sin rotos ni gastados o rasgados</li>
  <li>Pantalon de vestir o casuales</li>
</ul>
<h4>Calzado:</h4>
<p>Zapatos cuero o deportivo, sandalias.</p>
<div class="alert-reglamento alert-danger-r">
  <strong>PROHIBIDO:</strong> NO se aceptara el uso de pantalones cortos, pantaloncillos playeros, ni cholas de bano (chancletas).
</div>`,
      content_en: `<h4>Upper part:</h4>
<p>It is mandatory to wear a shirt, polo, shirt, t-shirt with sleeves, that identify the team.</p>
<h4>Lower part:</h4>
<ul>
  <li>Long sports pants</li>
  <li>Jeans without holes or worn or torn</li>
  <li>Dress or casual pants</li>
</ul>
<h4>Footwear:</h4>
<p>Leather or sports shoes, sandals.</p>
<div class="alert-reglamento alert-danger-r">
  <strong>PROHIBITED:</strong> The use of shorts, beach shorts, or bathroom slippers (flip-flops) will NOT be accepted.
</div>`,
      icon: '4',
      section_type: 'article',
      display_order: 4,
    },
    {
      section_key: 'sanciones',
      title_es: 'Articulo 5: Sanciones',
      title_en: 'Article 5: Sanctions',
      content_es: `<p>Las sanciones seran unipersonales en la modalidad individual y equipo (el descuento se hara al atleta infractor). En la modalidad parejas, ambos recibiran la sancion. En la mayoria de las sanciones aplicadas <strong>NO</strong> se rompera la mano, se aplicara la sancion y la mano continua. Se jugara con todos los dobles que el atleta levante.</p>
<h4>Excepciones para romper una mano:</h4>
<ul>
  <li><strong>Chivo que provoca 4 o mas jugadas:</strong> Se rompe la mano y se penaliza al infractor (80) (Tarjeta Amarilla).</li>
  <li><strong>Pase con ficha:</strong> Se rompe la mano y se penaliza al infractor (80) (Tarjeta Amarilla).</li>
  <li><strong>Tranque falso:</strong> Se rompe la mano y se penaliza al infractor (40).</li>
</ul>`,
      content_en: `<p>Sanctions will be individual in the individual and team modality (the discount will be made to the offending athlete). In the pairs modality, both will receive the sanction. In most of the sanctions applied, the hand will <strong>NOT</strong> be broken, the sanction will be applied and the hand continues. It will be played with all the doubles that the athlete raises.</p>
<h4>Exceptions to break a hand:</h4>
<ul>
  <li><strong>Goat that causes 4 or more plays:</strong> The hand is broken and the offender is penalized (80) (Yellow Card).</li>
  <li><strong>Pass with tile:</strong> The hand is broken and the offender is penalized (80) (Yellow Card).</li>
  <li><strong>False block:</strong> The hand is broken and the offender is penalized (40).</li>
</ul>`,
      icon: '5',
      section_type: 'article',
      display_order: 5,
    },
    {
      section_key: 'duracion',
      title_es: 'Articulo 6: Duracion de las Partidas',
      title_en: 'Article 6: Duration of Games',
      content_es: '<p>Las partidas tendran una duracion de <strong>40 minutos o 200 tantos</strong> (lo que ocurra primero). Si el tiempo reglamentario termino, ninguna partida puede finalizar con la imposicion de una penalidad que implique romper la mano. Se juega con 7 fichas por atleta.</p>',
      content_en: '<p>Games will have a duration of <strong>40 minutes or 200 points</strong> (whichever comes first). If regulation time is over, no game can end with the imposition of a penalty that involves breaking the hand. It is played with 7 tiles per athlete.</p>',
      icon: '6',
      section_type: 'article',
      display_order: 6,
    },
    {
      section_key: 'puntualidad',
      title_es: 'Articulo 7: Puntualidad',
      title_en: 'Article 7: Punctuality',
      content_es: '<p>El atleta que no este sentado en la mesa dos (2) minutos despues de comenzada la ronda perdera <strong>200 a 00</strong> (Tarjeta Amarilla). Ganaran los presentes 100 a 00.</p>',
      content_en: '<p>The athlete who is not seated at the table two (2) minutes after the round has started will lose <strong>200 to 00</strong> (Yellow Card). Those present will win 100 to 00.</p>',
      icon: '7',
      section_type: 'article',
      display_order: 7,
    },
    {
      section_key: 'tarjetas',
      title_es: 'Sistema de Tarjetas y Sanciones',
      title_en: 'Card and Sanctions System',
      content_es: `<div class="tarjeta-box tarjeta-amarilla">
  <h4><i class="fas fa-exclamation-triangle"></i> Tarjeta Amarilla</h4>
  <p><strong>Descripcion:</strong> Producto de una falta leve o acumulacion de dos amonestaciones disciplinarias.</p>
  <p><strong>Causas principales:</strong></p>
  <ul>
    <li>Fumar, comer o beber en el area de competencia</li>
    <li>Retraso de dos (2) minutos a la mesa de juego asignada</li>
    <li>Chivo y pase con ficha (descuento de 80 puntos)</li>
    <li>Reclamar airadamente al companero, rivales, arbitro o autoridad</li>
  </ul>
</div>
<div class="tarjeta-box tarjeta-roja">
  <h4><i class="fas fa-ban"></i> Tarjeta Roja</h4>
  <p><strong>Descripcion:</strong> Producto de una falta grave o acumulacion de dos Tarjetas Amarillas. Conlleva a la perdida de la partida 00 a 200.</p>
  <p><strong>Causas principales:</strong></p>
  <ul>
    <li>Estar bajo los efectos del alcohol o sustancias psicotropicas</li>
    <li>No portar el carnet o el uniforme sin autorizacion escrita</li>
    <li>Abandonar la mesa de juego sin autorizacion</li>
    <li>Portar armas de fuego en el area de competencia</li>
  </ul>
</div>
<div class="tarjeta-box tarjeta-negra">
  <h4><i class="fas fa-times-circle"></i> Tarjeta Negra</h4>
  <p><strong>Descripcion:</strong> Producto de una falta muy grave. Conlleva a la perdida de la partida 00 a 200 y a la expulsion de la competencia.</p>
  <p><strong>Causas principales:</strong></p>
  <ul>
    <li>Demostrar conducta antideportiva (marcar fichas, esconder fichas, etc.)</li>
    <li>Producir agresion fisica a otro atleta</li>
    <li>Realizar apuestas durante la competencia</li>
    <li>Presuncion de senas</li>
  </ul>
</div>`,
      content_en: `<div class="tarjeta-box tarjeta-amarilla">
  <h4><i class="fas fa-exclamation-triangle"></i> Yellow Card</h4>
  <p><strong>Description:</strong> Result of a minor offense or accumulation of two disciplinary warnings.</p>
  <p><strong>Main causes:</strong></p>
  <ul>
    <li>Smoking, eating or drinking in the competition area</li>
    <li>Delay of two (2) minutes to the assigned game table</li>
    <li>Goat and pass with tile (80 point discount)</li>
    <li>Angrily complaining to teammate, rivals, referee or authority</li>
  </ul>
</div>
<div class="tarjeta-box tarjeta-roja">
  <h4><i class="fas fa-ban"></i> Red Card</h4>
  <p><strong>Description:</strong> Result of a serious offense or accumulation of two Yellow Cards. Leads to losing the game 00 to 200.</p>
  <p><strong>Main causes:</strong></p>
  <ul>
    <li>Being under the influence of alcohol or psychotropic substances</li>
    <li>Not carrying the ID card or uniform without written authorization</li>
    <li>Leaving the game table without authorization</li>
    <li>Carrying firearms in the competition area</li>
  </ul>
</div>
<div class="tarjeta-box tarjeta-negra">
  <h4><i class="fas fa-times-circle"></i> Black Card</h4>
  <p><strong>Description:</strong> Result of a very serious offense. Leads to losing the game 00 to 200 and expulsion from the competition.</p>
  <p><strong>Main causes:</strong></p>
  <ul>
    <li>Showing unsportsmanlike conduct (marking tiles, hiding tiles, etc.)</li>
    <li>Physical aggression against another athlete</li>
    <li>Making bets during the competition</li>
    <li>Presumption of signals</li>
  </ul>
</div>`,
      icon: 'fa-bolt',
      section_type: 'card_system',
      display_order: 8,
    },
    {
      section_key: 'comision',
      title_es: 'Comision Tecnica',
      title_en: 'Technical Commission',
      content_es: `<div class="comision-grid">
  <div class="miembro-card-reglamento">
    <h5>DIRECTOR GENERAL DEL EVENTO</h5>
    <p class="fw-bold">RAYMOND YSABEL</p>
  </div>
  <div class="miembro-card-reglamento">
    <h5>DIRECTOR TECNICO</h5>
    <p class="fw-bold">JUAN JOSE ORTIZ</p>
    <small>+1 7873542240</small>
  </div>
  <div class="miembro-card-reglamento">
    <h5>DIRECTOR DE INFORMATICA</h5>
    <p class="fw-bold">RONNI HERNANDEZ</p>
  </div>
  <div class="miembro-card-reglamento">
    <h5>ARBITRO PRINCIPAL</h5>
    <p class="fw-bold">PATRICIA LOPEZ</p>
    <small>+1 7876750944</small>
  </div>
</div>
<h4>Contactos para consultas:</h4>
<div class="contactos-grid">
  <div class="contacto-card">
    <strong>Juan Jose Ortiz:</strong><br>
    <a href="tel:+17873542240">+1 787-354-2240</a>
  </div>
  <div class="contacto-card">
    <strong>Patricia Lopez:</strong><br>
    <a href="tel:+17876750944">+1 787-675-0944</a>
  </div>
  <div class="contacto-card">
    <strong>Joan Santos:</strong><br>
    <a href="tel:+17874847320">+1 787-484-7320</a>
  </div>
</div>`,
      content_en: `<div class="comision-grid">
  <div class="miembro-card-reglamento">
    <h5>EVENT GENERAL DIRECTOR</h5>
    <p class="fw-bold">RAYMOND YSABEL</p>
  </div>
  <div class="miembro-card-reglamento">
    <h5>TECHNICAL DIRECTOR</h5>
    <p class="fw-bold">JUAN JOSE ORTIZ</p>
    <small>+1 7873542240</small>
  </div>
  <div class="miembro-card-reglamento">
    <h5>IT DIRECTOR</h5>
    <p class="fw-bold">RONNI HERNANDEZ</p>
  </div>
  <div class="miembro-card-reglamento">
    <h5>CHIEF REFEREE</h5>
    <p class="fw-bold">PATRICIA LOPEZ</p>
    <small>+1 7876750944</small>
  </div>
</div>
<h4>Contact for inquiries:</h4>
<div class="contactos-grid">
  <div class="contacto-card">
    <strong>Juan Jose Ortiz:</strong><br>
    <a href="tel:+17873542240">+1 787-354-2240</a>
  </div>
  <div class="contacto-card">
    <strong>Patricia Lopez:</strong><br>
    <a href="tel:+17876750944">+1 787-675-0944</a>
  </div>
  <div class="contacto-card">
    <strong>Joan Santos:</strong><br>
    <a href="tel:+17874847320">+1 787-484-7320</a>
  </div>
</div>`,
      icon: 'fa-users',
      section_type: 'commission',
      display_order: 9,
    },
    {
      section_key: 'disposicion_final',
      title_es: 'Disposicion Final',
      title_en: 'Final Provision',
      content_es: '<p class="lead">Lo no previsto en este Reglamento sera competencia de la Comision Tecnica, quien dictara sentencia despues de reunirse y analizar el caso.</p>',
      content_en: '<p class="lead">What is not provided for in these Regulations will be the responsibility of the Technical Commission, who will issue a ruling after meeting and analyzing the case.</p>',
      icon: 'fa-gavel',
      section_type: 'final',
      display_order: 10,
    },
  ];
}

export const GET: APIRoute = async () => {
  try {
    await ensureTable();
    const data = await query('SELECT * FROM regulation_sections ORDER BY display_order ASC');
    return jsonResponse({ data });
  } catch (err: any) {
    console.error('Error fetching regulations:', err);
    return errorResponse('Error al obtener reglamento', 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody<any>(request);
  if (!body) return errorResponse('Datos invalidos', 400);

  const result = await execute(
    `INSERT INTO regulation_sections (section_key, title_es, title_en, content_es, content_en, icon, section_type, display_order, is_active)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      body.section_key || '',
      body.title_es || null,
      body.title_en || null,
      body.content_es || null,
      body.content_en || null,
      body.icon || null,
      body.section_type || 'article',
      body.display_order || 0,
      body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
    ]
  );

  await logActivity(user.id, 'create', 'regulation_sections', result.insertId, null, getClientIP(request));
  return jsonResponse({ message: 'Seccion creada', id: result.insertId });
};

export const PUT: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin', 'editor');
  if (roleError) return errorResponse(roleError, 403);

  const body = await parseBody<any>(request);
  if (!body || !body.id) return errorResponse('ID requerido', 400);

  await execute(
    `UPDATE regulation_sections SET section_key=?, title_es=?, title_en=?, content_es=?, content_en=?,
     icon=?, section_type=?, display_order=?, is_active=? WHERE id=?`,
    [
      body.section_key || '',
      body.title_es || null,
      body.title_en || null,
      body.content_es || null,
      body.content_en || null,
      body.icon || null,
      body.section_type || 'article',
      body.display_order || 0,
      body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
      body.id,
    ]
  );

  await logActivity(user.id, 'update', 'regulation_sections', body.id, null, getClientIP(request));
  return jsonResponse({ message: 'Seccion actualizada' });
};

export const DELETE: APIRoute = async ({ request }) => {
  const { user, error } = await authMiddleware(request);
  if (error || !user) return errorResponse(error || 'No autenticado', 401);
  const roleError = requireRole(user, 'super_admin', 'admin');
  if (roleError) return errorResponse(roleError, 403);

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return errorResponse('ID requerido', 400);

  await execute('DELETE FROM regulation_sections WHERE id = ?', [id]);
  await logActivity(user.id, 'delete', 'regulation_sections', parseInt(id), null, getClientIP(request));
  return jsonResponse({ message: 'Seccion eliminada' });
};
