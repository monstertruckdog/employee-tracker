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
          multiSearch();
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
      message: 'Name of department',
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