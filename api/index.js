const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 3004;

const users = require('./src/users.js');
const notecards = require('./src/notecards.js');

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.get('/users', users.getUsers);
app.get('/users/:id', users.getUserById);

// * Notecards * // 
app.get('/notecards', notecards.getAllNotecards);
app.post('/notecards/create', notecards.createNotecard);
app.delete('/notecards/:id', notecards.deleteNotecard);
app.put('/notecards/:id', notecards.updateNotecard);

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
});

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
});