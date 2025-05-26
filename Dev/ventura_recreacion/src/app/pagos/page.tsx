"use client";
import "./PagosPage.css";
import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/checkout-form';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

export default function Pagos() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [amount, setAmount] = useState(0);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const eventoId = searchParams?.get('eventoId');

  useEffect(() => {
    const montoAprobado = searchParams?.get('monto');
    if (montoAprobado) {
      setAmount(Number(montoAprobado) * 100); // Convertir a centavos
    }
  }, [searchParams]);

  const handleShowPaymentForm = () => {
    if (!user) {
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
            
            
            <div className="monto-selector">
              <label htmlFor="monto">Monto a pagar (MXN):</label>
              <select 
                id="monto" 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))}
                className="select-monto"
                disabled={!!eventoId}
              >
                {!eventoId && (
                  <>
                    <option value={10000}>$100.00</option>
                    <option value={50000}>$500.00</option>
                    <option value={100000}>$1,000.00</option>
                  </>
                )}
                <option value={amount}>${(amount/100).toFixed(2)}</option>
              </select>
              {eventoId && (
                <p className="info-monto">
                  Monto fijado por evento aprobado
                </p>
              )}
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
            <h2>Pagar ${(amount/100).toFixed(2)}</h2>
            <Elements stripe={stripePromise}>
              <CheckoutForm 
                amount={amount} 
                eventoId={eventoId || ''}
              />
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