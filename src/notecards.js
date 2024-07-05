require('dotenv').config();
const utils = require('./utils');

const Pool = require('pg').Pool
// USE if local
// const pool = new Pool({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASSWORD,
//     port: process.env.DB_PORT,
// });

// Use deployed
const pool = new Pool({
    connectionString: process.env.GAEILGE_API_URL,
})

const getAllNotecards = (req, resp) => {
    pool.query('SELECT * FROM notecard ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
        }
        const data = [];
        results.rows.forEach((row) => {
            data.push(utils.regularizeDbObject(row));
        });

        resp.status(200).json(data);
    });
};

const createNotecard = (req, resp) => {
    const { englishPhrase, irishPhrase, color = null } = req.body;

    pool.query('INSERT INTO notecard (english_phrase, irish_phrase, color) VALUES ($1, $2, $3) RETURNING *', [englishPhrase, irishPhrase, color], (error, results) => {
        if (error) {
            throw error
        }
        resp.status(201).json(utils.regularizeDbObject(results.rows[0]));
    });
};

const deleteNotecard = (req, resp) => {
    const id = parseInt(req.params.id)

    pool.query('DELETE FROM notecard WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        resp.status(200).json({ status: 200, message: `Notecard deleted with ID: ${id}`});
    });
};

const updateNotecard = (req, resp) => {
    const id = parseInt(req.params.id);
    const { englishPhrase, irishPhrase } = req.body;
    pool.query('UPDATE notecard SET english_phrase = $1, irish_phrase = $2 WHERE id = $3',
        [englishPhrase, irishPhrase, id],
        (error, results) => {
            if (error) {
                throw error
            }
            resp.status(201).json({ status: 201, message: `User modified with ID: ${id}` });
        }
    )
}

const updateUser = (request, response) => {
    const id = parseInt(request.params.id)
    const { name, email } = request.body
  
    pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3',
      [name, email, id],
      (error, results) => {
        if (error) {
          throw error
        }
        response.status(200).send(`User modified with ID: ${id}`)
      }
    )
  }
  

module.exports = {
    getAllNotecards,
    createNotecard,
    deleteNotecard,
    updateNotecard,
};
