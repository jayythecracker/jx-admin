import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { UserFilters } from "@/components/user-filters";
import { UserTable } from "@/components/user-table";
import { UserViewModal } from "@/components/user-view-modal";
import { UserEditModal } from "@/components/user-edit-modal";
import { createBanConfirmation, createUnbanConfirmation } from "@/components/confirmation-modal";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { FilterUserParams, User, UpdateUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();

  // State for filters
  const [filters, setFilters] = useState<FilterUserParams>({
    name: "",
    phone: "",
    is_vip: "all",
    is_banned: "all",
    sortBy: "created_at",
    sortOrder: "desc",
    page: 1,
    limit: 10,
    table: "users2" // Default to users2 table
  });

  // State for modals
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isUnbanModalOpen, setIsUnbanModalOpen] = useState(false);

  // Fetch users query
  const { 
    data, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/users', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      if (filters.name) queryParams.append('name', filters.name);
      if (filters.phone) queryParams.append('phone', filters.phone);
      if (filters.is_vip !== 'all') queryParams.append('is_vip', filters.is_vip);
      if (filters.is_banned !== 'all') queryParams.append('is_banned', filters.is_banned);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      queryParams.append('table', filters.table); // Add table parameter

      const url = `/api/users?${queryParams.toString()}`;
      const res = await fetch(url, { credentials: 'include' });

      if (!res.ok) {
        throw new Error(`Error fetching users: ${res.statusText}`);
      }

      return await res.json() as { data: User[], count: number };
    }
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: string, userData: UpdateUser }) => {
      const res = await apiRequest('PUT', `/api/users/${id}?table=${filters.table}`, userData);
      return await res.json() as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        description: "User updated successfully.",
        variant: "default",
      });
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating user",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Ban user mutation
  const banMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/users/${id}/ban?table=${filters.table}`, {});
      return await res.json() as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        description: "User banned successfully.",
        variant: "default",
      });
      setIsBanModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error banning user",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Unban user mutation
  const unbanMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/users/${id}/unban?table=${filters.table}`, {});
      return await res.json() as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        description: "User unbanned successfully.",
        variant: "default",
      });
      setIsUnbanModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error unbanning user",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Set VIP status mutation
  const setVipMutation = useMutation({
    mutationFn: async ({ id, isVip }: { id: string, isVip: boolean }) => {
      const res = await apiRequest('POST', `/api/users/${id}/vip?table=${filters.table}`, { isVip });
      return await res.json() as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error) => {
      toast({
        title: "Error setting VIP status",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<FilterUserParams>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters,
      // Reset page to 1 when changing filters except for page changes
      page: 'page' in newFilters ? newFilters.page || 1 : 1
    }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Handler for opening user details modal
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  // Handler for opening edit modal
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(false);
    setIsEditModalOpen(true);
  };

  // Handler for starting ban process
  const handleBanUser = (user: User) => {
    setSelectedUser(user);
    setIsBanModalOpen(true);
  };

  // Handler for starting unban process
  const handleUnbanUser = (user: User) => {
    setSelectedUser(user);
    setIsUnbanModalOpen(true);
  };

  // Handler for saving user changes
  const handleSaveUser = (id: string, userData: UpdateUser) => {
    updateMutation.mutate({ id, userData });
  };

  // Handler for confirming ban
  const handleConfirmBan = () => {
    if (selectedUser) {
      banMutation.mutate(selectedUser.id);
    }
  };

  // Handler for confirming unban
  const handleConfirmUnban = () => {
    if (selectedUser) {
      unbanMutation.mutate(selectedUser.id);
    }
  };

  // Error display
  if (isError) {
    return (
      <div className="flex-1 p-4">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <h3 className="text-lg font-semibold">Error Loading Users</h3>
          <p>{error instanceof Error ? error.message : "Unknown error occurred"}</p>
          <button 
            className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md flex items-center"
            onClick={() => refetch()}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
      </div>

      {/* Filters */}
      <UserFilters 
        onFilterChange={handleFilterChange} 
        isLoading={isLoading}
        onRefresh={() => refetch()}
        currentTable={filters.table}
      />

      {/* Users Table */}
      <UserTable 
        users={data?.data || []}
        totalCount={data?.count || 0}
        currentPage={filters.page || 1}
        onPageChange={handlePageChange}
        itemsPerPage={filters.limit || 10}
        isLoading={isLoading}
        onViewUser={handleViewUser}
        onEditUser={handleEditUser}
        onBanUser={handleBanUser}
        onUnbanUser={handleUnbanUser}
      />

      {/* Modals */}
      <UserViewModal 
        user={selectedUser}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onEdit={() => {
          setIsViewModalOpen(false);
          setIsEditModalOpen(true);
        }}
      />

      <UserEditModal 
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveUser}
        isPending={updateMutation.isPending}
      />

      {selectedUser && (
        <>
          {createBanConfirmation(
            selectedUser,
            isBanModalOpen,
            () => setIsBanModalOpen(false),
            handleConfirmBan,
            banMutation.isPending
          )}

          {createUnbanConfirmation(
            selectedUser,
            isUnbanModalOpen,
            () => setIsUnbanModalOpen(false),
            handleConfirmUnban,
            unbanMutation.isPending
          )}
        </>
      )}
    </div>
  );
}