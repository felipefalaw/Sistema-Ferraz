CREATE TABLE emails (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assunto VARCHAR(255) NOT NULL,
    remetente VARCHAR(255) NOT NULL,
    destinatario VARCHAR(255) NOT NULL,
    corpo TEXT,
    data_recebida DATETIME,
    status VARCHAR(50)
);
