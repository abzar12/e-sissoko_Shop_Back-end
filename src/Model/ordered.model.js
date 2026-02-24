import DataBase from "../config/database.js"
class OrdersModel {
    static async AddOrders({ cart, User, deleveryMethod, orderNumber, paymentMethod, reference, model }) {
        const conn = await DataBase.getConnection()
        try {
            console.log("model", model)
            await conn.beginTransaction()
            // insert in order table
            const OrdersSql = `
            INSERT INTO Orders 
            (Order_Number, Customer_ID, User_Email, Reference, Total_Amount, Payment_Method, Payment_Status, Delevery_Method, Ordered_Status )
            VALUES 
            (?,?,?,?,?,?,?,?,?)
            `
            const totalAmount = cart.reduce((acc, item) => {
                return acc + item.sub_total;
            }, 0)
            if (totalAmount <= 0) {
                console.log("Not amount ....")
                throw new Error("Not amount ....");
            }
            const orderedStatus = "Pending"
            const paymentStatus = "unpaid"
            // console.log("------------------------------")
            // console.log({
            //     orderNumber,
            //     userId: User?.User_ID,
            //     email: User?.Email,
            //     deleveryMethod
            // });
            const [Orders] = await conn.execute(OrdersSql, [orderNumber, User.User_ID, User.Email, reference, totalAmount, paymentMethod, paymentStatus, deleveryMethod[0], orderedStatus])
            if (Orders.affectedRows === 0) {
                console.log("Order insert failed")
                throw new Error("Order insert failed");
            }
            // insert in orderItems  table
            // order_ID refer to orderNumber and product_ID refer to the uuid of cart 
            for (let itemOrder of cart) {
                const ItemOrdersSql = "INSERT INTO OrderItems (Order_ID, Product_ID, Name, Quantity, Price, Model, Images) VALUES (?,?,?,?,?,?,?)"

                const [orderItems] = await conn.execute(ItemOrdersSql, [orderNumber, itemOrder.uuid, itemOrder.name, itemOrder.quantity, itemOrder.price, model, itemOrder.image])

                if (!orderItems.affectedRows === 0) {
                    console.log("Order item insert failed")
                    throw new Error("Order item insert failed");
                }
                // we can now update the product the quantity should be increase after use ordered 

                const productSql = "UPDATE Phone SET Quantity = Quantity - ? WHERE uuid= ?"

                const [UpdateProduct] = await conn.execute(productSql, [itemOrder.quantity, itemOrder.uuid])
                if (!UpdateProduct.affectedRows === 0) {
                    console.log("Updating product Failed")
                    throw new Error("Updating product Failed");
                }
            }
            await conn.commit();
            console.log("Order place successfully")
            return { OrderNumber: orderNumber, ItemsTotal: totalAmount };
        } catch (error) {
            await conn.rollback()
            console.log(`Ordered Failed!!!; Error: ${error.message}`)
            throw new Error(`Ordered Failed!!!; Error: ${error.message}`);
        } finally {
            conn.release()
        }
    }
    static async findByReference(reference) {
        try {
            if (!reference || reference.length === 0) {
                console.log("No reference provided... ")
                throw new Error("No reference provided... ")
            }
            const sql = "SELECT * FROM Orders WHERE Reference= ?"
            const [rows] = await DataBase.query(sql, [reference])
            if (!rows || rows.length === 0) {
                console.log(`⚠️ Order does not exist: ${reference}`);
                throw new Error(`Order does not exist: ${reference}`);
            }

            return rows[0];
        } catch (error) {
            console.log(`Updating Order Failed, Error: ${error.message}`)
            throw error;
        }
    }
    // this update the payment after payment by cart 
    static async UpdateOrder({ paymentStatus, orderedStatus, amount, reference }) {
        try {
            if (!paymentStatus || !orderedStatus || !amount || !reference) {
                // console.log("Data not provided... ")
                throw new Error("Data not provided... ")
            }
            const UpdateSql = "UPDATE Orders  SET Payment_Status= ?, Ordered_Status=?, Total_Amount=? WHERE Reference=?"
            const result = await DataBase.query(UpdateSql, [paymentStatus, orderedStatus, amount, reference])
            if (!result || result.affectedRows === 0) {
                // console.log(` Order Updating Failed: ${reference}`);
                throw new Error(` Order Updating Failed: ${reference}`);
            }
            console.log("Updating ordered Completed successfully ...")
            return result
        } catch (error) {
            console.log(`Updating Order Failed, Error: ${error.message}`)
            throw error;
        }
    }
    static async GetAllOrders(Page, Limit, category, status, search, viewOnOrders) {
        try {
            let Category = category ? category?.toLowerCase()?.trim() : null
            let Status = status ? status.toLowerCase().trim() : null
            const page = Number(Page) || 1;
            const limit = Number(Limit) || 15;
            const offset = (page - 1) * limit;
            let sql = `SELECT Orders.Payment_Status, Orders.Reference AS Reference, Orders.Payment_Method AS Method, DATE(Orders.Create_At) AS Date,
             Orders.Order_Number AS ID, Orders.User_Email AS Email, Orders.Total_Amount AS Amount, Orders.Delevery_Method as Delevery ,
            Orders.Ordered_Status AS Status, OrderItems.Name  AS Products, OrderItems.* FROM Orders  
             INNER JOIN OrderItems 
             ON  Orders.Order_Number = OrderItems.Order_ID
             WHERE 1=1
             `
            let values = []
            if (Category) {
                sql += ` AND OrderItems.Model = ?`
                values.push(Category)
            }
            if (Status === "paid") {
                sql += ` AND Orders.Payment_Status = ?`;
                values.push(Status);
            }
            if (Status && Status !== "paid" && Status !== "all") {
                sql += ` AND Orders.Ordered_Status = ?`;
                values.push(Status);
            }
            if (search) {
                sql += ` AND (
                Orders.Order_Number LIKE ?  
                OR Orders.User_Email LIKE ?
                OR Orders.Reference LIKE ?
                Or Orders.Total_Amount LIKE ?
                )`
                values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
            }
            //  this condition will end the request unless if the request contain view because in the view page we want all the orders with order number
            if (viewOnOrders) {
                console.log("Start here")
                if (!viewOnOrders.length) return

                sql += ` AND (Orders.Order_Number = ? AND OrderItems.Order_ID = ?) `
                values.push(viewOnOrders, viewOnOrders)
                values.push(limit, offset)
                const result = await DataBase.query(sql, values)

                if (!result && result[0].length === 0) {
                    // console.log("SQL Error")
                    throw new Error("SQL Error");
                }
                // console.log("ALL THE ORDERS:,", result[0])
                console.log("End here")
                return { orders: result[0], offset: offset, limitPage: offset + result[0].length };
            }
            sql += ` GROUP BY
             Orders.Order_Number,
             Orders.User_Email,
             Orders.Total_Amount,
             Orders.Payment_Method,
             Orders.Delevery_Method,
             Orders.Ordered_Status
            ORDER BY DATE(Orders.Create_At) DESC LIMIT ?  OFFSET ? `
            values.push(limit, offset)
            const result = await DataBase.query(sql, values)

            if (!result && result[0].length === 0) {
                // console.log("SQL Error")
                throw new Error("SQL Error");
            }
            // console.log("ALL THE ORDERS:,", result[0])
            return { orders: result[0], offset: offset, limitPage: offset + result[0].length };
        } catch (error) {
            console.log("Getting orders Failed:", error)
            throw new Error("Getting orders Failed:", error);
        }
    }
    static async GetOrderByID(OrderID) {
        try {
            if (!OrderID) {
                // console.log("No ID provided")
                throw new Error("No ID provided");
            }
            const sql = "SELECT * FROM Orders WHERE Order_Number = ?"
            const result = await DataBase.query(sql, [OrderID])
            if (!result && result[0].length === 0) {
                // console.log("SQL Error")
                throw new Error("SQL Error");
            }
            return result[0];
        } catch (error) {
            console.log("Getting unique order Failed:", error)
            throw new Error("Getting unique order Failed:", error);
        }
    }
    static async GetDailyOrders() {
        try {
            // this if for Daily orders 
            const sql = `SELECT DAYNAME(Create_At) as day, WEEKDAY(Create_At) as dayIndex,
                COUNT(*) AS Total_Orders, SUM(Total_Amount) AS Total_Amount FROM Orders 
            WHERE YEAR(Create_At) = YEAR(CURDATE())
            AND WEEK(Create_At, 1) = WEEK(CURDATE(), 1)
            GROUP BY DAYNAME(Create_At), DAYNAME(Create_At)
            ORDER BY WEEKDAY(Create_At)
            `
            // this if for Daily Items orders 
            const sql2 = `SELECT DAYNAME(Create_At) AS day, WEEKDAY(Create_At) AS dayIndex,
                SUM(Quantity) AS Total_Quantity FROM OrderItems
            WHERE YEAR(Create_At) = YEAR(CURDATE())
            AND WEEK(Create_At, 1) = WEEK(CURDATE(), 1)
            GROUP BY DAYNAME(Create_At), WEEKDAY(Create_At)
            ORDER BY WEEKDAY(Create_At)
            `
            const Orders = await DataBase.query(sql)

            const Items = await DataBase.query(sql2)

            // if (!Orders[0].length || !Items[0].length) {
            //     // console.log("SQL Failed")
            //     throw new Error("SQL Failed");
            // }
            const WeekDays = [
                { dayIndex: 0, day: "Monday" },
                { dayIndex: 1, day: "Tuesday" },
                { dayIndex: 2, day: "Wednesday" },
                { dayIndex: 3, day: "Thursday" },
                { dayIndex: 4, day: "Friday" },
                { dayIndex: 5, day: "Saturday" },
                { dayIndex: 6, day: "Sunday" },
            ]
            const dbOrderResult = Orders[0]
            const CharDayOrders = WeekDays.map(Day => {
                const found = dbOrderResult.find(dbDay => dbDay.dayIndex === Day.dayIndex)
                return {
                    day: Day.day,
                    Total_Orders: found ? found.Total_Orders : 0,
                    Total_Amount: found ? found.Total_Amount : 0
                }
            })
            // console.log("Chart ORDERS Day:", CharDayOrders)
            const dbItemsResult = Items[0]

            const ChartDayItems = WeekDays.map(Day => {
                const found = dbItemsResult.find(dayItems => dayItems.dayIndex === Day.dayIndex)
                return {
                    day: Day.day,
                    Total_Quantity: found ? found.Total_Quantity : 0
                }
            })
            // console.log("Chart Items Day:", ChartDayItems)
            return { Orders: CharDayOrders, Items: ChartDayItems }
        } catch (error) {
            console.log("Get Daily orders Failed:", error)
            throw new Error("Get Daily orders Failed:", error);
        }
    }
    static async GetYearOrder_Sale(year) {
        const years = year || new Date().getFullYear()
        try {
            const YearsSql = `SELECT YEAR(Create_At) AS Year, MONTH(Create_At) AS MonthDay,
                MONTHNAME(Create_At) AS Months, SUM(Total_Amount) AS Amount, COUNT(*) AS Products 
            FROM Orders 
            WHERE YEAR(Create_At) = ${years}
            GROUP BY YEAR(Create_At), MONTH(Create_At), MONTHNAME(Create_At)
            ORDER BY YEAR(Create_At), MONTH(Create_At), MONTHNAME(Create_At)
                `
            const Orders_Sales = await DataBase.query(YearsSql)

            if (!Orders_Sales[0] && !Orders_Sales[0].length) {
                // console.log("SQL Failed")
                throw new Error("SQL Failed")
            }
            // console.log("Years Orders and Sales:", Orders_Sales)
            // marge the data match 
            const YEARMONTHS = [
                { MonthDay: 1, Months: "January" },
                { MonthDay: 2, Months: "February" },
                { MonthDay: 3, Months: "March" },
                { MonthDay: 4, Months: "April" },
                { MonthDay: 5, Months: "May" },
                { MonthDay: 6, Months: "June" },
                { MonthDay: 7, Months: "July" },
                { MonthDay: 8, Months: "August" },
                { MonthDay: 9, Months: "September" },
                { MonthDay: 10, Months: "October" },
                { MonthDay: 11, Months: "November" },
                { MonthDay: 12, Months: "December" }
            ]
            const dbOrderYearsResult = Orders_Sales[0]

            const YearsChart = YEARMONTHS.map(Months => {
                const found = dbOrderYearsResult.find(OrderValue => OrderValue.MonthDay === Months.MonthDay)
                return {
                    Year: year,
                    MonthDay: Months.MonthDay,
                    Months: Months.Months,
                    Amount: found ? found.Amount : 0,
                    Products: found ? found.Products : 0
                }
            })
            // console.log("Years Chart Orders and Sales:", YearsChart)
            return { orders: YearsChart }
        } catch (error) {
            console.log("Get Year orders Failed:", error)
            throw new Error("Get Years orders Failed:", error.message);
        }
    }
    static async UpdateStatus(value, id) {
        try {
            if (!value, !id) {
                console.log("Sql Data not provided")
                throw new Error("Sql Data not provided");
            }
            if (value === "paid") {
                let sql = `UPDATE Orders SET Payment_Status = ? WHERE Order_Number = ? `

                const [row] = await DataBase.query(sql, [value, id])
                if (row.affectedRows === 0) {
                    console.log("Sql Failed")
                    throw new Error("Sql Failed");
                }
                return row
            }
            if (value !== "paid") {
                let sql = `UPDATE Orders SET Ordered_Status = ? WHERE Order_Number = ? `

                const [row] = await DataBase.query(sql, [value, id])
                if (row.affectedRows === 0) {
                    console.log("Sql Failed")
                    throw new Error("Sql Failed");
                }
                // this added for socket 
                // 2. Get the full order (so we can emit it)
                const [orders] = await DataBase.query(
                    "SELECT * FROM orders WHERE Order_Number = ?",
                    [id]
                );

                return orders[0]; // full order object
                // return row // before the return 
            }
        } catch (error) {
            console.log("Updating orders Failed:", error)
            throw new Error("Updating orders Failed:", error.message);
        }
    }
    static async GetCustomerOrder(customerEmail, status, id) {
        try {
            console.log("ENtered here")
            let values = []
            let sql = ` SELECT Orders.*, ${!id ? "COUNT(OrderItems.Order_ID) AS Item_Number, " : ""}  OrderItems.* From Orders
            INNER JOIN OrderItems 
            ON Orders.Order_Number = OrderItems.Order_ID
            WHERE 1=1
            `
            if (status && status.length > 0) {
                console.log(status)
                sql += ` AND Orders.Ordered_Status = ? `
                values.push(status)
            }
            if (id && customerEmail) {
                sql += `  AND Orders.User_Email = ? AND OrderItems.Order_ID = ? `
                values.push(customerEmail, id)

                const result = await DataBase.query(sql, values)
                if (!result || result[0].length === 0) {
                    console.log("SQL Error")
                    throw new Error("SQL Error");
                }
                console.log("orders", result[0])
                return { orders: result[0] }
            }

            sql += ` AND Orders.User_Email = ?`
            values.push(customerEmail)
            sql += ` GROUP BY Orders.Order_Number `
            const result = await DataBase.query(sql, values)
            if (!result && result[0].length === 0) {
                console.log("SQL Error")
                throw new Error("SQL Error");
            }
            // console.log("orders", result[0])
            return { orders: result[0] }
        } catch (error) {
            console.log("Getting orders Failed:", error)
            throw new Error("Getting orders Failed:", error.message);
        }
    }
}
export default OrdersModel