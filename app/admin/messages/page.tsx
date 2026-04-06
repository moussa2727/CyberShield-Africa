'use client';

import { useState, useEffect, useCallback } from 'react';

// Force cette page à être dynamique
export const dynamic = 'force-dynamic';

import {
  MessageSquare,
  Search,
  Filter,
  Download,
  Trash2,
  Reply,
  CheckCircle,
  MailOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  RefreshCw,
  CheckSquare,
  Mail,
  Clock,
  AlertCircle,
} from 'lucide-react';
import AdminLayout from '@/src/components/admin/AdminLayout';
import { toast } from 'sonner';

// Types basés sur les validateurs
interface Message {
  id: string;
  fullName: string;
  email: string;
  message: string;
  company?: string;
  service?: string;
  isRead: boolean;
  isReplied: boolean;
  adminResponse?: string;
  respondedAt?: string;
  respondedBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

interface Statistics {
  total: number;
  unread: number;
  replied: number;
  today: number;
}

// Composant principal
export default function MessagesAdmin() {
  // États pour les messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // États pour les filtres et pagination
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    isRead: false as boolean | undefined,
    isReplied: undefined as boolean | undefined,
    search: '',
    email: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt' as 'createdAt' | 'updatedAt' | 'email' | 'isRead',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  // États pour les modales
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePermanent, setDeletePermanent] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  const [exporting, setExporting] = useState(false);

