const utils = require('../utils');
const pool = require('../config/db.js'); 

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
