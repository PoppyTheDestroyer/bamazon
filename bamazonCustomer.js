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
    console.log(`Connected as ID: ${connection.threadId}`);
});

function productDisplay() {
    var query = "SELECT * FROM products;";
    connection.query(query, function (err, response) {
        if (err) {
            throw err
        };
        console.log(response);
        inquirer
            .prompt([
                {
                    type: "input",
                    message: "Enter the item ID of the product you would like to buy.",
                    name: "itemId"
                },
                {
                    type: "input",
                    message: "How many would you like to purchase?",
                    name: "quantity"
                }
            ])
            .then(function (inquirerResponse) {
                var item = "SELECT stock_quantity FROM products where item_id = " + inquirerResponse.itemId + ";";
                connection.query(item, function (err, response) {
                    if (err) {
                        throw err
                    }
                    console.log(response[0].stock_quantity);
                    console.log(inquirerResponse.quantity)
                    if (response[0].stock_quantity < inquirerResponse.quantity) {
                        console.log("Insufficient Quantity");
                        inquirer
                            .prompt([
                                {
                                    type: "input",
                                    message: "We currently have " + response[0].stock_quantity + " of your item in stock. How many would you like to purchase?",
                                    name: "quantityTwo"
                                }
                            ])
                            .then(function (inquirerResponseTwo) {
                                connection.query(item, function (err, responseTwo) {
                                    if (err) {
                                        throw err
                                    }
                                    console.log(responseTwo[0].stock_quantity);
                                    console.log(inquirerResponseTwo.quantityTwo);
                                    if (responseTwo[0].stock_quantity < inquirerResponseTwo.quantityTwo) {
                                        console.log("Ok, we're done here. Come back when you understand basic math. Idiot.");
                                        connection.end();
                                    }
                                })
                            })
                    };
//You left off here!!!! var buy = "UPDATE products SET "
                });
            })
    });
}
productDisplay();

function purchase() {

}