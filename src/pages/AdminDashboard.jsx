import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format, subDays, eachDayOfInterval, isPast } from 'date-fns';
import {
  BookOpen, Users, AlertCircle, DollarSign,
  TrendingUp, BookMarked, ArrowRight, Loader2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatsCard from '@/components/dashboard/StatsCard';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);

  // ✅ Dummy user (no auth)
  useEffect(() => {
    setUser({ full_name: "Admin" });
  }, []);

  // ✅ Fetch Books
  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ['adminBooks'],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/books");
      return res.json();
    },
  });

  // ✅ Fetch Transactions
  const { data: transactions = [], isLoading: transLoading } = useQuery({
    queryKey: ['adminTransactions'],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/transactions");
      return res.json();
    },
  });

  // ✅ Fetch Requests
  const { data: requests = [] } = useQuery({
    queryKey: ['adminRequests'],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/requests");
      return res.json();
    },
  });

  // ✅ Fetch Users
  const { data: users = [] } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/users");
      return res.json();
    },
  });

  // 🔥 Stats calculations
  const totalBooks = books.reduce((acc, b) => acc + (b.quantity || 1), 0);

  const issuedBooks = transactions.filter(
    t => t.status === 'Issued' || t.status === 'Overdue'
  ).length;

  const overdueBooks = transactions.filter(t => {
    if (t.status === 'Returned') return false;
    return t.due_date && isPast(new Date(t.due_date));
  }).length;

  const totalFines = transactions
    .filter(t => t.fine_amount > 0)
    .reduce((acc, t) => acc + t.fine_amount, 0);

  // 📊 Borrowing trend
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date()
  });

  const borrowingTrend = last30Days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const count = transactions.filter(t =>
      format(new Date(t.issue_date), 'yyyy-MM-dd') === dayStr
    ).length;
    return {
      date: format(day, 'MMM d'),
      borrows: count
    };
  });

  // 📊 Category distribution
  const categoryData = books.reduce((acc, book) => {
    const cat = book.category || 'Other';
    acc[cat] = (acc[cat] || 0) + (book.quantity || 1);
    return acc;
  }, {});

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name, value
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#ef4444'];

  const recentTransactions = transactions.slice(0, 5);

  const isLoading = booksLoading || transLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white"
      >
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.full_name?.split(' ')[0] || 'Admin'}!
        </h1>
        <p className="text-white/80 mt-1">
          Here's what's happening in your library today.
        </p>
      </motion.div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Books" value={totalBooks} icon={BookOpen} gradient="from-blue-500 to-cyan-500" />
        <StatsCard title="Books Issued" value={issuedBooks} icon={BookMarked} gradient="from-emerald-500 to-teal-500" />
        <StatsCard title="Overdue" value={overdueBooks} icon={AlertCircle} gradient="from-red-500 to-rose-500" />
        <StatsCard title="Total Fines" value={`$${totalFines}`} icon={DollarSign} gradient="from-amber-500 to-orange-500" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Registered Users</p>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Pending Requests</p>
              <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
              <Link to={createPageUrl('BookRequests')}>
                <p className="text-indigo-600 text-sm mt-2 hover:underline">View →</p>
              </Link>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Book Categories</p>
              <p className="text-3xl font-bold text-gray-900">{pieData.length}</p>
            </div>
            <div className="p-3 bg-pink-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Borrowing Trend Chart */}
        <Card className="p-6 border-0 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Borrowing Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={borrowingTrend}>
              <defs>
                <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="borrows" 
                stroke="#6366f1" 
                fillOpacity={1} 
                fill="url(#colorBorrows)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Distribution Chart */}
        <Card className="p-6 border-0 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

    </div>
  );
}