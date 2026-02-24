import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import cookieParser from "cookie-parser";
import { GenerateUserId } from "../utils/generateUuid.js";
import { Generate_access_Token, Generate_refresh_Token } from "../utils/generateToken.js";
import CustomersServices from "../services/customers.service.js";
import { Get_OTP } from "../utils/generateOTP.js";
import DataBase from "../config/database.js";

class CustomerControler {
    // --------------------Create a user--------------------
    static async SignUp(req, resp) {
        try {
            const Data = req.body
            if (!Data) {
                console.log("Missing Data please check it");
                return resp.status(404).json({
                    success: false,
                    message: "Missing Data please check it"
                })
            }
            // we should generate a unique uuid for the user
            const user_ID = "CUST_" + GenerateUserId()
            console.log("SLUG", user_ID)
            if (!user_ID) {
                console.log("Could not Generate a Id");
                return resp.status(404).json({
                    success: false,
                    message: "Could not Generate a Id"
                })
            }
            if (Data.password !== Data.confirmpassword) {
                console.log("Please password and confirm password must be the same");
                return resp.status(404).json({
                    success: false,
                    message: "Password do not match"
                })
            }
            const hash_pwd = await bcrypt.hash(Data.password, 10);
            const hash_Confirm_pwd = await bcrypt.hash(Data.confirmpassword, 10);
            if (!hash_pwd || !hash_Confirm_pwd) {
                console.log("Could not hash Password");
                return resp.status(500).json({
                    success: false,
                    message: "Could not hash Password"
                })
            }
            const result = await CustomersServices.CreateUser({ Id: user_ID, data: Data, password: hash_pwd, confirmpassword: hash_Confirm_pwd, Validated: "false" })
            if (!result) {
                console.log("Error to create User");
                return resp.status(500).json({
                    success: false,
                    message: "Error to create User"
                })
            }
            return resp.status(201).json({
                success: true,
                message: "User created Successfully",
                User: result
            })
        } catch (error) {
            console.log(`Could not Create user check Error: ${error.message}`)
            return resp.status(500).json({
                success: false,
                message: "Could not Create user check Error",
                Error: error.message
            })
        }
    }
    // --------------------function to login user --------------------
    static async LogIn(req, resp) {
        try {
            const { email, password } = req.body
            if (!email || !password) {
                return resp.status(404).json({
                    success: false,
                    message: "Email and Password are required!!!"
                })
            }
            // get user by email if user doesnot exit then return an error 
            const UserFound = await CustomersServices.FindUserByEmail(email);
            console.log(UserFound)
            if (!UserFound) {
                console.log("Please , Email or Password does not exist!!!")
                return resp.status(401).json({
                    success: false,
                    message: "Please , Email or Password is incorrect !!!"
                })
            }
            // comparing the password and the data base one 
            const match = await bcrypt.compare(password, UserFound.Password)
            if (!match) {
                console.log("Please ,  Email or Password is incorrect !!!")
                return resp.status(500).json({
                    success: false,
                    message: "Please , Email or Password is incorrect !!!"
                })
            }
            // if the email sent and password much to the database one then continue
            if (email === UserFound.Email && match) {
                // if every goes well and user has been check in database then generate token
                // use only for generate token because token function has three parameters(Id, role, username)
                const Role = "customer"
                const accessToken = Generate_access_Token({ id: UserFound.User_ID, firstname: UserFound.FirstName, lastname: UserFound.LastName, role: Role, email: UserFound.Email, city: UserFound.City, area: UserFound.Area, phone: UserFound.Phone })
                const refreshToken = Generate_refresh_Token({ id: UserFound.User_ID, firstname: UserFound.FirstName, lastname: UserFound.LastName, role: Role, email: UserFound.Email, city: UserFound.City, area: UserFound.Area, phone: UserFound.Phone })
                // check if token has been create or return and error
                if (!accessToken || !refreshToken) {
                    console.log("Could not generate token")
                    return resp.status(400).json({
                        success: false,
                        message: "Could not generate token!!!"
                    })
                }
                resp.cookie('acstk', accessToken, {
                    maxAge: 15 * 60 * 1000,
                    httpOnly: false,
                    secure: false
                })
                resp.cookie('rfstk', refreshToken, {
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    httpOnly: true,
                    secure: false,
                    path: "/"
                })
                return resp.status(201).json({
                    success: true,
                    message: "User logged In successfully!!!",
                    user: { id: UserFound.User_ID, firstname: UserFound.FirstName, lastname: UserFound.LastName, role: Role, email: UserFound.Email, city: UserFound.City, area: UserFound.Area, phone: UserFound.Phone },
                    token: accessToken
                })
            }
        } catch (error) {
            console.log(`"Logged In failed !!!: ${error}`)
            return resp.status(500).json({
                success: false,
                message: "Please , Email or Password is incorrect !!!",
                Error: error.message
            })
        }
    }
    static async GetAllCustomers(req, resp) {
        try {
            const { page, limit, status, search } = JSON.parse(req.query.query)
            if (!page || !limit) {
                console.log("query not provided")
                return resp.status(404).json({
                    success: false,
                    message: "query not provided",
                })
            }
            const customers = await CustomersServices.getAllCustomers(page, limit, status, search)
            if (!customers) {
                console.log("Cutomers Result Failed")
                return resp.status(404).json({
                    success: false,
                    message: "Cutomers Result Failed",
                })
            }
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
    static async Delete_Customer(req, resp) {
        try {
            const Id = req.params.Id;
            console.log(Id)
            const user = await CustomersServices.Delete_User(Id)
            if (!user) {
                return resp.status(404).json({
                    success: false,
                    message: "Customer not found or already deleted"
                });
            }
            console.log('Customer DELETED', user)
            return resp.status(201).json({ success: true, Message: "User Deleted ", response: user })
        } catch (error) {
            console.log('server failed...', error)
            return resp.status(500).json({
                success: false,
                Message: "Server Failed",
                Error: error.message
            })
        }
    }
    static async getCustomerByEmail(req, resp) {
        try {
            const { email } = req.params
            if (!email) {
                console.log("Email not provided")
                return resp.status(404).json({
                    success: false,
                    message: "Query not provided",
                })
            }
            const customers = await CustomersServices.getCustomerByEmail(email)
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
    static async Logout(req, resp) {
        await resp.clearCookie("rfstk", {
            httpOnly: true,
        });
        await resp.clearCookie("acstk", {
            httpOnly: true,
        });
        console.log("logout successfully")
        return resp.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }
    static async CreateOTP(req, resp) {
        try {
            const { email } = req.params
            if (!email) {
                return resp.status(404).json({
                    success: false,
                    message: "Email not provided"
                })
            }
            const existUser = await CustomersServices.FindUserByEmail(email)
            if (!existUser) {
                return resp.status(400).json({
                    success: false,
                    message: "This user doesn't exist or has been deleted"
                })
            }
            const otp = Get_OTP()
            if (!otp) {
                return resp.status(400).json({
                    success: false,
                    message: "SERVER problem please, check later"
                })
            }
            console.log("OTP GENERATED: ", otp)
            let attempt = 1
            let expiredDate = new Date(Date.now() + 15 * 60 * 1000)
            // verify is the OTP existed then deleted to avoid confusing 
            const deleteOldOTP = await CustomersServices.VerifyOTP(email)
            if (deleteOldOTP) {
                await DataBase.query("DELETE FROM OTP WHERE Email = ?", [email])
            }
            const recordUserOTP = await CustomersServices.CreateOTP(email, otp, attempt, expiredDate)
            if (!recordUserOTP) {
                await DataBase.query("DELETE FROM OTP WHERE Email = ?", [email])
                return resp.status(404).json({
                    success: false,
                    message: "SERVER problem detected! please try"
                })
            }
            return resp.status(201).json({
                success: true,
                message: "OTP has been sent to your Email",
                email: email
            })
        } catch (error) {
            console.log("ERROR: ", error.message)
            return resp.status(500).json({
                success: false,
                message: error.message
            })
        }
    }
    static async VerifyOTP(req, resp) {
        try {
            const { email } = req.params
            const { otp } = req.body
            if (!email || !otp) {
                return resp.status(404).json({
                    success: false,
                    message: "Email not provided"
                })
            }
            const checkOTP = await CustomersServices.VerifyOTP(email)
            console.log("USER: ", checkOTP)
            if (!checkOTP[0]) {
                console.log("OTP not Found")
                return resp.status(404).json({
                    success: false,
                    message: "OTP not Found"
                })
            }
            if (new Date(checkOTP[0].expired) < new Date()) {
                await DataBase.query("DELETE FROM OTP WHERE email = ?", [email]);
                return resp.status(400).json({
                    success: false,
                    message: "OTP expired Please try again"
                })
            }
            if (checkOTP[0].attempt >= 5) {
                return resp.status(429).json({
                    success: false,
                    message: "Too many attempts. Try after 24h"
                })
            }
            if (checkOTP[0].otp !== otp) {
                console.log("Typeof ", typeof (checkOTP[0].otp), typeof (otp))
                await DataBase.query(`UPDATE OTP SET attempt = attempt + 1 WHERE email = ?`, [email]
                );
                return resp.status(400).json({
                    success: false,
                    message: "Invalid OTP, try again",
                    attempt: 5 - checkOTP[0].attempt
                })
            }
            await DataBase.query("DELETE FROM OTP WHERE email = ?", [email]);

            return resp.status(201).json({
                success: true,
                message: "Verification Successfully"
            })
        } catch (error) {
            console.log("ERROR: ", error.message)
            return resp.status(500).json({
                success: false,
                message: error.message
            })
        }
    }
    static async UpdatingPassword(req, resp) {
        try {
            const { email } = req.params
            const { password1, password2 } = req.body
            if (!email || !password1 || !password2) {
                return resp.status(404).json({
                    success: false,
                    message: "You're not allowed to change Password"
                })
            }
            // checking if user exist 
            const checkUser = await CustomersServices.FindUserByEmail(email)
            if (!checkUser) {
                return resp.status(404).json({
                    success: false,
                    message: "Please this user doesn't exist or has been deleted"
                })
            }
            if (password1 !== password2) {
                resp.status(404).json({
                    success: false,
                    message: "Please the password doesn't match"
                })
            }
            const hashpwd = await bcrypt.hash(password1, 10)
            const updatepwd = await CustomersServices.UpdatingPassword(hashpwd ,email)
            if (!updatepwd) {
                return resp.status(400).json({
                    success: false,
                    message: "Please this user doesn't exist or has been deleted"
                })
            }
            await resp.clearCookie("rfstk", {
                httpOnly: true,
            });
            await resp.clearCookie("acstk", {
                httpOnly: true,
            });
            return resp.status(200).json({
                success: true,
                message: "Your password has been changed. THANK YOU"
            })
        } catch (error) {
            console.log(`${error.message}`)
            return resp.status(500).json({
                success: false,
                message: error.message
            })
        }
    }
}
export default CustomerControler