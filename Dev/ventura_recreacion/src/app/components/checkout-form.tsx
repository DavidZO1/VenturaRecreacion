"use client";
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

interface CheckoutFormProps {
  amount: number;
  eventoId: string;
}

const CheckoutForm = ({ amount, eventoId }: CheckoutFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();
    const router = useRouter();
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
            // 1. Crear intent de pago con metadatos mejorados
            const paymentIntentResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-payment-intent`, 
                {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify({ 
                        amount: amount , // Convertir a centavos
                        metadata: {
                            userId: user._id,
                            userEmail: user.email,
                            eventoId: eventoId,
                            platform: "web"
                        }
                    })
                }
            );

            if (!paymentIntentResponse.ok) {
                const errorData = await paymentIntentResponse.json();
                throw new Error(errorData.message || 'Error al crear el intent de pago');
            }

            const { clientSecret, id: paymentIntentId } = await paymentIntentResponse.json();

            // 2. Confirmar el pago con Stripe
            const { error, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement)!,
                        billing_details: {
                            name: user.name,
                            email: user.email,
                            address: {
                                city: "Bogotá", // Ejemplo de dato adicional
                                country: "CO"
                            }
                        }
                    },
                    return_url: window.location.href // Para pagos que requieren redirección
                }
            );

            if (error) {
                throw new Error(error.message || 'Error en la autenticación del pago');
            }

            if (paymentIntent?.status === 'succeeded') {
                setPaymentStatus('¡Pago exitoso! Redirigiendo...');
                
                // Esperar 2 segundos para permitir que el webhook procese
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                router.push('/eventos');
                router.refresh(); // Forzar actualización de datos
            }

        } catch (error) {
            console.error('Error en el proceso de pago:', error);
            setPaymentStatus(error instanceof Error ? error.message : 'Error desconocido');
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
                            hidePostalCode: true // Opción importante para Colombia
                        }}
                        className="p-3 border rounded"
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={!stripe || isProcessing}
                    className={`w-full py-2 px-4 rounded ${
                        isProcessing ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                    } text-white transition-all`}
                >
                    {isProcessing ? 'Procesando...' : `Pagar $${(amount / 100).toLocaleString('es-CO')} COP`}
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