import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/CheckoutModal.module.css';
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
    // Just move to payment step without creating order
    await handleMoveToPaymentStep();
  };

  // Handle file upload for payment proof
  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };
  // Handle moving to payment step without creating order
  const handleMoveToPaymentStep = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Get the seller ID from cart items to fetch QRIS code
      if (items.length > 0) {
        const firstItem = items[0];
        if (firstItem.sellerId) {
          try {
            const storeData = await fetchStoreById(firstItem.sellerId);
            
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
      } else {
        setQrisImageUrl('/placeholder.svg');
      }
      
      // Move to the payment step
      setStep(2);
    } catch (err) {
      console.error('Error moving to payment step:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  // Handle order creation and payment
  const handleCreateOrder = async () => {
    try {
      // Call the checkout API
      const response = await checkout(formData.name, formData.phone, formData.notes);

      if (response.success) {
        // Store the order ID for later use
        setOrderId(response.data.id);
        return response.data.id;
      } else {
        setError(response.message || 'Failed to create order');
        return null;
      }
    } catch (err) {
      console.error('Error during checkout:', err);
      setError(err.message || 'An error occurred during checkout');
      return null;
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
      // First, create the order
      const createdOrderId = await handleCreateOrder();
      
      if (!createdOrderId) {
        setError('Failed to create order');
        return;
      }

      // Then upload the payment proof
      const response = await uploadPaymentProof(createdOrderId, paymentProof);
      
      if (response.success) {
        // Clear the cart after successful payment
        await clearCart();
        // Close the modal and redirect to order status page
        onClose();
        navigate(`/order-status/${createdOrderId}`);
      } else {
        setError(response.message || 'Failed to upload payment proof');
      }
    } catch (err) {
      console.error('Error uploading payment proof:', err);
      setError(err.message || 'An error occurred while processing your order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles['checkout-modal-overlay']} onClick={onClose}>
        <div className={`${styles['modal-content']} ${styles['checkout-modal']}`} onClick={(e) => e.stopPropagation()}>
            {step === 1 && (
                <>
                <div className={styles['checkout-modal-header']}>
                    <h3 className={styles['checkout-modal-title']}>Data Pemesanan</h3>
                    <button className={styles['checkout-modal-close']} onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    </button>
                </div>

                <div className={styles['checkout-modal-body']}>
                    <div className={styles['order-summary-mini']}>
                    <h4>Ringkasan Pesanan</h4>
                    <div className={styles['mini-items']}>
                        {items.map((item) => (
                        <div key={item.id} className={styles['mini-item']}>
                            <span>
                            {item.name} x{item.quantity}
                            </span>
                            <span>Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span>
                        </div>
                        ))}
                        <div className={styles['mini-item']}>
                            <span>Fee Service</span>
                            <span>Rp {feeservice.toLocaleString("id-ID")}</span>
                        </div>
                    </div>
                    <div className={styles['mini-total']}>
                        <strong>Total: Rp {total.toLocaleString("id-ID")}</strong>
                    </div>
                    </div>

                    <form onSubmit={handleFormSubmit} className={styles['checkout-form']}>
                    <div className={styles['form-group']}>
                        <label>Nama Lengkap *</label>
                        <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Masukkan nama lengkap"
                        />
                    </div>

                    <div className={styles['form-group']}>
                        <label>Nomor WhatsApp *</label>
                        <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        placeholder="08xxxxxxxxxx"
                        />
                    </div>

                    <div className={styles['form-group']}>
                        <label>Catatan (Opsional)</label>
                        <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Catatan khusus untuk pesanan"
                        rows="3"
                        />
                    </div>                    <button type="submit" className={styles['checkout-btn-primary']} disabled={isSubmitting}>
                        {isSubmitting ? "Loading..." : "Lanjut ke Pembayaran"}
                    </button>
                    </form>
                </div>
                </>
            )}

            {step === 2 && (
                <>
                <div className={styles['checkout-modal-header']}>
                    <h3 className={styles['checkout-modal-title']}>Pembayaran QRIS</h3>
                    <button className={styles['checkout-modal-close']} onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    </button>
                </div>

                <div className={styles['checkout-modal-body']}>
                    <div className={styles['payment-info']}>
                    <div className={styles['total-payment']}>
                        <h4>Total Pembayaran</h4>
                        <div className={styles['amount']}>Rp {total.toLocaleString("id-ID")}</div>
                    </div>

                    <div className={styles['checkout-qris-section']}>
                        <h4>📱 Scan QRIS untuk Pembayaran</h4>

                        <div className={styles['checkout-qris-container']}>
                        <div className={styles['checkout-qris-image']}>
                            <img src={qrisImageUrl || "/placeholder.svg?height=200&width=200"} alt="QRIS Code" className={styles['checkout-qris-code']} />
                        </div>
                        <div className={styles['checkout-qris-info']}>
                            <p>Scan dengan aplikasi:</p>
                            <div className={styles['payment-apps']}>
                            <span className={styles['app-badge']}>DANA</span>
                            <span className={styles['app-badge']}>GoPay</span>
                            <span className={styles['app-badge']}>OVO</span>
                            <span className={styles['app-badge']}>ShopeePay</span>
                            <span className={styles['app-badge']}>LinkAja</span>
                            </div>
                        </div>
                        </div>
                    </div>

                    <div className={styles['checkout-payment-notes']}>
                        <h5>⚠️ Penting:</h5>
                        <ul>
                        <li>
                            Bayar sesuai nominal exact: <strong>Rp {total.toLocaleString("id-ID")}</strong>
                        </li>
                        <li>Scan QRIS dengan aplikasi e-wallet Anda</li>
                        <li>Screenshot bukti pembayaran setelah berhasil</li>                        <li>Upload bukti pembayaran di step selanjutnya</li>
                        <li>Pesanan akan dibuat setelah Anda mengupload bukti pembayaran</li>
                        <li>Pesanan akan diproses setelah pembayaran terverifikasi</li>
                        </ul>
                    </div>
                    </div>

                    <div className={styles['checkout-modal-actions']}>                    <button className={styles['checkout-btn-secondary']} onClick={() => {
                        setStep(1);
                        setError(''); // Clear any errors when going back
                    }}>
                        Kembali
                    </button>
                    <button className={styles['checkout-btn-primary']} onClick={() => setStep(3)}>
                        Sudah Bayar
                    </button>
                    </div>
                </div>
                </>
            )}

            {step === 3 && (
                <>
                <div className={styles['checkout-modal-header']}>
                    <h3 className={styles['checkout-modal-title']}>Upload Bukti Pembayaran QRIS</h3>
                    <button className={styles['checkout-modal-close']} onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    </button>
                </div>

                <div className={styles['checkout-modal-body']}>
                    <div className={styles['checkout-upload-section']}>
                    <p>Upload screenshot bukti pembayaran dari aplikasi e-wallet Anda</p>

                    <div className={styles['checkout-file-upload']}>
                        <input
                        type="file"
                        id="payment-proof"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                        />
                        <label htmlFor="payment-proof" className={styles['checkout-upload-area']}>
                        {paymentProof ? (
                            <div className={styles['file-preview']}>
                            <div className={styles['file-icon']}>📄</div>
                            <div className={styles['file-name']}>{paymentProof.name}</div>
                            <div className={styles['file-size']}>{(paymentProof.size / 1024 / 1024).toFixed(2)} MB</div>
                            </div>
                        ) : (
                            <div className={styles['checkout-upload-placeholder']}>
                            <div className={styles['checkout-upload-icon']}>📷</div>
                            <div>Klik untuk upload bukti pembayaran</div>
                            <div className={styles['checkout-upload-hint']}>Format: JPG, PNG (Max 5MB)</div>
                            </div>
                        )}
                        </label>
                    </div>

                    <div className={styles['checkout-customer-summary']}>
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

                    <div className={styles['checkout-modal-actions']}>                    
                        <button className={styles['checkout-btn-secondary']} onClick={() => {
                        setStep(2);
                        setError(''); // Clear any errors when going back
                    }}>
                        Kembali
                    </button>
                    <button className={styles['checkout-btn-primary']} onClick={handleFinalSubmit} disabled={!paymentProof || isSubmitting}>
                        {isSubmitting ? "Membuat Pesanan..." : "Buat & Kirim Pesanan"}
                    </button>
                    </div>
                </div>
                </>
            )}

            {step === 4 && (
                <>
                <div className={styles['checkout-modal-header']}>
                    <h3 className={styles['checkout-modal-title']}>Pesanan Berhasil Dibuat!</h3>
                    <button className={styles['checkout-modal-close']} onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    </button>
                </div>

                <div className={styles['checkout-modal-body']}>
                    <div className={styles['checkout-success-section']}>
                    <div className={styles['success-icon']}>✅</div>
                    <h4>Terima kasih!</h4>
                    <p>Pesanan Anda telah berhasil dibuat dengan ID: <strong>{orderId}</strong></p>

                    <div className={styles['success-info']}>
                        <h5>Apa selanjutnya?</h5>
                        <ul>
                        <li>Bukti pembayaran Anda sedang diverifikasi</li>
                        <li>Anda akan dihubungi melalui WhatsApp untuk konfirmasi</li>
                        <li>Proses verifikasi biasanya memakan waktu 5-15 menit</li>
                        <li>Pesanan akan diproses setelah pembayaran terverifikasi</li>
                        </ul>
                    </div>

                    <div className={styles['checkout-customer-summary']}>
                        <h5>Detail Pemesanan:</h5>
                        <p><strong>Nama:</strong> {formData.name}</p>
                        <p><strong>WhatsApp:</strong> {formData.phone}</p>
                        <p><strong>Total:</strong> Rp {total.toLocaleString("id-ID")}</p>
                    </div>
                    </div>

                    <div className={styles['checkout-modal-actions']}>
                    <button className={styles['checkout-btn-primary']} onClick={onClose}>
                        Tutup
                    </button>
                    </div>
                </div>
                </>
            )}

            {error && (
                <div className={styles['checkout-error']}>
                {error}
                </div>
            )}
        </div>
    </div>
    );
}

export default CheckoutModal;