const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 3004;

const users = require('./src/users.js');
const noteCards = require('./src/notecards.js');
const categories = require('./src/categories.js');

app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);

app.get('/users', users.getUsers);
app.get('/users/:id', users.getUserById);

// * Notecards * //
app.get('/notecards', noteCards.getAllNoteCards);
app.post('/notecards/create', noteCards.createNoteCard);
app.delete('/notecards/:id', noteCards.deleteNoteCard);
app.delete('/notecards/:noteCardId/categories/:categoryId', noteCards.removeCategoryFromNoteCard)
app.put('/notecards/:id', noteCards.updateNoteCard);

// * Categories //
app.get('/categories', categories.getAllCategories);
app.post('/categories/create', categories.createCategory);
app.delete('/categories/:id', categories.deleteCategory);

app.get('/', (request, response) => {
	response.json({ info: 'Gaeilge v1. Node.js, Express, and Postgres API' });
});

app.listen(port, () => {
	console.log(`App running on port ${port}.`);
});
