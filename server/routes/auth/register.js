import express from 'express'
import bcrypt from 'bcryptjs'
import pool, { poolConnect, sql } from '../../config/db.js'

const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const { username, email, password } = req.body

        if (!username?.trim() || !email?.trim() || !password) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        if (password.length < 4) {
            return res.status(400).json({ message: 'Password must be at least 4 characters' })
        }

        await poolConnect

        const existingUser = await pool.request()
            .input('username', sql.NVarChar(50), username.trim())
            .input('email', sql.NVarChar(100), email.trim())
            .query('SELECT id FROM users WHERE username = @username OR email = @email')

        if (existingUser.recordset.length > 0) {
            return res.status(409).json({ message: 'Username or email already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const result = await pool.request()
            .input('username', sql.NVarChar(50), username.trim())
            .input('email', sql.NVarChar(100), email.trim())
            .input('passwordHash', sql.NVarChar(255), hashedPassword)
            .query(`
                INSERT INTO users (username, email, password_hash)
                OUTPUT INSERTED.id
                VALUES (@username, @email, @passwordHash)
            `)

        res.status(201).json({
            message: 'Registration successful',
            userId: result.recordset[0].id
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Registration failed' })
    }
})

export default router
