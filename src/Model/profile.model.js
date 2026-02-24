import DataBase from "../config/database.js"
class CustomerModelProfile {

    static async UpdatingProfile(email, data) {
        try {
            const sql = "UPDATE Customers SET FirstName = ?, LastName = ?, Phone = ?, City = ?, Area = ? WHERE Email = ? "
            const result = await DataBase.query(sql, [data.firstname, data.lastname, data.number, data.region, data.city, email])
            if (!result && result.affectedRow === 0) {
                console.log("Customer Updating Sql failed")
                throw new Error("Customer Updating Sql failed");
            }
            return email
        } catch (error) {
            console.log
            throw new Error(`Sql Failed: ${error.message}`);
        }
    }
}
export default CustomerModelProfile