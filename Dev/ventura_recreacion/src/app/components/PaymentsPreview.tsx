// components/PaymentsPreview.tsx
"use client";
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

export default function PaymentsPreview() {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // Crear payment intent en el backend
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create-payment-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: 1000 }) // Ejemplo: $10.00
            });

            const { clientSecret } = await response.json();
            
            const stripe = await stripePromise;
            const { error } = await stripe!.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)!,
                }
            });

            if (error) throw error;
            alert('Pago exitoso!');
        } catch (err) {
            console.error(err);
            alert('Error en el pago');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="section-preview payment-preview">
            {/* ... resto del componente ... */}
            <button 
                onClick={handlePayment}
                disabled={loading}
                className="preview-button"
            >
                {loading ? 'Procesando...' : 'Pagar Ahora'}
            </button>
        </section>
    );
}