require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const session = require("express-session");
const flash = require("connect-flash");
const expressLayouts = require("express-ejs-layouts");
const { Pool } = require("pg");
const app = express();

// set middleware
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.use(
    session({
        secret: "secret key",
        resave: false,
        saveUninitialized: false,
    })
);
app.use(flash());

// contoh penggunaan middleware
app.use((req, res, next) => {
    console.log("Time:", Date.now());
    next();
});
app.use(morgan(":method :url :status :response-time ms - :res[content-length]"));
app.get("/css/style.css", (req, res) => {
    res.end();
});

// test add data to postgres
app.get("/addasync", async (req, res) => {
    const pool = new Pool();
    try {
        // mendefinisikan query
        const order = {
            text: "INSERT INTO contacts VALUES($1, $2, $3) RETURNING *",
            values: ["Ramdhani", "aryasubagja1999@gmail.com", "088222520321"],
        };
        // mengeksekusi query
        const result = await pool.query(order);
        res.json(result);
    } catch (error) {
        console.log(error);
        return false;
    }
});

// menerapkan route kedalam app
app.use("/", require("./routes"));

// menjalankan express pada port
app.listen(process.env.PORT, () => {
    console.log(`Server running at port: ${process.env.PORT}`);
});
