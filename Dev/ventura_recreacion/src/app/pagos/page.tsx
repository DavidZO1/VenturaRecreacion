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

// Minimum amount in COP that converts to at least 50 cents USD
// Assuming 1 USD = ~4000 COP, minimum should be around 2000 COP to be safe
const MIN_AMOUNT_COP = 2000;

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
      const parsedAmount = Number(montoAprobado);
      // Ensure the amount meets minimum requirements
      setAmount(Math.max(parsedAmount, MIN_AMOUNT_COP));
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
    
    if (amount < MIN_AMOUNT_COP) {
      alert(`El monto mínimo para procesar un pago es ${formatCurrency(MIN_AMOUNT_COP)} COP`);
      return;
    }
    
    setShowPaymentForm(true);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = Number(e.target.value);
    setAmount(newAmount);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'completado': 'Completado',
      'pendiente': 'Pendiente',
      'fallido': 'Fallido'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const isValidAmount = amount >= MIN_AMOUNT_COP;

  return (
    <div className="pagos-page">
      <h1>Sistema de Pagos Seguros</h1>
      
      {!showPaymentForm ? (
        <div className="metodos-pago">
          <div className="pago-card">
            <h2>💳 Métodos de Pago</h2>
            
            <div className="metodo-item">
              <img 
                src="/credit-card.png" 
                alt="Tarjetas de Crédito/Débito"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.textContent = '💳 Tarjetas de Crédito/Débito';
                }}
              />
              <span>Tarjetas de Crédito/Débito</span>
            </div>
            
            <div className="monto-selector">
              <label htmlFor="monto">💰 Monto a pagar:</label>
              <input
                type="number"
                id="monto"
                value={amount}
                onChange={handleAmountChange}
                className="input-monto"
                disabled={!!eventoId}
                min={MIN_AMOUNT_COP}
                step="500"
                placeholder={`Mínimo ${formatCurrency(MIN_AMOUNT_COP)}`}
              />
              
              <div className="amount-info">
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: '#666', 
                  margin: '0.5rem 0',
                  fontStyle: 'italic'
                }}>
                  💡 Monto mínimo: {formatCurrency(MIN_AMOUNT_COP)} COP
                </p>
                
                {eventoId && (
                  <p className="info-monto">
                    ℹ️ Monto fijado por evento aprobado
                  </p>
                )}
                
                {amount > 0 && (
                  <p style={{ 
                    marginTop: '0.5rem', 
                    color: isValidAmount ? '#2c3e50' : '#e74c3c', 
                    fontWeight: '600' 
                  }}>
                    Total: {formatCurrency(amount)}
                    {!isValidAmount && (
                      <span style={{ display: 'block', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        ⚠️ Monto inferior al mínimo requerido
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
            
            <button 
              className="boton-primario" 
              onClick={handleShowPaymentForm}
              disabled={!isValidAmount}
              style={{
                opacity: isValidAmount ? 1 : 0.6,
                cursor: isValidAmount ? 'pointer' : 'not-allowed'
              }}
            >
              {isValidAmount 
                ? `Pagar ${formatCurrency(amount)}` 
                : `Mínimo ${formatCurrency(MIN_AMOUNT_COP)}`
              }
            </button>
          </div>

          <div className="historial-pagos">
            <h2>📋 Historial de Transacciones</h2>
            
            {loadingHistory ? (
              <div className="loading">
                Cargando transacciones...
              </div>
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
                    <span data-label="Fecha">
                      {formatDate(pago.date)}
                    </span>
                    <span data-label="Monto">
                      {formatCurrency(pago.amount)}
                    </span>
                    <span 
                      data-label="Estado"
                      data-status={pago.status.toLowerCase()}
                    >
                      {getStatusText(pago.status)}
                    </span>
                    <span data-label="Evento">
                      {pago.eventoId || 'Sin evento asociado'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sin-transacciones">
                No se encontraron transacciones registradas
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="pago-form-container">
          <div className="pago-card">
            <h2>💳 Procesar Pago</h2>
            <div style={{ 
              background: '#e8f5e8', 
              border: '1px solid #27ae60', 
              borderRadius: '8px', 
              padding: '1rem', 
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <strong>Monto a pagar: {formatCurrency(amount)}</strong>
              {eventoId && (
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#2c3e50' }}>
                  Evento ID: {eventoId}
                </p>
              )}
            </div>
            
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
              ← Volver a métodos de pago
            </button>
          </div>
        </div>
      )}
    </div>
  );
}