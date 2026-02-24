import CustomersModel from "../Model/customers.model.js";
class CustomersServices {
    // ------------------------Create a Customers 
    static async CreateUser({ Id, data, password, confirmpassword, Validated }) {
        try {

            if (!Id || !Validated || !password || !confirmpassword) {
                console.log(`Missing row please: `)
                throw new Error(`Missing row please`);
            }
            const user = await CustomersModel.CreatUser({ Id, data, password, confirmpassword, Validated })
            if (!user) {
                console.log(`Creating user failed`)
                throw new Error(`Creating user failed`);
            }
            return user
        } catch (error) {
            console.log(`${error.message}`)
            throw new Error(`${error.message}`);
        }
    }
    // ------------------------find Customers by Id 
    static async FindUser(User_ID) {
        try {
            if (!User_ID) {
                console.log(`User failed:`);
                throw new Error(`User failed:`);
            }
            const user = await CustomersModel.FindUser({ Id: User_ID })
            if (!user) {
                console.log(`Finding User Failed`)
                throw new Error(`Finding User Failed`);
            }
            return user
        } catch (error) {
            console.log(`${error.message}`)
            throw new Error(`${error.message}`);
        }
    }
    // ------------------------find Customers by Email 
    static async FindUserByEmail(email) {
        try {
            if (!email) {
                console.log(`Missing row check value:`);
                throw new Error(`Missing row check value`);
            }
            const user = await CustomersModel.FindUserByEmail({ email })
            if (!user) {
                console.log(`Finding User Failed`)
                throw new Error(`Finding User Failed`);
            }
            return user;
        } catch (error) {
            console.log(`${error.message}`)
            throw error;
        }
    }
    // -------------------------Get ALl Customers
    static async getAllCustomers(page, limit, status, search) {
        try {
            if (!page || !limit) {
                console.log(`Missing row check value:`);
                throw new Error(`Missing row check value`);
            }
            const customers = await CustomersModel.getAllCustomers(page, limit, status, search)
            if (!customers) {
                console.log("Customers Not Provided")
                throw new Error("Customers Not Provided");
            }
            return customers;
        } catch (error) {
            console.log(error.message)
            throw new Error(error.message);
        }

    }
     static async Delete_User(Id) {
        try {
            if (!Id) {
                throw new Error("Please any Customers ID Provided");
            }
            const customer = await CustomersModel.Delete_User(Id);
            if (!customer) throw new Error("Customer not Found !!!");
            return customer;
        } catch (error) {
            console.log('Deleting Customer Failed', error)
            throw new Error(`Customer not Found !!!, ${error.message}`)
        }
    }
    static async getCustomerByEmail(email){
         try {
            // if there is a value then return the values found 
            const result = await CustomersModel.getCustomerByEmail(email)
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
    // ----------------------------CREAT OTP FOR USER
     static async CreateOTP(email, otp, attempt, expired) {
        try {

            const result = await CustomersModel.CreateOTP(email, otp, attempt, expired)
            if(!result){
                throw new Error("Could not get the result");
            }
            return result
        } catch (error) {
            // handling an error
            console.log(" OTP ERROR: ", error)
            throw new Error(` OTP ERROR:: ${error.message}`);
        }
    }

    // --------------------------VERIFY OTP FOR USER
    static async VerifyOTP(email) {
        try {
            const result = await CustomersModel.VerifyOTP(email)
            if(!result){
                throw new Error("Could not get the result");
            }
            return result
        } catch (error) {
            // handling an error
            console.log(" OTP ERROR: ", error)
            throw new Error(` OTP ERROR:: ${error.message}`);
        }
    }

     // --------------------------Upating Password
    static async UpdatingPassword(hashpwd, email) {
        try {
            const result = await CustomersModel.UpadePassword(hashpwd,email)
            if(!result){
                throw new Error("Could not get the result");
            }
            return result
        } catch (error) {
            // handling an error
            console.log(" Updating ERROR: ", error)
            throw new Error(` Updating ERROR:: ${error.message}`);
        }
    }
}
export default CustomersServices