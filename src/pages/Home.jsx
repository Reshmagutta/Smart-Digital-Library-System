import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {

  // ✅ Fetch books
  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/books");
      return res.json();
    },
  });

  // ✅ Compute stats
  const totalBooks = books.reduce((acc, b) => acc + (b.quantity || 1), 0);
  const availableBooks = books.reduce((acc, b) => acc + (b.available_quantity || 0), 0);
  const categories = [...new Set(books.map(b => b.category))].length;

  // ✅ Popular books
  const popularBooks = [...books]
    .sort((a, b) => (b.borrow_count || 0) - (a.borrow_count || 0))
    .slice(0, 6);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-xl"
      >
        <h1 className="text-2xl font-bold">Welcome to Smart Library 📚</h1>
        <p className="mt-2 text-white/80">Explore and manage books easily</p>

        <Link to={createPageUrl('BrowseBooks')}>
          <Button className="mt-4 bg-white text-indigo-600">
            Browse Books
          </Button>
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p>Total Books</p>
          <h2 className="text-xl font-bold">{totalBooks}</h2>
        </Card>

        <Card className="p-4 text-center">
          <p>Available</p>
          <h2 className="text-xl font-bold">{availableBooks}</h2>
        </Card>

        <Card className="p-4 text-center">
          <p>Categories</p>
          <h2 className="text-xl font-bold">{categories}</h2>
        </Card>
      </div>

      {/* Popular Books */}
      {popularBooks.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">Popular Books</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {popularBooks.map(book => (
              <Card key={book.id} className="p-3">
                <h3 className="font-semibold">{book.title}</h3>
                <p className="text-sm text-gray-500">{book.author}</p>

                <div className="flex justify-between mt-2">
                  <Badge>{book.category}</Badge>
                  <span className="text-xs flex items-center">
                    <Star className="w-3 h-3 mr-1 text-yellow-500" />
                    {book.borrow_count || 0}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}