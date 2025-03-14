import { useState } from "react";
import { Edit, Eye, Ban, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/use-pagination";
import { formatDate, formatDateTime, getInitials, formatPhoneNumber } from "@/lib/utils";
import { User } from "@shared/schema";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface UserTableProps {
  users: User[];
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  isLoading: boolean;
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onBanUser: (user: User) => void;
  onUnbanUser: (user: User) => void;
}

export function UserTable({
  users,
  totalCount,
  currentPage,
  onPageChange,
  itemsPerPage,
  isLoading,
  onViewUser,
  onEditUser,
  onBanUser,
  onUnbanUser
}: UserTableProps) {
  const pagination = usePagination({
    totalItems: totalCount,
    itemsPerPage,
    initialPage: currentPage
  });

  // When the pagination component changes page, notify parent
  const handlePageChange = (page: number) => {
    pagination.goToPage(page);
    onPageChange(page);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton loading state
              Array.from({ length: itemsPerPage }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell>
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="ml-4">
                        <Skeleton className="h-4 w-[120px] mb-2" />
                        <Skeleton className="h-3 w-[150px]" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No users found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            ) : (
              users.map(user => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {getInitials(user.name)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">
                          IMEI: {user.imei}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatPhoneNumber(user.phone)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {user.is_banned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : (
                        <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">
                          Active
                        </Badge>
                      )}
                      {user.is_vip && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                          VIP
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDateTime(user.last_login)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewUser(user)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditUser(user)}
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.is_banned ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onUnbanUser(user)}
                          className="text-green-600 hover:text-green-800"
                          title="Unban User"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onBanUser(user)}
                          className="text-red-600 hover:text-red-800"
                          title="Ban User"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{totalCount === 0 ? 0 : pagination.startIndex + 1}</span> to{" "}
              <span className="font-medium">{Math.min(pagination.endIndex + 1, totalCount)}</span> of{" "}
              <span className="font-medium">{totalCount}</span> results
            </p>
          </div>
          <div className="flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <Button
                variant="outline"
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50"
                onClick={pagination.prevPage}
                disabled={pagination.currentPage === 1}
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </Button>
              
              {pagination.getPageRange().map((page, index) => (
                page === "..." ? (
                  <Button
                    key={`ellipsis-${index}`}
                    variant="outline"
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                    disabled
                  >
                    ...
                  </Button>
                ) : (
                  <Button
                    key={`page-${page}`}
                    variant={pagination.currentPage === page ? "secondary" : "outline"}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pagination.currentPage === page 
                        ? "bg-primary/10 text-primary border-primary/20" 
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => handlePageChange(page as number)}
                  >
                    {page}
                  </Button>
                )
              ))}
              
              <Button
                variant="outline"
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50"
                onClick={pagination.nextPage}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
