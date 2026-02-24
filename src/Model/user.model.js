import { json } from "express"
import DataBase from "../config/database.js"
class UserModel {

    static Add_User = async ({ data, password_Hash, confim_pwd_Hash, userId }) => {
        try {
            // check if User exist in data base then throw an error
            const check_User = await DataBase.query("SELECT * FROM Users WHERE Email = ? ", [data.email]);
            const [row] = check_User
            // if the user execute this code 
            if (row && row.length != 0){
                throw new Error("Please, the Email already exist ");
            }
            const sql = "INSERT INTO Users (User_ID, UserName, FirstName, LastName, Email, Password, Confirm_Password, Role) VALUES (?,?,?,?,?,?,?,?)"
            const [result] = await DataBase.query(sql, [userId, data.username, data.firstname, data.lastname, data.email, password_Hash, confim_pwd_Hash, data.role])
            if (!result) {
                throw new Error('please missing row checking it well')
            }
            return { Id: result.InsertId, email: data.email, Name: data.firstname + ' ' + data.lastname }
        }
        catch (error) {
            // handling an error 
            console.log("INSERT USER FAILED", error)
            throw new Error(`INSERT USER FAILED: ${error.message}`);
        }

    }
    // deleting user by Id 
    static Delete_User = async (Id) => {
        try {
            const sql = "DELETE FROM Users WHERE User_ID = ? ";
            const [existing] = await DataBase.query("SELECT * FROM Users WHERE User_ID = ? ", [Id])
            // if the length of the result is empty throw an error 
            if (existing.length === 0) {
                throw new Error("This User doesn't exist")
            }
            // if there is a value then return the values found 
            const [result] = await DataBase.query(sql, [Id])
            return result[0]
        } catch (error) {
            // handling an error
            console.log("FAILED TO DELETE USER", error)
            throw new Error(`Please, No Id match in Data Base: ${error.message}`);
        }

    }
    // find user by email
    static async findUser(condition) {
        try {
            if (condition.email) {
            const sql = "SELECT * FROM Users WHERE Email = ?"
            const [result] = await DataBase.query(sql, [condition.email]);
            // if no error then return a result 
            if(result.length === 0){
                throw new Error("User not Found by Email or has been deleted")
            }
            console.log('User has been got successfully')
            return result;
        } else if (condition.uuid) {
            const sql = "SELECT * FROM Users WHERE User_ID = ?"
            const [result] = await DataBase.query(sql, [condition.uuid]);
            // if the length of the result is empty throw an error 
            if (result.length === 0) {
                console.log('Value got :', condition.uuid)
                throw new Error("User not Found by UserId or has been deleted")
            }
            // if no error then return a result 
            console.log('User has been got successfully')
            return result;
        }
    
        } catch (error) {
            console.log(`User not Found ..., ${error}`)
            throw new Error(`User not Found ..., ${error.message}`)
        }
    }
    // get All users
    static async getAllUsers(page, limit, search) {
        try {
            let Page = page
            let Limit = limit
            let Offset = (Page - 1) * Limit
            let values = []
            // sql 
            let sqlUser = `SELECT * FROM Users WHERE 1=1 `
            if(search){
                sqlUser += ` AND (FirstName LIKE ? OR LastName LIKE ? OR Email LIKE ? ) `
                values.push(`%${search}%`, `%${search}%`, `%${search}%`)
            }
            sqlUser+= " LIMIT ? OFFSET ?"
            values.push(Limit, Offset)

            const row = await  DataBase.query(sqlUser, values)
            if (row.length === 0) {
                console.log("User Not Found")
                throw new Error("User Not Found");
            }
            console.log("Sql Successfully")
            return { users: row[0], offset: Offset , limitPage: Offset + row[0].length }
        } catch (error) {
            console.log(`Getting User Sql Failed ${error.message}`)
            throw new Error(`Getting User Sql Failed ${error.message}`);
        }
    }
     static async getUserByEmail(email) {
            try {
                const sql = "SELECT *, DATE(Create_at) as date FROM Users WHERE Email= ? ";
                // if there is a value then return the values found 
                const [row] = await DataBase.query(sql, [email])
                if (row.length === 0) {
                    console.log(" Sql Failed; Customers Not Found")
                    throw new Error("Sql Failed; Customers Not Found");
                }
                return row[0]
            } catch (error) {
                // handling an error
                console.log("FAILED TO Get Customer", error)
                throw new Error(`Please, Failed to get Customer: ${error.message}`);
            }
        }
}
export default UserModel;