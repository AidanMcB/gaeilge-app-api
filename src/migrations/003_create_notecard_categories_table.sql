CREATE TABLE notecard_categories (
    notecard_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (notecard_id, category_id),
    FOREIGN KEY (notecard_id) REFERENCES notecards(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
