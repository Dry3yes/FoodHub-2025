import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CheckoutModal.css';
import { useCart } from '../hooks/useCart';
import { checkout, fetchStoreById, uploadPaymentProof } from '../services/Api';

function CheckoutModal({ onClose }) {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: JSON.parse(localStorage.getItem('user')).name,
    phone: '',
    notes: ''
  });
  const [paymentProof, setPaymentProof] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [qrisImageUrl, setQrisImageUrl] = useState(null);
  const [orderId, setOrderId] = useState(null);

  // Calculate total
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const feeservice = 2000;
  const total = subtotal + feeservice;

  // Handle form submission for step 1
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // Create the order and proceed to payment step
    await handleCreateOrder();
  };

  // Handle file upload for payment proof
  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  // Handle order creation and payment
  const handleCreateOrder = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Call the checkout API
      const response = await checkout(formData.notes);
      
      if (response.success) {
        // Store the order ID for later use
        setOrderId(response.data.id);
        
        // Fetch the seller's QRIS code if we have a sellerId
        if (response.data.sellerId) {
          try {
            const storeData = await fetchStoreById(response.data.sellerId);
            
            if (storeData && storeData.qrisUrl) {
              setQrisImageUrl(storeData.qrisUrl);
            } else {
              setQrisImageUrl('/placeholder.svg');
            }
          } catch (err) {
            console.error('Error fetching seller details:', err);
            setQrisImageUrl('/placeholder.svg');
          }
        } else {
          setQrisImageUrl('/placeholder.svg');
        }
        
        // Move to the payment step
        setStep(2);
      } else {
        setError(response.message || 'Failed to create order');
      }
    } catch (err) {
      console.error('Error during checkout:', err);
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle final submission with payment proof
  const handleFinalSubmit = async () => {
    if (!paymentProof) {
      setError('Please upload payment proof');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Use the API function from Api.js
      const response = await uploadPaymentProof(orderId, paymentProof);      if (response.success) {
        // Clear the cart after successful payment
        await clearCart();
        // Close the modal and redirect to order status page
        onClose();
        navigate(`/order-status/${orderId}`);
      } else {
        setError(response.message || 'Failed to upload payment proof');
      }
    } catch (err) {
      console.error('Error uploading payment proof:', err);
      setError(err.message || 'An error occurred while uploading payment proof');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-modal-overlay" onClick={onClose}>
        <div className="modal-content checkout-modal" onClick={(e) => e.stopPropagation()}>
            {step === 1 && (
                <>
                <div className="checkout-modal-header">
                    <h3 className="checkout-modal-title">Data Pemesanan</h3>
                    <button className="checkout-modal-close" onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    </button>
                </div>

                <div className="checkout-modal-body">
                    <div className="order-summary-mini">
                    <h4>Ringkasan Pesanan</h4>
                    <div className="mini-items">
                        {items.map((item) => (
                        <div key={item.id} className="mini-item">
                            <span>
                            {item.name} x{item.quantity}
                            </span>
                            <span>Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span>
                        </div>
                        ))}
                        <div className="mini-item">
                            <span>Fee Service</span>
                            <span>Rp {feeservice.toLocaleString("id-ID")}</span>
                        </div>
                    </div>
                    <div className="mini-total">
                        <strong>Total: Rp {total.toLocaleString("id-ID")}</strong>
                    </div>
                    </div>

                    <form onSubmit={handleFormSubmit} className="checkout-form">
                    <div className="form-group">
                        <label>Nama Lengkap *</label>
                        <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Masukkan nama lengkap"
                        />
                    </div>

                    <div className="form-group">
                        <label>Nomor WhatsApp *</label>
                        <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        placeholder="08xxxxxxxxxx"
                        />
                    </div>

                    <div className="form-group">
                        <label>Catatan (Opsional)</label>
                        <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Catatan khusus untuk pesanan"
                        rows="3"
                        />
                    </div>

                    <button type="submit" className="checkout-btn-primary">
                        Lanjut ke Pembayaran
                    </button>
                    </form>
                </div>
                </>
            )}

            {step === 2 && (
                <>
                <div className="checkout-modal-header">
                    <h3 className="checkout-modal-title">Pembayaran QRIS</h3>
                    <button className="modal-close" onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    </button>
                </div>

                <div className="checkout-modal-body">
                    <div className="payment-info">
                    <div className="total-payment">
                        <h4>Total Pembayaran</h4>
                        <div className="amount">Rp {total.toLocaleString("id-ID")}</div>
                    </div>

                    <div className="checkout-qris-section">
                        <h4>📱 Scan QRIS untuk Pembayaran</h4>

                        <div className="checkout-qris-container">
                        <div className="checkout-qris-image">
                            <img src={qrisImageUrl || "/placeholder.svg?height=200&width=200"} alt="QRIS Code" className="checkout-qris-code" />
                        </div>
                        <div className="checkout-qris-info">
                            <p>Scan dengan aplikasi:</p>
                            <div className="payment-apps">
                            <span className="app-badge">DANA</span>
                            <span className="app-badge">GoPay</span>
                            <span className="app-badge">OVO</span>
                            <span className="app-badge">ShopeePay</span>
                            <span className="app-badge">LinkAja</span>
                            </div>
                        </div>
                        </div>
                    </div>

                    <div className="checkout-payment-notes">
                        <h5>⚠️ Penting:</h5>
                        <ul>
                        <li>
                            Bayar sesuai nominal exact: <strong>Rp {total.toLocaleString("id-ID")}</strong>
                        </li>
                        <li>Scan QRIS dengan aplikasi e-wallet Anda</li>
                        <li>Screenshot bukti pembayaran setelah berhasil</li>
                        <li>Upload bukti pembayaran di step selanjutnya</li>
                        <li>Pesanan akan diproses setelah pembayaran terverifikasi</li>
                        </ul>
                    </div>
                    </div>

                    <div className="checkout-modal-actions">
                    <button className="checkout-btn-secondary" onClick={() => setStep(1)}>
                        Kembali
                    </button>
                    <button className="checkout-btn-primary" onClick={() => setStep(3)}>
                        Sudah Bayar
                    </button>
                    </div>
                </div>
                </>
            )}

            {step === 3 && (
                <>
                <div className="checkout-modal-header">
                    <h3 className="checkout-modal-title">Upload Bukti Pembayaran QRIS</h3>
                    <button className="modal-close" onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    </button>
                </div>

                <div className="checkout-modal-body">
                    <div className="checkout-upload-section">
                    <p>Upload screenshot bukti pembayaran dari aplikasi e-wallet Anda</p>

                    <div className="checkout-file-upload">
                        <input
                        type="file"
                        id="payment-proof"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                        />
                        <label htmlFor="payment-proof" className="checkout-upload-area">
                        {paymentProof ? (
                            <div className="file-preview">
                            <div className="file-icon">📄</div>
                            <div className="file-name">{paymentProof.name}</div>
                            <div className="file-size">{(paymentProof.size / 1024 / 1024).toFixed(2)} MB</div>
                            </div>
                        ) : (
                            <div className="checkout-upload-placeholder">
                            <div className="checkout-upload-icon">📷</div>
                            <div>Klik untuk upload bukti pembayaran</div>
                            <div className="checkout-upload-hint">Format: JPG, PNG (Max 5MB)</div>
                            </div>
                        )}
                        </label>
                    </div>

                    <div className="checkout-customer-summary">
                        <h5>Data Pemesanan:</h5>
                        <p>
                        <strong>Nama:</strong> {formData.name}
                        </p>
                        <p>
                        <strong>WhatsApp:</strong> {formData.phone}
                        </p>
                        {formData.notes && (
                        <p>
                            <strong>Catatan:</strong> {formData.notes}
                        </p>
                        )}
                    </div>
                    </div>

                    <div className="checkout-modal-actions checkout-last">
                    <button className="checkout-btn-secondary" onClick={() => setStep(2)}>
                        Kembali
                    </button>
                    <button className="checkout-btn-primary" onClick={handleFinalSubmit} disabled={!paymentProof || isSubmitting}>
                        {isSubmitting ? "Mengirim Pesanan..." : "Kirim Pesanan"}
                    </button>
                    </div>
                </div>
                </>
            )}

            {step === 4 && (
                <>
                <div className="checkout-modal-header">
                    <h3 className="checkout-modal-title">Pesanan Berhasil Dibuat!</h3>
                    <button className="checkout-modal-close" onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    </button>
                </div>

                <div className="checkout-modal-body">
                    <div className="checkout-success-section">
                    <div className="success-icon">✅</div>
                    <h4>Terima kasih!</h4>
                    <p>Pesanan Anda telah berhasil dibuat dengan ID: <strong>{orderId}</strong></p>
                    
                    <div className="success-info">
                        <h5>Apa selanjutnya?</h5>
                        <ul>
                        <li>Bukti pembayaran Anda sedang diverifikasi</li>
                        <li>Anda akan dihubungi melalui WhatsApp untuk konfirmasi</li>
                        <li>Proses verifikasi biasanya memakan waktu 5-15 menit</li>
                        <li>Pesanan akan diproses setelah pembayaran terverifikasi</li>
                        </ul>
                    </div>

                    <div className="checkout-customer-summary">
                        <h5>Detail Pemesanan:</h5>
                        <p><strong>Nama:</strong> {formData.name}</p>
                        <p><strong>WhatsApp:</strong> {formData.phone}</p>
                        <p><strong>Total:</strong> Rp {total.toLocaleString("id-ID")}</p>
                    </div>
                    </div>

                    <div className="checkout-modal-actions">
                    <button className="checkout-btn-primary" onClick={onClose}>
                        Tutup
                    </button>
                    </div>
                </div>
                </>
            )}

            {error && (
                <div className="checkout-error">
                {error}
                </div>
            )}
        </div>
    </div>
    );
}

export default CheckoutModal;