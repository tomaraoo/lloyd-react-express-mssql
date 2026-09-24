import express from 'express'
import loginRouter from './login.js'
import registerRouter from './register.js'

const router = express.Router()

router.use('/login', loginRouter)
router.use('/register', registerRouter)

export default router
