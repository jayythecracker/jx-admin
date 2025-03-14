import { useState, useEffect } from "react";
import { Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { type FilterUserParams } from "@shared/schema";

interface UserFiltersProps {
  onFilterChange: (filters: Partial<FilterUserParams>) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export function UserFilters({ onFilterChange, isLoading, onRefresh }: UserFiltersProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vipStatus, setVipStatus] = useState<string>("all");
  const [banStatus, setBanStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [debouncedName, setDebouncedName] = useState("");
  const [debouncedPhone, setDebouncedPhone] = useState("");

  // Debounce search inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedName(name);
    }, 500);
    return () => clearTimeout(timer);
  }, [name]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPhone(phone);
    }, 500);
    return () => clearTimeout(timer);
  }, [phone]);

  // Update filters when debounced values change
  useEffect(() => {
    onFilterChange({
      name: debouncedName,
      phone: debouncedPhone,
      is_vip: vipStatus as any,
      is_banned: banStatus as any,
      sortBy: sortBy as any,
      page: 1 // Reset to first page on filter change
    });
  }, [debouncedName, debouncedPhone, vipStatus, banStatus, sortBy, onFilterChange]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search" className="mb-1">Search by Name</Label>
          <div className="relative">
            <Input
              id="search"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Search by name..."
              className="pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <Label htmlFor="phoneSearch" className="mb-1">Search by Phone</Label>
          <div className="relative">
            <Input
              id="phoneSearch"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Search by phone..."
              className="pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-40">
          <Label htmlFor="vipFilter" className="mb-1">VIP Status</Label>
          <Select 
            value={vipStatus} 
            onValueChange={setVipStatus}
          >
            <SelectTrigger id="vipFilter">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="non-vip">Non-VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-40">
          <Label htmlFor="banFilter" className="mb-1">Ban Status</Label>
          <Select 
            value={banStatus} 
            onValueChange={setBanStatus}
          >
            <SelectTrigger id="banFilter">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
              <SelectItem value="active">Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-48">
          <Label htmlFor="sortBy" className="mb-1">Sort By</Label>
          <Select 
            value={sortBy} 
            onValueChange={setSortBy}
          >
            <SelectTrigger id="sortBy">
              <SelectValue placeholder="Created Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="created_at">Created Date</SelectItem>
              <SelectItem value="last_login">Last Login</SelectItem>
              <SelectItem value="expired_at">Expiration Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-auto self-end">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isLoading}
            className="w-full"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
