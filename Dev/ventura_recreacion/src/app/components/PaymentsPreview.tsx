// components/PaymentsPreview.tsx
"use client";
export default function PaymentsPreview() {
    const metodosPago = [
      "Tarjetas de Crédito",
      "PayPal",
      "Transferencia Bancaria"
    ];
  
    return (
      <section className="section-preview payment-preview">
        <div className="preview-content">
          <h2 className="preview-title">Métodos de Pago Seguros</h2>
          <div className="metodos-grid">
            {metodosPago.map((metodo, index) => (
              <div key={index} className="metodo-item">
                {metodo}
              </div>
            ))}
          </div>
          <a href="/pagos" className="preview-button">Ver detalles de pagos</a>
        </div>
        <style jsx>{`
          .payment-preview {
            background: #f8f9fa;
            padding: 4rem 0;
            text-align: center;
          }
          
          .preview-content {
            max-width: 800px;
            margin: 0 auto;
            padding: 0 1rem;
          }
          
          .metodos-grid {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            flex-wrap: wrap;
            margin: 2rem 0;
          }
          
          .metodo-item {
            background: white;
            padding: 0.8rem 1.5rem;
            border-radius: 20px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            color: #2c3e50;
          }
          
          .preview-button {
            display: inline-block;
            background: #27ae60;
            color: white;
            padding: 0.8rem 2rem;
            border-radius: 4px;
            text-decoration: none;
            transition: background 0.3s ease;
          }
          
          .preview-button:hover {
            background: #219a52;
          }
        `}</style>
      </section>
    );
  }