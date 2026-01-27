'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Project } from '@/lib/types';
import { Mail, MapPin, Phone, Instagram, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const demoProjects: Project[] = [
  { id: '1', title: 'Landscapes', slug: 'landscapes', order_index: 1, is_visible: true, created_at: '', updated_at: '' },
  { id: '2', title: 'Urban', slug: 'urban', order_index: 2, is_visible: true, created_at: '', updated_at: '' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Message sent successfully!');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <main className="min-h-screen bg-primary">
      <Navigation projects={demoProjects} siteName="PORTFOLIO" />
      
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left Column - Info */}
            <div className="space-y-12">
              <div className="opacity-0 animate-fade-up">
                <p className="text-accent uppercase tracking-wider text-sm mb-4">Contact</p>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
                  Get in Touch
                </h1>
                <p className="text-neutral-400 text-lg leading-relaxed">
                  Have a project in mind? Want to acquire a print? Or simply want to say hello? 
                  I'd love to hear from you.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-6 opacity-0 animate-fade-up stagger-1">
                <div className="flex items-start space-x-4">
                  <Mail className="w-5 h-5 text-accent mt-1" />
                  <div>
                    <p className="text-neutral-500 text-sm uppercase tracking-wider mb-1">Email</p>
                    <a href="mailto:hello@example.com" className="text-white hover:text-accent transition-colors">
                      hello@example.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone className="w-5 h-5 text-accent mt-1" />
                  <div>
                    <p className="text-neutral-500 text-sm uppercase tracking-wider mb-1">Phone</p>
                    <a href="tel:+905551234567" className="text-white hover:text-accent transition-colors">
                      +90 555 123 4567
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <MapPin className="w-5 h-5 text-accent mt-1" />
                  <div>
                    <p className="text-neutral-500 text-sm uppercase tracking-wider mb-1">Location</p>
                    <p className="text-white">Istanbul, Turkey</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Instagram className="w-5 h-5 text-accent mt-1" />
                  <div>
                    <p className="text-neutral-500 text-sm uppercase tracking-wider mb-1">Instagram</p>
                    <a 
                      href="https://instagram.com" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-accent transition-colors"
                    >
                      @yourhandle
                    </a>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="p-6 border border-neutral-800 opacity-0 animate-fade-up stagger-2">
                <p className="text-neutral-500 text-sm">
                  I typically respond within 24-48 hours. For urgent inquiries, 
                  please mention "URGENT" in your subject line.
                </p>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="opacity-0 animate-fade-up stagger-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm text-neutral-400 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm text-neutral-400 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm text-neutral-400 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select a subject</option>
                    <option value="commission">Commission Work</option>
                    <option value="print">Print Inquiry</option>
                    <option value="collaboration">Collaboration</option>
                    <option value="press">Press / Media</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm text-neutral-400 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="input-field resize-none"
                    placeholder="Tell me about your project..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
