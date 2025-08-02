const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const baseController = require("./controllers/baseController")
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const utilities = require("./utilities")
const session = require("express-session")
const pool = require('./database/')
const bodyParser = require("body-parser")


const app = express()

app.use(express.static("public"))
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/* ***********************
 * Middleware
 * ************************/
 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("errors/500", {
    title: "Internal Server Error",
    message: err.message || "An unexpected error occurred.",
  });
});
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(static)

// Index Route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory Routes
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute)

// 404 Handler
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

// Error Handler
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  let message = err.status == 500 ? err.message : "Oh no! There was a crash. Maybe try a different route?"
  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  })
})

const port = process.env.PORT || 5500
const host = process.env.HOST || "localhost"

app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`)
})
