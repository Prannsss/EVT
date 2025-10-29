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
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
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
import Link from 'next/link';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Sample data for demonstration
// Monthly reservation data for bar chart
const monthlyReservationData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Reservations',
      data: [65, 59, 80, 81, 56, 55, 72, 90, 81, 75, 62, 78],
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgb(37, 99, 235)',
      borderWidth: 1,
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Monthly Reservations',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const statsCards = [
  {
    title: 'Total Reservations',
    value: '245',
    change: '+12.5%',
    trend: 'up',
    icon: Calendar,
    color: 'from-blue-600 to-sky-400',
  },
  {
    title: 'Total Rooms',
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
    title: 'Total Guests',
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
      {/* Admin Title - Hidden when sidebar is toggled */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold group-data-[collapsible=icon]:hidden">Admin</h1>
      </div>
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
                <Icon className="h-5 w-5 text-gray-600" />
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

  {/* Charts and Tables Grid */}
  <div className="grid gap-6 md:grid-cols-2 mb-8">
    {/* Monthly Reservations Chart */}
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Monthly Reservations</CardTitle>
            <CardDescription>Reservation trends throughout the year</CardDescription>
          </div>
          <select 
            className="border rounded p-1 text-sm"
            defaultValue="2025"
            aria-label="Select year"
          >
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Bar options={chartOptions} data={monthlyReservationData} />
        </div>
      </CardContent>
    </Card>

    {/* Recent Bookings Table */}
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Recent Bookings</CardTitle>
          <CardDescription className="mt-1">
            Latest reservations and their current status
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
            <Link href="/admin/bookings">View All</Link>
          </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentBookings.map((booking) => (
              <TableRow key={booking.id} className="hover:bg-muted/50">
                <TableCell>{booking.client}</TableCell>
                <TableCell>{booking.room}</TableCell>
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
  </div>

  {/* Quick Actions section removed */}
    </>
  );
}
