import ItemOrderModel from "../Model/itemOrders.model.js";
class itemOrdersService{
    static async AddItems({ orderedNumber, productID, name, quantity, price, image }){
        try {
            
            if( !orderedNumber || !productID || !name || !quantity || !price || !image ){
                 console.log(`Missing row Check the variable`)
                throw new Error(`Missing row Check the variable:`);
            }
            const result = await ItemOrderModel.AddItems({ orderedNumber, productID, name, quantity, price, image })
        } catch (error) {
            console.log(`${error.message}`)
            throw new Error(`${error.message}`);
        }
    }
}
export default itemOrdersService