'use client';

import { useState, FormEvent } from 'react';
import toast from 'react-hot-toast';

interface ContactFormProps {
  className?: string;
}

export default function ContactForm({ className = '' }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Client-side validasyon
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    if (formData.message.length < 10) {
      toast.error('Mesajınız en az 10 karakter olmalıdır.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu.');
      }

      toast.success(data.message || 'Mesajınız başarıyla gönderildi!');

      // Formu temizle
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bir hata oluştu. Lütfen tekrar deneyin.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-5 ${className}`}>
      <div>
        <label className="block text-sm text-neutral-600 mb-2">
          Adınız <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          disabled={isSubmitting}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors disabled:bg-neutral-100 disabled:cursor-not-allowed"
          placeholder="Adınız Soyadınız"
        />
      </div>

      <div>
        <label className="block text-sm text-neutral-600 mb-2">
          E-posta <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          required
          disabled={isSubmitting}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors disabled:bg-neutral-100 disabled:cursor-not-allowed"
          placeholder="ornek@email.com"
        />
      </div>

      <div>
        <label className="block text-sm text-neutral-600 mb-2">
          Konu
        </label>
        <select
          disabled={isSubmitting}
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors bg-white disabled:bg-neutral-100 disabled:cursor-not-allowed"
        >
          <option value="">Konu Seçin</option>
          <option value="order">Sipariş Hakkında</option>
          <option value="custom">Özel Talep</option>
          <option value="collab">İşbirliği</option>
          <option value="other">Diğer</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-neutral-600 mb-2">
          Mesajınız <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          disabled={isSubmitting}
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors resize-none disabled:bg-neutral-100 disabled:cursor-not-allowed"
          placeholder="Mesajınızı buraya yazın..."
        />
        <p className="text-xs text-neutral-400 mt-1">
          {formData.message.length}/5000 karakter
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Gönderiliyor...
          </>
        ) : (
          'Gönder'
        )}
      </button>
    </form>
  );
}
