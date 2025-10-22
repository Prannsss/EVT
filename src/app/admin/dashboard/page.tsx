 'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Sample data for demonstration
const statsCards = [
  {
    title: 'Total Bookings',
    value: '245',
    change: '+12.5%',
    trend: 'up',
    icon: Calendar,
    color: 'from-blue-600 to-sky-400',
  },
  {
    title: 'Active Clients',
    value: '1,429',
    change: '+5.2%',
    trend: 'up',
    icon: Users,
    color: 'from-blue-600 to-sky-400',
  },
  {
    title: 'Revenue',
    value: '$48,523',
    change: '+18.3%',
    trend: 'up',
    icon: DollarSign,
    color: 'from-blue-600 to-sky-400',
  },
  {
    title: 'Growth Rate',
    value: '24.8%',
    change: '-2.1%',
    trend: 'down',
    icon: TrendingUp,
    color: 'from-blue-600 to-sky-400',
  },
];

const recentBookings = [
  {
    id: 'BK-001',
    client: 'Sarah Johnson',
    room: 'Deluxe Suite',
    checkIn: '2025-10-25',
    status: 'Confirmed',
  },
  {
    id: 'BK-002',
    client: 'Michael Chen',
    room: 'Garden Villa',
    checkIn: '2025-10-26',
    status: 'Pending',
  },
  {
    id: 'BK-003',
    client: 'Emily Rodriguez',
    room: 'Premium Room',
    checkIn: '2025-10-27',
    status: 'Confirmed',
  },
  {
    id: 'BK-004',
    client: 'David Kim',
    room: 'Executive Suite',
    checkIn: '2025-10-28',
    status: 'Confirmed',
  },
  {
    id: 'BK-005',
    client: 'Lisa Anderson',
    room: 'Standard Room',
    checkIn: '2025-10-29',
    status: 'Cancelled',
  },
];

export default function DashboardPage() {
  return (
    <>
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;

          return (
            <Card
              key={index}
              className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-200"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div
                  className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendIcon
                    className={`h-4 w-4 ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
  </div>

  {/* Recent Bookings Table */}
  <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Recent Bookings</CardTitle>
            <CardDescription className="mt-1">
              Latest reservations and their current status
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBookings.map((booking) => (
                <TableRow key={booking.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{booking.id}</TableCell>
                  <TableCell>{booking.client}</TableCell>
                  <TableCell>{booking.room}</TableCell>
                  <TableCell>
                    {new Date(booking.checkIn).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        booking.status === 'Confirmed'
                          ? 'default'
                          : booking.status === 'Pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className={
                        booking.status === 'Confirmed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : booking.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                          : ''
                      }
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Booking</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Cancel Booking
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3 mt-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Quick Add Booking</CardTitle>
            <CardDescription>Create a new reservation quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-sky-400 hover:from-blue-700 hover:to-sky-500">
              <Calendar className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Add New Client</CardTitle>
            <CardDescription>Register a new guest</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Generate Report</CardTitle>
            <CardDescription>Export analytics and data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
