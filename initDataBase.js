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
    console.log('🛠️ Criando tabelas...');

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
        codigoPix TEXT,
        qrCode TEXT,
        idQrCodePayment TEXT,
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
        FOREIGN KEY (pagamento_id) REFERENCES Pagamento(id) ON DELETE CASCADE
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
        codigo_recuperacao VARCHAR(6),
        codigo_expira DATETIME,
        FOREIGN KEY (role_id) REFERENCES Role(id)
      );

    

      CREATE TABLE IF NOT EXISTS Auditoria (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tabela VARCHAR(100) NOT NULL,
        operacao ENUM('INSERT','UPDATE','DELETE') NOT NULL,
        usuario VARCHAR(100) NULL,
        registro_id INT,
        data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
        dados_antigos JSON NULL,
        dados_novos JSON NULL
      );

      INSERT IGNORE INTO Role (nome) VALUES ('admin');
      INSERT IGNORE INTO Role (nome) VALUES ('funcionario');
      INSERT IGNORE INTO Produto (nome, preco) VALUES ('milho',5.00),('tomate',3.50);
    `);

    console.log('✅ Tabelas criadas com sucesso!');
    console.log('🧩 Criando triggers de auditoria...');

    const triggers = [

      // ===========================
      // CLIENTE
      // ===========================
      `DROP TRIGGER IF EXISTS trg_cliente_insert;
      CREATE TRIGGER trg_cliente_insert
      AFTER INSERT ON Cliente
      FOR EACH ROW
      INSERT INTO Auditoria (tabela, operacao, usuario, registro_id, dados_novos)
      VALUES ('Cliente','INSERT',@usuario_logado, NEW.id,
        JSON_OBJECT('id',NEW.id,'nome',NEW.nome,'contato',NEW.contato,'email',NEW.email,'cpf',NEW.cpf));`,

      `DROP TRIGGER IF EXISTS trg_cliente_update;
      CREATE TRIGGER trg_cliente_update
      AFTER UPDATE ON Cliente
      FOR EACH ROW
      INSERT INTO Auditoria (tabela, operacao, usuario, registro_id, dados_antigos, dados_novos)
      VALUES ('Cliente','UPDATE',@usuario_logado, NEW.id,
        JSON_OBJECT('id',OLD.id,'nome',OLD.nome,'contato',OLD.contato,'email',OLD.email,'cpf',OLD.cpf),
        JSON_OBJECT('id',NEW.id,'nome',NEW.nome,'contato',NEW.contato,'email',NEW.email,'cpf',NEW.cpf));`,

      `DROP TRIGGER IF EXISTS trg_cliente_delete;
      CREATE TRIGGER trg_cliente_delete
      AFTER DELETE ON Cliente
      FOR EACH ROW
      INSERT INTO Auditoria (tabela, operacao, usuario, registro_id, dados_antigos)
      VALUES ('Cliente','DELETE',@usuario_logado, OLD.id,
        JSON_OBJECT('id',OLD.id,'nome',OLD.nome,'contato',OLD.contato,'email',OLD.email,'cpf',OLD.cpf));`,

      // ===========================
      // PAGAMENTO
      // ===========================
      `DROP TRIGGER IF EXISTS trg_pagamento_insert;
      CREATE TRIGGER trg_pagamento_insert
      AFTER INSERT ON Pagamento
      FOR EACH ROW
      INSERT INTO Auditoria (tabela, operacao, usuario, registro_id, dados_novos)
      VALUES ('Pagamento','INSERT',@usuario_logado, NEW.id,
        JSON_OBJECT('id',NEW.id,'externalId',NEW.externalId,'data_criacao',NEW.data_criacao,
          'data_pagamento',NEW.data_pagamento,'metodo',NEW.metodo,'status',NEW.status,
          'codigoPix',NEW.codigoPix,'qrCode',NEW.qrCode,'idQrCodePayment',NEW.idQrCodePayment,
          'totalCentavos',NEW.totalCentavos));`,

      `DROP TRIGGER IF EXISTS trg_pagamento_update;
      CREATE TRIGGER trg_pagamento_update
      AFTER UPDATE ON Pagamento
      FOR EACH ROW
      INSERT INTO Auditoria (tabela, operacao, usuario, registro_id, dados_antigos, dados_novos)
      VALUES ('Pagamento','UPDATE',@usuario_logado, NEW.id,
        JSON_OBJECT('id',OLD.id,'externalId',OLD.externalId,'data_criacao',OLD.data_criacao,
          'data_pagamento',OLD.data_pagamento,'metodo',OLD.metodo,'status',OLD.status,
          'codigoPix',OLD.codigoPix,'qrCode',OLD.qrCode,'idQrCodePayment',OLD.idQrCodePayment,
          'totalCentavos',OLD.totalCentavos),
        JSON_OBJECT('id',NEW.id,'externalId',NEW.externalId,'data_criacao',NEW.data_criacao,
          'data_pagamento',NEW.data_pagamento,'metodo',NEW.metodo,'status',NEW.status,
          'codigoPix',NEW.codigoPix,'qrCode',NEW.qrCode,'idQrCodePayment',NEW.idQrCodePayment,
          'totalCentavos',NEW.totalCentavos));`,

      `DROP TRIGGER IF EXISTS trg_pagamento_delete;
      CREATE TRIGGER trg_pagamento_delete
      AFTER DELETE ON Pagamento
      FOR EACH ROW
      INSERT INTO Auditoria (tabela, operacao, usuario, registro_id, dados_antigos)
      VALUES ('Pagamento','DELETE',@usuario_logado, OLD.id,
        JSON_OBJECT('id',OLD.id,'externalId',OLD.externalId,'data_criacao',OLD.data_criacao,
          'data_pagamento',OLD.data_pagamento,'metodo',OLD.metodo,'status',OLD.status,
          'codigoPix',OLD.codigoPix,'qrCode',OLD.qrCode,'idQrCodePayment',OLD.idQrCodePayment,
          'totalCentavos',OLD.totalCentavos));`,

      // ===========================
      // PRODUTO
      // ===========================
      `DROP TRIGGER IF EXISTS trg_produto_insert;
      CREATE TRIGGER trg_produto_insert
      AFTER INSERT ON Produto
      FOR EACH ROW
      INSERT INTO Auditoria (tabela, operacao, usuario, registro_id, dados_novos)
      VALUES ('Produto','INSERT',@usuario_logado, NEW.id,
        JSON_OBJECT('id',NEW.id,'nome',NEW.nome,'preco',NEW.preco));`,

      `DROP TRIGGER IF EXISTS trg_produto_update;
      CREATE TRIGGER trg_produto_update
      AFTER UPDATE ON Produto
      FOR EACH ROW
      INSERT INTO Auditoria (tabela, operacao, usuario, registro_id, dados_antigos, dados_novos)
      VALUES ('Produto','UPDATE',@usuario_logado, NEW.id,
        JSON_OBJECT('id',OLD.id,'nome',OLD.nome,'preco',OLD.preco),
        JSON_OBJECT('id',NEW.id,'nome',NEW.nome,'preco',NEW.preco));`,

      `DROP TRIGGER IF EXISTS trg_produto_delete;
      CREATE TRIGGER trg_produto_delete
      AFTER DELETE ON Produto
      FOR EACH ROW
      INSERT INTO Auditoria (tabela, operacao, usuario, registro_id, dados_antigos)
      VALUES ('Produto','DELETE',@usuario_logado, OLD.id,
        JSON_OBJECT('id',OLD.id,'nome',OLD.nome,'preco',OLD.preco));`,
    ];

    for (const sql of triggers) {
      await db.raw(sql);
    }

    console.log('✅ Todas as triggers foram criadas com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao criar o banco ou tabelas:', err);
  } finally {
    await db.destroy();
  }
}

createDatabaseAndTables();
