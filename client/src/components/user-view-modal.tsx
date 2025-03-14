import React from "react";
import { X, Edit } from "lucide-react";
import { formatDate, formatDateTime, getInitials } from "@/lib/utils";
import { User } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ScrollArea
} from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface UserViewModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function UserViewModal({ user, isOpen, onClose, onEdit }: UserViewModalProps) {
  if (!user) return null;

  // Generate sample login history (in a real app, this would come from backend)
  const loginHistory = user.last_login ? [
    { date: user.last_login, device: user.current_device || "Unknown device" },
    // This is just for demonstration, in a real app we would have actual login history
  ] : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">User Details</DialogTitle>
          <DialogDescription>
            Detailed information about the user.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center mb-4">
            <div className="flex-shrink-0 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto sm:mx-0">
              <span className="text-primary text-2xl font-medium">
                {getInitials(user.name)}
              </span>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
              <p className="text-xl font-semibold text-gray-900">{user.name}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
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
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.phone}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">IMEI</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.imei}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(user.created_at)}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Expires</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(user.expired_at) || "No expiration"}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Last Login</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDateTime(user.last_login) || "Never"}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Current Device</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.current_device || "Unknown"}</dd>
            </div>
          </dl>
          
          {loginHistory.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Login History</h4>
                <ScrollArea className="max-h-40">
                  <ul className="divide-y divide-gray-200">
                    {loginHistory.map((login, index) => (
                      <li key={index} className="py-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{formatDateTime(login.date)}</span>
                          <span className="text-gray-500">{login.device}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter className="mt-4">
          <Button 
            variant="default" 
            onClick={onEdit} 
            className="mr-2"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit User
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
