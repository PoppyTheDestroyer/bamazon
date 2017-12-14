const connectObject = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
};

const mySql = require("mysql");
const inquirer = require("inquirer");
const table = require("console.table");
const connection = mySql.createConnection(connectObject);

connection.connect(function (err) {
    if (err) {
        throw err
    };
    begin();
    //console.log(`Connected as ID: ${connection.threadId}`);
});

function begin() {
    inquirer
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
                drawTable();
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
                addProduct(inquirerResponse.deptName);
            })

        })
}

function drawTable() {
    var rows;
    var tableJoin = `SELECT departments.department_id, departments.department_name, departments.overhead_costs, 
    SUM(products.product_sales) AS product_sales, SUM(products.product_sales) - departments.overhead_costs AS 
    total_profit FROM products INNER JOIN departments ON products.department_name = departments.department_name 
    GROUP BY department_id, department_name, overhead_costs;`;
    connection.query(tableJoin, function (err, response) {
        if (err) {
            throw err
        }
        console.log(response);
        for (var i = 0; i < response.length; i += 1) {
            var values = [
                [
                    "department_id", "department_name", "overhead_costs", "product_sales", "total_profit"
                ],
                [
                    response[i].department_id, response[i].department_name, response[i].overhead_costs, response[i].product_sales, response[i].total_profit
                ]
            ]
            console.table(values[0], values.slice(1));
        }
        begin();
    })
}

function addProduct(departmentInv) {
    inquirer
        .prompt([
            {
                type: "input",
                message: "You must enter a product into the new department. Enter an item ID number for the new product.",
                name: "newID"
            },
            {
                type: "input",
                message: "What is the name of the product?",
                name: "name"
            },
            {
                type: "input",
                message: "How much does this item cost?",
                name: "newPrice"
            },
            {
                type: "input",
                message: "How many of this item should be added?",
                name: "newQuant"
            }
        ])
        .then(function (inquirerResponse) {
            connection.query("INSERT INTO products SET ?", {
                item_id: inquirerResponse.newID,
                product_name: inquirerResponse.name, department_name: departmentInv,
                price: inquirerResponse.newPrice, stock_quantity: inquirerResponse.newQuant, product_sales: 0
            },
                function (err, response) {
                    if (err) {
                        throw err
                    }
                    console.log("Product ID: " + inquirerResponse.newID + "\nItem: " + inquirerResponse.name +
                        "\nDepartment: " + inquirerResponse.newDept + "\nPrice: $" + inquirerResponse.newPrice +
                        "\nIn Stock: " + inquirerResponse.newQuant + "\n");
                        begin();
                })
        })
}
