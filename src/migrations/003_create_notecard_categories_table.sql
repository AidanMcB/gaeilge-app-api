CREATE TABLE notecard_categories (
    notecard_id INT NOT NULL REFERENCES notecards(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (notecard_id, category_id)
);
