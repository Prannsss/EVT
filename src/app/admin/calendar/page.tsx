'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';

// Sample reservation data
const reservations = [
  {
    id: 1,
    date: new Date(2025, 5, 15),
    clientName: "Sarah Johnson",
    cottage: "Garden Villa",
    guests: 4,
    time: "2:00 PM"
  },
  {
    id: 2,
    date: new Date(2025, 5, 18),
    clientName: "Michael Chen",
    cottage: "Lakeside Cottage",
    guests: 2,
    time: "3:30 PM"
  },
  {
    id: 3,
    date: new Date(2025, 5, 22),
    clientName: "Emily Rodriguez",
    cottage: "Mountain View Suite",
    guests: 6,
    time: "12:00 PM"
  },
  {
    id: 4,
    date: new Date(2025, 9, 23), // October 23, 2025
    clientName: "John Smith",
    cottage: "Garden Villa",
    guests: 2,
    time: "3:00 PM"
  }
];

// Hardcoded reservation details
const reservationDetails = {
  clientName: "John Smith",
  cottage: "Garden Villa",
  guests: 2,
  time: "3:00 PM",
  contact: {
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567"
  }
};

export default function AdminCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2025, 9, 23)); // October 23, 2025

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Add previous month's days
    for (let i = 0; i < firstDayOfMonth; i++) {
      const prevMonthDay = new Date(year, month, -i);
      days.unshift({
        date: prevMonthDay,
        isCurrentMonth: false,
        hasBooking: hasBookingOnDate(prevMonthDay)
      });
    }
    
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        hasBooking: hasBookingOnDate(currentDate)
      });
    }
    
    // Add next month's days to fill the grid (6 rows of 7 days)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDay = new Date(year, month + 1, i);
      days.push({
        date: nextMonthDay,
        isCurrentMonth: false,
        hasBooking: hasBookingOnDate(nextMonthDay)
      });
    }
    
    return days;
  };

  // Check if date has booking
  const hasBookingOnDate = (date: Date) => {
    return reservations.some(res => 
      res.date.getDate() === date.getDate() &&
      res.date.getMonth() === date.getMonth() &&
      res.date.getFullYear() === date.getFullYear()
    );
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // Get days for current month
  const days = getDaysInMonth(currentMonth);

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Booking Calendar</h2>
        <p className="text-muted-foreground">Manage your vehicle bookings and availability</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-3xl">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-1">
                0 total bookings
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day names */}
                {dayNames.map(day => (
                  <div key={day} className="text-center py-2 text-sm font-medium">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {days.map((day, index) => (
                  <div 
                    key={index}
                    className={`
                      h-16 p-2 relative border cursor-pointer
                      ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                      ${selectedDate && day.date.getDate() === selectedDate.getDate() && 
                        day.date.getMonth() === selectedDate.getMonth() && 
                        day.date.getFullYear() === selectedDate.getFullYear() 
                          ? 'ring-2 ring-blue-500' : ''}
                      ${day.hasBooking && day.isCurrentMonth ? 'bg-blue-50' : ''}
                    `}
                    onClick={() => handleDateSelect(day.date)}
                  >
                    <div className="text-right text-base">{day.date.getDate()}</div>
                    {day.hasBooking && day.isCurrentMonth && (
                      <div className="absolute bottom-2 left-2 right-2 h-1 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'October 23, 2025'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{reservationDetails.clientName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'October 23, 2025'} at {reservationDetails.time}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cottage</p>
                    <p>{reservationDetails.cottage}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Guests</p>
                    <p>{reservationDetails.guests} people</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contact</p>
                    <p>{reservationDetails.contact.email}</p>
                    <p>{reservationDetails.contact.phone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Bookings</span>
                    <span className="font-medium text-blue-600">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cancelled</span>
                    <span className="font-medium text-blue-600">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium text-blue-600">0</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t mt-2">
                    <span className="font-medium">Total Revenue</span>
                    <span className="font-medium text-blue-600">₱0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
