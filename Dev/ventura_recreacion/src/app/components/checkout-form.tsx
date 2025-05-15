"use client";
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const CheckoutForm = ({ amount }: { amount: number }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!stripe || !elements || !user) {
            alert("No se puede procesar el pago en este momento");
            return;
        }

        setIsProcessing(true);
        setPaymentStatus("Procesando pago...");

        try {
            // 1. Crear intent de pago
            const paymentIntentResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-payment-intent`, 
                {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify({ 
                        amount,
                        metadata: {
                            userId: user._id,
                            email: user.email
                        }
                    })
                }
            );

            if (!paymentIntentResponse.ok) {
                throw new Error('Error al crear el intent de pago');
            }

            const { clientSecret } = await paymentIntentResponse.json();

            // 2. Confirmar el pago con Stripe
            const { error, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement)!,
                        billing_details: {
                            name: user.name,
                            email: user.email,
                        }
                    }
                }
            );

            if (error) {
                setPaymentStatus(`Error: ${error.message}`);
            } else if (paymentIntent?.status === 'succeeded') {
                setPaymentStatus('¡Pago exitoso! Gracias por tu compra.');
                // Aquí podrías realizar alguna acción adicional como actualizar la UI
                // o redirigir a una página de confirmación
            } else {
                setPaymentStatus(`Estado del pago: ${paymentIntent?.status}`);
            }
        } catch (error) {
            console.error('Error al procesar el pago:', error);
            setPaymentStatus('Error al procesar el pago. Por favor intenta de nuevo.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="checkout-form">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="card-element-container">
                    <label htmlFor="card-element">Datos de tarjeta</label>
                    <CardElement 
                        id="card-element"
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                                invalid: {
                                    color: '#9e2146',
                                },
                            },
                        }}
                        className="p-3 border rounded"
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={!stripe || isProcessing}
                    className={`w-full py-2 px-4 rounded ${
                        isProcessing ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                >
                    {isProcessing ? 'Procesando...' : `Pagar $${amount / 100}`}
                </button>
            </form>
            
            {paymentStatus && (
                <div className={`mt-4 p-3 rounded ${
                    paymentStatus.includes('exitoso') 
                        ? 'bg-green-100 text-green-800' 
                        : paymentStatus.includes('Error') 
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                }`}>
                    {paymentStatus}
                </div>
            )}
        </div>
    );
};

export default CheckoutForm;