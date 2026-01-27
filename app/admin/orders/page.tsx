'use client';

import { useState, useEffect } from 'react';
import { Loader2, Package, ChevronDown, Eye } from 'lucide-react';
import { getOrders, updateOrderStatus, getOrderItems } from '@/lib/supabase';
import { Order, OrderItem } from '@/lib/types';

const statusOptions = [
  { value: 'pending', label: 'Beklemede', color: 'bg-yellow-500' },
  { value: 'confirmed', label: 'Onaylandı', color: 'bg-blue-500' },
  { value: 'shipped', label: 'Kargoda', color: 'bg-purple-500' },
  { value: 'delivered', label: 'Teslim Edildi', color: 'bg-green-500' },
  { value: 'cancelled', label: 'İptal', color: 'bg-red-500' },
];

// Fiyat formatlama
const formatPrice = (price: number) => {
  return price.toLocaleString('tr-TR');
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const data = await getOrders();
    setOrders(data);
    setLoading(false);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus);
    await loadOrders();
    setOpenDropdown(null);
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    const items = await getOrderItems(order.id);
    setOrderItems(items);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Siparişler</h1>
          <p className="text-neutral-400 mt-1">{orders.length} sipariş</p>
        </div>
      </div>

      {/* Sipariş Listesi */}
      {orders.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
          <Package className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400">Henüz sipariş yok</p>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Sipariş No</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Tarih</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Tutar</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <tr key={order.id} className="border-b border-neutral-800 last:border-0">
                    <td className="p-4">
                      <span className="text-white font-mono text-sm">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white">{order.customer_name}</p>
                        <p className="text-sm text-neutral-500">{order.customer_email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-neutral-400">
                        {formatDate(order.created_at)}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-medium">
                        ₺{formatPrice(order.total_amount)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-white bg-neutral-800 hover:bg-neutral-700 transition-colors"
                        >
                          <span className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
                          {statusInfo.label}
                          <ChevronDown className="w-4 h-4" />
                        </button>

                        {openDropdown === order.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setOpenDropdown(null)} 
                            />
                            <div className="absolute right-0 top-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-50 min-w-[150px]">
                              {statusOptions.map((status) => (
                                <button
                                  key={status.value}
                                  onClick={() => handleStatusChange(order.id, status.value)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white hover:bg-neutral-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                                >
                                  <span className={`w-2 h-2 rounded-full ${status.color}`} />
                                  {status.label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
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
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-xl font-semibold text-white">
                Sipariş #{selectedOrder.id.slice(0, 8).toUpperCase()}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Müşteri Bilgileri */}
              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-2">Müşteri</h3>
                <p className="text-white">{selectedOrder.customer_name}</p>
                <p className="text-neutral-400">{selectedOrder.customer_email}</p>
                <p className="text-neutral-400">{selectedOrder.customer_phone}</p>
              </div>

              {/* Teslimat Adresi */}
              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-2">Teslimat Adresi</h3>
                <p className="text-white">{selectedOrder.shipping_address || '-'}</p>
              </div>

              {/* Sipariş Kalemleri */}
              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-2">Ürünler</h3>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between p-3 bg-neutral-800 rounded-lg">
                      <div>
                        <p className="text-white">{item.size_name} - {item.frame_name}</p>
                        <p className="text-sm text-neutral-500">
                          Stil: {item.style === 'mat' ? 'Mat' : 'Full Bleed'} • Adet: {item.quantity}
                        </p>
                      </div>
                      <p className="text-white font-medium">₺{formatPrice(item.unit_price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toplam */}
              <div className="flex justify-between pt-4 border-t border-neutral-800">
                <span className="text-neutral-400">Toplam</span>
                <span className="text-xl font-medium text-white">₺{formatPrice(selectedOrder.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
