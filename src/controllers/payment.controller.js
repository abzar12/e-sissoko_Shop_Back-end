import axios from "axios"
import crypto from "crypto"
import OrdersModel from "../Model/ordered.model.js"
class PaymentVerify {

    static async Verification(req, res) {
        try {
            const { reference } = req.params
            console.log("verification init Reference= ", req.params)
            if (!reference) {
                console.log(`Verification failed check Data`)
                res.status(400).json({
                    success: false,
                    message: "Verification failed check Data",
                })
            }
            const resp = await axios(`https://api.paystack.co/transaction/verify/${reference}`, {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
            })
            console.log("Verification succeed")
            return res.status(200).json({
                success: true,
                Response: resp.data.data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Verification Failed ",
                Error: error.message()
            })
        }
    }
    static async WebhookPaystack(req, res) {
        try {
            console.log("Webhook init ")
            const hash = crypto
                .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
                .update(req.body)
                .digest('hex');

            if (hash !== req.headers["x-paystack-signature"]) {
                console.log("❌ Invalid signature");
                return res.sendStatus(401);
            }

            const event = JSON.parse(req.body.toString())
            if (event.event !== "charge.success") {
                return res.sendStatus(200);
            }

            const { reference, amount } = event.data
            const order = await OrdersModel.findByReference(reference)
            if (order.length === 0) {
                console.log("⚠️ Order not found");
                return res.sendStatus(200);
            }
            console.log(" Order  found");
            if (order.Payment_Status === "paid") {
                console.log("ℹ️ Order already paid");
                return res.sendStatus(200);
            }
            const [UpdateOrder] = await OrdersModel.UpdateOrder({paymentStatus: "paid", orderedStatus: "paid", amount: amount/100, reference})
            if(UpdateOrder.affectedRows === 0){
                console.log("Failed to update Ordered", reference);
                return res.sendStatus(200);
            }
            console.log("✅ Order confirmed:", reference);
            res.sendStatus(200);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Paystack webhook Failed: ",
                Error: error
            })
        }
    }
}
export default PaymentVerify