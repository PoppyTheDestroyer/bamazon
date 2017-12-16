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

function productDisplay() {
    var query = "SELECT item_id, product_name, price FROM products;";
    connection.query(query, function (err, response) {
        if (err) {
            throw err
        };
        for (var i = 0; i < response.length; i +=1) {
            console.log(`Product ID: ${response[i].item_id} \nItem: ${response[i].product_name} \nPrice: $${response[i].price}\n`)
        }
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
                var item = "SELECT stock_quantity FROM products WHERE item_id = " + inquirerResponse.itemId + ";";
                connection.query(item, function (err, response) {
                    if (err) {
                        throw err
                    }
                    //console.log(response[0].stock_quantity);
                    //console.log(inquirerResponse.quantity)
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
                                    //console.log(responseTwo[0].stock_quantity);
                                    //console.log(inquirerResponseTwo.quantityTwo);
                                    if (responseTwo[0].stock_quantity < inquirerResponseTwo.quantityTwo) {
                                        console.log("Ok, we're done here. Come back when you understand basic math. Idiot.");
                                        connection.end();
                                    } else {
                                        purchase(response[0].stock_quantity, inquirerResponseTwo.quantityTwo, inquirerResponse.itemId)
                                    }
                                })
                            })
                    } else {
                        //console.log(inquirerResponse.itemId);
                        //console.log(inquirerResponse.quantity);
                        //console.log(response[0].stock_quantity);
                        purchase(response[0].stock_quantity, inquirerResponse.quantity, inquirerResponse.itemId)
                    }
                });
            })
    });
}
productDisplay();

function purchase(num, funQuant, itemNumber) {
    var updateQuantity = num - funQuant;
    //console.log(updateQuantity);
    var buy = "UPDATE products SET stock_quantity = " + updateQuantity + " WHERE item_id = " + itemNumber + ";";
    connection.query(buy, function (err, response) {
        if (err) {
            throw err
        }
        var total = "SELECT price, product_sales FROM products WHERE item_id = " + itemNumber;
        connection.query(total, function (err, response) {
            if (err) {
                throw err
            }
            var totalPrice = funQuant * response[0].price;
            var productTotal = totalPrice + parseInt(response[0].product_sales);
            var updateSales = "UPDATE products SET product_sales = " + productTotal + " WHERE item_id = " + itemNumber + ";";
            connection.query(updateSales, function(err, response) {
                if(err) {
                    throw err
                }
            })
            console.log("Your total is $" + totalPrice +". Thank you for your money. And your business, I guess.");
            connection.end();
        })
    })
};

