'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Lütfen tüm alanları doldurun.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu.')
      }

      toast.success('Mesajınız başarıyla gönderildi!')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm text-neutral-600 mb-2">Adınız</label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors disabled:bg-neutral-50 disabled:cursor-not-allowed"
          placeholder="Adınız Soyadınız"
        />
      </div>

      <div>
        <label className="block text-sm text-neutral-600 mb-2">E-posta</label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors disabled:bg-neutral-50 disabled:cursor-not-allowed"
          placeholder="ornek@email.com"
        />
      </div>

      <div>
        <label className="block text-sm text-neutral-600 mb-2">Konu</label>
        <select
          name="subject"
          required
          value={formData.subject}
          onChange={handleChange}
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors bg-white disabled:bg-neutral-50 disabled:cursor-not-allowed"
        >
          <option value="">Konu Seçin</option>
          <option value="order">Sipariş Hakkında</option>
          <option value="custom">Özel Talep</option>
          <option value="collaboration">İşbirliği</option>
          <option value="other">Diğer</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-neutral-600 mb-2">Mesajınız</label>
        <textarea
          name="message"
          required
          rows={5}
          value={formData.message}
          onChange={handleChange}
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-neutral-200 focus:border-black outline-none transition-colors resize-none disabled:bg-neutral-50 disabled:cursor-not-allowed"
          placeholder="Mesajınızı buraya yazın..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-black text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
      </button>
    </form>
  )
}
