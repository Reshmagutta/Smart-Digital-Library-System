import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format, isPast } from 'date-fns';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, AlertCircle, CheckCircle2, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function TransactionManagement() {

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  // ✅ FETCH TRANSACTIONS
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/transactions");
      return res.json();
    }
  });

  // ✅ RETURN BOOK
  const returnMutation = useMutation({
    mutationFn: async (id) => {
      await fetch("http://localhost:5000/api/transactions/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
    },
    onSuccess: () => {
      toast.success("Book returned successfully");
    },
  });

  // ✅ PAY FINE
  const payFineMutation = useMutation({
    mutationFn: async (id) => {
      await fetch("http://localhost:5000/api/transactions/pay-fine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
    },
    onSuccess: () => {
      toast.success("Fine paid successfully");
    },
  });

  // 🔥 STATS
  const stats = {
    issued: transactions.filter(t => t.status === 'Issued' || t.status === 'Overdue').length,
    overdue: transactions.filter(t => t.status === 'Overdue').length,
    returned: transactions.filter(t => t.status === 'Returned').length,
  };

  // 🔥 FILTER
  const filtered = transactions.filter(t => {
    const matchSearch = t.book_title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = selectedStatus === 'All Status' || t.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const statuses = ['All Status', ...new Set(transactions.map((t) => t.status))];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-8">Transactions</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6 border-l-4 border-l-blue-500 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Issued</p>
              <p className="text-3xl font-bold text-gray-900">{stats.issued}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Overdue</p>
              <p className="text-3xl font-bold text-gray-900">{stats.overdue}</p>
            </div>
            <div className="p-3 bg-red-200 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-green-500 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Returned</p>
              <p className="text-3xl font-bold text-gray-900">{stats.returned}</p>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          {statuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filtered.map(t => (
          <Card key={t.id} className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-red-200">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 pt-1">
                <div className="p-2 bg-red-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-red-600" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{t.book_title}</h3>
                <p className="text-sm text-gray-600">{t.user_name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Issued: {format(new Date(t.issue_date), 'MMM dd')} · Due: {format(new Date(t.due_date), 'MMM dd')}
                </p>
              </div>

              {/* Fine Amount */}
              {t.fine_amount > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Fine</p>
                  <p className="text-lg font-bold text-red-600">${t.fine_amount.toFixed(2)}</p>
                </div>
              )}

              {/* Status Badge */}
              <div className="flex-shrink-0">
                <Badge className={
                  t.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                  t.status === 'Returned' ? 'bg-green-100 text-green-700' :
                  'bg-blue-100 text-blue-700'
                }>
                  {t.status}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            {t.status !== 'Returned' && (
              <div className="mt-3 flex gap-2">
                {t.fine_amount > 0 && !t.fine_paid && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => payFineMutation.mutate(t.id)}
                    className="text-xs"
                  >
                    Pay Fine
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => returnMutation.mutate(t.id)}
                  className="text-xs"
                >
                  Return Book
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}