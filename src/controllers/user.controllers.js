import bcrypt, { hash } from "bcrypt"
import UserService from "../services/user.service.js";
import { GenerateUserId } from "../utils/generateUuid.js";
import { Generate_access_Token, Generate_refresh_Token } from "../utils/generateToken.js";
class UserController {
    static async Add_User(req, resp) {
        try {
            // cheching if the user alreay exit on data base 
            const exiting = await UserService.findUser({ email: req.body.email })
            if (exiting.email) {
                return resp.status(409).json({
                    success: false,
                    message: "User already exit please, try diferent Email",
                    user: exiting
                })
            }
            // generate a unique key for a new user
            const userId = "USER_" + GenerateUserId()
            const user = await UserService.Add_User(req.body, userId)
            console.log('User save on DataBase', user)
            return await resp.status(201).json({ success: true, Message: "User has been created successfully", Info: user })
        } catch (error) {
            console.log('server failed...', error)
            return resp.status(500).json({ success: false, Message: "Server Failed.", Error: error.message })
        }
    }
    static async Delete_User(req, resp) {
        try {
            const Id = req.params.Id
            console.log(req.params.Id)
            const user = await UserService.Delete_User(Id)
            if (!user) {
                return resp.status(404).json({
                    success: false,
                    message: "User not found or already deleted"
                });
            }
            console.log('User DELETED', user)
            return resp.status(201).json({ success: true, Message: "Request Deleted successfully ", response: user })
        } catch (error) {
            console.log('server failed...', error)
            return resp.status(500).json({
                success: false,
                Message: "Server Failed",
                Error: error.message
            })
        }
    }
    // a function to get the user by Id 
    static async Get_UserById(req, resp) {
        try {
            // getting user id by request if it doesn't exist it will return an error 
            const Id = req.params.Id;
            if (!Id) {
                return resp.status(404).json({
                    success: false,
                    Message: "ERROR Server: Any User Selected !!!"
                })
            }
            // sending user Id to user service to handle 
            const user = await UserService.findUser({ uuid: Id })
            if (!user) {
                return resp.status(500).json({
                    success: false,
                    Message: "ERROR Server: User not Found !!!"
                })
            }
            // display the user found 
            console.log("USER FOUND SUCCESSFULLY: ", user)
            return resp.status(201).json({
                success: true,
                Message: "USER FOUND SUCCESSFULLY: ",
                Info: user
            })
        } catch (error) {
            // handling error 
            console.log("USER ERROR: ", error)
            return resp.status(500).json({
                success: false,
                Message: "ERROR Server: User not Found !!!",
                Error: error.message
            })
        }
    }
    static async logIn(req, resp) {
        try {
            console.log(req.body)
            const { email, password } = req.body // getting user email and password
            if (!email && !password) {
                return resp.status(400).json({
                    success: false,
                    message: "email or password is empty"
                })
            }
            const user = await UserService.findUser({ email })
            // if the user does not exit then resp is 404
            if (!user[0].Password && !user[0].Email) {

                return resp.status(404).json({
                    success: false,
                    message: "User not found, Incorrect Email or Password"
                })
            }
            console.log("user values, User: ", user)
            // checking if the password much
            const match = await bcrypt.compare(password, user[0].Password)
            if (!match) {
                console.log("Invalid Password or Email")
                return resp.status(404).json({
                    success: false,
                    message: "Invalid Password or Email"
                })
            }
            // we have to hash the password to compare the 
            const hash_pwd = await bcrypt.hash(password, 10)
            if (!hash_pwd) {
                return resp.status(500).json({
                    success: false,
                    message: "Could not hash Client password"
                })
            }
            // if email and password much for the data of database
            if (email === user[0].Email && match) {
                const access_token = Generate_access_Token({ id: user[0].User_ID, role: user[0].Role, email: user[0].Email, username: user[0].UserName, firstname: user[0].FirstName, lastname: user[0].LastName })
                resp.cookie("acstk", access_token, {
                    maxAge: 15 * 60 * 1000,
                    secure: false,
                    httpOnly: false
                })
                const refresh_token = Generate_refresh_Token({ id: user[0].User_ID, role: user[0].Role, email: user[0].Email, username: user[0].UserName, firstname: user[0].FirstName, lastname: user[0].LastName })
                resp.cookie('rfstk', refresh_token, {
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    httpOnly: true,
                    path: "/"
                })
                return resp.status(201).json({
                    success: true,
                    message: "User logged in Successfully",
                    user: { id: user[0].User_ID, role: user[0].Role, email: user[0].Email, username: user[0].UserName, firstname: user[0].FirstName, lastname: user[0].LastName },
                    token: access_token
                })
            } else {
                console.log("Invalid Password or Email")
                return resp.status(404).json({
                    success: false,
                    message: "Invalid Password or Email"
                })
            }
        } catch (error) {
            console.log("User login Failed", error)
            return resp.status(500).json({
                success: false,
                message: "User login Failed",
                Error: error.message
            })
        }
    }
    // get All User
     static async GetAllUser (req, resp){
        try {
            const {page, limit, search} = JSON.parse(req.query.query)
            if(!page || !limit){
                console.log("query not provided")
                return resp.status(404).json({
                success: false,
                message: "query not provided",
            })
            }
            const user = await UserService.getAllUser(page, limit, search)
            if(!user){
                console.log("Users Result Failed")
                return resp.status(404).json({
                success: false,
                message: "Users Result Failed",
                })
            }
            return resp.status(201).json({
                success: true,
                message: "User Request successfully",
                response: user
                })
        } catch (error) {
            return resp.status(500).json({
                success: false,
                message: "User Request Failed",
                Error: error.message
            })
        }
    }
    static async getUserByEmail(req, resp) {
        try {
            const { email } = req.params
            if (!email) {
                console.log("Email not provided")
                return resp.status(404).json({
                    success: false,
                    message: "Query not provided",
                })
            }
            const customers = await UserService.getUserByEmail(email)
            if (!customers) {
                console.log("Cutomers Result Failed")
                return resp.status(404).json({
                    success: false,
                    message: "Cutomers Result Failed",
                })
            }
            console.log("successfully:", customers)
            return resp.status(201).json({
                success: true,
                message: "Customers Request successfully",
                response: customers
            })
        } catch (error) {
            return resp.status(500).json({
                success: false,
                message: "Customers Request Failed",
                Error: error.message
            })
        }
    }
}
export default UserController