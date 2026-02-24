import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export const GenerateProductId =() => {
    return uuidv4()
}
export const GenerateUserId = () =>{
    return crypto.randomInt(0, 100000)
}