import crypto from 'crypto'


export const Get_OTP = () => {
    return crypto.randomInt(0, 1000000)
}