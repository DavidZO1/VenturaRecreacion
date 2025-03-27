// app/pagos/page.tsx
import "./PagosPage.css";

export default function Pagos() {
  return (
    <div className="pagos-page">
      <h1>Sistema de Pagos Seguros</h1>
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
          <button className="boton-primario">Pagar Ahora</button>
        </div>
      </div>
    </div>
  );
}