const mysql = require('mysql2/promise');

class Database {
  constructor() {
    this.pool = null;
  }

  async connect() {
    try {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
      });

      // Testar conexão
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      
      console.log('Conectado ao banco de dados MySQL');
      return this.pool;
    } catch (error) {
      console.error('Erro ao conectar ao banco de dados:', error);
      throw error;
    }
  }

  async query(sql, params = []) {
    try {
      const [results] = await this.pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Erro na query:', error);
      throw error;
    }
  }

  async transaction(callback) {
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('Conexão com banco de dados fechada');
    }
  }
}

module.exports = new Database();