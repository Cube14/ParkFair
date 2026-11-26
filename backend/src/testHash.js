const bcrypt = require("bcryptjs");

(async () => {
  const hash =
    "$2b$10$GoGet5AteZ/.NwCC7hwhwewbE0itLQqTkAKc8TiBNVw8lywbnHCi2";

  console.log(
    await bcrypt.compare(
      "Akshita@2009",
      hash
    )
  );
})();