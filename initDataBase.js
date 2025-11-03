const knex = require('knex');
const dotenv = require('dotenv');
dotenv.config();

const db = knex({
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'unifeob@123',
    database: 'sabor',
    multipleStatements: true 
  },
});

async function createDatabaseAndTables() {
  try {
   
  
    await db.raw(`
      CREATE TABLE IF NOT EXISTS Cliente (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        contato VARCHAR(100),
        email VARCHAR(100),
        cpf VARCHAR(100)
      );

      CREATE TABLE IF NOT EXISTS Pagamento (
        id INT AUTO_INCREMENT PRIMARY KEY,
        externalId CHAR(36) UNIQUE NOT NULL,
        data_criacao DATE NOT NULL,
        data_pagamento DATE,
        metodo VARCHAR(50),
        status VARCHAR(50),
        totalCentavos INT
      );

      CREATE TABLE IF NOT EXISTS Pedido (
        id INT AUTO_INCREMENT PRIMARY KEY,
        externalId CHAR(36) UNIQUE NOT NULL,
        data DATE NOT NULL,
        cliente_id INT NOT NULL,
        pagamento_id INT NOT NULL,
        entrega BOOLEAN,
        FOREIGN KEY (cliente_id) REFERENCES Cliente(id),
        FOREIGN KEY (pagamento_id) REFERENCES Pagamento(id)
      );

      CREATE TABLE IF NOT EXISTS Produto (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        preco DECIMAL(10,2) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pedido_produto (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pedido_id INT NOT NULL,
        produto_id INT NOT NULL,
        quantidade INT NOT NULL,
        FOREIGN KEY (pedido_id) REFERENCES Pedido(id),
        FOREIGN KEY (produto_id) REFERENCES Produto(id)
      );

      CREATE TABLE IF NOT EXISTS Role (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(50) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS User (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hashed VARCHAR(255) NOT NULL,
        role_id INT,
        nome VARCHAR(100),
        FOREIGN KEY (role_id) REFERENCES Role(id)
      );

        -- Inserir role admin se não existir
      INSERT IGNORE INTO Role (nome) VALUES ('admin');

      -- Inserir produtos milho e tomate se não existirem
      INSERT IGNORE INTO Produto (nome, preco) VALUES 
        ('milho', 5.00),
        ('tomate', 3.50);
    
    `);

    console.log('Tabelas criadas com sucesso!');
    await db.destroy();

  } catch (err) {
    console.error('Erro ao criar o banco ou tabelas:', err);
  }
}

createDatabaseAndTables();
