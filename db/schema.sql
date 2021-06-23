DROP DATABASE IF EXISTS employee_mgmt;
CREATE DATABASE employee_mgmt;

USE employee_mgmt;

CREATE TABLE department (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
	name VARCHAR(30) NOT NULL,
    UNIQUE INDEX (name)
);

CREATE TABLE role (
	id INTEGER AUTO_INCREMENT PRIMARY KEY NOT NULL,
	title VARCHAR(30),
    salary DECIMAL(10,2),
    department_id INTEGER NOT NULL,
    UNIQUE INDEX (title),
    FOREIGN KEY (department_id)
		REFERENCES department(id)
);

CREATE TABLE employee (
	id INTEGER AUTO_INCREMENT PRIMARY KEY NOT NULL,
	first_name VARCHAR(30),
    last_name VARCHAR(30) NOT NULL,
    role_id INTEGER NOT NULL,
    manager_id INTEGER,
    -- UNIQUE INDEX (first_name, last_name),
	FOREIGN KEY (manager_id)
		REFERENCES employee(id)
        ON DELETE CASCADE,
	FOREIGN KEY (role_id)
		REFERENCES role(id)
);
