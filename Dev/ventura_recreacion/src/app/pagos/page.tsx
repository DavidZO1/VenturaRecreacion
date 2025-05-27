"use client";
import "./PagosPage.css";
import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/checkout-form';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

interface PaymentHistory {
  amount: number;
  date: string;
  status: string;
  eventoId?: string;
}

export default function Pagos() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [amount, setAmount] = useState(0);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const eventoId = searchParams?.get('eventoId');

  useEffect(() => {
    const montoAprobado = searchParams?.get('monto');
    if (montoAprobado) {
      setAmount(Number(montoAprobado));
    }
    
    if (user) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/history`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener el historial');
        return res.json();
      })
      .then(data => setPaymentHistory(data))
      .catch(error => {
        console.error(error);
        alert('Error al cargar el historial de pagos');
      })
      .finally(() => setLoadingHistory(false));
    }
  }, [searchParams, user]);

  const handleShowPaymentForm = () => {
    if (!user) {
      alert("Por favor inicia sesión para continuar con el pago");
      window.location.href = "/login";
      return;
    }
    
    if (amount <= 0) {
      alert("Por favor ingresa un monto válido");
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
              <label htmlFor="monto">Monto a pagar (COP):</label>
              <input
                type="number"
                id="monto"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="input-monto"
                disabled={!!eventoId}
                min="1000"
                step="100"
              />
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

          <div className="historial-pagos">
            <h2>Historial de Pagos</h2>
            {loadingHistory ? (
              <p>Cargando historial...</p>
            ) : paymentHistory.length > 0 ? (
              <div className="tabla-pagos">
                <div className="encabezado">
                  <span>Fecha</span>
                  <span>Monto</span>
                  <span>Estado</span>
                  <span>Evento</span>
                </div>
                {paymentHistory.map((pago, index) => (
                  <div className="fila" key={index}>
                    <span>{new Date(pago.date).toLocaleDateString()}</span>
                    <span>${pago.amount.toLocaleString()} COP</span>
                    <span>{pago.status}</span>
                    <span>{pago.eventoId || 'N/A'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay pagos registrados</p>
            )}
          </div>
        </div>
      ) : (
        <div className="pago-form-container">
          <div className="pago-card">
            <h2>Pagar ${amount.toLocaleString()} COP</h2>
            <Elements stripe={stripePromise}>
              <CheckoutForm 
                amount={amount * 100}
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