import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Settings, Save, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

export default function LibrarySettings() {
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState({
    library_name: 'Smart Library',
    fine_per_day: 0.5,
    max_borrow_days: 14,
    max_books_per_user: 5,
    reminder_days_before: 2
  });

  // ✅ GET SETTINGS
  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/settings");
      return res.json();
    },
  });

  useEffect(() => {
    if (data) {
      setSettings(data);
    }
  }, [data]);

  // ✅ SAVE SETTINGS
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("http://localhost:5000/api/settings", {
        method: "POST", // or PUT
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
      toast.success("Settings saved");
    },
    onError: () => toast.error("Failed to save"),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">

      <motion.h1 className="text-xl font-bold flex items-center gap-2">
        <Settings /> Library Settings
      </motion.h1>

      <Card className="p-4 space-y-4">

        <div>
          <Label>Library Name</Label>
          <Input
            value={settings.library_name}
            onChange={(e) =>
              setSettings({ ...settings, library_name: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Fine per day</Label>
          <Input
            type="number"
            value={settings.fine_per_day}
            onChange={(e) =>
              setSettings({ ...settings, fine_per_day: parseFloat(e.target.value) })
            }
          />
        </div>

        <div>
          <Label>Max Borrow Days</Label>
          <Input
            type="number"
            value={settings.max_borrow_days}
            onChange={(e) =>
              setSettings({ ...settings, max_borrow_days: parseInt(e.target.value) })
            }
          />
        </div>

        <div>
          <Label>Max Books per User</Label>
          <Input
            type="number"
            value={settings.max_books_per_user}
            onChange={(e) =>
              setSettings({ ...settings, max_books_per_user: parseInt(e.target.value) })
            }
          />
        </div>

        <div>
          <Label>Reminder Days</Label>
          <Input
            type="number"
            value={settings.reminder_days_before}
            onChange={(e) =>
              setSettings({ ...settings, reminder_days_before: parseInt(e.target.value) })
            }
          />
        </div>

        <Button onClick={() => saveMutation.mutate(settings)}>
          <Save className="mr-2" /> Save
        </Button>

      </Card>

    </div>
  );
}