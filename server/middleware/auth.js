import jwt from 'jsonwebtoken'

export function authenticateToken(req, res, next) {
    const authorization = req.headers.authorization
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null

    if (!token) {
        return res.status(401).json({ message: 'Login required' })
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch {
        res.status(401).json({ message: 'Invalid login' })
    }
}
