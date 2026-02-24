import jwt  from "jsonwebtoken";

export default function ValidateToken(req, resp, next) {
    const token = req.hearders.authorisation.split(" ")[1]
    
    if (!token) return resp.status(401).json({
        success: false,
        message: "please, No token provided"
    })
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_ACC_TK)
        req.user = decoded
        next()
    } catch (error) {
        return resp.status(500).json({
            success: false,
            message: "Token Error: ",
            Error: error.message
        })
    }
}