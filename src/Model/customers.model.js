import { validate } from "uuid"
import DataBase from "../config/database.js"
import { consoleLog } from "@ngrok/ngrok"
class CustomersModel {
    // -------------------------user login part-------------------------
    static async CreatUser({ Id, data, password, confirmpassword, Validated }) {
        try {
            const Role = "customer"
            const sql = "INSERT INTO Customers (User_ID, FirstName, LastName, Email, Phone, Password, ConfirmPassword, City, Area, Role, Validated) VALUES (?,?,?,?,?,?,?,?,?,?,?)"

            const [result] = await DataBase.query(sql, [Id, data.firstname, data.lastname, data.email, data.phone, password, confirmpassword, data.city, data.area, Role, Validated])
            if (!result) {
                console.log(`Sign-Up failed:`)
                throw new Error("login failed");
            }
            return { Name: data.firstname + data.lastname, result: result.insertId }
        } catch (error) {
            console.log(`Sign-Up failed: ${error}`)
            throw new Error(`Sign-Up failed, Error: ${error.message}`);
        }
    }
    // Find user By ID ----------------------
    static async FindUser({ Id }) {
        try {
            const sql = "SELECT * FROM Customers WHERE User_ID = ?"
            const [row] = await DataBase.query(sql, [Id])
            if (row.length === 0) {
                console.log("User no Found")
                throw new Error("User no Found");
            }
            return row[0]
        } catch (error) {
            console.log(`Failed to find user Error: ${error.message}`)
            throw new Error(`Failed to find user Error: ${error.message}`);

        }
    }
    // find user By Email ----------------------------
    static async FindUserByEmail({ email }) {
        try {
            const sql = "SELECT * FROM Customers WHERE Email = ?"
            const [row] = await DataBase.query(sql, [email])
            if (row.length === 0) {
                console.log("User no Found by Email")
                throw new Error("User doesn't exist or has been deleted ");
            }
            return row[0];
        } catch (error) {
            console.log(`${error.message}`)
            throw new Error(`${error.message}`);

        }
    }
    // Get All User ----------------------
    static async getAllCustomers(page, limit, status, search) {
        try {

            let Page = page
            let Limit = limit
            let Offset = (Page - 1) * Limit
            let values = []
            // sql 
            let sqlCustomers = `SELECT Customers.*, SUM(Orders.Total_Amount) AS Amount, Orders.Customer_ID, COUNT(Orders.Payment_Status) AS Quantity, Orders.Payment_Status AS Status
            FROM Customers
            INNER JOIN Orders
            ON Customers.User_ID = Orders.Customer_ID
             WHERE 1=1
             `
            if (search) {
                console.log(search)
                sqlCustomers += ` AND (
                          Customers.FirstName LIKE ?
                          OR Customers.LastName LIKE ?
                          OR Customers.Email LIKE ?
                          OR Customers.User_ID LIKE ?
                        )`
                values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
            }
            if (status === "paid") {
                sqlCustomers += `AND Orders.Payment_Status = ? `
                values.push("paid")
            }
            if (status === "unpaid") {
                sqlCustomers += `AND Orders.Payment_Status = ? `
                values.push("unpaid")
            }

            //  
            sqlCustomers += ` GROUP BY Customers.User_ID ORDER BY Customers.User_ID`
            sqlCustomers += " LIMIT ? OFFSET ?"
            values.push(Limit, Offset)

            const row = await DataBase.query(sqlCustomers, values)
            console.log("row", row)

            if (row.length === 0) {
                console.log("Customers Not Found")
                throw new Error("Customers Not Found");
            }
            console.log("Sql Successfully")
            return { customers: row[0], offset: Offset, limitPage: Offset + row[0].length }
        } catch (error) {
            console.log(`Getting customers Sql Failed ${error.message}`)
            throw new Error(`Getting customers Sql Failed ${error.message}`);
        }
    }
    // DELETE USER BY ID
    static Delete_User = async (Id) => {
        try {
            const sql = "DELETE FROM Customers WHERE User_ID = ? ";
            const [existing] = await DataBase.query("SELECT * FROM Customers WHERE User_ID = ? ", [Id])
            // if the length of the result is empty throw an error 
            if (existing.length === 0) {
                throw new Error("This Customer doesn't exist")
            }
            // if there is a value then return the values found 
            const [result] = await DataBase.query(sql, [Id])
            return result[0]
        } catch (error) {
            // handling an error
            console.log("FAILED TO DELETE Customer", error)
            throw new Error(`Please, Deleting Failed : ${error.message}`);
        }

    }
    // GET USER BY EMAIL
    static async getCustomerByEmail(email) {
        try {
            const sql = "SELECT * FROM Customers WHERE Email= ? ";
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
    // Create a OTP for verification 
    static async CreateOTP(email, otp, attempt, expired) {
        try {
            const sql = "INSERT INTO OTP (email, otp, attempt, expired) VALUES(?,?,?,?)";
            // if there is a value then return the values found 
            const result = await DataBase.query(sql, [email, otp, attempt, expired])
            return result
        } catch (error) {
            // handling an error
            console.log("FAILED TO INSET OTP", error)
            throw new Error(`Please, Failed to insert OTP: ${error.message}`);
        }
    }
    // vefiry OTP if it match
    static async VerifyOTP(email) {
        try {
            const sql = "SELECT * FROM OTP WHERE email = ?";
            // if there is a value then return the values found 
            const row = await DataBase.query(sql, [email])
            if (row.length === 0) {
                console.log("OTP not Found");
                throw new Error("OTP not Found");
            }
            return row[0]
        } catch (error) {
            // handling an error
            console.log("FAILED TO GET OTP", error)
            throw new Error(`Please, Failed to get OTP: ${error.message}`);
        }
    }
    static async UpadePassword(hashpwd,email) {
        try {
            const sql = "UPDATE Customers SET Password = ? WHERE Email= ?";
            const [result] = await DataBase.query(sql, [hashpwd, email])
            if (result.affectedRow === 0) {
                console.log("Updating Customer password Failed");
                throw new Error("Updating Customer password Failed");
            }
            return result
        } catch (error) {
            console.log("FAILED TO Update password", error)
            throw new Error(`Please, FAILED TO Update password: ${error.message}`);
        }
    }
}
export default CustomersModel