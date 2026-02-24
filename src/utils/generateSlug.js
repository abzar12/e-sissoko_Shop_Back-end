import slugify from "slugify";
import { nanoid } from "nanoid";
export const Generate_slug = (Name) => {
    return slugify(Name, {
        lower: true,
        strict: true
    })
}
export const Generate_ShortId = () => {
    return nanoid(10)
}
