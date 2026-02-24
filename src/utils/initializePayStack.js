import axios from "axios"
const initializePayStack = async (User, cart, res, Reference) => {
    try {
        if (!User || !cart) {
            throw new Error("Payment Init didn't get Data ...");
        }
        console.log("Paystack:", User.Email + "\n" + cart)
        const Email = User.Email;
        const amount = cart.reduce((acc, item) => {
            return acc + item.sub_total
        }, 0)
        const PaystackResp = await axios.post("https://api.paystack.co/transaction/initialize",
            {
                email: Email,
                amount: amount * 100,
                reference: Reference,
                currency: "GHS",
                callback_url: `${process.env.API_FRONT_END}/payment/verify`
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
            })

        return res.status(200).json({
            success: true,
            data: PaystackResp.data.data
        })

    } catch (error) {
        console.error("Starting Payment Error", error.response?.data || error);
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || "Payment init failed"
        })
    }
}
export default initializePayStack