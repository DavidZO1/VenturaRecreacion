"use client";
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../context/AuthContext';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

const CheckoutForm = ({ amount }: { amount: number }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [succeeded, setSucceeded] = useState(false);

    const createPaymentIntent = async (amount: number) => {
        try {
            if (!user?.token) {
                throw new Error('Se requiere autenticación para realizar pagos');
            }
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-payment-intent`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ 
                    amount,
                    metadata: {
                        userId: user._id
                    }
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear intento de pago');
            }
            
            const data = await response.json();
            return data.clientSecret;
        } catch (err) {
            if (err instanceof Error) {
                throw new Error(err.message);
            }
            throw new Error('Error al procesar el pago');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!stripe || !elements) {
            return;
        }
        
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            setError("No se pudo encontrar el elemento de tarjeta");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        
        try {
            const clientSecret = await createPaymentIntent(amount);
            
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        email: user?.email,
                    }
                }
            });

            if (error) {
                setError(error.message || 'Error al procesar el pago');
            } else if (paymentIntent?.status === 'succeeded') {
                setSucceeded(true);
                // Aquí podrías guardar el ID del pago en tu base de datos
                console.log('Payment succeeded:', paymentIntent.id);
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Error desconocido al procesar el pago');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a',
            },
        },
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}
            
            {succeeded ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    ¡Pago completado con éxito!
                </div>
            ) : (
                <>
                    <div className="p-4 border rounded">
                        <CardElement options={cardElementOptions} />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={!stripe || isLoading}
                        className={`w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50
                        ${(isLoading || !stripe) ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Procesando...' : `Pagar $${(amount / 100).toFixed(2)}`}
                    </button>
                </>
            )}
        </form>
    );
};

export default function PaymentsPreview() {
    return (
        <section className="max-w-md mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">Realizar Pago</h2>
            <Elements stripe={stripePromise}>
                <CheckoutForm amount={1000} /> {/* $10.00 */}
            </Elements>
        </section>
    );
}