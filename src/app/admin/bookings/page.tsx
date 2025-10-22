
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle } from "lucide-react";

export default function BookingsPage() {
  return (
    <div>
       <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline">Bookings</h1>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Booking
        </Button>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>Check-out</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No upcoming bookings.
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
