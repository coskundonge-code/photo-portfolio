'use client';

import { useState, useEffect } from 'react';
import { Loader2, Package, ChevronDown } from 'lucide-react';
import { getOrders, updateOrderStatus } from '@/lib/supabase';
import { Order } from '@/lib/types';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const data = await getOrders();
    setOrders(data);
    setLoading(false);
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    const result = await updateOrderStatus(orderId, status);
    if (result) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as Order['status'] } : o));
      toast.success('Sipariş durumu güncellendi!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400';
      case 'shipped': return 'bg-purple-500/20 text-purple-400';
      case 'delivered': return 'bg-green-500/20 text-green-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-neutral-500/20 text-neutral-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'confirmed': return 'Onaylandı';
      case 'shipped': return 'Kargoda';
      case 'delivered': return 'Teslim Edildi';
      case 'cancelled': return 'İptal';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display text-white mb-2">Siparişler</h1>
        <p className="text-neutral-400">Müşteri siparişlerini takip edin</p>
      </div>

      {orders.length === 0 ? (
        <div className="admin-card text-center py-12">
          <Package className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400">Henüz sipariş yok.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="admin-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-medium">{order.customer_name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-400">{order.customer_email}</p>
                  {order.customer_phone && (
                    <p className="text-sm text-neutral-500">{order.customer_phone}</p>
                  )}
                  <p className="text-sm text-neutral-500 mt-2">
                    {new Date(order.created_at).toLocaleDateString('tr-TR', { 
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-display text-white mb-2">₺{order.total_amount}</p>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="px-3 py-2 bg-neutral-800 border border-neutral-700 text-white text-sm rounded-lg focus:outline-none"
                  >
                    <option value="pending">Beklemede</option>
                    <option value="confirmed">Onaylandı</option>
                    <option value="shipped">Kargoda</option>
                    <option value="delivered">Teslim Edildi</option>
                    <option value="cancelled">İptal</option>
                  </select>
                </div>
              </div>

              {order.shipping_address && (
                <div className="mt-4 pt-4 border-t border-neutral-800">
                  <p className="text-sm text-neutral-400">
                    <span className="text-neutral-500">Adres:</span> {order.shipping_address}
                  </p>
                </div>
              )}

              {order.notes && (
                <div className="mt-2">
                  <p className="text-sm text-neutral-400">
                    <span className="text-neutral-500">Not:</span> {order.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
