import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = ['All', 'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Self-Help', 'Education', 'Literature', 'Reference'];
const AVAILABILITY = ['All', 'Available', 'Low Stock', 'Out of Stock'];
const SORT_OPTIONS = [
  { value: 'title', label: 'Title A-Z' },
  { value: '-title', label: 'Title Z-A' },
  { value: '-borrow_count', label: 'Most Popular' },
  { value: '-created_date', label: 'Recently Added' },
  { value: 'author', label: 'Author A-Z' },
];

export default function BookFilters({ filters, onFilterChange, onClear }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-900">Filters</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by title, author, ISBN..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          value={filters.category || 'All'}
          onValueChange={(value) => onFilterChange({ ...filters, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.availability || 'All'}
          onValueChange={(value) => onFilterChange({ ...filters, availability: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABILITY.map((avail) => (
              <SelectItem key={avail} value={avail}>{avail}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.sort || '-created_date'}
          onValueChange={(value) => onFilterChange({ ...filters, sort: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}