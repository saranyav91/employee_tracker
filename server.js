var mysql = require("mysql");
var inquirer = require("inquirer");


var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "Carno1234@",
  database: "companyDB"
});

connection.connect(function (err) {
  if (err) throw err;
  runSearch();
});

function runSearch() {
  inquirer
    .prompt({
      name: "action",
      type: "rawlist",
      message: "What would you like to do?",
      choices: [
        "Add department",
        "Add role",
        "Add employee",
        "View all departments",
        "View all roles",
        "View all employees",
        "Update employee role"
      ]
    })
    .then(function (answer) {
      switch (answer.action) {
        case "Add department":
          addDepartment();
          break;

        case "Add role":
          addRole();
          break;

        case "Add employee":
          addEmployee();
          break;

        case "View all departments":
          departmentsView();
          break;

        case "View all roles":
          rolesView();
          break;

        case "View all employees":
          employeesView();
          break;

        case "Update employee role":
          updateEmployeerole();
          break;
      }
    });
}

function addDepartment() {
  inquirer
    .prompt({
      name: "department",
      type: "input",
      message: "Enter department name"
    })
    .then(function (answer) {

      connection.query("INSERT INTO department SET ?",
        {
          name: answer.department
        }, function (err, res) {
          runSearch();

        });
    });
}

function addRole() {
  inquirer
    .prompt([{
      name: "title",
      type: "input",
      message: "Enter role title"
    }, {
      name: "salary",
      type: "input",
      message: "Enter role salary"
    }, {
      name: "department_id",
      type: "input",
      message: "Enter role department id"
    },]
    )
    .then(function (answer) {

      connection.query("INSERT INTO role SET ?",
        {
          title: answer.title,
          salary: answer.salary,
          department_id: answer.department_id
        }, function (err, res) {

          if (err) throw err;
          runSearch();
        });
    });
}
function addEmployee() {
  inquirer
    .prompt([{
      name: "first_name",
      type: "input",
      message: "Enter employee first name"
    }, {
      name: "last_name",
      type: "input",
      message: "Enter employee last name"
    }, {
      name: "role_id",
      type: "input",
      message: "Enter employee role id"
    },
    {
      name: "manager_id",
      type: "input",
      message: "Enter employee manager id"
    }]
    )
    .then(function (answer) {

      connection.query("INSERT INTO employee SET ?",
        {
          first_name: answer.first_name,
          last_name: answer.last_name,
          role_id: answer.role_id,
          manager_id: answer.manager_id
        }, function (err, res) {

          runSearch();
        });
    });

}
function departmentsView() {

  var query = "SELECT * FROM department";
  connection.query(query, function (err, res) {

    console.table(res);

    runSearch();
  });

}
function rolesView() {
  var query = "SELECT t1.id, t1.title, t1.salary, t2.name as department_name FROM role t1 INNER JOIN department t2 ON t1.department_id = t2.id";
  connection.query(query, function (err, res) {

    console.table(res);

    runSearch();
  });
}
function employeesView() {
  var query = "SELECT t1.id, t1.first_name, t1.last_name, CONCAT(m.first_name, ' ', m.last_name) AS Manager, t2.title, t2.salary, t3.name AS department_name FROM employee t1 INNER JOIN employee m ON m.id = t1.manager_id INNER JOIN  role t2 ON t1.role_id = t2.id INNER JOIN department t3 ON t2.department_id = t3.id ORDER BY t1.id";

  connection.query(query, function (err, res) {

    console.table(res);

    runSearch();
  });
}
//TO DO update employee role
function updateEmployeerole() {
  //get list of rows and popuate choicelist

  var query = "SELECT title FROM role";
  var roles = [];

  connection.query(query, function (err, res) {
    if (err) throw err;
    //console.log(res.title);
    for (var i = 0; i < res.length; i++) {
      //console.log(res[i].title);
      roles[i] = res[i].title;
    }
  });
  //console.log(roles);

  inquirer
    .prompt([{
      name: "name",
      type: "input",
      message: "Which Employee's role do you want to update?"
    },
    {
      type: 'list',
      message: 'Select a role from the list',
      choices: roles,
      name: "role"
    }
    ])
    .then(function (answer) {
      var name = answer.name.split(" ");
      var role = answer.role;
      var idrole;
      var idemp;
      var query = "SELECT id FROM role WHERE title= ?";
      connection.query(query, role, function (err, res) {
        if (err) throw err;

        idrole = res[0].id;

        var query1 = "SELECT id FROM employee WHERE first_name='" + name[0] + "' AND last_name ='" + name[1] + "'";
        connection.query(query1, function (err, res) {
          if (err) throw err;

          idemp = res[0].id;

          var query2 = "UPDATE employee SET role_id =" + idrole + " WHERE id = " + idemp + "";

          connection.query(query2, function (err, res) {
            if (err) throw err;
            console.log("Updated Employee role");
            runSearch();
          });

        });


      });

    });
}