const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const PORT = 5170;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração da conexão com o banco de dados
const dbConfig = {
    host: '160.20.22.99',
    user: 'aluno18',
    password: 'p6HsHAQGzxw=',
    database: 'fasiclin',
    port: 3360
};

let db;

function handleDisconnect() {
    db = mysql.createConnection(dbConfig);

    db.connect(err => {
        if (err) {
            console.error('Erro ao conectar ao MySQL:', err.message);
            setTimeout(handleDisconnect, 2000);
            return;
        }
        console.log('Conectado ao banco de dados MySQL Fasiclin.');
    });

    db.on('error', err => {
        console.error('Erro no banco de dados:', err.message);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNREFUSED') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

// Rota para buscar produtos
app.get('/api/products', (req, res) => {
    db.query("SELECT IDPRODUTO, NOME, DESCRICAO FROM PRODUTO ORDER BY NOME", (err, results) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            return res.status(500).json({ error: 'Erro interno do servidor ao buscar produtos.' });
        }
        res.json({
            message: "success",
            data: results
        });
    });
});


// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
