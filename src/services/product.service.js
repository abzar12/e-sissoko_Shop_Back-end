import ProductModel from "../Model/product.model.js";
import fs from "fs"
import path from "path";
class ProductService {
    static async GetAll_Product({page, limit, category, quantity_status, search, color, price}) {
        try {
            const product = await ProductModel.GetAll_Product({page, limit, category, quantity_status, search, color, price})
            if(!product){
                console.log("Getting All Product Failed")
                throw new Error("Getting All Product Failed");
            }
            return product
        } catch (error) {
            console.log(error.message)
            throw new Error(error.message);
        }

    }
    static async Get_ProductByUUID(product_uuid) {
        try {
            if (!product_uuid) {
                console.log("Product Id is empty or no much of any values", product_uuid)
                throw new Error("Product uuid is empty or no much of any values")
            }
            const product = await ProductModel.Get_ProductByUUID(product_uuid)
            if (!product) {
                console.log("Product Failed,")
                throw new Error("Product Failed !!!: ")
            }
            return product
        } catch (error) {
            console.log(`Failed Product : ${error.message}`)
            throw new Error(`Failed Product  : ${error.message}`);
        }
    }
    static async Create_Product(data, Images_Name, uuid, slug) {
        try {
            if (!data || !Images_Name) {
                throw new Error(`Please check Product data and files name: ${JSON.stringify(data)} \n File: ${Images_Name}`);
            }
            if (!data.Name || !data.Category || !data.Brand || !data.Model || !data.Color
                || !data.Warranty || !data.Quantity || !data.Price ||
                !data.Contact_Email || !data.Description || !uuid, !slug) {
                throw new Error(`Please missing row Check Data : ${data}`);
            }
            const product = await ProductModel.Create_Product({ data, Images_Name, uuid, slug })
            if (!product) {
                throw new Error(`Prodcut failed ${product}`);
            }
            return product
        } catch (error) {
            console.log(`Product Failed: ${error}`)
            throw new Error(`Product Failed: ${error.message}`);
        }

    }
    static async Update_Product(data, Images_Name, uuid, slug) {
        try {
            if (!data, !Images_Name, !uuid, !slug) {
                console.log('SERVER Error, Missing data please check')
                throw new Error(`SERVER Error, Missing data please check`);
            }
            const product = await ProductModel.Update_Product(data, Images_Name, uuid, slug)
            return product
        } catch (error) {
            console.log(`Failed Product : ${error.message}`)
            throw new Error(`Failed Product  : ${error.message}`);
        }
    }
    static async findProduct(slug) {
        try {
            if (!slug) {
                console.log("Slug not provide is undefined...")
                throw new Error("Slug not provide is undefined...");
            }
            const product = await ProductModel.findProduct(slug)
            if (!product) {
                console.log("Failed to get product by Slug")
                throw new Error("Failed to get product by Slug");
            }
            return product
        } catch (error) {
            console.log(`Could not get product By slug: ${error.message}`)
            throw new Error(`Could not get product By slug: ${error.message}`);
        }

    }
    static async DeleteProduct(uuid){
        try {
            if(!uuid){
                console.log("UUID Not Provided")
                throw new Error("UUID Not Provided")
            }
            const result = await ProductModel.DeleteProduct(uuid)
            if(!result){
                console.log("Deleting Failed")
                throw new Error("Deleting Failed");
            }
            return result
        } catch (error) {
            console.log(`${error.message}`)
            throw new Error(`${error.message}`);
        }
    }
}
export default ProductService;