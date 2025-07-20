/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const baseController = require("./controllers/baseController")
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities")

/* ***********************
 * App Setup
 *************************/
const app = express()

/* ***********************
 * Middleware to Serve Static Files
 *************************/
app.use(express.static("public"))

/* ***********************
 * View Engine and Template
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // Relative to 'views' folder

/* ***********************
 * Routing
 *************************/
app.use(static)

// Index Route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory Routes
app.use("/inv", inventoryRoute)

/* ***********************
 * 404 Handler - Must be last non-error route
 *************************/
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

/* ***********************
 * Global Error Handler
 * Catch and report application errors
 *************************/
app.use(async (err, req, res, next) => {
  const nav = await utilities.getNav()
  const status = err.status || 500
  const message =
    err.status === 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?"

  console.error(`ERROR at ${req.originalUrl}: ${err.stack}`)

  res.status(status).render("errors/error", {
    title: status,
    message,
    nav
  })
})

/* ***********************
 * Server Startup
 *************************/
const port = process.env.PORT || 3000
const host = process.env.HOST || "localhost"

app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`)
})
