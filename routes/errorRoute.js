// routes/errorRoute.js
import express from "express"
import { triggerError } from "../controllers/errorController.js"

const router = express.Router()

router.get("/error-test", triggerError)

export default router
