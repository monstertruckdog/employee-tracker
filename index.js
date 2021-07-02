require('dotenv').config()
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
let employeeNameSelection;

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
        'Update | Employee\'s Role',
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
          addNewEmployee();
          break;

        case 'View   | All Departments':
          viewDepartments();
          break;

        case 'View   | All Roles':
          viewRoles();
          break;
        
        case 'View   | All Employees':
          viewEmployees();
          break;

        case 'Update | Employee\'s Role':
          updateEmployeeRole();
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
      // TABLE RECORD INSERTION
      const queryInsert = "INSERT INTO department VALUES(default, ?);";
      connection.query(queryInsert, [answer.deptName], (err, res) => {
        if (err) throw err;
        console.log(`\nNew DEPARTMENT created successfully!\n`)
      });
      // DISPLAY NEW RECORD IN TABLE
      const querySelectAll = "SELECT id AS 'DEPT ID', name AS 'DEPT NAME' FROM department ORDER BY id DESC LIMIT 1"
      connection.query(querySelectAll, (err, res) => {
        if (err) throw err;
        console.table(res);
        actionSelect();
      });
    })
};

const addNewRole = () => {
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
      const queryCheckExist = "SELECT title FROM role WHERE UPPER(title) = ?"
      connection.query(queryCheckExist, [answer.roleName.toUpperCase()], (err, res) => {
        if (err) throw err;
        if (res.length > 0 && (res[0].title.toUpperCase() === answer.roleName.toUpperCase())) {
          console.log(`Role title "${answer.roleName}" already exists.  Please try again`)
          exit();
        }
      });
      const queryDecode = `SELECT d.id FROM department d WHERE ? = d.name`
      connection.query(queryDecode, [answer.roleDepartment], (err, resDeco) => {
        if (err) throw err;
        const queryInsert = "INSERT INTO role VALUES(default, ?, ?, ?);";
        connection.query(queryInsert, [answer.roleName, answer.roleSalary, resDeco[0].id], (err, res) => {
          if (err) throw err;
          console.log(`\nNew ROLE created successfully!\n`)
          // DISPLAY NEW TABLE RECORD IN TABLE
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
          message: 'First name of new Employee'
      },
      {
          name: 'employeeLastName',
          type: 'input',
          message: 'Last name of new Employee'
      }
  ])
  .then((answer) => {
      const queryCheckExist = `SELECT first_name, last_name
                               FROM employee
                               WHERE UPPER(first_name) = ?
                               AND UPPER(last_name) = ?`
      // CHECK FOR DUPLICATES:  employee.first_name, employee.last_name
      connection.query(queryCheckExist, [answer.employeeFirstName.toUpperCase(), answer.employeeLastName.toUpperCase()], (err, res) => {
          if (err) throw err;
          if (res.length > 0 && (res[0].first_name.toUpperCase() === answer.employeeFirstName.toUpperCase()) && (res[0].last_name.toUpperCase() === answer.employeeLastName.toUpperCase())) {
              console.log(`Employee name "${answer.employeeFirstName} ${answer.employeeLastName}" already exists.  Please try again`)
              exit();
          }
          employeeNames.push(answer.employeeFirstName, answer.employeeLastName)
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
              const queryDecodeRole = `SELECT f.id
                                      FROM role f
                                      WHERE f.title = ?`
              const queryDecodeManager = `SELECT deco.id
                                          FROM employee deco
                                          JOIN role rdeco
                                            ON deco.role_id = rdeco.id
                                          WHERE ? = CONCAT(deco.first_name, ' ', deco.last_name, ' (', rdeco.title, ')')`
              connection.query(queryDecodeRole, [answer.employeeRole], (err, resDecoRole) => {
                if (err) throw err;
                connection.query(queryDecodeManager, [answer.employeeManagerSelection], (err, resDecoMgr) => {
                  if (err) throw err;
                  // TABLE RECORD INSERTION
                  const queryInsertEmployee = `INSERT INTO employee
                                              VALUES(default, ?, ?, ?, ?)`                        
                  if (answer.employeeManagerSelection === 'No assigned manager') {
                    connection.query(queryInsertEmployee, [employeeNames[0], employeeNames[1], resDecoRole[0].id, null], (err, res) => {
                      if (err) throw err;
                    })
                  } else {
                      connection.query(queryInsertEmployee, [employeeNames[0], employeeNames[1], resDecoRole[0].id, resDecoMgr[0].id], (err, res) => {
                        if (err) throw err;
                        console.log(`\nNew EMPLOYEE created successfully\n`)
                    })
                  }
                  // DISPLAY NEW TABLE RECORDS AND RESTART MAIN MENU OPTIONS
                  employeeAddDisplay();
                })
              })
            })
          })
        })
  })
};

