import OrdersModel from "../Model/ordered.model.js";
class OrdersServices {

    static async AddOrders({ cart, User, deleveryMethod, orderNumber, paymentMethod, reference, model }) {
        try {
            if (!cart || !User || !deleveryMethod || !orderNumber || !reference) {
                console.log(`Missing row Check the variable: ${totalAmount}`)
                throw new Error(`Missing row Check the variable:`);
            }
            const result = await OrdersModel.AddOrders({ cart, User, deleveryMethod, orderNumber, paymentMethod, reference, model })
            if (!result) {
                console.log(`Could not get data from Model`)
                throw new Error(`Could not get data from Model`);
            }
            return result
        } catch (error) {
            console.log(`Services Message:${error.message}`)
            throw new Error(`${error.message}`);
        }
    }
    static async GetAllOrders(page, limit, category, status, search, viewOnOrders) {
        try {
            const Orders = await OrdersModel.GetAllOrders(page, limit, category, status, search, viewOnOrders)
            if (!Orders) {
                console.log("Orders Failed")
                throw new Error("Orders Failed");
            }
            return Orders
        } catch (error) {
            console.log(`Services Message:${error.message}`)
            throw new Error(`${error.message}`);

        }
    }
    static async GetOrderByID(OrderID) {
        try {
            if (!OrderID) {
                console.log("ID no provided")
                throw new Error("ID no provided");
            }
            const Order = await OrdersModel.GetOrderByID(OrderID)
            if (!Order) {
                console.log("Order Failed");
                throw new Error("Order Failed");
            }
            return Order
        } catch (error) {
            console.log(`Service: ${error.message}`)
            throw new Error(`${error.message}`);
        }
    }
    static async GetDailyOrders() {
        try {
            const Order = await OrdersModel.GetDailyOrders()
            if (!Order) {
                console.log("Daily Order Failed")
                throw new Error("Daily Order Failed");
            }
            return Order
        } catch (error) {
            console.log(`${error.message}`)
            throw new Error(`${error.message}`);
        }
    }
    static async GetYearOrdersSales(year) {
        try {
            const Orders = await OrdersModel.GetYearOrder_Sale(year)
            if (!Orders) {
                console.log("Years Orders Failed");
                throw new Error("Years Orders Failed");
            }
            return Orders
        } catch (error) {
            console.log(error.message)
            throw new Error(error.message);

        }

    }
    static async UpdateStatus(value, id) {
        try {
            const result = await OrdersModel.UpdateStatus(value, id)
            if (!result) {
                console.log("Error Updating Failed")
                throw new Error("Error Updating Failed");
            }
            return result
        } catch (error) {
            console.log(`${error.message}`)
            throw new Error(`${error.message}`);
        }
    }
    static async GetCustomerOrder(customerEmail, status, id){
        try {
            const result = await OrdersModel.GetCustomerOrder(customerEmail, status, id)
            if (!result) {
                console.log("Error Customer Orders Failed")
                throw new Error("ErrorCustomer Orders Failed");
            }
            return result
        } catch (error) {
            console.log(`${error.message}`)
            throw new Error(`${error.message}`);
        }
    }
}
export default OrdersServices
