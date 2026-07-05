const bcrypt = require("bcryptjs");

bcrypt.hash(
    "Akshita@2009",
    10
).then(console.log);