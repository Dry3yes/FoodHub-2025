import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { submitSupportTicket } from '../services/Api';
import '../styles/SupportPage.css';

const SupportPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: JSON.parse(localStorage.getItem('user'))?.name || '',
    email: JSON.parse(localStorage.getItem('user'))?.email || '',
    userType: JSON.parse(localStorage.getItem('user'))?.role === 'Seller' ? 'seller' : 'customer',
    category: 'bug',
    subject: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('');
    
    try {
      await submitSupportTicket(formData);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        userType: 'customer',
        category: 'bug',
        subject: '',
        description: '',
      });
    } catch (error) {
      console.error('Support ticket submission failed:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="support-page">
      <Header />
      <div className="support-container">
        <div className="support-header">
          <h1>Pusat Bantuan</h1>
          <p>Jika Anda mengalami masalah, kami siap membantu! Kirim tiket dukungan dan tim kami akan menghubungi Anda secepatnya.</p>
        </div>

        {submitStatus === 'success' && (
          <div className="alert alert-success">
            <strong>Berhasil!</strong> Tiket dukungan Anda telah berhasil dikirim.
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="alert alert-error">
            <strong>Error!</strong> Terjadi masalah saat mengirim tiket Anda. Silakan coba lagi atau hubungi kami langsung.
          </div>
        )}

        <form className="support-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nama Lengkap *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="Masukkan nama lengkap Anda"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Alamat Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="Masukkan alamat email Anda"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="userType">Saya adalah *</label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleInputChange}
              >
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Issue Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="bug">Laporan Bug</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Topik *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className={errors.subject ? 'error' : ''}
              placeholder={formData.category === 'bug' 
                ? "Laporkan masalah teknis seperti kesalahan, crash, atau perilaku tidak terduga dalam sistem"
                : "Kekhawatiran atau umpan balik lain yang tidak tercakup di atas. Harap jelaskan secara rinci"
              }
            />
            {errors.subject && <span className="error-message">{errors.subject}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Deskripsi Detail *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={errors.description ? 'error' : ''}
              placeholder="Harap berikan detail sebanyak mungkin tentang masalah Anda. Sertakan pesan kesalahan, langkah-langkah yang Anda ambil, dan apa yang Anda harapkan terjadi."
              rows="6"
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
            <small className="form-help">Minimal 10 karakter diperlukan</small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim'}
            </button>

          </div>
        </form>
      </div>
       
    </div>
  );
};

export default SupportPage;
