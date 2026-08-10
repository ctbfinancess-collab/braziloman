import Stripe from "stripe";
import { env, hasStripe } from "./env";

/**
 * Cliente Stripe como singleton. Retorna null sem STRIPE_SECRET_KEY: o site
 * funciona normalmente, só os botões de pagamento ficam escondidos (os
 * fluxos de anuidade/inscrição em evento seguem 100% manuais, como já eram).
 */
export const stripe: Stripe | null = hasStripe ? new Stripe(env.STRIPE_SECRET_KEY!) : null;
