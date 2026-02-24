import CustomerModelProfile from "../Model/profile.model.js"
class CustomerServiceProfile {
    // updating the profile 
    static async UpdatingProfile({ data, email }) {
        try {
            const result = await CustomerModelProfile.UpdatingProfile(email, data)
            if (!result) {
                throw new Error("Error updating Profile Model failed");
            }
            return result
        } catch (error) {
            console.log(`Service Error: ${error.message}`)
            throw new Error(`${error.message}`);
        }

    }
}
export default CustomerServiceProfile