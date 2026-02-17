import mysql from 'mysql2/promise';

// En producción, si DB_HOST no es localhost/127.0.0.1 o si DB_SSL=true,
// activar SSL para encriptar la conexión con la BD.
const DB_HOST = import.meta.env.DB_HOST || 'localhost';
const useSSL =
  import.meta.env.DB_SSL === 'true' ||
  (DB_HOST !== 'localhost' && DB_HOST !== '127.0.0.1');

const pool = mysql.createPool({
  host: DB_HOST,
  port: parseInt(import.meta.env.DB_PORT || '3306'),
  user: import.meta.env.DB_USER || 'femundo_admin',
  password: import.meta.env.DB_PASSWORD || '',
  database: import.meta.env.DB_NAME || 'femundo_cms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Seguridad: prevenir SQL injection a nivel de driver
  multipleStatements: false,
  // Tiempo máximo de espera para conexiones (ms)
  connectTimeout: 10000,
  // SSL: se activa automáticamente si la BD es remota o si DB_SSL=true
  ...(useSSL
    ? {
        ssl: {
          // rejectUnauthorized: true verifica el certificado del servidor.
          // Cambiar a false SOLO si usas un certificado auto-firmado en dev.
          rejectUnauthorized: import.meta.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
        },
      }
    : {}),
});

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    console.error('SQL:', sql, 'Params:', params);
    throw error;
  }
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

export async function execute(sql: string, params?: any[]): Promise<mysql.ResultSetHeader> {
  try {
    const [result] = await pool.execute(sql, params);
    return result as mysql.ResultSetHeader;
  } catch (error) {
    console.error('Database execute error:', error);
    console.error('SQL:', sql, 'Params:', params);
    throw error;
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export default pool;
