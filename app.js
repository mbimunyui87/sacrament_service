const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to database");
});

// Routes

// Home Route (Search and Form)
app.get("/", (req, res) => {
  res.render("index", { members: [], search: "" });
});

// Search Members
app.post("/search", (req, res) => {
  const searchQuery = req.body.search.trim();
  const sql = "SELECT memberId, firstName, lastName FROM Members WHERE firstName LIKE ? OR lastName LIKE ?";

  db.query(sql, [`%${searchQuery}%`, `%${searchQuery}%`], (err, results) => {
    if (err) {
      console.error("Error executing search query:", err);
      return res.status(500).send("Server Error");
    }
    res.render("index", { members: results, search: searchQuery });
  });
});

// Submit Sacrament Form
app.post("/submit", (req, res) => {
  const { memberId, sacramentType, sacramentDate, performedBy, status, godMother, godFather } = req.body;

  const sql = `INSERT INTO Sacrament (memberId, sacramentType, sacramentDate, performedBy, status, godMother, godFather)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [memberId, sacramentType, sacramentDate, performedBy, status, godMother, godFather], (err) => {
    if (err) {
      console.error("Error inserting into Sacrament table:", err);
      return res.status(500).send("Server Error");
    }
    res.redirect("/");
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
