import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import apiRoutes from './routes/index.js'
import { poolConnect } from './config/db.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
    origin: process.env.CLIENT_URL
}))

app.use(express.json())
app.use('/api', apiRoutes)

app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    })
})

async function startServer() {
    try {
        await poolConnect
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`)
        })
    } catch (error) {
        console.error(`Database connection failed: ${error.message}`)
        process.exit(1)
    }
}

startServer()

export default app
