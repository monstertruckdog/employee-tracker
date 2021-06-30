require('dotenv').config()
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
const firstAndLastNames = [];

const connection = mysql.createConnection({
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: 3306
});

connection.connect((err) => {
  if (err) throw err;
  console.log(`Connection was established\nApplication is running`);
  actionSelect();
});

// ERRORS
const errDuplicate = new Error('A duplicate has occurred');

const actionSelect = () => {
  inquirer
    .prompt({
      name: 'action',
      type: 'rawlist',
      message: 'What would you like to do?',
      choices: [
        //'Add    | New Department', // Done
        //'Add    | New Role', // Done
        'Add    | New Employee',
        //'View   | All Departments', // Done
        //'View   | All Roles',
        'View   | All Employees',
        'Update | Employee Roles',
        'Exit' // Done
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case 'Add    | New Employee':
          addNewEmployee();
          break;

        case 'View   | All Employees':
          viewEmployees();
          break;

        case 'Exit':
          exit();
      }
    })
};

const viewEmployees = () => {
  //const query = 'SELECT * FROM employee;';
    const queryEmployeeAllSelect = `SELECT
	                                  e.id AS "ID",
                                    CONCAT(e.first_name, ' ', e.last_name) AS "Employee Name",
                                    e.role_id AS "Role ID",
                                    r.title AS "Role Desc",
                                    IFNULL(e.manager_id, 'NA') AS "Manager ID",
                                    IFNULL(CONCAT(m.first_name, ' ', m.last_name), '(No assigned Manager)') AS "Manager Desc"
                                    FROM employee e
                                    JOIN role r
                                      ON e.role_id = r.id
                                    LEFT JOIN employee m
                                      ON e.manager_id = m.id
                                    ORDER BY id;`
    connection.query(queryEmployeeAllSelect, (err, res) => {
        console.log('');
        console.table(res);
        actionSelect();
    })
};

const exit = () => {
    console.log(`\n\nExiting application\n`)
    process.exit();
};

const addNewEmployee = () => {
    // ORIG connection.query(`SELECT DISTINCT(d.name) FROM department d JOIN role r ON d.id = r.department_id;`, (err, res) => {
    const queryRoleTitleList = `SELECT DISTINCT(title)
                                FROM role
                                ORDER BY title`

    const queryManagerList = `SELECT CONCAT(m.first_name, ' ', m.last_name, ' (', r.title, ')') AS "full_name_title"
                              FROM (SELECT DISTINCT(s.manager_id)
                                    FROM employee s) j
                              JOIN employee m
                                ON j.manager_id = m.id
                              JOIN role r
                                ON r.id = m.role_id
                              ORDER BY m.last_name;`

    //const displayRolesManagers = () => {
        /*
        connection.query(queryRoleTitleList, (err, resA) => {
            if (err) throw err;*/
    inquirer
    .prompt([
        {
            name: 'employeeFirstName',
            type: 'input',
            message: 'First name of new Employee',
        },
        {
            name: 'employeeLastName',
            type: 'input',
            message: 'Last name of new Employee',
        },
    ])
    .then((answer) => {
        const queryCheckExist = `SELECT first_name, last_name
                                 FROM employee
                                 WHERE UPPER(first_name) = ?
                                 AND UPPER(last_name) = ?`
        console.log(`--> ANSWERS:  ${answer.employeeFirstName}`);
        console.log(`--> ANSWERS:  ${answer.employeeLastName}`)
        connection.query(queryCheckExist, [answer.employeeFirstName.toUpperCase(), answer.employeeLastName.toUpperCase()], (err, res) => {
            if (err) throw err;
            console.log(`--> DUPLICATE CHECK RESPONSE:  `, res)
            console.log(`--> DUPLICATE CHECK RESPONSE - INDEX[0]:  ${res[0]}`);
            if (res.length > 0 && (res[0].first_name.toUpperCase() === answer.employeeFirstName.toUpperCase()) && (res[0].last_name.toUpperCase() === answer.employeeLastName.toUpperCase())) {
                console.log(`Employee name "${answer.employeeFirstName} ${answer.employeeLastName}" already exists.  Please try again`)
                exit();
            } else {
                console.log('NO DUPLICATES FOUND')
            } 
        })
    })

    .then(() => {
        connection.query(queryRoleTitleList, (err, res) => {
            if (err) throw err;
            inquirer
            .prompt([
                {
                    name: 'employeeRole',
                    type: 'rawlist',
                    message: 'Job Role for new Employee',
                    choices() {
                        const employeeRoleOptions = [];
                        res.forEach(({ title }) => {
                            employeeRoleOptions.push(title);
                    });
                    return employeeRoleOptions
                    }
                }
            ])
        })
        //.then(() => {
            connection.query(queryManagerList, (err, res) => {
                if (err) throw err;
                inquirer
                    .prompt([
                    {
                        name: 'employeeManagerSelection',
                        type: 'rawlist',
                        message: 'Select an existing manager assigned to new employee',
                        choices() {
                            const employeeManagerChoices = [];
                            res.forEach(({ full_name_title }) => {
                                employeeManagerChoices.push(full_name_title);
                            })
                            employeeManagerChoices.push('No assigned manager');
                                    
                            return employeeManagerChoices
                        }
                    }
                ])
                .then((answer) => {
                    console.log(`--> DID THIS VALUE MAKE IT? - employeeManagerChoices:  ${employeeManagerChoices}`);
                    if (answer.employeeManagerSelection === 'No assigned manager') {
                        console.log('--> EMPLOYEE MANAGER WILL NOT BE ASSIGNED.  TO BE CONTINUED')
                    } else {
                        console.log('--> Future code to go here');
                        exit();
                    }
            })
        })
    })
};

