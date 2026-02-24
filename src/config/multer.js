import fs from "fs"
import multer from "multer";
import path from "path";

const storage =  multer.diskStorage({
    destination(req, file, cb){
        if(!fs.existsSync("public/upload/Product_img/")){
            fs.mkdirSync("public/upload/Product_img/", { recursive: true })
        }
        cb(null, "public/upload/Product_img/")
    },
    filename(req, file, callback){
        callback(null, file.fieldname +"_"+ Date.now()+ path.extname(file.originalname));
    }
})
export const upload = multer ({ storage: storage})
