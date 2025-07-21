const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const baseController = require("./controllers/baseController")
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities")

const app = express()

app.use(express.static("public"))
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

app.use(static)

// Index Route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory Routes
app.use("/inv", inventoryRoute)

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
