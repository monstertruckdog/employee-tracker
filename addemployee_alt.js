require('dotenv').config()
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');

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
    let employeeNames = [];
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
            }
            console.log('NO DUPLICATES FOUND')
            employeeNames.push(answer.employeeFirstName, answer.employeeLastName)
            //.then(() => {
            let managerRes;
            connection.query(queryManagerList, (err, res) => {
              if (err) throw err;
                managerRes = res;
            })
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
                },
                {
                  name: 'employeeManagerSelection',
                  type: 'rawlist',
                  message: 'Select an existing manager assigned to new employee',
                  choices() {
                    const employeeManagerChoices = [];
                    managerRes.forEach(({ full_name_title }) => {
                      employeeManagerChoices.push(full_name_title);
                    })
                    employeeManagerChoices.push('No assigned manager');
                                    
                    return employeeManagerChoices
                  }
                }
              ])
              .then((answer) => {
                console.log(`--> INPUT FROM USER - first_name:  ${employeeNames[0]}`);
                console.log(`--> INPUT FROM USER - last_name:  ${employeeNames[1]}`);
                console.log(`--> INPUT FROM USER - department:  ${answer.employeeRole}`);
                console.log(`--> INPUT FROM USER - department:  ${answer.employeeManagerSelection}`);
                // const queryDecodeRole = `SELECT id
                //                          FROM role
                //                          WHERE '?' = (SELECT DISTINCT(title)
                //                                     FROM role)
                //                          ORDER BY id ASC`
                const queryDecodeRole = `SELECT f.id
                                        FROM role f
                                        WHERE f.title = ?`
                const queryDecodeManager = `SELECT deco.id
                                            FROM employee deco
                                            JOIN role rdeco
                                              ON deco.role_id = rdeco.id
                                            WHERE ? = CONCAT(deco.first_name, ' ', deco.last_name, ' (', rdeco.title, ')')`
                // OLD const queryDecodeRole = "SELECT d.id FROM department d JOIN department i ON d.id = i.id ORDER BY d.id;"
                connection.query(queryDecodeRole, [answer.employeeRole], (err, resDecoRole) => {
                  if (err) throw err;
                  console.log(`--> queryDecodeRole Results:  ${resDecoRole[0].id}`)
                  connection.query(queryDecodeManager, [answer.employeeManagerSelection], (err, resDecoMgr) => {
                    if (err) throw err;
                    console.log(`--> queryDecodeManager Results:  ${resDecoMgr[0].id}`);
                    // INSERTION
                    const queryInsertEmployee = `INSERT INTO employee
                                                VALUES(default, ?, ?, ?, ?)`
                    connection.query(queryInsertEmployee, [employeeNames[0], employeeNames[1], resDecoRole[0].id, resDecoMgr[0].id], (err, res) => {
                      if (err) throw err;
                      console.log(`\nNew EMPLOYEE created successfully\n`)
                    })
                    // DISPLAY NEW ENTRY IN TABLE
                    const querySelectAllEmployee = `SELECT
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
                                                ORDER BY id DESC LIMIT 1;`
                    connection.query(querySelectAllEmployee, (err, res) => {
                      if (err) throw err;
                      console.table(res);
                      actionSelect();
                    })
                })
                
                
                })
              })
            })
          })
    });
};