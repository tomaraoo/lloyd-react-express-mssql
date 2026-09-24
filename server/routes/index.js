import express from 'express'
import authRoutes from './auth/index.js'

const router = express.Router()

router.use('/auth', authRoutes)

router.get('/health', (req, res) => {
    res.json({ status: 'OK' })
})

export default router
