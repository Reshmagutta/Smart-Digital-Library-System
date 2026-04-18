import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, MoreVertical, Loader2, BookOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';

export default function BookManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // ✅ GET BOOKS
  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/books");
      return res.json();
    },
  });

  // ✅ CREATE BOOK
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("http://localhost:5000/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['books']);
      toast.success('Book added');
    },
  });

  // ✅ DELETE BOOK
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`http://localhost:5000/api/books/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['books']);
      toast.success('Book deleted');
    },
  });

  const filteredBooks = books.filter(book => {
    const matchSearch = book.title?.toLowerCase().includes(search.toLowerCase()) ||
                       book.author?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'All' || book.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const categories = ['All', ...new Set(books.map(b => b.category || 'Other'))];

  const getStatusBadge = (book) => {
    const available = book.available_quantity || 0;
    const total = book.quantity || 1;
    
    if (available === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700' };
    if (available <= total / 4) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Available', color: 'bg-green-100 text-green-700' };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Books</h1>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">All Categories</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Add Book Button */}
          <Button
            onClick={() =>
              createMutation.mutate({
                title: "New Book",
                author: "Unknown",
                category: "Fiction",
                quantity: 1,
              })
            }
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Book
          </Button>
        </div>

        <p className="text-gray-600 text-sm">{filteredBooks.length} books</p>
      </div>

      {/* Books List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredBooks.map((book, idx) => {
            const status = getStatusBadge(book);

            return (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4 items-start">
                    {/* Book Cover */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-24 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-lg flex items-center justify-center text-white">
                        <BookOpen className="w-8 h-8" />
                      </div>
                    </div>

                    {/* Book Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{book.title}</h3>
                      <p className="text-sm text-gray-600">{book.author}</p>

                      {/* Badges */}
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <Badge variant="outline" className="bg-blue-50">
                          {book.category || 'Fiction'}
                        </Badge>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </div>

                      {/* Stats */}
                      <div className="flex gap-4 mt-3 text-sm text-gray-600">
                        <span>{book.available_quantity || 0}/{book.quantity || 1} available</span>
                        {book.rfid_tag && (
                          <span className="text-indigo-600">{book.rfid_tag}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}