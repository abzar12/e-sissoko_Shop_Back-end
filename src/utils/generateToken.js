import jwt from "jsonwebtoken"

export const Generate_access_Token = ({id, firstname, lastname, role, email, username, city, area, phone}) => {
    return jwt.sign({id, firstname, lastname,role, email, username,city, area, phone}, process.env.JWT_SECRET_ACC_TK, {expiresIn: "15m"})
}
export const Generate_refresh_Token = ({Id, firstname, lastname, role, email, username, city, area, phone}) => {
    return jwt.sign({Id, firstname, lastname, role, email, username, city, area, phone}, process.env.JWT_SECRET_RFSH_TK, {expiresIn: "7d"})
}