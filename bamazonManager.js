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
    }
    //console.log(`Connected as ID: ${connection.threadId}`);
});

var begin = inquirer
    .prompt([
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["View products for sale", "View low inventory", "Add to inventory", "Add new product", "Exit"],
            name: "init"
        }
    ])
    .then(function (inquirerResponse) {
        if (inquirerResponse.init === "View products for sale") {
            viewAll();
        };
        if (inquirerResponse.init === "View low inventory") {
            lowInv();
        };
        if (inquirerResponse.init === "Add to inventory") {
            addTo();
        }
    })

function viewAll() {
    var allProducts = "SELECT * FROM PRODUCTS";
    connection.query(allProducts, function (err, response) {
        if (err) {
            throw err
        }
        for (var i = 0; i < response.length; i += 1) {
            console.log("Product ID: " + response[i].item_id + "\nItem: " + response[i].product_name +
                "\nDepartment: " + response[i].department_name + "\nPrice: " + response[i].price +
                "\nIn Stock: " + response[i].stock_quantity + "\n");
        }
    })
    connection.end();
};

function lowInv() {
    var fewLeft = "SELECT item_id, product_name, stock_quantity FROM products WHERE stock_quantity < 5;";
    connection.query(fewLeft, function (err, response) {
        if (err) {
            throw err
        }
        for (var i = 0; i < response.length; i += 1) {
            console.log("Product ID: " + response[i].item_id + "\nItem: " + response[i].product_name +
                "\nIn Stock: " + response[i].stock_quantity + "\n");
        }
    })
    connection.end();
}

function addTo() {
    inquirer
    .prompt([
        {
            type: "input",
            message: "Enter the Product ID of the item you would like to restock.",
            name: "restock"
        },
        {
        type: "input",
        message: "How many would you like to add to the inventory?",
        name: "addInv"
        }
    ])
    .then(function(inquirerResponse){
            var showMore = "SELECT * FROM products WHERE item_id = " + inquirerResponse.restock;
            connection.query(showMore, function(err, responseTwo) {
                if (err) {
                    throw err
                }
                var moreDammit = responseTwo[0].stock_quantity + parseInt(inquirerResponse.addInv);
                console.log(moreDammit);
                console.log(responseTwo[0].stock_quantity);
                var addMore = "UPDATE products SET stock_quantity = " + moreDammit + "+" + inquirerResponse.addInv + " WHERE item_id = " + inquirerResponse.restock + ";";
                connection.query(addMore, function (err, response) {
                    if (err) {
                        throw err
                    }
                console.log("You have added " + inquirerResponse.addInv + " of the " + responseTwo[0].product_name + ". There are now " + moreDammit + " in stock.")
                
            })
            connection.end();
        })
    })
}