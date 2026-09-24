import express from 'express'
import registerRouter from './register.js'

const router = express.Router()

router.use('/register', registerRouter)

export default router
