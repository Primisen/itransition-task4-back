create database task4;
use task4;

CREATE TABLE user (
id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
name varchar(30) NOT NULL,
login varchar(30) NOT NULL,
password VARCHAR(1032) NOT NULL,
registration_date DATE NOT NULL,
last_login_date DATE NOT NULL,
is_active BOOLEAN NOT NULL DEFAULT true,
UNIQUE(login));