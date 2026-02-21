CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL
);

INSERT INTO tasks (title) VALUES ('Installer Docker'), ('Pousser sur le Hub'), ('Réussir la soutenance');
