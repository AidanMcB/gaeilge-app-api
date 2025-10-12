const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const port = 3004;

const app = express();

const corsOptions = {
    origin: [
        process.env.FRONTEND_ORIGIN,
        'https://gaeilge-app.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Guest-Mode']
};

app.use(cors(corsOptions));

// Middlware
app.use(cookieParser());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
const verifyToken = require('./src/middleware/index.js');

// Debugging
if (process.env.NODE_ENV === 'development') {
	app.use((req, res, next) => {
		res.on('finish', () => {
			console.log('Response headers:', res.getHeaders());
		});
		next();
	});
}

// Controllers
const users = require('./src/controllers/users.js');
const noteCards = require('./src/controllers/notecards.js');
const categories = require('./src/controllers/categories.js');
const firebaseAuthController = require('./src/controllers/firebase-auth.js');

// *** Users *** //
app.get('/users', users.getUsers);
app.get('/users/:id', users.getUserById);

// *** Notecards *** //
app.get('/notecards', verifyToken, noteCards.getAllNoteCards);
app.post('/notecards/create', verifyToken, noteCards.createNoteCard);
app.delete('/notecards/:id', verifyToken, noteCards.deleteNoteCard);
app.delete('/notecards/:noteCardId/categories/:categoryId', verifyToken, noteCards.removeCategoryFromNoteCard);
app.put('/notecards/:id', verifyToken, noteCards.updateNoteCard);

// *** Categories *** //
app.get('/categories', categories.getAllCategories);
app.post('/categories/create', categories.createCategory);
app.delete('/categories/:id', categories.deleteCategory);

// *** Auth ***  //
app.post('/auth/verify', firebaseAuthController.verifyAuth);
app.post('/auth/users/create', firebaseAuthController.createUser);
app.post('/auth/users/login', firebaseAuthController.loginUser);
app.get('/auth/users/me', verifyToken, firebaseAuthController.getCurrentUser);

// *** Health Check *** //
app.get('/', (request, response) => {
    response.json({ info: 'Gaeilge v1. Node.js, Express, and Postgres API' });
});

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});