const viewDepartments = () => {
  const queryViewDepartments = `SELECT
                                  id AS 'Department ID',
                                  name AS 'Department Name'
                                FROM department
                                ORDER BY id ASC`
  connection.query(queryViewDepartments, (err, res) => {
    if (err) throw err;
    console.log('');
    console.table(res);
    actionSelect();
  })
}

const viewRoles = () => {
  const queryViewRoles = `SELECT
	                          r.id AS "Role ID",
	                          r.title AS "Role Title Name",
	                          r.salary AS "Role Salary (USD)",
	                          r.department_id AS "Department ID",
                            d.name AS "Department Name"
                          FROM role r
                          JOIN department d
                            ON r.department_id = d.id
                          ORDER BY r.id ASC;`
  connection.query(queryViewRoles, (err, res) => {
    if (err) throw err;
    console.log('');
    console.table(res);
    actionSelect();
  })
}

const viewEmployees = () => {
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
    if (err) throw err;
    console.log('');
    console.table(res);
    actionSelect();
  })
};

const updateEmployeeRole = () => {
  const queryEmployeeNameList = `SELECT
                                  CONCAT(e.first_name, ' ', e.last_name) AS 'full_name'
                                FROM employee e
                                ORDER BY e.last_name, e.first_name ASC`
  const queryRoleList = `SELECT
                          DISTINCT(r.title)
                        FROM role r
                        ORDER BY r.title ASC`
  let queryEmpList;
  connection.query(queryEmployeeNameList, (err, res) => {
    if (err) throw err;
      queryEmpList = res;
  
    inquirer
      .prompt([
        {
          name: 'updateEmpRolEmpName',
          type: 'rawlist',
          message: 'Select Employee name',
          choices() {
            const empNameList = [];
            queryEmpList.forEach(({ full_name }) => {
              empNameList.push(full_name);
            });
            return empNameList
          }
        },
      ])
      .then((answer) => {
        employeeNameSelection = answer.updateEmpRolEmpName
        const querySelectedEmployeeRole =   `SELECT
                                              r.title AS 'role_title'
                                            FROM employee e
                                            JOIN role r
                                              ON e.role_id = r.id
                                            WHERE CONCAT(e.first_name, ' ', e.last_name) = ?`
        connection.query(querySelectedEmployeeRole, [answer.updateEmpRolEmpName], (err, resRole) => {
          if (err) throw err;
          console.log(`EMPLOYEE\'S CURRENT ROLE:  `, resRole[0].role_title)
        });
        connection.query(queryRoleList, (err, res) => {
          if (err) throw err;
          inquirer
            .prompt([
              {
                name: 'updateEmpRolRoleList',
                type: 'rawlist',
                message: 'Select the new ROLE for the EMPLOYEE',
                choices() {
                  const roleDeptChoices = [];
                  res.forEach(({ title }) => {
                    roleDeptChoices.push(title);
                });
                return roleDeptChoices
              }
            }
          ])
          .then((answer) => {
            const queryUpdateEmployeeRole = `UPDATE employee e
                                            JOIN role r
                                              ON e.role_id = r.id
                                            SET e.role_id = (SELECT *
                                                            FROM (SELECT d.id
                                                                  FROM role d
                                                                  WHERE ? = d.title) x)
                                            WHERE ? = CONCAT(e.first_name, ' ', e.last_name)`
              connection.query(queryUpdateEmployeeRole, [answer.updateEmpRolRoleList, employeeNameSelection], (err, res) => {
              if (err) throw err;
              console.log(`EMPLOYEE\'S ROLE HAS BEEN SUCCESSFULLY UPDATED`)
              employeeUpdateDisplay(employeeNameSelection);
            })
          })
        })
      })
    })
  }
    

// Accesory functions
const exit = () => {
  console.log(`\n\nExiting application\n`)
  process.exit();
};

const employeeAddDisplay = () => {
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
};

const employeeUpdateDisplay = (employeeNameSelection) => {
  const querySelectUpdatedEmployee = `SELECT
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
                                      WHERE CONCAT(e.first_name, ' ', e.last_name) = ?`
  connection.query(querySelectUpdatedEmployee, [employeeNameSelection], (err, res) => {
    if (err) throw err;
    console.table(res);
    actionSelect();
  })
};