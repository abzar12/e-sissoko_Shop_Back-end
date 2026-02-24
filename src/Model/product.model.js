import DataBase from "../config/database.js";

class ProductModel {
    static async GetAll_Product({ page, limit, category, quantity_status, search, color, price }) {
        try {
            // console.log("category: ", category)
            let sql = "SELECT * FROM Phone WHERE 1=1 "
            let values = []
            switch (quantity_status) {
                case "available":
                    sql += " AND Quantity > 0 "
                    break;
                case "unavailable":
                    sql += " AND (Quantity = 0 OR Status = ?) "
                    values.push("archived")
                    break;
                case "low_stock":
                    sql += " AND Quantity BETWEEN 1 AND 5 "
                    break;
                case "archived":
                    sql += ` AND Status != ? `
                    values.push("archived")
                    break
            }
            if (color && color.length > 0) {
                console.log(color)
                const newSql = color.map(() => "Color = ? ").join(" OR ")
                sql += ` AND ${newSql} `
                values.push(...color)
            }
            if (price && price.length > 0) {
                const priceCondition = [];
                price.forEach(item => {
                    if (item === "0 - 1000") {
                        priceCondition.push("(Price BETWEEN ? AND ?)");
                        values.push(0, 1000);
                    }
                    if (item === "1000 - 2000") {
                        priceCondition.push("(Price BETWEEN ? AND ?)");
                        values.push(1000, 2000);
                    }
                    if (item === "2000 - 5000") {
                        priceCondition.push("(Price BETWEEN ? AND ?)");
                        values.push(2000, 5000);
                    }
                    if (item === "greater than 5000") {
                        priceCondition.push("(Price > ?)");
                        values.push(5000);
                    }
                });
                if (priceCondition.length > 0) {
                    sql += `AND (${priceCondition.join(" OR ")})`;
                }
            };
            if (category && category.length >= 1 && category[0] !== "") {
                console.log("categories: ", category)
                const newSql = category.map(() => 'Category = ?').join(" OR ")
                sql += ` AND ${newSql} `
                values.push(...category)
            }
            if (search) {
                sql += ` AND ( Name LIKE ? OR Category LIKE ? OR Model LIKE ?) `
                values.push(`%${search}%`, `%${search}%`, `%${search}%`)
            }
            if (quantity_status === "new") {
                sql += " ORDER BY Create_At DESC "
            }
            let offset
            if(page ){
                 offset = (page - 1) * limit
            }
            if (page && limit) {
                sql += " AND Quantity > 1 "
                sql += " LIMIT ? OFFSET ? "

                values.push(limit, offset)
            }

            const product = await DataBase.query(sql, values)
            if (!product) {
                console.log(`Server Error Product failed: ${product}`)
                throw new Error(`Server Error, ${product}`);
            }
            return { products: product[0], offset: offset, limit: offset + product[0].length };
        } catch (error) {
            console.log(`Product ERROR: ${error.message}`)
            throw new Error(`Product ERROR: ${error.message}`);

        }
    }
    static async Get_ProductByUUID(product_uuid) {
        try {
            if (!product_uuid) {
                console.log(`uuid is empty: ${product_uuid}`)
                throw new Error(`uuid is empty: ${product_uuid}`);
            }
            const sql = "SELECT * FROM Phone WHERE uuid = ?"
            const [product] = await DataBase.query(sql, [product_uuid])
            if (!product) {
                console.log(`Server Error Product failed: ${product}`)
                throw new Error(`Server Error, ${product}`);
            }
            console.log(`Getting product by UUID has been successfully!!!`)
            return product[0]
        } catch (error) {
            console.log(`Product ERROR: ${error.message}`)
            throw new Error(`Product ERROR: ${error.message}`);
        }
    }
    static async Create_Product({ data, Images_Name, uuid, slug }) {
        try {
            const sql = `INSERT INTO Phone
            (uuid, Slug, Name, Category, Brand, Model, Price, Promot_Price, Quantity, Color, Size, Weigth, Dimensions, Shipping, Delivery, Warranty, Contact_Email, Description, Image_Name)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            const [result] = await DataBase.query(sql, [uuid, slug, data.Name, data.Category, data.Brand, data.Model, data.Price, data.Promot_Price, data.Quantity,
                data.Color, data.Size, data.Weight, data.Dimensions, data.Shipping, data.Delivery, data.Warranty, data.Contact_Email,
                data.Description, JSON.stringify(Images_Name)])
            if (!result) {
                console.log(`Server Error Product failed: ${result}`)
                throw new Error(`Server Error, ${result}`);
            }
            console.log(`Product has been create successfully, \n Products: ${result.insertId}`)
            return { result: result.insertId, info: data.Name + " Category: " + data.Category };
        } catch (error) {
            console.log(`Server Error Product failed: ${error}`)
            throw new Error(`Server Error Product failed: ${error.message}`);
        }
    }
    static async Update_Product(data, Images_Name, uuid, slug) {
        try {
            const sql = `UPDATE Phone SET 
            Slug = ?, Name = ?, Category = ?, Brand = ?, Model = ?, Price = ?, Promot_Price = ?, Quantity = ?, Color = ?, 
            Shipping = ?, Delivery = ?, Warranty = ?, Contact_Email = ?, Description = ?, Image_Name = ?
            WHERE uuid = ?`
            const [product] = await DataBase.query(sql, [slug, data.Name, data.Category, data.Brand, data.Model, data.Price, data.Promot_Price, data.Quantity,
                data.Color, data.Shipping, data.Delivery, data.Warranty, data.Contact_Email,
                data.Description, JSON.stringify(Images_Name), uuid])
            if (!product) {
                console.log(`Product Failed, Info: ${product}`)
                throw new Error(`Product Failed, Info: ${product}`);
            }
            return { result: product.insertId, info: data.Name + " Category: " + data.Category }
        } catch (error) {
            console.log(`Failed to update the product: ${error}`)
            throw new Error(`Failed to update the product: ${error.message}`);
        }
    }
    static async findProduct(slug) {
        try {
            const sql = "SELECT * FROM Phone WHERE Slug = ?" // query of select user
            const [result] = await DataBase.query(sql, [slug])
            if (result[0].length === 0) {
                throw new Error("Failed to Select product")
            }
            return result[0]
        } catch (error) {
            throw new Error(`Failed to Select product, ${error.message}`)
        }

    }
    static async DeleteProduct(uuid) {
        try {
            const sql = `UPDATE Phone SET Status = ? WHERE uuid = ?`
            let value = "archived"
            const [result] = await DataBase.query(sql, [value, uuid])
            if (result.affectedRows === 0) {
                console.log("Deleting Product Failed")
                throw new Error("Product not found or already deleted");
            }
            return true
        } catch (error) {
            console.log(`${error.message}`)
            throw new Error(`Deleting Error: ${error.message}`);
        }
    }
}
export default ProductModel;