/*
// CHECK FOR DUPLICATES - employee first and last name
        console.log(`--> Salary value is valid ('true') or invalid ('false'):  ${/\d{0,10}\.\d{2}/g.test(answer.roleSalary)}`);
        const queryCheckExist = "SELECT title FROM role WHERE UPPER(title) = ?"
        connection.query(queryCheckExist, [answer.roleName.toUpperCase()], (err, res) => {
          if (err) throw err;
          if (res.length > 0 && (res[0].title.toUpperCase() === answer.roleName.toUpperCase())) {
            console.log(`Role title "${answer.roleName}" already exists.  Please try again`)
            exit();
          }
        });
        // INSERTION
        console.log(`--> INPUT FROM USER - title:  ${answer.roleName}`);
        console.log(`--> INPUT FROM USER - salary:  ${answer.roleSalary}`);
        console.log(`--> INPUT FROM USER - department:  ${answer.roleDepartment}`);
        // ORIG const queryDecode = "SELECT DISTINCT(d.id) FROM department d JOIN role r ON d.id = r.department_id WHERE UPPER(d.name) = UPPER(?);"
        const queryDecode = "SELECT d.id FROM department d JOIN department i ON d.id = i.id ORDER BY d.id;"
       // TO DO:  flatten the following nested callbacks (no longer needed)
        connection.query(queryDecode, [answer.roleDepartment], (err, resDeco) => {
          if (err) throw err;
          const queryInsert = "INSERT INTO role VALUES(default, ?, ?, ?);";
          connection.query(queryInsert, [answer.roleName, answer.roleSalary, resDeco[0].id], (err, res) => {
            if (err) throw err;
            console.log(`\nNew ROLE created successfully!\n`)
            // DISPLAY NEW ENTRY IN TABLE
            const querySelectAll = "SELECT r.title AS 'ROLE TITLE', r.salary AS 'SALARY', d.name AS 'DEPARTMENT' FROM role r JOIN department d ON r.department_id = d.id ORDER BY r.id DESC LIMIT 1"
            connection.query(querySelectAll, (err, res) => {
              if (err) throw err;
              console.table(res);
              actionSelect();
*/