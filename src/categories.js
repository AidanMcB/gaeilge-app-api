require('dotenv').config();
const utils = require('./utils');

const Pool = require('pg').Pool;
let pool;
// Use if local
if (process.env.GAEILGE_ENV === "local") {
    pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });
} else {
    // Use deployed
    pool = new Pool({
    	connectionString: process.env.GAEILGE_API_URL,
    });
}

const getAllCategories = (req, resp) => {
    pool.query('SELECT * FROM categories ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error;
        }
        const categories = [];
        results.rows.forEach((row) => {
            categories.push(utils.normalizeFromDb(row));
        });

        resp.status(200).json(categories);
    });
};

const createCategory = (req, resp) => {
    const { name } = req.body;

    pool.query(
        'INSERT INTO categories (name) VALUES ($1) RETURNING *',
        [name],
        (error, results) => {
            if (error) {
                throw error;
            }
            resp.status(201).json(utils.normalizeFromDb(results.rows[0]));
        }
    );
};

const deleteCategory = (req, resp) => {
    const id = parseInt(req.params.id);

    pool.query(
        'DELETE FROM categories WHERE id = $1',
        [id],
        (error, results) => {
            if (error) {
                throw error;
            }
            resp.status(200).json({
                status: 200,
                message: `Category with ID ${id} delete`,
            });
        }
    );
};

module.exports = {
    getAllCategories,
    createCategory,
    deleteCategory,
};
