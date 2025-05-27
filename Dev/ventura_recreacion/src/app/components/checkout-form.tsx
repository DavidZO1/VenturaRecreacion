"use client";
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

interface CheckoutFormProps {
  amount: number; // Este monto viene en pesos colombianos
  eventoId: string;
}

// Minimum amount in COP (equivalent to ~$0.50 USD)
const MIN_AMOUNT_COP = 2000;

const CheckoutForm = ({ amount, eventoId }: CheckoutFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

    // CORRIGIDO: Convertir el monto a número entero
    const amountInCOP = Math.max(Math.round(Number(amount)), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!stripe || !elements || !user) {
            alert("No se puede procesar el pago en este momento");
            return;
        }

        // CORRIGIDO: Validación más robusta
        console.log(`🔍 Validando monto: ${amountInCOP} COP (mínimo: ${MIN_AMOUNT_COP} COP)`);
        
        if (isNaN(amountInCOP) || amountInCOP < MIN_AMOUNT_COP) {
            const errorMsg = `Error: El monto mínimo es ${MIN_AMOUNT_COP.toLocaleString('es-CO')} COP. Monto actual: ${amountInCOP.toLocaleString('es-CO')} COP`;
            console.error('❌', errorMsg);
            setPaymentStatus(errorMsg);
            return;
        }

        setIsProcessing(true);
        setPaymentStatus("Procesando pago...");

        try {
            console.log(`🔄 Iniciando pago por ${amountInCOP} COP`);

            // 1. Crear intent de pago con logging detallado
            const paymentData = { 
                amount: amountInCOP, // MONTO EXACTO EN PESOS COLOMBIANOS
                metadata: {
                    userId: user._id,
                    userEmail: user.email,
                    eventoId: eventoId || null,
                    platform: "web",
                    userName: user.name
                }
            };

            console.log('📤 Enviando datos de pago:', paymentData);

            const paymentIntentResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-payment-intent`, 
                {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify(paymentData)
                }
            );

            // CORRIGIDO: Mejor manejo de errores del servidor
            if (!paymentIntentResponse.ok) {
                const errorData = await paymentIntentResponse.json().catch(() => ({}));
                const errorMessage = errorData.message || `Error del servidor: ${paymentIntentResponse.status}`;
                console.error('❌ Error del servidor:', errorData);
                throw new Error(errorMessage);
            }

            const responseData = await paymentIntentResponse.json();
            const { clientSecret, id: paymentIntentId, amount: confirmedAmount, currency } = responseData;
            
            console.log(`💳 Intent creado exitosamente:`, {
                id: paymentIntentId,
                amount: confirmedAmount,
                currency: currency?.toUpperCase(),
                amountSent: amountInCOP
            });

            // Verificar que el monto sea correcto (con tolerancia para conversiones)
            if (Math.abs(confirmedAmount - amountInCOP) > 1) {
                console.warn(`⚠️ Diferencia en montos: Enviado ${amountInCOP}, Confirmado ${confirmedAmount}`);
            }

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
                                city: "Bogotá",
                                country: "CO" // Colombia
                            }
                        }
                    },
                    return_url: `${window.location.origin}/pagos`
                }
            );

            if (error) {
                console.error('❌ Error en confirmCardPayment:', error);
                
                // Handle specific Stripe errors
                if (error.code === 'card_declined') {
                    throw new Error('Tarjeta rechazada. Por favor verifica los datos o usa otra tarjeta.');
                } else if (error.code === 'insufficient_funds') {
                    throw new Error('Fondos insuficientes en la tarjeta.');
                } else if (error.code === 'incorrect_cvc') {
                    throw new Error('Código de seguridad (CVC) incorrecto.');
                } else if (error.code === 'expired_card') {
                    throw new Error('La tarjeta ha expirado.');
                } else if (error.code === 'amount_too_small') {
                    throw new Error(`El monto es demasiado pequeño. Mínimo ${MIN_AMOUNT_COP} COP.`);
                } else {
                    throw new Error(error.message || 'Error en la autenticación del pago');
                }
            }

            if (paymentIntent?.status === 'succeeded') {
                console.log('✅ Pago completado exitosamente:', paymentIntent.id);
                setPaymentStatus(`¡Pago exitoso por ${amountInCOP.toLocaleString('es-CO')} COP! Redirigiendo...`);
                
                // Esperar un poco para que el webhook procese
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Redirigir según si hay evento o no
                if (eventoId) {
                    router.push('/eventos');
                } else {
                    router.push('/pagos');
                }
                router.refresh();
            } else if (paymentIntent?.status === 'requires_action') {
                setPaymentStatus('El pago requiere autenticación adicional...');
                // Stripe manejará automáticamente la autenticación 3D Secure si es necesaria
            } else if (paymentIntent?.status === 'requires_payment_method') {
                setPaymentStatus('Por favor verifica los datos de tu tarjeta e intenta nuevamente.');
            } else {
                console.log('⚠️ Estado de pago inesperado:', paymentIntent?.status);
                setPaymentStatus(`Estado del pago: ${paymentIntent?.status || 'desconocido'}`);
            }

        } catch (error) {
            console.error('🔥 Error en el proceso de pago:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el procesamiento';
            setPaymentStatus(`Error: ${errorMessage}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // CORRIGIDO: Validación más clara
    const isValidAmount = !isNaN(amountInCOP) && amountInCOP >= MIN_AMOUNT_COP;

    // Calculate approximate USD equivalent for display
    const approximateUSD = (amountInCOP / 4000).toFixed(2);

    // CORRIGIDO: Debugging más detallado
    console.log('🔍 CheckoutForm Debug:', {
        originalAmount: amount,
        amountInCOP,
        isValidAmount,
        MIN_AMOUNT_COP,
        type: typeof amount,
        typeAfterConversion: typeof amountInCOP
    });

    return (
        <div className="checkout-form">
            <div className="payment-summary" style={{
                background: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                border: '1px solid #e9ecef'
            }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>
                    💰 Resumen del pago
                </h3>
                <p style={{ margin: '0', fontSize: '1.1rem', fontWeight: '600' }}>
                    Monto: <span style={{ color: isValidAmount ? '#27ae60' : '#e74c3c' }}>
                        ${amountInCOP.toLocaleString('es-CO')} COP
                    </span>
                </p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#6c757d' }}>
                    Aproximadamente ${approximateUSD} USD
                </p>
                {!isValidAmount && (
                    <p style={{ 
                        margin: '0.5rem 0 0 0', 
                        fontSize: '0.9rem', 
                        color: '#e74c3c',
                        fontWeight: '500'
                    }}>
                        ⚠️ Monto mínimo requerido: ${MIN_AMOUNT_COP.toLocaleString('es-CO')} COP
                    </p>
                )}
                {eventoId && (
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#6c757d' }}>
                        Pago asociado al evento: {eventoId}
                    </p>
                )}
            </div>

            {!isValidAmount ? (
                <div style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    background: '#f8d7da',
                    color: '#721c24',
                    border: '1px solid #f5c6cb',
                    textAlign: 'center',
                    marginBottom: '1rem'
                }}>
                    <strong>No se puede procesar el pago</strong>
                    <br />
                    El monto debe ser de al menos ${MIN_AMOUNT_COP.toLocaleString('es-CO')} COP para cumplir con los requisitos mínimos de procesamiento internacional.
                    <br />
                    <small style={{ marginTop: '0.5rem', display: 'block', opacity: 0.8 }}>
                        Monto actual: ${amountInCOP.toLocaleString('es-CO')} COP
                    </small>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="card-element-container" style={{
                        marginBottom: '1.5rem'
                    }}>
                        <label htmlFor="card-element" style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#2c3e50'
                        }}>
                            💳 Información de la tarjeta
                        </label>
                        <div style={{
                            padding: '1rem',
                            border: '2px solid #e9ecef',
                            borderRadius: '8px',
                            background: 'white',
                            transition: 'border-color 0.3s ease'
                        }}>
                            <CardElement 
                                id="card-element"
                                options={{
                                    style: {
                                        base: {
                                            fontSize: '16px',
                                            color: '#424770',
                                            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                                            '::placeholder': {
                                                color: '#aab7c4',
                                            },
                                        },
                                        invalid: {
                                            color: '#e74c3c',
                                        },
                                    },
                                    hidePostalCode: true,
                                }}
                            />
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={!stripe || isProcessing}
                        style={{
                            width: '100%',
                            padding: '1rem 2rem',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            background: isProcessing 
                                ? '#95a5a6' 
                                : 'linear-gradient(135deg, #27ae60, #2ecc71)',
                            color: 'white',
                            transition: 'all 0.3s ease',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}
                        onMouseOver={(e) => {
                            if (!isProcessing) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(39, 174, 96, 0.4)';
                            }
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {isProcessing 
                            ? '🔄 Procesando...' 
                            : `💳 Pagar ${amountInCOP.toLocaleString('es-CO')} COP`
                        }
                    </button>
                </form>
            )}
            
            {paymentStatus && (
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    borderRadius: '8px',
                    background: paymentStatus.includes('exitoso') 
                        ? '#d4edda' 
                        : paymentStatus.includes('Error') 
                            ? '#f8d7da'
                            : '#d1ecf1',
                    color: paymentStatus.includes('exitoso') 
                        ? '#155724' 
                        : paymentStatus.includes('Error') 
                            ? '#721c24'
                            : '#0c5460',
                    border: `1px solid ${
                        paymentStatus.includes('exitoso') 
                            ? '#c3e6cb' 
                            : paymentStatus.includes('Error') 
                                ? '#f5c6cb'
                                : '#bee5eb'
                    }`,
                    fontSize: '1rem',
                    fontWeight: '500'
                }}>
                    {paymentStatus}
                </div>
            )}

            {/* Debug info mejorado */}
            <div style={{ 
                marginTop: '1rem', 
                padding: '0.5rem', 
                background: '#f0f0f0', 
                borderRadius: '4px',
                fontSize: '0.8rem',
                color: '#666'
            }}>
                Debug: Monto original: {amount} | Procesado: {amountInCOP} COP | Válido: {isValidAmount ? 'Sí' : 'No'}
            </div>
        </div>
    );
};

export default CheckoutForm;