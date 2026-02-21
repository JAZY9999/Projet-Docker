const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const pool = mariadb.createPool({
     host: 'database',
     user: process.env.MYSQL_USER,
     password: process.env.MYSQL_PASSWORD,
     database: process.env.MYSQL_DATABASE
});

app.get('/tasks', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM tasks");
        res.json(rows);
    } catch (err) { res.status(500).send(err); }
    finally { if (conn) conn.end(); }
});

app.post('/tasks', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query("INSERT INTO tasks (title) VALUES (?)", [req.body.title]);
        res.status(201).send();
    } catch (err) { res.status(500).send(err); }
    finally { if (conn) conn.end(); }
});

app.listen(3000, () => console.log('Backend listening on port 3000'));
