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
        'Update | Employee Roles'
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
      const query = "INSERT INTO department VALUES(default, '?')";
      connection.query(query, { name: answer.deptName }, (err, res) => {
        //console.log(`--> RESPONSE:  ${answer.deptName}`)
        console.log(''); // to avoid display issue with Inquirer insert of text "Answer:""
        console.table(res);
        actionSelect();
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
