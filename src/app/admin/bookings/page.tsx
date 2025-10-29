'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Eye, 
  CheckCircle, 
  Trash2, 
  MoreVertical, 
  LogOut 
} from "lucide-react";

// Sample data for demonstration
const requestsData = [
  { id: 1, client: "John Smith", checkIn: "2025-06-15", checkOut: "2025-06-18", status: "Pending", total: "$450", room: "Garden Villa" },
  { id: 2, client: "Maria Garcia", checkIn: "2025-06-20", checkOut: "2025-06-22", status: "Pending", total: "$280", room: "Lakeside Cottage" },
  { id: 3, client: "David Lee", checkIn: "2025-07-01", checkOut: "2025-07-05", status: "Pending", total: "$620", room: "Mountain View Suite" }
];

const approvedData = [
  { id: 4, client: "Emma Wilson", checkIn: "2025-06-10", checkOut: "2025-06-12", status: "Approved", total: "$320", room: "Garden Villa" },
  { id: 5, client: "James Brown", checkIn: "2025-06-25", checkOut: "2025-06-30", status: "Approved", total: "$750", room: "Lakeside Cottage" }
];

const cancelledData = [
  { id: 6, client: "Sophia Martinez", checkIn: "2025-06-05", checkOut: "2025-06-08", status: "Cancelled", total: "$380", room: "Mountain View Suite" },
  { id: 7, client: "Robert Johnson", checkIn: "2025-07-10", checkOut: "2025-07-15", status: "Cancelled", total: "$680", room: "Garden Villa" }
];

export default function BookingsPage() {
  return (
    <>
      <div className="mb-3">{/* smaller gap to topbar */}
        <h2 className="text-lg font-semibold mb-2">Bookings</h2>
        <Tabs defaultValue="requests">
          <TabsList>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          <TabsContent value="requests">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Requests</CardTitle>
                <CardDescription className="mt-1">Pending booking requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requestsData.length > 0 ? (
                      requestsData.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>{booking.client}</TableCell>
                          <TableCell>{booking.room}</TableCell>
                          <TableCell>{booking.status}</TableCell>
                          <TableCell>
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
                                <DropdownMenuItem>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  <span>Approve</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No booking requests.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="approved">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedData.length > 0 ? (
                      approvedData.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>{booking.client}</TableCell>
                          <TableCell>{booking.room}</TableCell>
                          <TableCell>{booking.status}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" title="Checkout">
                              <LogOut className="h-4 w-4" />
                              <span className="sr-only">Checkout</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No approved bookings.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="cancelled">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Cancelled</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cancelledData.length > 0 ? (
                      cancelledData.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>{booking.client}</TableCell>
                          <TableCell>{booking.room}</TableCell>
                          <TableCell>{booking.status}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" title="Delete">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No cancelled bookings.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
