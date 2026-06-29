const bcrypt = require("bcryptjs");

bcrypt.hash(
    "AlucarD$@20005",
    10
).then(console.log);