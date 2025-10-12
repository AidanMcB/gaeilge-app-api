const utils = require('../utils.js');
const pool = require('../config/db.js');

// Guest user configuration
const GUEST_USER = {
    id: 1,
    email: "amcbride22@gmail.com",
    username: "aidan",
    firebase_uid: "AbxO5KmA91Mu793BcaAuSP34xLE2",
    created_at: "2025-10-08T00:23:50.482Z",
    updated_at: "2025-10-08T00:23:50.482Z"
};

const getAllNoteCards = async (req, resp) => {
    try {
        // Handle guest mode
        if (req.user.isGuest) {
            // Use guest user ID for database queries
            const userId = GUEST_USER.id;

            const getNoteCardsResults = await pool.query(`
                SELECT 
                    n.id AS notecard_id,
                    n.english_phrase,
                    n.irish_phrase,
                    c.id AS category_id,
                    c.name AS category_name
                FROM 
                    notecards n
                LEFT JOIN 
                    notecard_categories nc ON n.id = nc.notecard_id
                LEFT JOIN 
                    categories c ON nc.category_id = c.id
                WHERE 
                    n.user_id = $1
                ORDER BY n.id DESC;
            `, [userId]);
            const noteCardsMap = {};

            getNoteCardsResults.rows.forEach((row) => {
                if (!noteCardsMap[row.notecard_id]) {
                    noteCardsMap[row.notecard_id] = {
                        id: row.notecard_id,
                        englishPhrase: row.english_phrase,
                        irishPhrase: row.irish_phrase,
                        categories: []
                    };
                }
                if (row.category_id) {
                    noteCardsMap[row.notecard_id].categories.push({
                        id: row.category_id,
                        name: row.category_name
                    });
                }
            });

            const noteCards = Object.values(noteCardsMap);
            return resp.status(200).json(noteCards);
        }

        // Get user ID from the authenticated user
        const firebaseUid = req.user.uid;
        const userResult = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
        
        if (userResult.rows.length === 0) {
            return resp.status(404).json({ error: 'User not found' });
        }
        
        const userId = userResult.rows[0].id;

        const getNoteCardsResults = await pool.query(`
            SELECT 
                n.id AS notecard_id,
                n.english_phrase,
                n.irish_phrase,
                c.id AS category_id,
                c.name AS category_name
            FROM 
                notecards n
            LEFT JOIN 
                notecard_categories nc ON n.id = nc.notecard_id
            LEFT JOIN 
                categories c ON nc.category_id = c.id
            WHERE 
                n.user_id = $1
            ORDER BY n.id DESC;
        `, [userId]);
        const noteCardsMap = {};

        getNoteCardsResults.rows.forEach((row) => {
            if (!noteCardsMap[row.notecard_id]) {
                noteCardsMap[row.notecard_id] = {
                    id: row.notecard_id,
                    englishPhrase: row.english_phrase,
                    irishPhrase: row.irish_phrase,
                    categories: []
                };
            }
            if (row.category_id) {
                noteCardsMap[row.notecard_id].categories.push({
                    id: row.category_id,
                    name: row.category_name
                });
            }
        });

        const noteCards = Object.values(noteCardsMap);
        resp.status(200).json(noteCards);
    } catch (err) {
        console.error(err);
        resp.status(500).send('Server Error. Unable to retrieve note cards.');
    }
};

