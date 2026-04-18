import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import BookCard from '@/components/books/BookCard';
import BookFilters from '@/components/books/BookFilters';
import BookDetailModal from '@/components/modals/BookDetailModal';

export default function BrowseBooks() {
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    availability: 'All',
  });

  const [selectedBook, setSelectedBook] = useState(null);

  // ✅ FETCH BOOKS
  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/books");
      return res.json();
    },
  });

  // ✅ REQUEST BOOK
  const requestMutation = useMutation({
    mutationFn: async (book) => {
      const res = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          book_id: book.id,
          book_title: book.title,
          user_name: "Guest User", // no auth
          request_date: new Date().toISOString(),
          status: "Pending"
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Request submitted");
      setSelectedBook(null);
    },
    onError: () => toast.error("Failed to request book"),
  });

  // ✅ FILTER LOGIC
  const filteredBooks = books.filter(book => {
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (
        !book.title?.toLowerCase().includes(s) &&
        !book.author?.toLowerCase().includes(s)
      ) return false;
    }

    if (filters.category !== 'All' && book.category !== filters.category) {
      return false;
    }

    if (filters.availability !== 'All' && book.status !== filters.availability) {
      return false;
    }

    return true;
  });

  const handleRequest = (book) => {
    requestMutation.mutate(book);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      availability: 'All',
    });
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <BookFilters 
          filters={filters}
          onFilterChange={setFilters}
          onClear={clearFilters}
        />
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-10 h-10 mx-auto text-gray-400" />
          <p>No books found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <p className="text-sm text-gray-500">{filteredBooks.length} books</p>

          {filteredBooks.map((book, index) => (
            <BookCard
              key={book.id}
              book={book}
              index={index}
              onRequest={handleRequest}
              onView={setSelectedBook}
            />
          ))}
        </div>
      )}

      <BookDetailModal
        book={selectedBook}
        open={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        onRequest={handleRequest}
      />
    </div>
  );
}