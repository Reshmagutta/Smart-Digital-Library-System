import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Search, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

export default function BookRequests() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  // ✅ GET requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/requests");
      return res.json();
    },
  });

  // ✅ APPROVE
  const approveMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`http://localhost:5000/api/requests/${id}/approve`, {
        method: "POST",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['requests']);
      toast.success("Approved");
    },
  });

  // ✅ REJECT
  const rejectMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`http://localhost:5000/api/requests/${id}/reject`, {
        method: "POST",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['requests']);
      toast.success("Rejected");
    },
  });

  const filtered = requests.filter(r =>
    r.book_title?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">

      <Input
        placeholder="Search requests..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.map(r => (
        <motion.div key={r.id}>
          <Card className="p-4 flex justify-between items-center">
            <div>
              <h3>{r.book_title}</h3>
              <p className="text-sm text-gray-500">{r.user_name}</p>
              <p className="text-xs text-gray-400">
                {format(new Date(r.request_date), 'MMM d')}
              </p>
            </div>

            <div className="flex gap-2 items-center">
              <Badge>{r.status}</Badge>

              {r.status === "Pending" && (
                <>
                  <Button onClick={() => approveMutation.mutate(r.id)}>
                    <CheckCircle2 size={16} />
                  </Button>
                  <Button onClick={() => rejectMutation.mutate(r.id)}>
                    <XCircle size={16} />
                  </Button>
                </>
              )}
            </div>
          </Card>
        </motion.div>
      ))}

    </div>
  );
}