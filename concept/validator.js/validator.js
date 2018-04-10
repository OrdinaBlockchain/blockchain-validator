var Transaction = require("./transaction");

var transaction = new Transaction(3, "testkey");

transaction.sign();
transaction.verify();
console.log(transaction.getData());