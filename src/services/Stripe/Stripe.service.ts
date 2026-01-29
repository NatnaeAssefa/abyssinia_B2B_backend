import Stripe from "stripe";
import { env } from "../../config";

class StripeService {
    static stripe = new Stripe(env.STRIPE_SECRET_KEY_TEST_MODE as string);
}

export default StripeService