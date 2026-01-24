import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // Nemoj ručno apiVersion jer Stripe SDK sad strogo tipizira verziju
  typescript: true,
});