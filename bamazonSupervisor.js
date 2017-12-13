const connectObject = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
};

const mySql = require("mysql");
const inquirer = require("inquirer");
const connection = mySql.createConnection(connectObject);

connection.connect(function (err) {
    if (err) {
        throw err
    };
    begin();
    //console.log(`Connected as ID: ${connection.threadId}`);
});

function begin() {inquirer
    .prompt([
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["View product sales by department", "Create new department", "Exit"],
            name: "begin"
        }
    ])
    .then(function (inquirerResponse) {
        if (inquirerResponse.begin === "View product sales by department") {
            displayTable();
        }
        if (inquirerResponse.begin === "Create new department") {
            newDept();
        }
        if (inquirerResponse.begin === "Exit") {
            connection.end();
        }
    })
}

function newDept() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "Assign an ID to the new department.",
                name: "departmentNew"
            },
            {
                type: "input",
                message: "Enter the name of the new department",
                name: "deptName"
            },
            {
                type: "input",
                message: "What is the overhead for the new department?",
                name: "overhead"
            }
        ])
        .then(function (inquirerResponse) {
            connection.query("INSERT INTO departments SET ?", {
                department_id: inquirerResponse.departmentNew,
                department_name: inquirerResponse.deptName, overhead_costs: inquirerResponse.overhead
            }, function (err, response) {
                if (err) {
                    throw err
                }
                console.log("Department ID: " + inquirerResponse.departmentNew + 
                "\nDepartment Name: " + inquirerResponse.deptName + "\nOverhead: " + inquirerResponse.overhead + "\n");
                begin();
            })
            
    })
}

function displayTable() {

};

function joinTable() {
    var tableJoin = "SELECT departments.department_id, departments.department_name, departments.overhead_costs, products.product_sales FROM departments INNER JOIN products ON departments.department_name = products.department_name;";
connection.query(tableJoin, function (err, response) {
    if(err) {
        throw err
    }
})
}