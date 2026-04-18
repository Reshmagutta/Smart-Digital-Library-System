import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Search, Loader2, UserPlus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from 'sonner';

export default function UserManagement() {

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');

  // ✅ FETCH USERS
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/users");
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

  // 🔥 USER STATS
  const getStats = (userId) => {
    const t = transactions.filter(x => x.user_id === userId);
    return {
      issued: t.filter(x => x.status === 'Issued' || x.status === 'Overdue').length,
      overdue: t.filter(x => x.status === 'Overdue').length,
      fines: t.reduce((a, x) => a + (x.fine_amount || 0), 0),
    };
  };

  // ✅ INVITE USER
  const inviteMutation = useMutation({
    mutationFn: async (email) => {
      await fetch("http://localhost:5000/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    },
    onSuccess: () => toast.success("User invited"),
  });

  const roleColors = {
    admin: 'bg-yellow-100 text-yellow-700',
    user: 'bg-blue-100 text-blue-700',
    librarian: 'bg-purple-100 text-purple-700'
  };

  const filtered = users.filter(u => {
    const matchSearch = u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                       u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = selectedRole === 'All Roles' || u.role === selectedRole;
    return matchSearch && matchRole;
  });

  const roles = ['All Roles', ...new Set(users.map(u => u.role || 'user'))];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Users</h1>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Invite Button */}
          <Button
            onClick={() => inviteMutation.mutate("test@mail.com")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Invite User
          </Button>
        </div>

        <p className="text-gray-600 text-sm">{filtered.length} users</p>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filtered.map((user, idx) => {
          const stats = getStats(user.id);
          const roleColor = roleColors[user.role?.toLowerCase()] || 'bg-gray-100 text-gray-700';

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <Avatar className="w-12 h-12 bg-indigo-600 text-white flex items-center justify-center font-semibold text-lg">
                      <AvatarFallback className="bg-indigo-600 text-white">
                        {user.full_name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                      <Badge className={roleColor}>
                        {user.role || 'user'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-8 text-sm">
                    <div className="text-center">
                      <p className="text-gray-600 text-xs mb-1">Issued</p>
                      <p className="font-bold text-gray-900">{stats.issued}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600 text-xs mb-1">Overdue</p>
                      <p className="font-bold text-gray-900">{stats.overdue}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600 text-xs mb-1">Fines</p>
                      <p className="font-bold text-gray-900">${stats.fines.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}