import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { Radio, Zap, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function RFIDScanner() {

  const [rfid, setRfid] = useState('');
  const [recentScans, setRecentScans] = useState([]);

  // ✅ FETCH BOOKS
  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/books");
      return res.json();
    }
  });

  // ✅ FETCH TRANSACTIONS
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/transactions");
      return res.json();
    }
  });

  // ✅ RECENT SCANS (from transactions)
  useEffect(() => {
    const recent = transactions
      .sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date))
      .slice(0, 5);
    setRecentScans(recent);
  }, [transactions]);

  // ✅ SCAN
  const handleScan = () => {
    if (!rfid.trim()) {
      toast.error("Please enter an RFID tag");
      return;
    }

    const found = books.find(b => b.rfid_tag === rfid);

    if (!found) {
      toast.error("Book not found with this RFID tag");
      setRfid('');
      return;
    }

    toast.success(`Book found: ${found.title}`);
    setRfid('');
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  // ✅ ISSUE
  const issueMutation = useMutation({
    mutationFn: async (bookId) => {
      await fetch("http://localhost:5000/api/rfid/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: bookId })
      });
    },
    onSuccess: () => toast.success("Book issued successfully"),
  });

  // ✅ RETURN
  const returnMutation = useMutation({
    mutationFn: async (bookId) => {
      await fetch("http://localhost:5000/api/rfid/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: bookId })
      });
    },
    onSuccess: () => toast.success("Book returned successfully"),
  });

  return (
    <div className="p-6 max-w-6xl">
      {/* RFID Scanner Card */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 rounded-2xl p-12 text-white text-center min-h-[300px] flex flex-col items-center justify-center">
          {/* RFID Icon */}
          <div className="mb-6">
            <div className="inline-flex p-4 bg-white/20 rounded-full">
              <Radio className="w-12 h-12 text-white" strokeWidth={1.5} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-2">RFID Scanner</h1>
          <p className="text-white/90 mb-8">Scan or enter RFID tag to process books</p>

          {/* Input & Scan Button */}
          <div className="flex gap-2 max-w-md w-full">
            <input
              type="text"
              placeholder="Enter RFID tag..."
              value={rfid}
              onChange={(e) => setRfid(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              autoFocus
            />
            <Button
              onClick={handleScan}
              className="bg-white hover:bg-gray-100 text-purple-600 font-semibold px-6"
            >
              <Zap className="w-4 h-4 mr-2" /> Scan
            </Button>
          </div>

          {/* Helper Text */}
          <p className="text-white/70 text-sm mt-4">Press Enter or click Scan to search for book</p>
        </div>
      </div>

      {/* Recent RFID Activity */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-purple-600" />
          Recent RFID Activity
        </h2>

        <div className="space-y-3">
          {recentScans.length > 0 ? (
            recentScans.map((scan, idx) => (
              <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  {/* Radio Icon */}
                  <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg">
                    <Radio className="w-5 h-5 text-purple-600" strokeWidth={1.5} />
                  </div>

                  {/* Book Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{scan.book_title}</h3>
                    <p className="text-sm text-gray-600">{scan.user_name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(scan.issue_date), 'MMM dd, yyyy · h:mm a')}
                    </p>
                  </div>

                  {/* Status */}
                  <Badge className={
                    scan.status === 'Issued' ? 'bg-green-100 text-green-700' :
                    scan.status === 'Returned' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }>
                    {scan.status}
                  </Badge>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center text-gray-500">
              <p>No recent RFID scans</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}