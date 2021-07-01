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
	FOREIGN KEY (manager_id)
		REFERENCES employee(id)
        ON DELETE CASCADE,
	FOREIGN KEY (role_id)
		REFERENCES role(id)
);

ALTER TABLE department AUTO_INCREMENT = 1;

INSERT INTO department
VALUES (default, 'Operations');
INSERT INTO department
VALUES (default, 'Support');
INSERT INTO department
VALUES (default, 'Compliance');
INSERT INTO department
VALUES (default, 'IT');
INSERT INTO department
VALUES (default, 'Finance');
INSERT INTO department
VALUES (default, 'Sales');
INSERT INTO department
VALUES (default, 'Engineering');
INSERT INTO department
VALUES (default, 'Product Quality Assurance');
INSERT INTO department
VALUES (default, 'Human Resources');


ALTER TABLE role AUTO_INCREMENT = 1;

INSERT INTO role
VALUES (default, 'Customer Support Technician', 45000, 2);
INSERT INTO role
VALUES (default, 'Customer Support Manager', 160000, 2);
INSERT INTO role
VALUES (default, 'Database Administrator', 95000, 7);
INSERT INTO role
VALUES (default, 'Junior IT Administrator', 87000, 4);
INSERT INTO role
VALUES (default, 'Solutions Manager', 92000, 1);
INSERT INTO role
VALUES (default, 'Inside Sales', 56000, 6);
INSERT INTO role
VALUES (default, 'Operations Lead', 140000, 1);
INSERT INTO role
VALUES (default, 'Human Resources Lead', 165000.62, 9);
INSERT INTO role
VALUES (default, 'Human Resources Team Member', 89051.82, 9);


ALTER TABLE employee AUTO_INCREMENT = 1;

INSERT INTO employee
VALUES (default, 'Grace', 'DeLenaris', 7, default);
INSERT INTO employee
VALUES (default, 'Doug', 'Douglas', 5, 1);
INSERT INTO employee
VALUES (default, 'Haute', 'Daug', 5, 1);
INSERT INTO employee
VALUES (default, 'Pep', 'Cee', 8, default);
INSERT INTO employee
VALUES (default, 'Douglas', 'Dougie', 9, 4); 