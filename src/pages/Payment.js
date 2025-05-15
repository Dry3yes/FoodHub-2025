"use client"
import { useState } from "react"
import "./payment-selection.css"

export default function PaymentSelection({ onSelect }) {
  const [selectedPayment, setSelectedPayment] = useState(null)

  const handlePaymentSelect = (paymentMethod) => {
    setSelectedPayment(paymentMethod)
    if (onSelect) {
      onSelect(paymentMethod)
    }
  }

  return (
    <div className="payment-selection-container">
      <div className="payment-selection-header">
        <div className="payment-step-number">1</div>
        <h2 className="payment-title">Select a Payment Option</h2>
      </div>

      <div className="payment-options">
        <div className="payment-section">
          <p className="payment-section-title">Pay With Cash</p>
          <div
            className={`payment-option ${selectedPayment === "cash" ? "selected" : ""}`}
            onClick={() => handlePaymentSelect("cash")}
          >
            <div className="payment-option-content">
              <div className="payment-icon cash-icon">$</div>
              <span className="payment-name">Cash</span>
            </div>
          </div>
        </div>

        <div className="payment-section">
          <p className="payment-section-title">Transfer Bank</p>
          <div
            className={`payment-option ${selectedPayment === "bank_transfer" ? "selected" : ""}`}
            onClick={() => handlePaymentSelect("bank_transfer")}
          >
            <div className="payment-option-content">
              <div className="bank-logos">
                <div className="bank-logo bca-logo">BCA</div>
                <div className="bank-logo bni-logo">BNI</div>
                <div className="bank-logo mandiri-logo">mandiri</div>
              </div>
              <span className="maintenance-text">Under Maintaince.</span>
            </div>
          </div>
        </div>

        <div className="payment-section">
          <p className="payment-section-title">Qris</p>
          <div
            className={`payment-option ${selectedPayment === "qris" ? "selected" : ""}`}
            onClick={() => handlePaymentSelect("qris")}
          >
            <div className="payment-option-content">
              <div className="qris-logo">QRIS</div>
              <span className="maintenance-text">Under Maintaince.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
