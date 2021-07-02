USE employee_mgmt;

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