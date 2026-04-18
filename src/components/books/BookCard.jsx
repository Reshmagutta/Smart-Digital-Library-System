import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, MapPin, Tag, Star } from 'lucide-react';
import { motion } from "framer-motion";

export default function BookCard({ book, onRequest, onView, showRequestButton = true, index = 0 }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Low Stock': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Out of Stock': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Fiction': 'from-blue-500 to-cyan-500',
      'Non-Fiction': 'from-emerald-500 to-teal-500',
      'Science': 'from-purple-500 to-indigo-500',
      'Technology': 'from-orange-500 to-red-500',
      'History': 'from-amber-500 to-yellow-500',
      'Biography': 'from-pink-500 to-rose-500',
      'Self-Help': 'from-green-500 to-emerald-500',
      'Education': 'from-indigo-500 to-purple-500',
      'Literature': 'from-cyan-500 to-blue-500',
      'Reference': 'from-slate-500 to-gray-500',
    };
    return colors[category] || 'from-slate-500 to-gray-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
        <div className="flex">
          {/* Book Cover */}
          <div className={`relative w-32 h-44 flex-shrink-0 bg-gradient-to-br ${getCategoryColor(book.category)} flex items-center justify-center`}>
            {book.cover_image ? (
              <img 
                src={book.cover_image} 
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="w-12 h-12 text-white/80" />
            )}
            <div className="absolute top-2 left-2">
              <Badge className={`${getStatusColor(book.status)} border text-xs`}>
                {book.status}
              </Badge>
            </div>
          </div>

          {/* Book Info */}
          <div className="flex-1 p-4 flex flex-col">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                {book.title}
              </h3>
              <p className="text-sm text-slate-500 mt-1">{book.author}</p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary" className="text-xs bg-slate-100">
                  <Tag className="w-3 h-3 mr-1" />
                  {book.category}
                </Badge>
                {book.shelf_location && (
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {book.shelf_location}
                  </Badge>
                )}
              </div>

              {book.description && (
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {book.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>{book.available_quantity || 0} / {book.quantity || 1} available</span>
                {book.borrow_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500" />
                    {book.borrow_count} borrows
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {onView && (
                  <Button variant="ghost" size="sm" onClick={() => onView(book)}>
                    View
                  </Button>
                )}
                {showRequestButton && book.available_quantity > 0 && onRequest && (
                  <Button 
                    size="sm" 
                    onClick={() => onRequest(book)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    Request
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}