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
        'Add    | New Department',
        'Add    | New Role',
        'Add    | New Employee',
        'View   | All Departments',
        'View   | All Roles',
        'View   | All Employees',
        'Update | Employee Roles',
        'Exit'
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
          rangeSearch();
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
          //console.log('Goodbye!');
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
      // CHECK FOR DUPLICATES
      const queryCheckExist = "SELECT name FROM department WHERE UPPER(name) = ?"
      connection.query(queryCheckExist, [answer.deptName.toUpperCase()], (err, res) => {
        if (err) throw err;
        if (res.length > 0 && (res[0].name.toUpperCase() === answer.deptName.toUpperCase())) {
          console.log(`Department name "${answer.deptName}" already exists.  Please try again`)
          //process.exit(1);
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
  connection.query(`SELECT DISTINCT(d.name) FROM department d JOIN role r ON d.id = r.department_id;`, (err, res) => {
  // connection.query(`SELECT DISTINCT(d.name) FROM department d;`, (err, res) => {
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
      // CHECK FOR DUPLICATES
      console.log(`--> Salary value is valid ('true') or invalid ('false'):  ${/\d{0,10}\.\d{2}/g.test(answer.roleSalary)}`);
      const queryCheckExist = "SELECT title FROM role WHERE UPPER(title) = ?"
      connection.query(queryCheckExist, [answer.roleName.toUpperCase()], (err, res) => {
        if (err) throw err;
        if (res.length > 0 && (res[0].title.toUpperCase() === answer.roleName.toUpperCase())) {
          console.log(`Role title "${answer.roleName}" already exists.  Please try again`)
          //process.exit(1);
          exit();
        }
      });
      // INSERTION
      console.log(`--> INPUT FROM USER - title:  ${answer.roleName}`);
      console.log(`--> INPUT FROM USER - salary:  ${answer.roleSalary}`);
      console.log(`--> INPUT FROM USER - department:  ${answer.roleDepartment}`);
      const queryDecode = "SELECT DISTINCT(d.id) FROM department d JOIN role r ON d.id = r.department_id WHERE UPPER(d.name) = UPPER(?);"
      /*
      connection.query(queryDecode, [answer.roleDepartment], (err, resDeco) => {
        if (err) throw err;
        console.log(`--> INPUT FROM USER - DECODED department:  `, resDeco[0]);
        console.log(`--> INPUT FROM USER - DECODED department index 'id':  `, resDeco[0].id);
        const roleDepartmentDecoded = resDeco[0].id;
        console.log(`--> 172 | INPUT FROM USER - DECODED department index 'id' as variable (roleDepartmentDecoded):  `, roleDepartmentDecoded);
      });
      console.log(`--> 175 | (from INSERT query) INPUT FROM USER - DECODED department:  `, roleDepartmentDecoded);
      const queryInsert = "INSERT INTO role VALUES(default, ?, ?, ?);";
      connection.query(
        /*
        queryInsert,
        [
          {
            title: answer.roleName
          },
          {
            salary: answer.roleSalary
          },
          {
            // department_id: answer.roleDepartment
            department_id: roleDepartmentDecoded
          }
        ],
        */
       /*
        queryInsert, [answer.roleName, answer.RoleSalary, roleDepartmentDecoded],
        (err, res) => {
        if (err) throw err;
        console.log(`\nNew ROLE created successfully!\n`)
      });
      */
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
      
      /*
      // DISPLAY NEW ENTRY IN TABLE
      const querySelectAll = "SELECT r.title AS 'ROLE TITLE', r.salary AS 'SALARY', d.name AS 'DEPARTMENT' FROM role r JOIN department d ON r.department_id = d.id ORDER BY r.id DESC LIMIT 1"
      connection.query(querySelectAll, (err, res) => {
        if (err) throw err;
        console.table(res);
        actionSelect();
      });
      */
     //actionSelect();
    })
  })
};

const viewEmployees = () => {
  const query = 'SELECT * FROM employee;';
  connection.query(query, (err, res) => {
    console.log('');
    console.table(res);
    actionSelect();
  })
};

const exit = () => {
  console.log(`\n\nExiting application\n`)
  process.exit();
};