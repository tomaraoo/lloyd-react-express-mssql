import express from 'express'
import pool, { poolConnect, sql } from '../config/db.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

router.get('/tasks', authenticateToken, async (req, res) => {
    try {
        const status = req.query.status || null
        const startDate = req.query.start_date || null
        const endDate = req.query.end_date || null

        if (status && !['Pending', 'Completed'].includes(status)) {
            return res.status(400).json({ message: 'Status is invalid' })
        }

        await poolConnect

        const result = await pool.request()
            .input('userId', sql.Int, req.user.id)
            .input('status', sql.NVarChar(20), status)
            .input('startDate', sql.Date, startDate)
            .input('endDate', sql.Date, endDate)
            .query(`
                SELECT
                    COUNT(*) AS total,
                    COALESCE(SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END), 0) AS pending,
                    COALESCE(SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END), 0) AS completed,
                    COALESCE(SUM(CASE WHEN status = 'Pending' AND due_date < CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END), 0) AS overdue
                FROM dbo.tasks
                WHERE user_id = @userId
                  AND (@status IS NULL OR status = @status)
                  AND (@startDate IS NULL OR due_date >= @startDate)
                  AND (@endDate IS NULL OR due_date <= @endDate);

                SELECT id, title, description, due_date, status, created_at, updated_at
                FROM dbo.tasks
                WHERE user_id = @userId
                  AND (@status IS NULL OR status = @status)
                  AND (@startDate IS NULL OR due_date >= @startDate)
                  AND (@endDate IS NULL OR due_date <= @endDate)
                ORDER BY due_date, title;
            `)

        res.json({
            summary: result.recordsets[0][0],
            tasks: result.recordsets[1]
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to generate report' })
    }
})

export default router
