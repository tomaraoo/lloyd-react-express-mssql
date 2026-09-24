import express from 'express'
import authRoutes from './auth/index.js'
import reportRoutes from './reports.js'
import taskRoutes from './tasks.js'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/reports', reportRoutes)
router.use('/tasks', taskRoutes)

router.get('/health', (req, res) => {
    res.json({ status: 'OK' })
})

export default router
