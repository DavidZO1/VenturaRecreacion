"use client";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../context/AuthContext';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);


const CheckoutForm = ({ amount }: { amount: number }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!stripe || !elements || !user) return;

        const { error, paymentIntent } = await stripe.confirmCardPayment(
            await createPaymentIntent(amount),
            {
                payment_method: {
                    card: elements.getElement(CardElement)!,
                    billing_details: {
                        email: user.email,
                    }
                }
            }
        );

        if (error) alert(error.message);
        else if (paymentIntent?.status === 'succeeded') {
            alert('Pago exitoso!');
            // Guardar en base de datos
        }
    };

    const createPaymentIntent = async (amount: number) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-payment-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        });
        return (await response.json()).clientSecret;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <CardElement className="p-2 border rounded" />
            <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
                Pagar ${amount / 100}
            </button>
        </form>
    );
};

export default function PaymentsPreview() {
    return (
        <section className="section-preview payment-preview">
            <Elements stripe={stripePromise}>
                <CheckoutForm amount={1000} /> {/* Ejemplo: $10.00 */}
            </Elements>
        </section>
    );
}