const createNoteCard = async (req, resp) => {
    const { englishPhrase, irishPhrase, categories = null } = req.body;
    // categories: [ { name: string, id: number } ]

    try {
        // Handle guest mode
        if (req.user.isGuest) {
            // Use guest user ID for database operations
            const userId = GUEST_USER.id;

            // 1. Create new NoteCard with guest user_id
            const noteCardResult = await pool.query(
                'INSERT INTO notecards (english_phrase, irish_phrase, user_id) VALUES ($1, $2, $3) RETURNING *',
                [englishPhrase, irishPhrase, userId]
            );
            const newNoteCard = noteCardResult.rows[0];

            // 2. Create notecard_categories relationship
            if (categories?.length > 0) {
                const placeholders = categories
                    .map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`)
                    .join(', ');

                const categoryInsertQuery = `
                    INSERT INTO notecard_categories (notecard_id, category_id)
                    VALUES ${placeholders}
                `;

                const flattenedValues = categories.flatMap((cat) => [newNoteCard.id, cat.id]);

                await pool.query(categoryInsertQuery, flattenedValues);
            }

            // 3. Retrieve the new NoteCard with its categories
            const noteCardQuery = `
                SELECT 
                    nc.id,
                    nc.english_phrase,
                    nc.irish_phrase,
                    nc.user_id,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'id', c.id,
                                'name', c.name
                            )
                        ) FILTER (WHERE c.id IS NOT NULL),
                        '[]'::json
                    ) AS categories
                FROM 
                    notecards nc
                LEFT JOIN 
                    notecard_categories ncc 
                    ON nc.id = ncc.notecard_id
                LEFT JOIN 
                    categories c 
                    ON ncc.category_id = c.id
                WHERE 
                    nc.id = $1
                GROUP BY 
                    nc.id, nc.english_phrase, nc.irish_phrase, nc.user_id
            `;
            const finalResult = await pool.query(noteCardQuery, [newNoteCard.id]);
            const noteCardWithCategories = finalResult.rows[0];

            // 4. Respond with the combined data
            return resp.status(201).json(utils.normalizeFromDb(noteCardWithCategories));
        }

        // Get user ID from the authenticated user
        const firebaseUid = req.user.uid;
        const userResult = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
        
        if (userResult.rows.length === 0) {
            return resp.status(404).json({ error: 'User not found' });
        }
        
        const userId = userResult.rows[0].id;

        // 1. Create new NoteCard with user_id
        const noteCardResult = await pool.query(
            'INSERT INTO notecards (english_phrase, irish_phrase, user_id) VALUES ($1, $2, $3) RETURNING *',
            [englishPhrase, irishPhrase, userId]
        );
        const newNoteCard = noteCardResult.rows[0];

        // 2. Create notecard_categories relationship
        if (categories?.length > 0) {
            const placeholders = categories
                .map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`)
                .join(', ');

            const categoryInsertQuery = `
                INSERT INTO notecard_categories (notecard_id, category_id)
                VALUES ${placeholders}
            `;

            const flattenedValues = categories.flatMap((cat) => [newNoteCard.id, cat.id]);

            await pool.query(categoryInsertQuery, flattenedValues);
        }

        // 3. Retrieve the new NoteCard with its categories
        const noteCardQuery = `
            SELECT 
                nc.id,
                nc.english_phrase,
                nc.irish_phrase,
                nc.user_id,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', c.id,
                            'name', c.name
                        )
                    ) FILTER (WHERE c.id IS NOT NULL),
                    '[]'::json
                ) AS categories
            FROM 
                notecards nc
            LEFT JOIN 
                notecard_categories ncc 
                ON nc.id = ncc.notecard_id
            LEFT JOIN 
                categories c 
                ON ncc.category_id = c.id
            WHERE 
                nc.id = $1
            GROUP BY 
                nc.id, nc.english_phrase, nc.irish_phrase, nc.user_id
        `;
        const finalResult = await pool.query(noteCardQuery, [newNoteCard.id]);
        const noteCardWithCategories = finalResult.rows[0];

        // 4. Respond with the combined data
        resp.status(201).json(utils.normalizeFromDb(noteCardWithCategories));
    } catch (err) {
        console.error('Error creating note card: ', err);
        resp.status(500).json({
            error: 'Internal server error',
            details: `Failed to create note card. Error : ${err}`
        });
    }
};

