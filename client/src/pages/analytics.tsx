import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CalendarDays, Users, Crown, Ban, UserPlus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { UserActivity, UserStats } from "@shared/schema";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<string>("30");
  const [currentTable, setCurrentTable] = useState<'users' | 'users2'>('users2');

  // Fetch user statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/analytics/stats", currentTable],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/analytics/stats?table=${currentTable}`);
      const data = await response.json();
      return data as UserStats;
    },
  });

  // Fetch user activity trend
  const { data: activityData, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["/api/analytics/activity", timeRange, currentTable],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/analytics/activity?days=${timeRange}&table=${currentTable}`
      );
      const data = await response.json();
      return data as UserActivity[];
    },
  });

  const isLoading = isLoadingStats || isLoadingActivity;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Format dates for the chart
  const chartData = activityData?.map((item) => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">User Analytics</h1>
        <p className="text-muted-foreground">
          Monitor user statistics and activity trends.
        </p>
      </div>

      {/* Table Selection */}
      <div className="mb-8">
        <Select 
          value={currentTable} 
          onValueChange={(value: 'users' | 'users2') => setCurrentTable(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select user table" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="users">Legacy Users</SelectItem>
            <SelectItem value="users2">New Users</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          description="All registered users"
          icon={<Users className="h-5 w-5 text-blue-500" />}
          trend={null}
        />
        <StatsCard
          title="Active Users"
          value={stats?.activeUsers || 0}
          description="Non-banned users"
          icon={<Users className="h-5 w-5 text-green-500" />}
          trend={null}
        />
        <StatsCard
          title="VIP Users"
          value={stats?.vipUsers || 0}
          description="Premium members"
          icon={<Crown className="h-5 w-5 text-amber-500" />}
          trend={null}
        />
        <StatsCard
          title="Banned Users"
          value={stats?.bannedUsers || 0}
          description="Restricted accounts"
          icon={<Ban className="h-5 w-5 text-red-500" />}
          trend={null}
        />
        <StatsCard
          title="New Users"
          value={stats?.newUsers || 0}
          description="Last 7 days"
          icon={<UserPlus className="h-5 w-5 text-indigo-500" />}
          trend="+5%"
          trendDirection="up"
        />
      </div>

      {/* Activity Chart */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle>User Registration Trend</CardTitle>
            <CardDescription>
              New user registrations over time
            </CardDescription>
          </div>
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="userCount"
                  name="New Users"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  trend: string | null;
  trendDirection?: "up" | "down";
}

function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  trendDirection,
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarDays className="mr-1 h-3 w-3" />
          {description}
          {trend && (
            <span
              className={`ml-2 ${
                trendDirection === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}