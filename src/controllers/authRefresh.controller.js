import jwt from "jsonwebtoken"
import { Generate_access_Token } from "../utils/generateToken.js"

class authController {
    static async RefreshPage(req, resp) {
        try {
            const refreshToken = await req.cookies.rfstk // getting the refresh token in cookies
            if (!refreshToken) {
                return resp.status(403).json({
                    success: false,
                    message: "Your are not authorized"
                })
            }
            // jwt verify if the token match and it will return payload 
            const user = jwt.verify(refreshToken, process.env.JWT_SECRET_RFSH_TK)
            console.log(user)
            if (!user) {
                return resp.status(403).json({
                    success: false,
                    message: "Token does not Mutch"
                })
            }
            const New_access_token = Generate_access_Token({id: user.id, role: user.role, firstname:user.firstname, lastname: user.lastname, email: user.email, username:user.username, city:user.city, area: user.area, phone:user.phone})
            if (!New_access_token) {
                return resp.status(403).json({
                    success: false,
                    message: "Invalid refresh token",
                })
            }
            console.log("Access token generated successfully")
            return resp.status(200).json({
                success: true,
                message: "Access token generated successfully",
                user: user,
                token: New_access_token
            })
        } catch (error) {
            console.log("error:", error)

            return resp.status(500).json({
                success: false,
                message: "Invalid refresh token",
                Error: error.message
            })
        }
    }
}
export default authController