const deleteNoteCard = async (req, resp) => {
    const id = parseInt(req.params.id);
    
    try {
        // Handle guest mode
        if (req.user.isGuest) {
            // Use guest user ID for database operations
            const userId = GUEST_USER.id;

            // Delete notecard only if it belongs to the guest user
            const result = await pool.query('DELETE FROM notecards WHERE id = $1 AND user_id = $2', [id, userId]);
            
            if (result.rowCount === 0) {
                return resp.status(404).json({ error: 'Notecard not found or not owned by guest user' });
            }

            return resp.status(200).json({
                status: 200,
                message: `Notecard deleted with ID: ${id}`
            });
        }

        // Get user ID from the authenticated user
        const firebaseUid = req.user.uid;
        const userResult = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
        
        if (userResult.rows.length === 0) {
            return resp.status(404).json({ error: 'User not found' });
        }
        
        const userId = userResult.rows[0].id;

        // Delete notecard only if it belongs to the user
        const result = await pool.query('DELETE FROM notecards WHERE id = $1 AND user_id = $2', [id, userId]);
        
        if (result.rowCount === 0) {
            return resp.status(404).json({ error: 'Notecard not found or not owned by user' });
        }

        resp.status(200).json({
            status: 200,
            message: `Notecard deleted with ID: ${id}`
        });
    } catch (error) {
        console.error('Error deleting notecard:', error);
        resp.status(500).json({ error: 'Internal server error' });
    }
};

const updateNoteCard = async (req, resp) => {
    const id = parseInt(req.params.id);
    const { englishPhrase, irishPhrase, categories = [] } = req.body;

    try {
        // Handle guest mode
        if (req.user.isGuest) {
            // Use guest user ID for database operations
            const userId = GUEST_USER.id;

            // 1. Update the notecard only if it belongs to the guest user
            const updateResult = await pool.query(
                'UPDATE notecards SET english_phrase = $1, irish_phrase = $2 WHERE id = $3 AND user_id = $4',
                [englishPhrase, irishPhrase, id, userId]
            );

            if (updateResult.rowCount === 0) {
                return resp.status(404).json({ error: 'Notecard not found or not owned by guest user' });
            }

            // 2. Handle categories: clear existing and insert new ones
            if (categories.length > 0) {
                // Clear existing notecard_categories for the notecard
                await pool.query('DELETE FROM notecard_categories WHERE notecard_id = $1', [id]);

                // Insert new notecard_categories relationships
                const placeholders = categories.map((_, index) => `($1, $${index + 2})`).join(', ');

                const categoryInsertQuery = `
                    INSERT INTO notecard_categories (notecard_id, category_id)
                    VALUES ${placeholders}
                `;
                const flattenedValues = [id, ...categories.map((cat) => cat.id)];

                await pool.query(categoryInsertQuery, flattenedValues);
            }

            // 3. Retrieve the updated notecard with its categories
            const noteCardQuery = `
                SELECT 
                    nc.id,
                    nc.english_phrase,
                    nc.irish_phrase,
                    nc.user_id,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'id', c.id,
                                'name', c.name
                            )
                        ) FILTER (WHERE c.id IS NOT NULL),
                        '[]'::json
                    ) AS categories
                FROM
                    notecards nc
                LEFT JOIN 
                    notecard_categories ncc 
                    ON nc.id = ncc.notecard_id
                LEFT JOIN 
                    categories c 
                    ON ncc.category_id = c.id
                WHERE 
                    nc.id = $1
                GROUP BY 
                    nc.id, nc.english_phrase, nc.irish_phrase, nc.user_id
            `;
            const finalResult = await pool.query(noteCardQuery, [id]);
            const updatedNoteCardResult = finalResult.rows[0];

            // 4. Respond with the updated notecard
            return resp.status(200).json({
                message: 'Success',
                data: utils.normalizeFromDb(updatedNoteCardResult)
            });
        }

        // Get user ID from the authenticated user
        const firebaseUid = req.user.uid;
        const userResult = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
        
        if (userResult.rows.length === 0) {
            return resp.status(404).json({ error: 'User not found' });
        }
        
        const userId = userResult.rows[0].id;

        // 1. Update the notecard only if it belongs to the user
        const updateResult = await pool.query(
            'UPDATE notecards SET english_phrase = $1, irish_phrase = $2 WHERE id = $3 AND user_id = $4',
            [englishPhrase, irishPhrase, id, userId]
        );

        if (updateResult.rowCount === 0) {
            return resp.status(404).json({ error: 'Notecard not found or not owned by user' });
        }

        // 2. Handle categories: clear existing and insert new ones
        if (categories.length > 0) {
            // Clear existing notecard_categories for the notecard
            await pool.query('DELETE FROM notecard_categories WHERE notecard_id = $1', [id]);

            // Insert new notecard_categories relationships
            const placeholders = categories.map((_, index) => `($1, $${index + 2})`).join(', ');

            const categoryInsertQuery = `
                INSERT INTO notecard_categories (notecard_id, category_id)
                VALUES ${placeholders}
            `;
            const flattenedValues = [id, ...categories.map((cat) => cat.id)];

            await pool.query(categoryInsertQuery, flattenedValues);
        }

        // 3. Retrieve the updated notecard with its categories
        const noteCardQuery = `
            SELECT 
                nc.id,
                nc.english_phrase,
                nc.irish_phrase,
                nc.user_id,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', c.id,
                            'name', c.name
                        )
                    ) FILTER (WHERE c.id IS NOT NULL),
                    '[]'::json
                ) AS categories
            FROM
                notecards nc
            LEFT JOIN 
                notecard_categories ncc 
                ON nc.id = ncc.notecard_id
            LEFT JOIN 
                categories c 
                ON ncc.category_id = c.id
            WHERE 
                nc.id = $1
            GROUP BY 
                nc.id, nc.english_phrase, nc.irish_phrase, nc.user_id
        `;
        const finalResult = await pool.query(noteCardQuery, [id]);
        const updatedNoteCardResult = finalResult.rows[0];

        // 4. Respond with the updated notecard
        resp.status(200).json({
            message: 'Success',
            data: utils.normalizeFromDb(updatedNoteCardResult)
        });
    } catch (err) {
        console.error('Error updating note card: ', err);
        resp.status(500).json({
            error: 'Internal server error',
            details: `Failed to update note card. Error: ${err.message}`
        });
    }
};

