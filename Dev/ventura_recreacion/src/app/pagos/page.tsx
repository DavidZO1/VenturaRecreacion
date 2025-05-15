"use client";
import "./PagosPage.css";
import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/checkout-form';
import { useAuth } from '../context/AuthContext';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

// Nuevo: Tipo para métodos de pago
type PaymentMethod = 'card' | 'paypal' | null;

export default function Pagos() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [amount, setAmount] = useState(1000);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null); // Nuevo estado
  const { user } = useAuth();

  const handleShowPaymentForm = () => {
    if (!user) {
      alert("Por favor inicia sesión para continuar con el pago");
      window.location.href = "/login";
      return;
    }
    
    if (!selectedMethod) { // Validar selección
      alert("Selecciona un método de pago");
      return;
    }

    setShowPaymentForm(true);
  };

  return (
    <div className="pagos-page">
      <h1>Sistema de Pagos Seguros</h1>
      
      {!showPaymentForm ? (
        <div className="metodos-pago">
          <div className="pago-card">
            <h2>Métodos de Pago</h2>
            
            {/* Tarjeta - Ahora seleccionable */}
            <div 
              className={`metodo-item ${selectedMethod === 'card' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('card')}
            >
              <img src="/credit-card.png" alt="Tarjetas" />
              <span>Tarjetas de Crédito/Débito</span>
              {selectedMethod === 'card' && <div className="checkmark">✓</div>}
            </div>

            {/* PayPal - Ahora seleccionable */}
            <div 
              className={`metodo-item ${selectedMethod === 'paypal' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('paypal')}
            >
              <img src="/paypal.png" alt="PayPal" />
              <span>PayPal</span>
              {selectedMethod === 'paypal' && <div className="checkmark">✓</div>}
            </div>

            {/* ... resto del código igual ... */}
            
            <button 
              className="boton-primario" 
              onClick={handleShowPaymentForm}
            >
              Pagar Ahora
            </button>
          </div>
        </div>
      ) : (
        <div className="pago-form-container">
          <div className="pago-card">
            <h2>Realizar Pago de ${amount/100}</h2>
            
            {/* Mostrar formulario según método */}
            {selectedMethod === 'card' && (
              <Elements stripe={stripePromise}>
                <CheckoutForm amount={amount} />
              </Elements>
            )}
            
            {selectedMethod === 'paypal' && (
              <div className="paypal-message">
                <p>Procesando pago con PayPal...</p>
                {/* Aquí integrarías el SDK de PayPal */}
              </div>
            )}

            <button 
              className="boton-secundario" 
              onClick={() => setShowPaymentForm(false)}
            >
              Volver
            </button>
          </div>
        </div>
      )}
    </div>
  );
}