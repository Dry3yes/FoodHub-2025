"use client"
import { useState } from "react"
import "../styles/OrderStatus.css"

const OrderStatus = ({ orderData, onBackToCart }) => {
  const [currentStatus, setCurrentStatus] = useState("pending_verification")

  const statusSteps = [
    { id: "pending_verification", label: "Menunggu Verifikasi", icon: "⏳", active: true },
    { id: "confirmed", label: "Pesanan Dikonfirmasi", icon: "✅", active: false },
    { id: "preparing", label: "Sedang Dimasak", icon: "👨‍🍳", active: false },
    { id: "ready", label: "Siap Diambil", icon: "🍽️", active: false },
    { id: "completed", label: "Selesai", icon: "🎉", active: false },
  ]

  return (
    <div className="order-status-container">
      <div className="status-header">
        <h2>Status Pesanan</h2>
        <div className="order-id">ID Pesanan: {orderData.orderId}</div>
      </div>

      <div className="status-timeline">
        {statusSteps.map((step, index) => (
          <div key={step.id} className={`status-step ${step.active ? "active" : ""}`}>
            <div className="step-icon">{step.icon}</div>
            <div className="step-content">
              <div className="step-label">{step.label}</div>
              {step.active && (
                <div className="step-description">
                  Bukti pembayaran Anda sedang diverifikasi oleh admin. Proses ini biasanya memakan waktu 5-15 menit.
                </div>
              )}
            </div>
            {index < statusSteps.length - 1 && <div className="step-line"></div>}
          </div>
        ))}
      </div>

      <div className="order-details">
        <h3>Detail Pesanan</h3>
        <div className="order-info">
          <div className="info-row">
            <span>Nama:</span>
            <span>{orderData.customerData.name}</span>
          </div>
          <div className="info-row">
            <span>WhatsApp:</span>
            <span>{orderData.customerData.phone}</span>
          </div>
          <div className="info-row">
            <span>Total:</span>
            <span>Rp {orderData.total.toLocaleString("id-ID")}</span>
          </div>
          <div className="info-row">
            <span>Waktu Pesan:</span>
            <span>{new Date(orderData.createdAt).toLocaleString("id-ID")}</span>
          </div>
        </div>

        <div className="order-items">
          <h4>Item Pesanan:</h4>
          {orderData.items.map((item) => (
            <div key={item.id} className="status-item">
              <img src={item.image || "/placeholder.svg"} alt={item.name} className="status-item-image" />
              <div className="status-item-details">
                <div className="status-item-name">{item.name}</div>
                <div className="status-item-qty">Qty: {item.quantity}</div>
                <div className="status-item-price">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="status-actions">
        <button className="btn-secondary" onClick={onBackToCart}>
          Pesan Lagi
        </button>
        <button className="btn-primary" onClick={() => window.location.reload()}>
          Refresh Status
        </button>
      </div>
    </div>
  )
}

export default OrderStatus


