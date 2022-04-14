const dotenv = require('dotenv');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const db = require('./database/db');
const { fileLoader } = require('ejs');
const Task = require('./Task').Task;
const Status = require('./Task').Status;

dotenv.config();
const app = express();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join('database', 'uploads', req.query.id);
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        cb(null, dir);
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage : storage });

app.set('view engine', 'ejs');
app.set('views', process.env.VIEWS);
app.use(express.static(path.join(__dirname, process.env.STATIC)));
app.get('/', bodyParser.urlencoded(), async (req, res) => {
    if (req.query['id']) {
        const row = 
        (await db.query('SELECT * FROM task WHERE id=$1', [ req.query['id'] ])).rows[0];        
        fs.readdir('database/uploads/1', (err, files) => {
            res.render('task', { 
                task : new Task(
                    row['id'],
                    row['name'],
                    row['status'],
                    new Date(row['date'])),
                
                files : files
            });
        });

    }

    const rows = (await db.query('SELECT * FROM task ORDER BY id')).rows;
    const tasks = [];
    for (let i = 0; i < rows.length; i++) {
        tasks.push(new Task(
            rows[i]['id'],
            rows[i]['name'],
            rows[i]['status'],
            new Date(rows[i]['date']),
        ));
    }

    res.render('main', { tasks : tasks });
})

app.post('/', bodyParser.urlencoded(), async (req, res) => {
    let status = req.body.status;
    console.log(req.body);
    if (req.body.load == 'true') {
        
    }
    else if (status == Status.Done || status == Status.Canceled) {
        await db.query('UPDATE task SET status=$1 WHERE id=$2', [ status, req.query.id ]);
    }
    else if (status == Status.Created && req.body.name != '' && req.body.date == '') {
        console.log(req.body);
        let date = req.body.date.split('-');
        await db.query('INSERT INTO task (name, date, status) values ($1, $2, $3)', 
            [ req.body.name, new Date(date[0], date[1], date[2]), status ]);
    }

    res.redirect('/');
});

app.post('/upload', upload.any(), async (req, res) => {
    res.redirect('/');
});

app.get('/download', bodyParser.urlencoded(), (req, res) => {
    res.download(path.join(__dirname, 'database', 'uploads', req.query.id, req.query.file));
});

app.listen(4455, () => {
    console.log(`server started on ${process.env.PORT} port`);
});