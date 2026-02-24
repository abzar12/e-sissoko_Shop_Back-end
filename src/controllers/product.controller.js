import ProductService from "../services/product.service.js";
import { GenerateProductId } from "../utils/generateUuid.js";
import { Generate_slug, Generate_ShortId } from "../utils/generateSlug.js";
import fs from "fs"
import path, { join, parse } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)
class ProductController {
    // ---------------------------------Get All the product-------------------------------------
    static async GetAll_Product(req, resp) {
        try {
{/* example of front-end query
    const [query, Setquery] = useState({
        category: [],
        price: [],
        color: [],
        page: 1,
        limit: 15,
        search: ""
    })
     */}
            const { page, limit, category, quantity_status, search, color, price } = req.query
            // console.log(page, limit, category)
            const product = await ProductService.GetAll_Product({ page, limit, category, quantity_status, search, color, price })
            if (!product) {
                console.log(`Error, product Failed ${product}`)
                return resp.status(404).json({
                    success: false,
                    message: `Error, product Failed`,
                })
            }
            return resp.status(201).json({
                success: true,
                message: "Product has been get successfully",
                response: product
            })
        } catch (error) {
            console.log(`Error, getting product Failed, ${error.message}`)
            return resp.status(505).json({
                success: false,
                message: `Error, getting product Failed`,
                error: error.message
            })
        }
    }
    // ---------------------------------Get product By Id-------------------------------------

    static async Get_ProductById(req, resp) {
        try {
            const product_uuid = req.params.uuid
            console.log("uuid: ", product_uuid)
            if (!product_uuid) {
                return resp.status(404).json({
                    success: false,
                    message: "Product Id is Empty or can not get it"
                })
            }
            const product = await ProductService.Get_ProductByUUID(product_uuid)
            if (!product) {
                return resp.status(404).json({
                    success: false,
                    message: "Failed to get product by Id"
                })
            }
            return resp.status(201).json({
                success: true,
                message: "Product has been get successfully ",
                product: product
            })
        } catch (error) {
            console.log(`Error, getting product Failed, ${error}`)
            return resp.status(500).json({
                success: false,
                message: `Error, getting product Failed`,
                product: error.message
            })
        }
    }
    // ---------------------------------Get product By Slug-------------------------------------

    static async findProduct(req, resp) {
        try {
            const { slug } = req.params
            if (!slug) {
                console.log(`Missing Slug`)
                return resp.status(404).json({
                    success: false,
                    message: `Slug Missing...`,
                })
            }
            const product = await ProductService.findProduct(slug)
            if (!product) {
                return resp.status(500).json({
                    success: false,
                    message: `Getting Product failed`
                })
            }
            console.log(`Product has been got successfully:, ${JSON.stringify(product)}`)
            return resp.status(201).json({
                success: true,
                message: `Product has been got successfully:`,
                product: product
            })
        } catch (error) {
            console.log(`Error, getting product Failed, ${error}`)
            return resp.status(500).json({
                success: false,
                message: `Error, getting product by Slug Failed`,
                product: error.message
            })
        }
    }
    // ---------------------------------Create or Add product-------------------------------------

    static async Create_Product(req, resp) {
        try {
            const uuid = GenerateProductId() // to generate a unique uuid for the product
            const slug = Generate_slug(req.body.Name) + "-" + Generate_ShortId() // to generate a unique slug for the product
            console.log(`this is uuid: ${uuid} and Slug: ${slug}`)
            // if uuid and slug is false throw an error 
            if (!uuid || !slug) {
                return resp.status(404).json({
                    success: false,
                    message: "Missing Slug or uuid"
                })
            }
            const Images_files = req.files.map(file => file.filename)
            if (!Images_files) {
                return resp.status(404).json({
                    success: false,
                    message: "Files name Error, FILE_NAME"
                });
            }
            const product = await ProductService.Create_Product(req.body, Images_files, uuid, slug)
            console.log("Product created successfully: ", Images_files)
            return resp.status(201).json({
                success: true,
                message: "Product Created Succcessfully",
                Product_Info: product,
                Files: Images_files
            })
        } catch (error) {
            console.log("PRODUCT ERROR", error)
            return resp.status(500).json({
                success: false,
                message: "PRODUCT ERROR",
                Error: error.message
            })
        }
    }
    // ---------------------------------Update a product-------------------------------------

    static async Update_Product(req, resp) {
        try {
            let Images_files = req.files.map(file => file.filename)
            const uuid = req.params.uuid
            console.log(req.body)
            console.log(req.files)
            if (!Images_files) {
                return resp.status(404).json({
                    success: false,
                    message: "Files name Error, FILE_NAME"
                });
            }

            const get_Old_images = await ProductService.Get_ProductByUUID(uuid)
            let Old_Images = get_Old_images.Image_Name;
            if (typeof Old_Images === "string") {
                Old_Images = JSON.parse(Old_Images)
            }
            if (Images_files && Images_files.length != 0) {
                for (const img of Old_Images) {
                    const Old_imagesPath = path.join(__dirname, "../../public/upload/Product_img/", img)
                    if (!Old_imagesPath) {
                        throw new Error("Could not get Old images path")
                    }
                    fs.unlink(Old_imagesPath, (err) => {
                        if (err) {
                            console.log("Could not delete old image:", err);
                        } else {
                            console.log('the Old images have been deleted')
                        }
                    })
                    console.log(`Old path deleted Succeefully : ${Old_imagesPath}`)
                }
            } else {
                Images_files = Old_Images
            }
            const slug = Generate_slug(req.body.Name) + "-" + Generate_ShortId() // to generate a unique slug for the product
            console.log(`this is uuid: ${uuid} and Slug: ${slug}`)
            const product = await ProductService.Update_Product(req.body, Images_files, uuid, slug)
            console.log(product)
            return resp.status(201).json({
                success: true,
                message: "Product Created Succcessfully",
                Product_Info: product,
                Files: Images_files
            })
        } catch (error) {
            console.log("PRODUCT ERROR", error)
            return resp.status(500).json({
                success: false,
                message: "PRODUCT ERROR",
                Error: error.message
            })
        }
    }
    static async DeleteProduct(req, resp) {
        try {
            const { uuid } = req.params
            console.log(uuid)
            if (!uuid) {
                console.log("UUID Not Provided")
                return resp.status(404).json({
                    success: false,
                    message: "UUID Not Provided"
                })
            }
            const result = await ProductService.DeleteProduct(uuid)
            if (!result) {
                return resp.status(505).json({
                    success: false,
                    message: "Request Failed"
                })
            }


            return resp.status(200).json({
                success: true,
                message: "Request successfully !!!"
            })

        } catch (error) {
            console.log("FAiled", error)
            return resp.status(505).json({
                    success: false,
                    message: "Request Failed",
                    Error: error.message
                })
        }
    }
}
export default ProductController