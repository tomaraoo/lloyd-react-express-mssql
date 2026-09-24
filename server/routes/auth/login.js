import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool, { poolConnect, sql } from '../../config/db.js'

const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const { username, password } = req.body

        if (!username?.trim() || !password) {
            return res.status(400).json({ message: 'Username and password are required' })
        }

        await poolConnect

        const result = await pool.request()
            .input('username', sql.NVarChar(50), username.trim())
            .query('SELECT id, username, password_hash FROM dbo.[users] WHERE username = @username')

        const user = result.recordset[0]

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: 'Invalid username or password' })
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        )

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Login failed' })
    }
})

export default router
