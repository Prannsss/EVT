'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  MoreVertical, 
  LogOut,
  Calendar,
  User,
  Home,
  DollarSign,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Booking {
  id: number;
  user_id: number;
  accommodation_id: number;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  kids: number;
  pwd: number;
  overnight_stay: boolean;
  overnight_swimming: boolean;
  total_price: number;
  status: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
  accommodation_name?: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('http://localhost:5000/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const requestsData = bookings.filter(b => b.status === 'pending');
  const approvedData = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
  const cancelledData = bookings.filter(b => b.status === 'cancelled');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-lg text-muted-foreground">{error}</p>
        <Button onClick={fetchBookings}>Try Again</Button>
      </div>
    );
  }

  const renderBookingRow = (booking: Booking) => (
    <TableRow key={booking.id} className="hover:bg-muted/50">
      <TableCell>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            booking.status === 'confirmed' || booking.status === 'completed'
              ? 'bg-green-100 dark:bg-green-900/30'
              : booking.status === 'cancelled'
              ? 'bg-red-100 dark:bg-red-900/30'
              : 'bg-primary/10'
          }`}>
            <User className={`w-4 h-4 ${
              booking.status === 'confirmed' || booking.status === 'completed'
                ? 'text-green-600'
                : booking.status === 'cancelled'
                ? 'text-red-600'
                : 'text-primary'
            }`} />
          </div>
          <div>
            <p className="font-medium">{booking.user_name || 'Unknown User'}</p>
            <p className="text-xs text-muted-foreground">{booking.user_email || 'No email'}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-muted-foreground" />
          {booking.accommodation_name || `Accommodation #${booking.accommodation_id}`}
        </div>
      </TableCell>
      <TableCell className="text-sm">{formatDate(booking.check_in_date)}</TableCell>
      <TableCell className="text-sm">{booking.check_out_date ? formatDate(booking.check_out_date) : 'Day use'}</TableCell>
      <TableCell className="text-sm font-medium">
        {new Date(booking.check_in_date).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </TableCell>
      <TableCell>{booking.adults + booking.kids + booking.pwd} guests</TableCell>
      <TableCell>
        <div className="flex items-center gap-1 font-semibold text-green-600">
          <DollarSign className="w-4 h-4" />
          ₱{booking.total_price.toLocaleString()}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant={
            booking.status === 'confirmed' || booking.status === 'completed'
              ? 'default'
              : booking.status === 'pending'
              ? 'outline'
              : 'destructive'
          }
          className={
            booking.status === 'confirmed' || booking.status === 'completed'
              ? 'bg-green-50 text-green-700 border-green-200'
              : booking.status === 'pending'
              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
              : booking.status === 'cancelled'
              ? 'bg-red-50 text-red-700 border-red-200'
              : ''
          }
        >
          {booking.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              <span>View Details</span>
            </DropdownMenuItem>
            {booking.status === 'pending' && (
              <>
                <DropdownMenuItem className="text-green-600">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span>Approve</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <XCircle className="mr-2 h-4 w-4" />
                  <span>Reject</span>
                </DropdownMenuItem>
              </>
            )}
            {(booking.status === 'confirmed' || booking.status === 'completed') && (
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Check Out</span>
              </DropdownMenuItem>
            )}
            {booking.status === 'cancelled' && (
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1">Bookings</h2>
        <p className="text-sm text-muted-foreground">Manage your booking requests and reservations</p>
      </div>
      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="requests" className="gap-2">
            <Calendar className="w-4 h-4" />
            Requests ({requestsData.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Approved ({approvedData.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="gap-2">
            <XCircle className="w-4 h-4" />
            Cancelled ({cancelledData.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="requests">
          <Card className="shadow-lg border-2">
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Requests
              </CardTitle>
              <CardDescription className="mt-1">Pending booking requests awaiting approval</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requestsData.length > 0 ? (
                    requestsData.map((booking) => renderBookingRow(booking))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Calendar className="w-12 h-12 text-muted-foreground/50" />
                          <p>No booking requests at the moment.</p>
                          <p className="text-sm">Pending bookings will appear here.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="approved">
          <Card className="shadow-lg border-2">
            <CardHeader className="border-b bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Approved Bookings
              </CardTitle>
              <CardDescription className="mt-1">Active and confirmed reservations</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedData.length > 0 ? (
                    approvedData.map((booking) => renderBookingRow(booking))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle className="w-12 h-12 text-muted-foreground/50" />
                          <p>No approved bookings yet.</p>
                          <p className="text-sm">Confirmed bookings will appear here.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cancelled">
          <Card className="shadow-lg border-2">
            <CardHeader className="border-b bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30">
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Cancelled Bookings
              </CardTitle>
              <CardDescription className="mt-1">Rejected or cancelled reservations</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cancelledData.length > 0 ? (
                    cancelledData.map((booking) => renderBookingRow(booking))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                        <div className="flex flex-col items-center gap-2">
                          <XCircle className="w-12 h-12 text-muted-foreground/50" />
                          <p>No cancelled bookings.</p>
                          <p className="text-sm">Cancelled bookings will appear here.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
