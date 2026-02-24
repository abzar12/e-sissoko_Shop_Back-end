import ProductModel from "../Model/product.model.js"
import OrdersServices from "../services/orders.services.js"
import CustomersServices from "../services/customers.service.js"
import initializePayStack from "../utils/initializePayStack.js"
import { Generate_ShortId } from "../utils/generateSlug.js"

class OrdersController {
    static async AddOrders(req, res) {
        const { paymentMethod } = req.body
        const { cart, user, deleveryMethod } = req.body.deleveryFormValues
        if (!cart || !user || !deleveryMethod) {
            console.log("Did not get values")
            return res.status(401).json({
                success: false,
                message: "Error row"
            })
        }
        try {
            // the product not found will return null 
            // we promise function check all the data together and it will be waiting to complet
            const User = await CustomersServices.FindUserByEmail(user.email)
            if (!User) {
                return res.status(404).json({
                    success: false,
                    message: `User not Found in Ordered`,
                })
            }
            const Product = await Promise.all(
                cart.map(p => ProductModel.Get_ProductByUUID(p.uuid))
            );
            // checking the product is in data base 
            const Product_Not_Found = cart.filter((_, i) => !Product[i]) // ignore the item(_) and use the index(i); return the cart value that are null or undefined
            // the product that are not in data base will be stored in in Product_Not_Found and then will return an error with that product to notify the user 
            if (Product_Not_Found && Product_Not_Found.length !== 0) {
                return res.status(404).json({
                    success: false,
                    message: `Some products are no longer available`,
                    Product: Product_Not_Found
                })
            }
            // generate a ordered number for the product 
            const order_ID = Generate_ShortId()
            let Model = null
            for (let order of cart) {
                const uuid = order.uuid
                const product = await ProductModel.Get_ProductByUUID(uuid)
                if (!product) {
                    return res.status(400).json({
                        success: false,
                        message: "the product does not exit. "
                    })
                }
                Model = product.Model
                // Compaire de price from front-end(cart) that of the Data base(Product) one 
                // the Product is an array that contains all the items found in data base
                // ------------------------
                if (Number(order.price) !== Number(product.Price)) {
                    return res.status(400).json({
                        success: false,
                        message: "Price tampering detected"
                    })
                }
                if (order.quantity > product.Quantity) {
                    return res.status(400).json({
                        success: false,
                        message: "Not enough Quantity available"
                    })
                }
            }
            const Reference = "ORD_" + Generate_ShortId()
            const orderSuccess = await OrdersServices.AddOrders({ cart, User, deleveryMethod, orderNumber: order_ID, paymentMethod: paymentMethod, reference: Reference, model: Model })
            if (!orderSuccess) {
                return res.status(500).json({
                    success: false,
                    message: "Orders Failed",
                })
            }

            if (paymentMethod === "paystack") {
                const payStatInit = await initializePayStack(User, cart, res, Reference)

                if (!payStatInit) {
                    return res.status(500).json({
                        success: false,
                        message: "Paystack Verification Failed. ",
                    })
                }
            }
            return res.status(200).json({
                success: true,
                message: "Products has been ordered Successfully !!!",
                response: orderSuccess
            })

        } catch (error) {
            console.log(`Products failed !!: ${error.message}`)
            return res.status(500).json({
                success: false,
                message: "Products failed !!",
                Error: error.message
            })
        }
    }
    static async GetAllOrders(req, resp) {
        try {

            const { page, limit, category, status, search, viewOnOrders } = JSON.parse(req.query.query)
            // console.log("Query: ", page, limit, category, search)
            const orders = await OrdersServices.GetAllOrders(page, limit, category, status, search, viewOnOrders)
            if (!orders) {
                resp.status(404).json({
                    success: false,
                    message: "Order Failed no access"
                })
            }
            return resp.status(201).json({
                success: true,
                message: "Orders request successfully",
                response: orders
            })
        } catch (error) {
            return resp.status(500).json({
                success: false,
                message: "Getting Orders Failed",
                Error: error.message
            })
        }
    }
    static async GetOrderByID(req, resp) {
        try {
            const { OrderID } = req.params
            if (!OrderID) {
                console.log("Order ID Not Provided")
                resp.status(404).json({
                    success: false,
                    message: "ID not Provided"
                })
            }
            const order = await OrdersServices.GetOrderByID(OrderID)
            if (!order) {
                resp.status(404).json({
                    success: false,
                    message: "Order Failed"
                })
            }
            return resp.status(201).json({
                success: true,
                message: "Order request successfully",
                response: order
            })
        } catch (error) {
            return resp.status(500).json({
                success: false,
                message: "Getting Order Failed",
                Error: error.message
            })
        }
    }
    static async GetDailyOrders(req, resp) {
        try {
            const DailyOrder = await OrdersServices.GetDailyOrders()
            if (!DailyOrder) {
                console.log("Daily Order Error")
                resp.status(404).json({
                    success: false,
                    message: "Dialy Order Error"
                })
            }
            return resp.status(201).json({
                success: true,
                message: "Daily Request Successfully",
                response: DailyOrder
            })
        } catch (error) {
            resp.status(500).json({
                success: false,
                message: "Getting Daily Orders Error",
                Error: error.message
            })
        }
    }
    static async GetYearsOrdersSales(req, resp) {

        try {
            const { year } = req.query
            console.log(req.query)
            if(!year){
                console.log("Missing Data please Check")
              return  resp.status(404).json({
                    success: false,
                    message: "Missing Data please Check"
                })
            }
            const YearlyOders = await OrdersServices.GetYearOrdersSales(year)
            if (!YearlyOders) {
                console.log("Yearly Orders Error")
              return  resp.status(404).json({
                    success: false,
                    message: "Yearly Orders Error"
                })
            }
            return resp.status(201).json({
                success: true,
                message: " Orders Request Successfully",
                response: YearlyOders
            })
        } catch (error) {
            return resp.status(500).json({
                success: false,
                message: "Yearly Orders Failed",
                Error: error.message
            })
        }
    }
    static async UpdateOrders(req, resp) {
        try {
            const { value, id } = req.body
            if (!value || !id) {
                console.log("Data not Provided")
                return resp.status(404).json({
                    success: false,
                    message: "Data not Provided"
                })
            }
            const result = await OrdersServices.UpdateStatus(value, id)
            if (!result) {
                console.log("Request Failed")
                return resp.status(404).json({
                    success: false,
                    message: "Request Failed"
                })
            }
            // ---------------- 
            // 🔥 SOCKET EMIT (THIS IS THE KEY PART)
            io.to(`user:${result.Cutomer_ID.toString()}`).emit("orderUpdated", result);
            io.to("admins").emit("orderUpdated", result);

            console.log("📤 emitting to room:", `user:${result.Cutomer_ID.toString()}`);
            console.log("👤 joined room:", `user:${userId}`);
            // ----------------
            console.log("successfuly", result)
            return resp.status(200).json({
                success: true,
                message: "Order Updated",
                response: result
            })
        } catch (error) {
            resp.status(200).json({
                success: false,
                message: "Order Updating Failed",
                Error: error.message
            })
        }
    }
    static async GetCustomerOrders(req, resp) {
        try {
            const { email, status, id } = JSON.parse(req.query.query)
            console.log("Query: ", id)
            const orders = await OrdersServices.GetCustomerOrder(email, status, id)
            if (!orders) {
                resp.status(404).json({
                    success: false,
                    message: "Customer Order Failed no access"
                })
            }
            return resp.status(201).json({
                success: true,
                message: "Customer Orders request successfully",
                response: orders
            })
        } catch (error) {
            return resp.status(500).json({
                success: false,
                message: "Getting Customer Orders Failed",
                Error: error.message
            })
        }
    }
}
export default OrdersController
