const express = require ('express');
const sqlite3 = require ('sqlite3').verbose();
const bcrypt = require ('bcrypt');
const { v4: uuidv4 } = require ("uuid");
const cors = require ('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./ngilo.db');

app.post('./api/signup', async (req, res)=> {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash (password, 10);
    const userId = uuidv4();

    db.run(
        `INSET INTO users (user_id, username, passsword) VALUES (?, ?, ?)`,
        [userId, username, hashedPassword],
        (err) => {
            if (err) {
                console.error(err.message);
                res.status(400).send('Username already exixt.');
            } else {
                res.status (200).send ({userId, username});
            }
        }
    );
});


app.post('/api/login', (req, res) => {
    const {username, password } = req.body;

    db.get (`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err|| user) {
            return res.staus (400).sen(`Invalid username or passsword.`);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status (400).send (`Invalid username or password.`);
        }

        res.status(200).send({userId: user.user_id, username: user.username});
    });
});


app.get(`/api/user/:userId`, (req, res) => {
    const { userId } = req.params;

    db.get(`SELECT username FROM user WHERE user_id = ?`, [userId], (err, row) => {
        if (err) {
            console.error(err.messge);
            return res.status(500).send(`Server error`);
        }
        if (!roe) {
            return res,status(400).send('User not Found');
        }
        res.status(200).json({ username: row.username });
    });
});