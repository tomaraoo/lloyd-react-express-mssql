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

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, due_date } = req.body

        if (!title?.trim() || !due_date) {
            return res.status(400).json({ message: 'Title and due date are required' })
        }

        await poolConnect

        const result = await pool.request()
            .input('userId', sql.Int, req.user.id)
            .input('title', sql.NVarChar(100), title.trim())
            .input('description', sql.NVarChar(500), description?.trim() || null)
            .input('dueDate', sql.Date, due_date)
            .query(`
                INSERT INTO dbo.tasks (user_id, title, description, due_date)
                OUTPUT INSERTED.id, INSERTED.title, INSERTED.description,
                       INSERTED.due_date, INSERTED.status,
                       INSERTED.created_at, INSERTED.updated_at
                VALUES (@userId, @title, @description, @dueDate)
            `)

        res.status(201).json(result.recordset[0])
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to create task' })
    }
})

router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const taskId = Number(req.params.id)
        const { title, description, due_date, status } = req.body

        if (!Number.isInteger(taskId) || !title?.trim() || !due_date) {
            return res.status(400).json({ message: 'Task data is invalid' })
        }

        if (!['Pending', 'Completed'].includes(status)) {
            return res.status(400).json({ message: 'Status is invalid' })
        }

        await poolConnect

        const result = await pool.request()
            .input('id', sql.Int, taskId)
            .input('userId', sql.Int, req.user.id)
            .input('title', sql.NVarChar(100), title.trim())
            .input('description', sql.NVarChar(500), description?.trim() || null)
            .input('dueDate', sql.Date, due_date)
            .input('status', sql.NVarChar(20), status)
            .query(`
                UPDATE dbo.tasks
                SET title = @title,
                    description = @description,
                    due_date = @dueDate,
                    status = @status,
                    updated_at = GETDATE()
                OUTPUT INSERTED.id, INSERTED.title, INSERTED.description,
                       INSERTED.due_date, INSERTED.status,
                       INSERTED.created_at, INSERTED.updated_at
                WHERE id = @id AND user_id = @userId
            `)

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Task not found' })
        }

        res.json(result.recordset[0])
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to update task' })
    }
})

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const taskId = Number(req.params.id)

        if (!Number.isInteger(taskId)) {
            return res.status(400).json({ message: 'Task ID is invalid' })
        }

        await poolConnect

        const result = await pool.request()
            .input('id', sql.Int, taskId)
            .input('userId', sql.Int, req.user.id)
            .query(`
                DELETE FROM dbo.tasks
                OUTPUT DELETED.id
                WHERE id = @id AND user_id = @userId
            `)

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Task not found' })
        }

        res.json({ message: 'Task deleted' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to delete task' })
    }
})

export default router
