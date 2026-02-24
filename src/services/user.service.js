import UserModel from "../Model/user.model.js";
import bcrypt from "bcrypt"
class UserService {
    static async Add_User(data, userId) {
        try {
            if (!data.email || !data.password || !data.confirm_password || !data.firstname || !data.lastname || !data.role) {
                throw new Error("All the field are required");
            }
            if (!userId) {
                console.log("Can not generate user ID")
            }
            if (data.password != data.confirm_password) {
                throw new Error("Please, the passwords must be the same ....");
            }

            const password_hash = await bcrypt.hash(data.password, 10);
            const confirm_password_hash = await bcrypt.hash(data.confirm_password, 10)
            return await UserModel.Add_User({ data, password_Hash: password_hash, confim_pwd_Hash: confirm_password_hash, userId })
        } catch (error) {
            console.log(`Please, Data ERROR: ${error.message}`)
            throw new Error(`Please, Data ERROR, ${error.message}`);
        }

    } 
    static async Delete_User(Id) {
        try {
            if (!Id) {
                throw new Error("Please any user Selected");
            }
            const user = await UserModel.Delete_User(Id);
            if (!user){
                throw new Error("User not Found !!!");
            } 
            return user;
        } catch (error) {
            console.log('Deleting User Failed', error)
            throw new Error(`User not Found !!!, ${error.message}`)
        }
    }
    static async findUser({ email, uuid }) {
        try {
            if (email) {
                const user = await UserModel.findUser({ email })
                if (!user) {
                    throw new Error("User not Found, please try again ")
                }
                return user;
            } else {
                const user = await UserModel.findUser({ uuid })
                if (!user) {
                    throw new Error("User not Found, please try again:", user)
                }
                return user;
            }
        } catch (error) {
            console.log('ERROR !!!', error)
            throw new Error(`ERROR of getting user, ${error.message}`);
        }
    }
    static async getAllUser(page, limit, search) {
        try {
            if (!page || !limit) {
                console.log(`Missing row check value:`);
                throw new Error(`Missing row check value`);
            }
            const user = await UserModel.getAllUsers(page, limit, search)
            if (!user) {
                console.log("User Not Provided")
                throw new Error("User Not Provided");
            }
            return user;
        } catch (error) {
            console.log(error.message)
            throw new Error(error.message);
        }

    }

    static async getUserByEmail(email){
         try {
            // if there is a value then return the values found 
            const result = await UserModel.getUserByEmail(email)
             if (!result) {
                console.log("Customers Not Found")
                throw new Error("Customers Not Found");
            }
            return result
        } catch (error) {
            // handling an error
            console.log("Error Customer: ", error)
            throw new Error(`Please, Error Customer:: ${error.message}`);
        }
    }
}
export default UserService;