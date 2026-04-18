import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, isWithinInterval, isPast, eachDayOfInterval } from 'date-fns';
import { FileText, Download, Loader2, TrendingUp, BookMarked, AlertCircle, DollarSign } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function Reports() {

  const [reportType, setReportType] = useState('issued');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // ✅ FETCH DATA FROM BACKEND
  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/books");
      return res.json();
    }
  });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/transactions");
      return res.json();
    }
  });

  // 🔥 STATS
  const stats = {
    totalIssued: transactions.filter(t => t.status === 'Issued' || t.status === 'Overdue').length,
    returned: transactions.filter(t => t.status === 'Returned').length,
    overdue: transactions.filter(t => t.status === 'Overdue').length,
    totalFines: transactions
      .filter(t => t.fine_amount > 0)
      .reduce((acc, t) => acc + t.fine_amount, 0),
  };

  // 📊 BORROWING TREND (Last 30 Days)
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

  // 📊 BOOKS BY CATEGORY
  const categoryData = books.reduce((acc, book) => {
    const cat = book.category || 'Other';
    acc[cat] = (acc[cat] || 0) + (book.quantity || 1);
    return acc;
  }, {});

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name, value
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#ef4444'];

  // 🔥 FILTERED TRANSACTIONS
  const getData = () => {
    if (reportType === 'issued') return transactions.filter(t => t.status === 'Issued' || t.status === 'Overdue');
    if (reportType === 'overdue') return transactions.filter(t => t.status === 'Overdue');
    if (reportType === 'returned') return transactions.filter(t => t.status === 'Returned');
    return transactions.filter(t => t.fine_amount > 0);
  };

  // ✅ DOWNLOAD CSV
  const downloadCSV = () => {
    const rows = getData().map(t => [
      t.book_title,
      t.user_name,
      format(new Date(t.issue_date), 'MMM dd, yyyy'),
      t.status,
      t.fine_amount || '0'
    ]);

    const csv = [
      ["Book", "User", "Date", "Status", "Fine"],
      ...rows
    ].map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `report-${reportType}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
          <FileText className="w-8 h-8 text-indigo-600" /> Reports
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Issued</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalIssued}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookMarked className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Returned</p>
              <p className="text-3xl font-bold text-gray-900">{stats.returned}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Overdue</p>
              <p className="text-3xl font-bold text-gray-900">{stats.overdue}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Fines Collected</p>
              <p className="text-3xl font-bold text-gray-900">${stats.totalFines.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Borrowing Activity Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Borrowing Activity (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
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

        {/* Books by Category Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Books by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Generate Reports */}
      <Card className="p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" /> Generate Reports
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Report Type */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="issued">Issued Books</option>
              <option value="returned">Returned Books</option>
              <option value="overdue">Overdue Books</option>
              <option value="fines">Fines</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* Download Button */}
          <div className="flex items-end">
            <Button
              onClick={downloadCSV}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" /> Download CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Preview Table */}
      <Card className="p-6 overflow-auto">
        <h3 className="text-lg font-semibold mb-4">Report Preview</h3>
        
        {getData().length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 text-gray-600">Book</th>
                <th className="text-left py-2 px-3 text-gray-600">User</th>
                <th className="text-left py-2 px-3 text-gray-600">Date</th>
                <th className="text-left py-2 px-3 text-gray-600">Status</th>
                <th className="text-right py-2 px-3 text-gray-600">Fine</th>
              </tr>
            </thead>
            <tbody>
              {getData().slice(0, 10).map((t, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-3">{t.book_title}</td>
                  <td className="py-3 px-3">{t.user_name}</td>
                  <td className="py-3 px-3">{format(new Date(t.issue_date), 'MMM dd, yyyy')}</td>
                  <td className="py-3 px-3">
                    <Badge className={
                      t.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                      t.status === 'Returned' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right font-semibold">${t.fine_amount?.toFixed(2) || '0.00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No records found
          </div>
        )}
      </Card>
    </div>
  );
}