import DataBase from "../config/database.js";
class ItemOrderModel {
    static async AddItems({ orderedNumber, productID, name, quantity, price, image }) {
        try {
            const ItemSql = "INSERT INTO OrderItems (Order_ID, Product_ID, Name, Quantity, Price, Images) VALUES (?,?,?,?,?,?)"
            const result = await DataBase.query(ItemSql, [orderedNumber, productID, name, quantity, price, image])
            if (!result) {
                console.log("Could not Stored!!!")
                throw new Error("Could not Stored!!!");
            }
            console.log("Items saved to OrderItems Table Successfully", result)
            return result;
        } catch (error) {
            console.log(`Item Orders Failed ${error.message}`)
            throw new Error(`Item Orders Failed ${error.message}`);
        }

    }
}
export default ItemOrderModel