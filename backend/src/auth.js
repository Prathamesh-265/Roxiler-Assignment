import jwt from "jsonwebtoken"

export function signToken(payload, secret) {
  return jwt.sign(payload, secret, { expiresIn: "7d" })
}

export function authMiddleware(secret) {
  return (req, res, next) => {
    const hdr = req.headers.authorization || ""
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null
    if (!token) return res.status(401).json({ message: "Unauthorized" })

    try {
      const decoded = jwt.verify(token, secret)
      req.user = decoded
      next()
    } catch (e) {
      return res.status(401).json({ message: "Invalid token" })
    }
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user?.role) return res.status(401).json({ message: "Unauthorized" })
    if (req.user.role !== role) return res.status(403).json({ message: "Forbidden" })
    next()
  }
}
