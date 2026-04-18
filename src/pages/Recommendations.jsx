import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BookCard from '@/components/books/BookCard';
import BookDetailModal from '@/components/modals/BookDetailModal';
import { toast } from 'sonner';

export default function Recommendations() {

  const [selectedBook, setSelectedBook] = useState(null);
  const [aiBooks, setAiBooks] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);

  // ✅ GET BOOKS
  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/books");
      return res.json();
    },
  });

  // ✅ AI CALL (OLLAMA)
  const fetchAI = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch("http://localhost:5000/api/ai/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          books: books.slice(0, 30)
        })
      });

      const data = await res.json();

      const matched = books.filter(b =>
        data.recommendations?.some(r =>
          b.title.toLowerCase().includes(r.toLowerCase())
        )
      );

      setAiBooks(matched.length ? matched : books.slice(0, 4));

    } catch (err) {
      toast.error("AI failed, showing default books");
      setAiBooks(books.slice(0, 4));
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    if (books.length) fetchAI();
  }, [books.length]);

  // ✅ REQUEST BOOK
  const requestMutation = useMutation({
    mutationFn: async (book) => {
      const res = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: book.id,
          book_title: book.title,
          user_name: "Guest",
          status: "Pending"
        }),
      });
      return res.json();
    },
    onSuccess: () => toast.success("Requested"),
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Sparkles /> AI Recommendations
        </h2>

        <Button onClick={fetchAI}>
          <RefreshCw className="mr-2" /> Refresh
        </Button>
      </div>

      {loadingAI ? (
        <Card className="p-10 text-center">
          <Loader2 className="animate-spin mx-auto" />
          <p>Thinking...</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {aiBooks.map((book, i) => (
            <BookCard
              key={book.id}
              book={book}
              index={i}
              onRequest={(b) => requestMutation.mutate(b)}
              onView={setSelectedBook}
            />
          ))}
        </div>
      )}

      <BookDetailModal
        book={selectedBook}
        open={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        onRequest={(b) => requestMutation.mutate(b)}
      />

    </div>
  );
}