"use client";
import "./PagosPage.css";
import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/checkout-form';
import { useAuth } from '../context/AuthContext';

// Cargar Stripe fuera del componente para evitar recargas innecesarias
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

export default function Pagos() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [amount, setAmount] = useState(1000); // Monto predeterminado: $10.00
  const { user } = useAuth();

  const handleShowPaymentForm = () => {
    if (!user) {
      // Si el usuario no está autenticado, redirigir al login
      alert("Por favor inicia sesión para continuar con el pago");
      window.location.href = "/login";
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
            <div className="metodo-item">
              <img src="/credit-card.png" alt="Tarjetas" />
              <span>Tarjetas de Crédito/Débito</span>
            </div>
            <div className="metodo-item">
              <img src="/paypal.png" alt="PayPal" />
              <span>PayPal</span>
            </div>
            
            <div className="monto-selector">
              <label htmlFor="monto">Monto a pagar (COP):</label>
              <select 
                id="monto" 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))}
                className="select-monto"
              >
                <option value={1000}>$10.000</option>
                <option value={5000}>$50.000</option>
                <option value={10000}>$100.000</option>
                <option value={50000}>$500.000</option>
              </select>
            </div>
            
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
            <Elements stripe={stripePromise}>
              <CheckoutForm amount={amount} />
            </Elements>
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