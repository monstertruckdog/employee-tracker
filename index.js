require('dotenv').config()
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
let roleDepartmentDecoded;

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
        'Add    | New Department', // Done
        'Add    | New Role', // Done
        'Add    | New Employee',
        'View   | All Departments', // Done
        'View   | All Roles',
        'View   | All Employees',
        'Update | Employee Roles',
        'Exit' // Done
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case 'Add    | New Department':
          addNewDept();
          break;

        case 'Add    | New Role':
          addNewRole();
          break;

        case 'Add    | New Employee':
          addNewEmployee();
          break;

        case 'View   | All Departments':
          rangeSearch();
          break;

        case 'View   | All Roles':
          songSearch();
          break;
        
        case 'View   | All Employees':
          viewEmployees();
          break;

        case 'Update | Employee Roles':
          songAndAlbumSearch();
          break;

        case 'Exit':
          exit();
          break;

        default:
          console.log(`Invalid action: ${answer.action}`);
          break;
      }
    });
};

const addNewDept = () => {
  inquirer
    .prompt({
      name: 'deptName',
      type: 'input',
      message: 'Name of new department',
    })
    .then((answer) => {
      // CHECK FOR DUPLICATES - department.name
      const queryCheckExist = "SELECT name FROM department WHERE UPPER(name) = ?"
      connection.query(queryCheckExist, [answer.deptName.toUpperCase()], (err, res) => {
        if (err) throw err;
        if (res.length > 0 && (res[0].name.toUpperCase() === answer.deptName.toUpperCase())) {
          console.log(`Department name "${answer.deptName}" already exists.  Please try again`)
          exit();
        }
      });
      // INSERTION
      const queryInsert = "INSERT INTO department VALUES(default, ?);";
      connection.query(queryInsert, [answer.deptName], (err, res) => {
        if (err) throw err;
        console.log(`\nNew DEPARTMENT created successfully!\n`)
      });
      // DISPLAY NEW ENTRY IN TABLE
      const querySelectAll = "SELECT id AS 'DEPT ID', name AS 'DEPT NAME' FROM department ORDER BY id DESC LIMIT 1"
      connection.query(querySelectAll, (err, res) => {
        if (err) throw err;
        console.table(res);
        actionSelect();
      });
    })
};

const addNewRole = () => {
  // ORIG connection.query(`SELECT DISTINCT(d.name) FROM department d JOIN role r ON d.id = r.department_id;`, (err, res) => {
  connection.query(`SELECT d.name FROM department d ORDER BY d.id`, (err, res) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: 'roleName',
          type: 'input',
          message: 'Title of new role',
        },
        {
          name: 'roleSalary',
          type: 'input',
          message: 'Salary for new role ($ 0.00 USD)',
          validate(value) {
            const checkCurrencyFormat = value.match(/\d{0,10}\.\d{2}/g); // TO DO:  improve regex to better accomodate currency foramt
            if (checkCurrencyFormat) {
              return true;
            }
          }
        },
        {
          name: 'roleDepartment',
          type: 'rawlist',
          message: 'Select the department associated with the new role',
          choices() {
            const roleDeptChoices = [];
            res.forEach(({ name }) => {
              roleDeptChoices.push(name);
            });
            return roleDeptChoices
          }
        }
      ])
      .then((answer) => {
      // CHECK FOR DUPLICATES - role.title
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
          });
        });
      });
    })
  })
};

// first_name, last_name, role_id, manager_id
const addNewEmployee = () => {
  // ORIG connection.query(`SELECT DISTINCT(d.name) FROM department d JOIN role r ON d.id = r.department_id;`, (err, res) => {
  const queryRoleTitleList = 'SELECT DISTINCT(title) FROM role ORDER BY title'
  const queryManagerList = 
  connection.query(`SELECT d.name FROM department d ORDER BY d.id`, (err, res) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: 'roleName',
          type: 'input',
          message: 'Title of new role',
        },
        {
          name: 'roleSalary',
          type: 'input',
          message: 'Salary for new role ($ 0.00 USD)',
          validate(value) {
            const checkCurrencyFormat = value.match(/\d{0,10}\.\d{2}/g); // TO DO:  improve regex to better accomodate currency foramt
            if (checkCurrencyFormat) {
              return true;
            }
          }
        },
        {
          name: 'roleDepartment',
          type: 'rawlist',
          message: 'Select the department associated with the new role',
          choices() {
            const roleDeptChoices = [];
            res.forEach(({ name }) => {
              roleDeptChoices.push(name);
            });
            return roleDeptChoices
          }
        }
      ])
      .then((answer) => {
      // CHECK FOR DUPLICATES - role.title
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
          });
        });
      });
    })
  })
};

const viewEmployees = () => {
  //const query = 'SELECT * FROM employee;';
  const queryEmployeeAllSelect = `SELECT
	                                  e.id,
                                    CONCAT(e.first_name, ' ', e.last_name) AS "Employee Name",
                                    e.role_id AS "Role ID",
                                    r.title AS "Role Desc",
                                    IFNULL(e.manager_id, 'NA') AS "Manager ID",
                                    IFNULL(CONCAT(m.first_name, ' ', m.last_name), '(No assigned Manager)') AS "Manager Desc"
                                  FROM employee e
                                  JOIN role r
                                    ON e.role_id = r.id
                                  LEFT JOIN employee m
                                    ON e.manager_id = m.id;`
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