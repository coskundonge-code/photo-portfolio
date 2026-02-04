'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Search,
  Users,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Clock,
  MoreVertical,
  Shield,
  Ban,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { getMembers, updateMember, toggleMemberStatus, deleteMember } from '@/lib/supabase';
import { useAdminStore } from '@/lib/store';
import { Member } from '@/lib/types';
import toast from 'react-hot-toast';

export default function AdminMembersPage() {
  const router = useRouter();
  const { checkAuth } = useAdminStore();
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const verifyAuth = () => {
      const zustandAuth = checkAuth();
      const legacyAuth = localStorage.getItem('adminAuth') === 'true';

      if (zustandAuth || legacyAuth) {
        setAuthChecked(true);
        loadMembers();
      } else {
        router.replace('/admin/login');
      }
    };

    const timer = setTimeout(verifyAuth, 100);
    return () => clearTimeout(timer);
  }, [checkAuth, router]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await getMembers();
      setMembers(data);
    } catch (err) {
      console.error('Üyeler yüklenemedi:', err);
      toast.error('Üyeler yüklenirken hata oluştu');
    }
    setLoading(false);
  };

  const handleToggleStatus = async (member: Member) => {
    setActionLoading(member.id);
    try {
      const success = await toggleMemberStatus(member.id, !member.is_active);
      if (success) {
        setMembers(members.map(m =>
          m.id === member.id ? { ...m, is_active: !m.is_active } : m
        ));
        toast.success(member.is_active ? 'Üye devre dışı bırakıldı' : 'Üye aktif edildi');
      } else {
        toast.error('İşlem başarısız');
      }
    } catch (err) {
      toast.error('Bir hata oluştu');
    }
    setActionLoading(null);
  };

  const handleDeleteMember = async (member: Member) => {
    if (!confirm(`${member.email} adlı üyeyi silmek istediğinize emin misiniz?`)) return;

    setActionLoading(member.id);
    try {
      const success = await deleteMember(member.id);
      if (success) {
        setMembers(members.filter(m => m.id !== member.id));
        toast.success('Üye silindi');
        setShowDetailModal(false);
      } else {
        toast.error('Silme işlemi başarısız');
      }
    } catch (err) {
      toast.error('Bir hata oluştu');
    }
    setActionLoading(null);
  };

  const handleUpdateRole = async (member: Member, role: 'member' | 'admin') => {
    setActionLoading(member.id);
    try {
      const updated = await updateMember(member.id, { role });
      if (updated) {
        setMembers(members.map(m =>
          m.id === member.id ? { ...m, role } : m
        ));
        setSelectedMember({ ...member, role });
        toast.success(`Rol güncellendi: ${role === 'admin' ? 'Yönetici' : 'Üye'}`);
      } else {
        toast.error('Rol güncellenemedi');
      }
    } catch (err) {
      toast.error('Bir hata oluştu');
    }
    setActionLoading(null);
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch =
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.name && member.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && member.is_active) ||
      (filterStatus === 'inactive' && !member.is_active);
    return matchesSearch && matchesFilter;
  });

  const activeCount = members.filter(m => m.is_active).length;
  const inactiveCount = members.filter(m => !m.is_active).length;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-neutral-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold text-white">Üye Yönetimi</h1>
          </div>
          <button
            onClick={loadMembers}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">{members.length}</p>
                <p className="text-sm text-neutral-400">Toplam Üye</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">{activeCount}</p>
                <p className="text-sm text-neutral-400">Aktif Üye</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <UserX className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">{inactiveCount}</p>
                <p className="text-sm text-neutral-400">Pasif Üye</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              type="text"
              placeholder="İsim veya e-posta ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:border-neutral-600 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filterStatus === 'all'
                  ? 'bg-white text-black'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filterStatus === 'active'
                  ? 'bg-green-500 text-white'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filterStatus === 'inactive'
                  ? 'bg-red-500 text-white'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Pasif
            </button>
          </div>
        </div>

        {/* Members Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400">
              {searchQuery || filterStatus !== 'all'
                ? 'Filtrelere uygun üye bulunamadı'
                : 'Henüz kayıtlı üye yok'}
            </p>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left px-6 py-4 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Üye
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Son Giriş
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{member.name || 'İsimsiz'}</p>
                          <p className="text-sm text-neutral-400">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        member.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-neutral-700 text-neutral-300'
                      }`}>
                        {member.role === 'admin' && <Shield className="w-3 h-3" />}
                        {member.role === 'admin' ? 'Yönetici' : 'Üye'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-400">
                      {formatDate(member.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-400">
                      {formatDate(member.last_login)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        member.is_active
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {member.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Aktif
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            Pasif
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(member)}
                          disabled={actionLoading === member.id}
                          className={`p-2 rounded-lg transition-colors ${
                            member.is_active
                              ? 'hover:bg-red-500/20 text-neutral-400 hover:text-red-400'
                              : 'hover:bg-green-500/20 text-neutral-400 hover:text-green-400'
                          }`}
                          title={member.is_active ? 'Devre Dışı Bırak' : 'Aktif Et'}
                        >
                          {actionLoading === member.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : member.is_active ? (
                            <Ban className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowDetailModal(true);
                          }}
                          className="p-2 rounded-lg hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                          title="Detaylar"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Member Detail Modal */}
      {showDetailModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowDetailModal(false)} />
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-neutral-800">
              <h3 className="text-lg font-semibold text-white">Üye Detayları</h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Avatar & Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-white font-medium">
                    {selectedMember.name
                      ? selectedMember.name.charAt(0).toUpperCase()
                      : selectedMember.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white">
                    {selectedMember.name || 'İsimsiz Üye'}
                  </h4>
                  <p className="text-neutral-400">{selectedMember.email}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-neutral-400 mb-1">
                    <Mail className="w-4 h-4" />
                    <span className="text-xs">E-posta</span>
                  </div>
                  <p className="text-white text-sm truncate">{selectedMember.email}</p>
                </div>
                <div className="bg-neutral-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-neutral-400 mb-1">
                    <Phone className="w-4 h-4" />
                    <span className="text-xs">Telefon</span>
                  </div>
                  <p className="text-white text-sm">{selectedMember.phone || '-'}</p>
                </div>
                <div className="bg-neutral-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-neutral-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Kayıt Tarihi</span>
                  </div>
                  <p className="text-white text-sm">{formatDate(selectedMember.created_at)}</p>
                </div>
                <div className="bg-neutral-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-neutral-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Son Giriş</span>
                  </div>
                  <p className="text-white text-sm">{formatDate(selectedMember.last_login)}</p>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2">ROL</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateRole(selectedMember, 'member')}
                    disabled={actionLoading === selectedMember.id}
                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedMember.role === 'member'
                        ? 'bg-white text-black'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    Üye
                  </button>
                  <button
                    onClick={() => handleUpdateRole(selectedMember, 'admin')}
                    disabled={actionLoading === selectedMember.id}
                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      selectedMember.role === 'admin'
                        ? 'bg-purple-500 text-white'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Yönetici
                  </button>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">Hesap Durumu</p>
                  <p className="text-sm text-neutral-400">
                    {selectedMember.is_active ? 'Hesap aktif ve giriş yapabilir' : 'Hesap devre dışı'}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleStatus(selectedMember)}
                  disabled={actionLoading === selectedMember.id}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedMember.is_active
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
                >
                  {actionLoading === selectedMember.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : selectedMember.is_active ? (
                    'Devre Dışı Bırak'
                  ) : (
                    'Aktif Et'
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-neutral-800 flex justify-between">
              <button
                onClick={() => handleDeleteMember(selectedMember)}
                disabled={actionLoading === selectedMember.id}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
              >
                Üyeyi Sil
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors text-sm font-medium"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