const removeCategoryFromNoteCard = async (req, resp) => {
    const noteCardId = parseInt(req.params.noteCardId);
    const categoryId = parseInt(req.params.categoryId);

    try {
        // Handle guest mode
        if (req.user.isGuest) {
            // Use guest user ID for database operations
            const userId = GUEST_USER.id;

            // First verify the notecard belongs to the guest user
            const notecardCheck = await pool.query(
                'SELECT id FROM notecards WHERE id = $1 AND user_id = $2',
                [noteCardId, userId]
            );

            if (notecardCheck.rows.length === 0) {
                return resp.status(404).json({ error: 'Notecard not found or not owned by guest user' });
            }

            // Remove the category from the notecard
            await pool.query(
                `DELETE FROM notecard_categories WHERE category_id = $1 AND notecard_id = $2`,
                [categoryId, noteCardId]
            );
            
            return resp.status(202).json({
                success: true,
                status: 202,
                message: 'Successfully removed category from note card.'
            });
        }

        // Get user ID from the authenticated user
        const firebaseUid = req.user.uid;
        const userResult = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
        
        if (userResult.rows.length === 0) {
            return resp.status(404).json({ error: 'User not found' });
        }
        
        const userId = userResult.rows[0].id;

        // First verify the notecard belongs to the user
        const notecardCheck = await pool.query(
            'SELECT id FROM notecards WHERE id = $1 AND user_id = $2',
            [noteCardId, userId]
        );

        if (notecardCheck.rows.length === 0) {
            return resp.status(404).json({ error: 'Notecard not found or not owned by user' });
        }

        // Remove the category from the notecard
        await pool.query(
            `DELETE FROM notecard_categories WHERE category_id = $1 AND notecard_id = $2`,
            [categoryId, noteCardId]
        );
        
        resp.status(202).json({
            success: true,
            status: 202,
            message: 'Successfully removed category from note card.'
        });
    } catch (err) {
        console.error('Error removing category from note card: ', err);
        resp.status(404).json({
            error: 'Internal server error',
            details: `Failed to remove category from note card. Error : ${err}`
        });
    }
};

const updateUser = (request, response) => {
    const id = parseInt(request.params.id);
    const { name, email } = request.body;

    pool.query(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3',
        [name, email, id],
        (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).send(`User modified with ID: ${id}`);
        }
    );
};

module.exports = {
    getAllNoteCards,
    createNoteCard,
    deleteNoteCard,
    updateNoteCard,
    removeCategoryFromNoteCard
};
