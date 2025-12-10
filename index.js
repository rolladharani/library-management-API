require("dotenv").config();
const express = require("express");
const app = express();
const sequelize = require("./src/config/db");
const { syncModels } = require("./src/models");

// middleware & routes
app.use(express.json());
app.use("/books", require("./src/routes/bookRoutes"));
app.use("/members", require("./src/routes/memberRoutes"));
app.use("/transactions", require("./src/routes/transactionRoutes"));
app.use("/fines", require("./src/routes/fineRoutes"));



app.get("/", (req, res) => res.send("Library API is running..."));

// Start: authenticate, sync, then start server
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database Connected");
    await syncModels(); // creates/updates tables
    console.log("All models synced.");

    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
})();
