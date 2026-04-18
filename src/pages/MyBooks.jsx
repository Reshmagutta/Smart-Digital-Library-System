import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format, differenceInDays, isPast } from 'date-fns';
import {
  BookOpen, Clock, AlertCircle, CheckCircle2,
  DollarSign, Calendar, Loader2
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MyBooks() {

  // ✅ FETCH TRANSACTIONS
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/transactions");
      return res.json();
    },
  });

  // ✅ FETCH REQUESTS
  const { data: requests = [] } = useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/requests");
      return res.json();
    },
  });

  // 🔥 FILTER LOGIC
  const issuedBooks = transactions.filter(t => t.status === 'Issued' || t.status === 'Overdue');
  const returnedBooks = transactions.filter(t => t.status === 'Returned');

  const overdueBooks = transactions.filter(t => {
    if (t.status === 'Returned') return false;
    return t.due_date && isPast(new Date(t.due_date));
  });

  const pendingRequests = requests.filter(r => r.status === 'Pending');

  const totalFines = transactions
    .filter(t => t.fine_amount > 0 && !t.fine_paid)
    .reduce((acc, t) => acc + t.fine_amount, 0);

  const getStatusBadge = (t) => {
    if (t.status === 'Returned') return <Badge>Returned</Badge>;
    if (t.status === 'Overdue') return <Badge className="bg-red-100">Overdue</Badge>;
    return <Badge>Issued</Badge>;
  };

  const getDaysInfo = (t) => {
    if (t.status === 'Returned') return null;

    const days = differenceInDays(new Date(t.due_date), new Date());

    if (days < 0) return <span className="text-red-500">{Math.abs(days)} overdue</span>;
    if (days === 0) return <span>Due today</span>;
    return <span>{days} days left</span>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p>Issued</p>
          <h2>{issuedBooks.length}</h2>
        </Card>
        <Card className="p-4 text-center">
          <p>Overdue</p>
          <h2>{overdueBooks.length}</h2>
        </Card>
        <Card className="p-4 text-center">
          <p>Requests</p>
          <h2>{pendingRequests.length}</h2>
        </Card>
        <Card className="p-4 text-center">
          <p>Fines</p>
          <h2>${totalFines}</h2>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="issued">
        <TabsList>
          <TabsTrigger value="issued">Issued</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        {/* Issued */}
        <TabsContent value="issued">
          {issuedBooks.map(t => (
            <Card key={t.id} className="p-4 mb-2">
              <h3>{t.book_title}</h3>
              <p>{getDaysInfo(t)}</p>
              {getStatusBadge(t)}
            </Card>
          ))}
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          {returnedBooks.map(t => (
            <Card key={t.id} className="p-4 mb-2">
              <h3>{t.book_title}</h3>
              <p>Returned: {format(new Date(t.return_date), 'MMM d')}</p>
            </Card>
          ))}
        </TabsContent>

        {/* Requests */}
        <TabsContent value="requests">
          {requests.map(r => (
            <Card key={r.id} className="p-4 mb-2">
              <h3>{r.book_title}</h3>
              <p>Status: {r.status}</p>
            </Card>
          ))}
        </TabsContent>

      </Tabs>

    </div>
  );
}