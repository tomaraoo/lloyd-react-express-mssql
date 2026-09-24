import express from 'express'
import pool, { poolConnect, sql } from '../config/db.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authenticateToken, async (req, res) => {
    try {
        await poolConnect

        const result = await pool.request()
            .input('userId', sql.Int, req.user.id)
            .query(`
                SELECT id, title, description, due_date, status, created_at, updated_at
                FROM dbo.tasks
                WHERE user_id = @userId
                ORDER BY created_at DESC
            `)

        res.json(result.recordset)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to retrieve tasks' })
    }
})

export default router
