import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BookOpen, MapPin, Tag, Calendar, FileText, User, Hash, Star } from 'lucide-react';

export default function BookDetailModal({ book, open, onClose, onRequest, showRequestButton = true }) {
  if (!book) return null;

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-emerald-100 text-emerald-700';
      case 'Low Stock': return 'bg-amber-100 text-amber-700';
      case 'Out of Stock': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Book Details</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Cover */}
          <div className={`w-full md:w-48 h-64 flex-shrink-0 rounded-xl bg-gradient-to-br ${getCategoryColor(book.category)} flex items-center justify-center`}>
            {book.cover_image ? (
              <img 
                src={book.cover_image} 
                alt={book.title}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <BookOpen className="w-16 h-16 text-white/80" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{book.title}</h2>
              <p className="text-lg text-slate-600 mt-1">{book.author}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className={getStatusColor(book.status)}>{book.status}</Badge>
              <Badge variant="secondary">
                <Tag className="w-3 h-3 mr-1" />
                {book.category}
              </Badge>
            </div>

            {book.description && (
              <p className="text-slate-600 text-sm leading-relaxed">
                {book.description}
              </p>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Hash className="w-4 h-4 text-slate-400" />
                <span>ISBN: {book.isbn}</span>
              </div>
              {book.shelf_location && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Location: {book.shelf_location}</span>
                </div>
              )}
              {book.publisher && (
                <div className="flex items-center gap-2 text-slate-600">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Publisher: {book.publisher}</span>
                </div>
              )}
              {book.publish_year && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Year: {book.publish_year}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-600">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>Available: {book.available_quantity || 0} / {book.quantity || 1}</span>
              </div>
              {book.borrow_count > 0 && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>Borrowed {book.borrow_count} times</span>
                </div>
              )}
            </div>

            {book.rfid_tag && (
              <>
                <Separator />
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="font-medium">RFID Tag:</span>
                  <code className="bg-slate-100 px-2 py-1 rounded">{book.rfid_tag}</code>
                </div>
              </>
            )}

            {showRequestButton && book.available_quantity > 0 && onRequest && (
              <Button 
                onClick={() => onRequest(book)}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                Request This Book
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}