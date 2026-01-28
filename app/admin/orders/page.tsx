'use client';

import { useState, useEffect } from 'react';
import { Loader2, Eye, X, Package, CreditCard, Banknote, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: any;
  items: any[];
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  notes: string;
  created_at: string;
}

const statusOptions = [
  { value: 'pending', label: 'Beklemede', color: 'bg-yellow-500' },
  { value: 'confirmed', label: 'Onaylandı', color: 'bg-blue-500' },
  { value: 'shipped', label: 'Kargoda', color: 'bg-purple-500' },
  { value: 'delivered', label: 'Teslim Edildi', color: 'bg-green-500' },
  { value: 'cancelled', label: 'İptal', color: 'bg-red-500' },
];

const paymentStatusOptions = [
  { value: 'pending', label: 'Ödeme Bekleniyor', color: 'text-yellow-400' },
  { value: 'paid', label: 'Ödendi', color: 'text-green-400' },
  { value: 'failed', label: 'Başarısız', color: 'text-red-400' },
  { value: 'refunded', label: 'İade Edildi', color: 'text-orange-400' },
];

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const formatPrice = (price: number) => price.toLocaleString('tr-TR');

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Siparişler yüklenemedi:', err);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, field: string, value: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ [field]: value })
        .eq('id', orderId);
      
      if (error) throw error;
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, [field]: value } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, [field]: value });
      }
    } catch (err) {
      console.error('Güncelleme hatası:', err);
    }
    setUpdating(false);
  };

  const getStatusInfo = (status: string) => statusOptions.find(s => s.value === status) || statusOptions[0];
  const getPaymentStatusInfo = (status: string) => paymentStatusOptions.find(s => s.value === status) || paymentStatusOptions[0];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Siparişler</h1>
        <p className="text-neutral-400 mt-1">{orders.length} sipariş</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400">Henüz sipariş yok</p>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Sipariş No</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Tarih</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Tutar</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Ödeme</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const paymentInfo = getPaymentStatusInfo(order.payment_status);
                
                return (
                  <tr key={order.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                    <td className="p-4">
                      <span className="text-white font-mono text-sm">#{order.order_number?.slice(0, 8) || order.id.slice(0, 8)}</span>
                    </td>
                    <td className="p-4">
                      <p className="text-white">{order.customer_name}</p>
                      <p className="text-neutral-500 text-sm">{order.customer_email}</p>
                    </td>
                    <td className="p-4 text-neutral-400 text-sm">{formatDate(order.created_at)}</td>
                    <td className="p-4 text-white font-medium">₺{formatPrice(order.total_amount)}</td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <span className="text-xs text-neutral-500 block">
                          {order.payment_method === 'bank_transfer' ? 'Havale/EFT' : 'Kredi Kartı'}
                        </span>
                        <span className={`text-sm font-medium ${paymentInfo.color}`}>
                          {paymentInfo.label}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                        title="Detay"
                      >
                        <Eye className="w-5 h-5 text-neutral-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Sipariş Detay Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800 sticky top-0 bg-neutral-900">
              <h2 className="text-xl font-semibold text-white">
                Sipariş #{selectedOrder.order_number?.slice(0, 8) || selectedOrder.id.slice(0, 8)}
              </h2>
              <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Müşteri */}
              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-3">Müşteri Bilgileri</h3>
                <div className="bg-neutral-800 rounded-lg p-4">
                  <p className="text-white font-medium">{selectedOrder.customer_name}</p>
                  <p className="text-neutral-400 text-sm">{selectedOrder.customer_email}</p>
                  <p className="text-neutral-400 text-sm">{selectedOrder.customer_phone}</p>
                </div>
              </div>

              {/* Teslimat Adresi */}
              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-3">Teslimat Adresi</h3>
                <div className="bg-neutral-800 rounded-lg p-4">
                  <p className="text-white text-sm">
                    {typeof selectedOrder.shipping_address === 'string' 
                      ? selectedOrder.shipping_address 
                      : `${selectedOrder.shipping_address?.address || ''}, ${selectedOrder.shipping_address?.district || ''}, ${selectedOrder.shipping_address?.city || ''} ${selectedOrder.shipping_address?.postal_code || ''}`
                    }
                  </p>
                </div>
              </div>

              {/* ÖDEME BİLGİLERİ */}
              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-3">Ödeme Detayları</h3>
                <div className="bg-neutral-800 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedOrder.payment_method === 'bank_transfer' ? (
                        <Banknote className="w-5 h-5 text-blue-400" />
                      ) : (
                        <CreditCard className="w-5 h-5 text-purple-400" />
                      )}
                      <div>
                        <p className="text-white font-medium">
                          {selectedOrder.payment_method === 'bank_transfer' ? 'Havale / EFT' : 'Kredi Kartı'}
                        </p>
                        <p className="text-neutral-500 text-xs">Ödeme Yöntemi</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${getPaymentStatusInfo(selectedOrder.payment_status).color}`}>
                        {getPaymentStatusInfo(selectedOrder.payment_status).label}
                      </p>
                      <p className="text-neutral-500 text-xs">Ödeme Durumu</p>
                    </div>
                  </div>
                  
                  {selectedOrder.payment_method === 'bank_transfer' && selectedOrder.payment_status === 'pending' && (
                    <div className="pt-3 border-t border-neutral-700">
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                        <p className="text-yellow-400 text-sm font-medium">⚠️ Havale/EFT Kontrolü Gerekli</p>
                        <p className="text-yellow-400/70 text-xs mt-1">
                          Banka hesabınızı kontrol edin. Ödeme alındıysa durumu "Ödendi" olarak güncelleyin.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedOrder.payment_status === 'paid' && (
                    <div className="pt-3 border-t border-neutral-700">
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <p className="text-green-400 text-sm">Ödeme başarıyla alındı</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ürünler */}
              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-3">Ürünler</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div key={index} className="bg-neutral-800 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{item.productTitle || item.title}</p>
                        <p className="text-neutral-500 text-sm">
                          {item.size?.name || item.size} • {item.frame?.name || item.frame} • {item.style === 'mat' ? 'Mat' : 'Full Bleed'}
                        </p>
                        <p className="text-neutral-500 text-sm">Adet: {item.quantity || 1}</p>
                      </div>
                      <p className="text-white font-medium">₺{formatPrice(item.price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toplam */}
              <div className="bg-neutral-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Kargo</span>
                  <span className="text-green-400">Ücretsiz</span>
                </div>
                <div className="flex justify-between items-center text-lg mt-2 pt-2 border-t border-neutral-700">
                  <span className="text-white font-medium">Toplam</span>
                  <span className="text-white font-semibold">₺{formatPrice(selectedOrder.total_amount)}</span>
                </div>
              </div>

              {/* Durum Güncelleme */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Sipariş Durumu</label>
                  <select
                    value={selectedOrder.status || 'pending'}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, 'status', e.target.value)}
                    disabled={updating}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white appearance-none cursor-pointer"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Ödeme Durumu</label>
                  <select
                    value={selectedOrder.payment_status || 'pending'}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, 'payment_status', e.target.value)}
                    disabled={updating}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white appearance-none cursor-pointer"
                  >
                    {paymentStatusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
