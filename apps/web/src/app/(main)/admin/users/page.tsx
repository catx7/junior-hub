'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Edit, Trash2, Shield, Ban, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { getIdToken } from '@/lib/firebase';

// API functions
async function fetchUsers() {
  const token = await getIdToken();
  const res = await fetch('/api/admin/users', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

async function updateUserRole(userId: string, role: string) {
  const token = await getIdToken();
  const res = await fetch(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error('Failed to update user role');
  return res.json();
}

async function deleteUser(userId: string) {
  const token = await getIdToken();
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to delete user');
  return res.json();
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchUsers,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      toast.success('User role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingUser(null);
    },
    onError: () => {
      toast.error('Failed to update user role');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      toast.error('Failed to delete user');
    },
  });

  const handleDeleteUser = (userId: string, userName: string) => {
    if (
      confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)
    ) {
      deleteUserMutation.mutate(userId);
    }
  };

  const filteredUsers = users.filter((user: any) => {
    const query = searchQuery.toLowerCase();
    return user.name?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query);
  });

  return (
    <div className="bg-muted/50 min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-foreground text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all platform users</p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="p-4">
            <p className="text-muted-foreground text-sm">Total Users</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-muted-foreground text-sm">Admins</p>
            <p className="text-2xl font-bold">
              {users.filter((u: any) => u.role === 'ADMIN').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-muted-foreground text-sm">Verified</p>
            <p className="text-2xl font-bold">{users.filter((u: any) => u.isVerified).length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-muted-foreground text-sm">Active Today</p>
            <p className="text-2xl font-bold">-</p>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6 p-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name or email..."
              className="pl-10"
            />
          </div>
        </Card>

        {/* Users Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border bg-card divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-muted-foreground px-6 py-12 text-center">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user: any) => (
                    <tr key={user.id} className="hover:bg-muted/50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} />
                            ) : (
                              <div className="bg-primary flex h-full w-full items-center justify-center text-sm font-bold text-white">
                                {user.name?.charAt(0) || 'U'}
                              </div>
                            )}
                          </Avatar>
                          <div>
                            <p className="text-foreground font-medium">{user.name}</p>
                            <p className="text-muted-foreground text-sm">
                              Rating: {user.rating?.toFixed(1) || '0.0'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="text-foreground whitespace-nowrap px-6 py-4 text-sm">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {editingUser?.id === user.id ? (
                          <select
                            value={editingUser.role}
                            onChange={(e) =>
                              setEditingUser({ ...editingUser, role: e.target.value })
                            }
                            className="rounded border px-2 py-1"
                          >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        ) : (
                          <Badge
                            variant={user.role === 'ADMIN' ? 'default' : 'outline'}
                            className={user.role === 'ADMIN' ? 'bg-purple-600' : ''}
                          >
                            <Shield className="mr-1 h-3 w-3" />
                            {user.role}
                          </Badge>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {user.isVerified ? (
                          <Badge className="bg-green-600">
                            <Check className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Ban className="mr-1 h-3 w-3" />
                            Unverified
                          </Badge>
                        )}
                      </td>
                      <td className="text-muted-foreground whitespace-nowrap px-6 py-4 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        {editingUser?.id === user.id ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                updateRoleMutation.mutate({
                                  userId: user.id,
                                  role: editingUser.role,
                                });
                              }}
                              disabled={updateRoleMutation.isPending}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingUser(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-destructive/5"
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              disabled={deleteUserMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-muted-foreground px-6 py-12 text-center">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