  // Charger les messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      queryParams.append('page', filters.page.toString());
      queryParams.append('limit', filters.limit.toString());
      if (filters.isRead !== undefined) queryParams.append('isRead', filters.isRead.toString());
      if (filters.isReplied !== undefined)
        queryParams.append('isReplied', filters.isReplied.toString());
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.email) queryParams.append('email', filters.email);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      queryParams.append('sortBy', filters.sortBy);
      queryParams.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/messages?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setMessages(result.data);
        setTotalPages(result.meta.totalPages);
        setUnreadCount(result.meta.unreadCount);
      } else {
        setError(result.error || 'Erreur lors du chargement des messages');
        toast.error('Erreur chargement messages', {
          description: result.error || 'Erreur lors du chargement des messages',
        });
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      toast.error('Erreur de connexion', {
        description: 'Impossible de joindre le serveur.',
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Charger les statistiques
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/statistics');
      const result = await response.json();

      if (result.success) {
        setStatistics(result.data);
      } else if (result?.error) {
        toast.error('Erreur statistiques', { description: result.error });
      }
    } catch (err) {
      console.error('Erreur chargement statistiques:', err);
      toast.error('Erreur statistiques', {
        description: 'Erreur lors du chargement des statistiques',
      });
    }
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([fetchMessages(), fetchStatistics()]);
      toast.success('Données actualisées');
    } catch {
      toast.error('Actualisation impossible', {
        description: 'Veuillez réessayer.',
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Charger le message sélectionné
  const fetchMessage = async (id: string) => {
    try {
      const response = await fetch(`/api/messages/${id}`);
      const result = await response.json();

      if (result.success) {
        setSelectedMessage(result.data);
      }
    } catch (err) {
      console.error('Erreur chargement message:', err);
    }
  };

  // Marquer comme lu
  const markAsRead = async (id: string, isRead: boolean) => {
    try {
      const response = await fetch(`/api/messages/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchMessages();
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, isRead });
        }
      }
    } catch (err) {
      console.error('Erreur mise à jour:', err);
    }
  };

  // Marquer tous comme lus
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/messages/mark-all-read', {
        method: 'PUT',
      });

      const result = await response.json();

      if (result.success) {
        await fetchMessages();
        await fetchStatistics();
        toast.success('Mise à jour effectuée', {
          description: 'Tous les messages ont été marqués comme lus.',
        });
      } else {
        toast.error('Erreur', {
          description: result.error || 'Erreur lors de la mise à jour.',
        });
      }
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Erreur de connexion');
    }
  };

  // Répondre à un message
  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    try {
      setReplying(true);
      const response = await fetch(`/api/messages/${selectedMessage.id}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: replyText, markAsRead: true }),
      });

      const result = await response.json();

      if (result.success) {
        setShowReplyModal(false);
        setReplyText('');
        await fetchMessages();
        if (selectedMessage) {
          await fetchMessage(selectedMessage.id);
        }
        toast.success('Réponse envoyée');
      } else {
        setError(result.error || "Erreur lors de l'envoi de la réponse");
        toast.error('Erreur', {
          description: result.error || "Erreur lors de l'envoi de la réponse",
        });
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error(err);
      toast.error('Erreur de connexion');
    } finally {
      setReplying(false);
    }
  };

  // Supprimer un message
  const deleteMessage = async () => {
    if (!selectedMessage) return;

    try {
      setDeleting(true);
      const response = await fetch(
        `/api/messages/${selectedMessage.id}/delete?permanent=${deletePermanent}`,
        {
          method: 'DELETE',
        },
      );

      if (response.ok || response.status === 204) {
        setShowDeleteModal(false);
        setSelectedMessage(null);
        await fetchMessages();
        await fetchStatistics();
        toast.success(deletePermanent ? 'Supprimé définitivement' : 'Message supprimé');
      } else {
        const result = await response.json();
        setError(result.error || 'Erreur lors de la suppression');
        toast.error('Erreur suppression', {
          description: result.error || 'Erreur lors de la suppression',
        });
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error(err);
      toast.error('Erreur de connexion');
    } finally {
      setDeleting(false);
    }
  };

  // Exporter les messages
  const exportMessages = async () => {
    try {
      setExporting(true);

      const queryParams = new URLSearchParams();
      queryParams.append('format', exportFormat);
      if (filters.isRead !== undefined) queryParams.append('isRead', filters.isRead.toString());
      if (filters.isReplied !== undefined)
        queryParams.append('isReplied', filters.isReplied.toString());
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const response = await fetch(`/api/messages/export?${queryParams}`, {
        method: 'PUT',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `messages_export_${new Date().toISOString()}.${exportFormat === 'csv' ? 'csv' : 'xlsx'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setShowExportModal(false);
        toast.success('Export téléchargé');
      } else {
        const result = await response.json();
        setError(result.error || "Erreur lors de l'export");
        toast.error('Erreur export', {
          description: result.error || "Erreur lors de l'export",
        });
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error(err);
      toast.error('Erreur de connexion');
    } finally {
      setExporting(false);
    }
  };

  // Formatage de la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Effet initial
  useEffect(() => {
    fetchMessages();
    fetchStatistics();
  }, [fetchMessages, fetchStatistics]);

  return (
    <AdminLayout title="Gestion des messages">
      <div className="min-h-screen bg-gray-50">
        {/* Header - Version épurée sans dégradé agressif */}
        <div className="bg-orange-600 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Gestion des Messages</h1>
                <p className="text-orange-100 text-sm sm:text-base mt-0.5 sm:mt-1">
                  Consultez et gérez les messages de contact
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing || loading}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm w-full sm:w-auto"
                >
                  <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                  <span>{refreshing ? 'Actualisation...' : 'Actualiser'}</span>
                </button>
                <button
                  onClick={markAllAsRead}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm w-full sm:w-auto"
                >
                  <CheckSquare size={16} />
                  <span>Tout marquer comme lu</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          {/* Statistiques - Version responsive */}
          {statistics && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-lg shadow p-4 sm:p-5 lg:p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-500 text-xs sm:text-sm">Total messages</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                      {statistics.total}
                    </p>
                  </div>
                  <MessageSquare className="text-orange-500 flex-shrink-0" size={24} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 sm:p-5 lg:p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-500 text-xs sm:text-sm">Non lus</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600 truncate">
                      {statistics.unread}
                    </p>
                  </div>
                  <Mail className="text-green-500 flex-shrink-0" size={24} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 sm:p-5 lg:p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-500 text-xs sm:text-sm">Répondus</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600 truncate">
                      {statistics.replied}
                    </p>
                  </div>
                  <Reply className="text-blue-500 flex-shrink-0" size={24} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 sm:p-5 lg:p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-500 text-xs sm:text-sm">Aujourd'hui</p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-600 truncate">
                      {statistics.today}
                    </p>
                  </div>
                  <Clock className="text-purple-500 flex-shrink-0" size={24} />
                </div>
              </div>
            </div>
          )}

          {/* Filtres - Version responsive */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Filter size={18} className="text-orange-500" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Filtres</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>

              <select
                value={filters.isRead === undefined ? '' : filters.isRead.toString()}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilters({
                    ...filters,
                    isRead: val === '' ? undefined : val === 'true',
                    page: 1,
                  });
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              >
                <option value="">Tous les statuts</option>
                <option value="false">Non lus</option>
                <option value="true">Lus</option>
              </select>

              <select
                value={filters.isReplied === undefined ? '' : filters.isReplied.toString()}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilters({
                    ...filters,
                    isReplied: val === '' ? undefined : val === 'true',
                    page: 1,
                  });
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              >
                <option value="">Tous les réponses</option>
                <option value="false">Non répondus</option>
                <option value="true">Répondus</option>
              </select>

              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                <Download size={16} />
                <span>Exporter</span>
              </button>
            </div>

            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                  className="px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                >
                  <option value="createdAt">Date de création</option>
                  <option value="updatedAt">Date de mise à jour</option>
                  <option value="email">Email</option>
                  <option value="isRead">Statut de lecture</option>
                </select>

                <select
                  value={filters.sortOrder}
                  onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as any })}
                  className="px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                >
                  <option value="desc">Décroissant</option>
                  <option value="asc">Croissant</option>
                </select>
              </div>

              <div className="text-xs sm:text-sm text-gray-500">
                {unreadCount} message{unreadCount > 1 ? 's' : ''} non lu{unreadCount > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Liste des messages - Version responsive avec vue mobile adaptée */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 text-red-700 flex items-center gap-2 text-sm">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              {/* Version mobile: vue carte, version desktop: tableau */}
              <div className="flex-1 min-w-0">
                {messages.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    <Mail className="mx-auto mb-2" size={40} />
                    <p>Aucun message trouvé</p>
                  </div>
                ) : (
                  <>
                    {/* Version mobile - Vue carte */}
                    <div className="block lg:hidden space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-colors ${
                            selectedMessage?.id === message.id
                              ? 'bg-orange-50 border-orange-200 border'
                              : ''
                          }`}
                          onClick={() => fetchMessage(message.id)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center flex-1 min-w-0">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-orange-600">
                                    {message.fullName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {message.fullName}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{message.email}</p>
                              </div>
                            </div>
                            <div className="flex gap-1 ml-2">
                              {!message.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(message.id, true);
                                  }}
                                  className="p-1 text-green-600 hover:text-green-900"
                                  title="Marquer comme lu"
                                >
                                  <MailOpen size={14} />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMessage(message);
                                  setShowReplyModal(true);
                                }}
                                className="p-1 text-orange-600 hover:text-orange-900"
                                title="Répondre"
                              >
                                <Reply size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMessage(message);
                                  setShowDeleteModal(true);
                                }}
                                className="p-1 text-red-600 hover:text-red-900"
                                title="Supprimer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {message.message}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">{formatDate(message.createdAt)}</span>
                            <div className="flex gap-1">
                              {!message.isRead && (
                                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs">
                                  Non lu
                                </span>
                              )}
                              {message.isReplied && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs">
                                  Répondu
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Version desktop - Tableau */}
                    <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Contact
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Message
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Statut
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {messages.map((message) => (
                              <tr
                                key={message.id}
                                className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                                  selectedMessage?.id === message.id ? 'bg-orange-50' : ''
                                }`}
                                onClick={() => fetchMessage(message.id)}
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                        <span className="text-sm font-medium text-orange-600">
                                          {message.fullName.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {message.fullName}
                                      </div>
                                      <div className="text-sm text-gray-500">{message.email}</div>
                                      {message.company && (
                                        <div className="text-xs text-gray-400">
                                          {message.company}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900">
                                    <p className="line-clamp-2 max-w-xs">{message.message}</p>
                                  </div>
                                  {message.service && (
                                    <div className="mt-1">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {message.service}
                                      </span>
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(message.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    {!message.isRead && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Non lu
                                      </span>
                                    )}
                                    {message.isRead && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        Lu
                                      </span>
                                    )}
                                    {message.isReplied && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Répondu
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex justify-end space-x-2">
                                    {!message.isRead && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markAsRead(message.id, true);
                                        }}
                                        className="text-green-600 hover:text-green-900"
                                        title="Marquer comme lu"
                                      >
                                        <MailOpen size={16} />
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedMessage(message);
                                        setShowReplyModal(true);
                                      }}
                                      className="text-orange-600 hover:text-orange-900"
                                      title="Répondre"
                                    >
                                      <Reply size={16} />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedMessage(message);
                                        setShowDeleteModal(true);
                                      }}
                                      className="text-red-600 hover:text-red-900"
                                      title="Supprimer"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                          <div className="flex-1 flex justify-between sm:hidden">
                            <button
                              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                              disabled={filters.page === 1}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Précédent
                            </button>
                            <button
                              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                              disabled={filters.page === totalPages}
                              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Suivant
                            </button>
                          </div>
                          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm text-gray-700">
                                Affichage de{' '}
                                <span className="font-medium">
                                  {(filters.page - 1) * filters.limit + 1}
                                </span>{' '}
                                à{' '}
                                <span className="font-medium">
                                  {Math.min(
                                    filters.page * filters.limit,
                                    messages.length + (filters.page - 1) * filters.limit,
                                  )}
                                </span>{' '}
                                sur{' '}
                                <span className="font-medium">
                                  {messages.length + (totalPages - filters.page) * filters.limit}
                                </span>{' '}
                                résultats
                              </p>
                            </div>
                            <div>
                              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                  disabled={filters.page === 1}
                                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ChevronLeft size={16} />
                                </button>
                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                  Page {filters.page} sur {totalPages}
                                </span>
                                <button
                                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                  disabled={filters.page === totalPages}
                                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ChevronRight size={16} />
                                </button>
                              </nav>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pagination mobile */}
                    {totalPages > 1 && (
                      <div className="mt-4 flex justify-center lg:hidden">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                            disabled={filters.page === 1}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                          >
                            Précédent
                          </button>
                          <span className="px-3 py-1 text-sm">
                            Page {filters.page} / {totalPages}
                          </span>
                          <button
                            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                            disabled={filters.page === totalPages}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                          >
                            Suivant
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Détails du message sélectionné - Version responsive */}
              <div className="lg:w-96 xl:w-[480px] flex-shrink-0">
                {selectedMessage ? (
                  <div className="bg-white rounded-lg shadow p-4 sm:p-6 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 break-words">
                          {selectedMessage.fullName}
                        </h2>
                        <p className="text-sm text-gray-500 break-words">{selectedMessage.email}</p>
                        {selectedMessage.company && (
                          <p className="text-xs text-gray-500 break-words mt-1">
                            Entreprise: {selectedMessage.company}
                          </p>
                        )}
                        {selectedMessage.service && (
                          <p className="text-xs text-gray-500 break-words">
                            Service: {selectedMessage.service}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!selectedMessage.isRead && (
                          <button
                            onClick={() => markAsRead(selectedMessage.id, true)}
                            className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs whitespace-nowrap"
                          >
                            <CheckCircle size={12} />
                            <span className="hidden xs:inline">Marquer lu</span>
                          </button>
                        )}
                        <button
                          onClick={() => setShowReplyModal(true)}
                          className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-xs whitespace-nowrap"
                        >
                          <Reply size={12} />
                          <span>Répondre</span>
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs whitespace-nowrap"
                        >
                          <Trash2 size={12} />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Message</h3>
                      <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                          {selectedMessage.message}
                        </p>
                      </div>
                    </div>

                    {selectedMessage.adminResponse && (
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Votre réponse</h3>
                        <div className="bg-orange-50 rounded-lg p-3 border-l-4 border-orange-500">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                            {selectedMessage.adminResponse}
                          </p>
                          {selectedMessage.respondedAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              Répondu le {formatDate(selectedMessage.respondedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-400 pt-3 border-t">
                      <p>Reçu le {formatDate(selectedMessage.createdAt)}</p>
                      <p className="mt-1">
                        Dernière modification: {formatDate(selectedMessage.updatedAt)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    <MessageSquare className="mx-auto mb-3" size={48} />
                    <p className="text-sm">Sélectionnez un message pour voir les détails</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modale de réponse - Version avec fond clair */}
        {showReplyModal && selectedMessage && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-4 sm:p-6 border-b">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                  Répondre à {selectedMessage.fullName}
                </h2>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-500 mb-2">Message original:</p>
                  <div className="bg-white rounded-lg p-3 max-h-40 overflow-y-auto border border-gray-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre réponse *
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="Écrivez votre réponse ici..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {replyText.length}/2000 caractères (minimum 10)
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-4 sm:p-6 border-t">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={sendReply}
                  disabled={replying || replyText.length < 10}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {replying && <Loader2 className="animate-spin" size={16} />}
                  <span>Envoyer la réponse</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modale de suppression */}
        {showDeleteModal && selectedMessage && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Trash2 className="text-red-600" size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Supprimer le message</h2>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Êtes-vous sûr de vouloir supprimer le message de{' '}
                  <strong>{selectedMessage.fullName}</strong> ?
                </p>

                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={deletePermanent}
                    onChange={(e) => setDeletePermanent(e.target.checked)}
                    className="rounded border-gray-300 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">
                    Supprimer définitivement (ne pourra pas être restauré)
                  </span>
                </label>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={deleteMessage}
                    disabled={deleting}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                  >
                    {deleting && <Loader2 className="animate-spin" size={16} />}
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modale d'export */}
        {showExportModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Download className="text-green-600" size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Exporter les messages</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Format d'export
                    </label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value as 'csv' | 'excel')}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    >
                      <option value="csv">CSV</option>
                      <option value="excel">Excel (XLSX)</option>
                    </select>
                  </div>

                  <p className="text-xs text-gray-500">
                    L'export utilisera les filtres actuels (recherche, statuts, dates).
                  </p>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={exportMessages}
                    disabled={exporting}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    {exporting && <Loader2 className="animate-spin" size={16} />}
                    <span>Exporter</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
