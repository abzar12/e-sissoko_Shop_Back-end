import CustomerServiceProfile from "../services/profile.service.js"
class CustomerControlerProfile {
    static async UpdatingProfile(req, resp){
        try {
            const { email } = req.params
            const data = req.body
            console.log("data: ", email, data, req.body)
            if (!email || !data) {
                console.log("Missing Data Check request")
                return resp.status(404).json({
                    success: false,
                    message: "Missing Data Check request"
                })
            }
            const result = await CustomerServiceProfile.UpdatingProfile({ email, data })
            if (!result) {
                return resp.status(404).json({
                    success: false,
                    message: "Result Failed please. "
                })
            }
            return resp.status(200).json({
                success: true,
                message: "Profile Updating Succesfully",
                response: result
            })
        } catch (error) {
            console.log(error.message)
            return resp.status(505).json({
                success: false,
                message: "Request Failed check Error",
                Error: error.message
            })
        }

    }
}
export default CustomerControlerProfile