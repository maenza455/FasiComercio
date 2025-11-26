const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const PORT = 5171;

app.use(cors());
app.use(express.json());

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

// Rota para buscar produtos (mantida, mas não diretamente relacionada ao login)
app.get('/api/products', (req, res) => {
    db.query("SELECT IDUSUARIO, SENHAUSUA FROM USUARIO", (err, results) => {
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

// NOVA ROTA: Rota para autenticação de login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ authenticated: false, message: 'Usuário e senha são obrigatórios.' });
    }

    // Consulta ao banco de dados para verificar as credenciais
    const query = "SELECT IDUSUARIO FROM USUARIO WHERE IDUSUARIO = ? AND SENHAUSUA = ?";
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Erro ao consultar o banco de dados para login:', err);
            return res.status(500).json({ authenticated: false, message: 'Erro interno do servidor.' });
        }

        if (results.length > 0) {
            // Credenciais corretas
            res.json({ authenticated: true, message: 'Login realizado com sucesso!' });
        } else {
            // Credenciais incorretas
            res.status(401).json({ authenticated: false, message: 'Usuário ou senha incorretos.' });
        }
    });
});


// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
