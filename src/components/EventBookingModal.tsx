"use client"

import React, { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar as CalendarComponent } from "./ui/calendar"
import { Calendar, Loader2, Sparkles } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface EventBookingModalProps {
  isOpen: boolean
  onClose: () => void
}

interface DynamicPricing {
  event: {
    whole_day: number;
    evening: number;
    morning: number;
  };
}

export default function EventBookingModal({ isOpen, onClose }: EventBookingModalProps) {
  const router = useRouter()
  const [selectedEvent, setSelectedEvent] = useState<'whole_day' | 'evening' | 'morning' | null>(null)
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined)
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null)
  const [proofOfPaymentPreview, setProofOfPaymentPreview] = useState<string | null>(null)
  const [eventDetails, setEventDetails] = useState("")
  
  // Dynamic pricing state
  const [pricing, setPricing] = useState<DynamicPricing | null>(null)
  const [loadingPricing, setLoadingPricing] = useState(true)

  // Fetch dynamic pricing on mount
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setLoadingPricing(true)
        const response = await fetch(`${API_URL}/api/pricing`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch pricing')
        }

        const data = await response.json()
        const settings = data.data

        // Convert array to grouped object
        const grouped: DynamicPricing = {
          event: { whole_day: 15000, evening: 10000, morning: 10000 },
        }

        settings.forEach((setting: any) => {
          if (setting.category === 'event') {
            grouped.event[setting.type as 'whole_day' | 'evening' | 'morning'] = Number(setting.price)
          }
        })

        setPricing(grouped)
      } catch (error) {
        console.error('Error fetching pricing:', error)
        // Use default values on error
        setPricing({
          event: { whole_day: 15000, evening: 10000, morning: 10000 },
        })
      } finally {
        setLoadingPricing(false)
      }
    }

    if (isOpen) {
      fetchPricing()
    }
  }, [isOpen])

  // Calculate total price dynamically
  const totalPrice = useMemo(() => {
    if (!pricing || !selectedEvent) return 0
    return pricing.event[selectedEvent]
  }, [pricing, selectedEvent])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProofOfPayment(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setProofOfPaymentPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBookEvent = () => {
    // Check if user is logged in (placeholder - replace with actual auth check)
    const isLoggedIn = false // TODO: Replace with actual auth state check

    if (!isLoggedIn) {
      // Store booking data in sessionStorage
      const bookingData = {
        eventType: selectedEvent,
        bookingDate: bookingDate?.toISOString(),
        eventDetails,
        totalPrice,
        timestamp: new Date().toISOString()
      }
      sessionStorage.setItem('pendingEventBooking', JSON.stringify(bookingData))
      
      // Redirect to signup/login
      alert("Please sign up or log in to complete your event booking")
      router.push('/signup')
      return
    }

    // If logged in, proceed with booking
    // User info will be retrieved from auth context/session
    console.log({
      eventType: selectedEvent,
      bookingDate,
      eventDetails,
      totalPrice,
      proofOfPayment: proofOfPayment?.name
    })
    
    alert(`Event booking submitted successfully! Total: ₱${totalPrice.toLocaleString('en-PH')}`)
    handleClose()
  }

  const resetForm = () => {
    setSelectedEvent(null)
    setBookingDate(undefined)
    setProofOfPayment(null)
    setProofOfPaymentPreview(null)
    setEventDetails("")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Show loading state while fetching pricing
  if (loadingPricing || !pricing) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Loading event pricing...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] w-full max-h-[90vh] overflow-y-auto" style={{maxWidth: '800px'}}>
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Book Entire Resort for Your Event
          </DialogTitle>
          <DialogDescription className="text-base">
            Reserve the entire resort exclusively for your special occasion
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Event Type Selection */}
          <div>
            <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Select Event Package
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Choose your preferred event time slot
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant={selectedEvent === 'whole_day' ? 'default' : 'outline'}
                className="h-auto flex-col items-start p-4 gap-1"
                onClick={() => setSelectedEvent(selectedEvent === 'whole_day' ? null : 'whole_day')}
              >
                <span className="font-bold text-base">Whole Day</span>
                <span className="text-xs opacity-80">9:00 AM - 5:00 PM</span>
                <span className="text-lg font-bold mt-1">
                  ₱{pricing.event.whole_day.toLocaleString('en-PH')}
                </span>
              </Button>

              <Button
                variant={selectedEvent === 'evening' ? 'default' : 'outline'}
                className="h-auto flex-col items-start p-4 gap-1"
                onClick={() => setSelectedEvent(selectedEvent === 'evening' ? null : 'evening')}
              >
                <span className="font-bold text-base">Evening</span>
                <span className="text-xs opacity-80">5:30 PM - 10:00 PM</span>
                <span className="text-lg font-bold mt-1">
                  ₱{pricing.event.evening.toLocaleString('en-PH')}
                </span>
              </Button>

              <Button
                variant={selectedEvent === 'morning' ? 'default' : 'outline'}
                className="h-auto flex-col items-start p-4 gap-1"
                onClick={() => setSelectedEvent(selectedEvent === 'morning' ? null : 'morning')}
              >
                <span className="font-bold text-base">Morning</span>
                <span className="text-xs opacity-80">9:00 AM - 5:00 PM</span>
                <span className="text-lg font-bold mt-1">
                  ₱{pricing.event.morning.toLocaleString('en-PH')}
                </span>
              </Button>
            </div>

            {selectedEvent && (
              <div className="mt-4 p-3 bg-primary/10 rounded-md">
                <p className="text-sm font-medium text-primary">
                  ✓ Event package selected: {selectedEvent === 'whole_day' ? 'Whole Day' : selectedEvent === 'evening' ? 'Evening' : 'Morning'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Entire resort will be exclusively yours during this time
                </p>
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div>
            <h4 className="text-lg font-bold mb-3">Select Event Date</h4>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full h-12 justify-start text-left font-normal ${!bookingDate && "text-muted-foreground"}`}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  {bookingDate ? format(bookingDate, "PPPP") : "Pick your event date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={bookingDate}
                  onSelect={setBookingDate}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Event Details */}
          <div>
            <h4 className="text-lg font-bold mb-3">Event Details (Optional)</h4>
            <textarea
              placeholder="Tell us about your event (e.g., birthday party, corporate event, wedding reception, etc.)"
              value={eventDetails}
              onChange={(e) => setEventDetails(e.target.value)}
              className="w-full min-h-[100px] p-3 border rounded-md resize-y"
            />
          </div>

          {/* Payment Section */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold mb-4">Payment Summary</h4>
            
            {/* Price Breakdown */}
            <div className="mb-4 p-4 bg-muted rounded-lg space-y-2">
              {selectedEvent ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-primary">Event Booking</span>
                    <span className="font-semibold text-primary">
                      {selectedEvent === 'whole_day' ? 'Whole Day' : selectedEvent === 'evening' ? 'Evening' : 'Morning'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Time</span>
                    <span className="font-medium">
                      {selectedEvent === 'whole_day' ? '9:00 AM - 5:00 PM' : selectedEvent === 'evening' ? '5:30 PM - 10:00 PM' : '9:00 AM - 5:00 PM'}
                    </span>
                  </div>
                  {bookingDate && (
                    <div className="flex justify-between text-sm">
                      <span>Date</span>
                      <span className="font-medium">{format(bookingDate, "PPPP")}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2 flex justify-between">
                    <span className="font-bold text-lg">Total Amount</span>
                    <span className="font-bold text-lg text-primary">₱{totalPrice.toLocaleString('en-PH')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Event package includes exclusive access to entire resort with all accommodations
                  </p>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Please select an event package to see pricing
                </p>
              )}
            </div>

            {selectedEvent && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: QR Code */}
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-muted">
                  <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center mb-4 border-2">
                    <div className="text-center p-4">
                      <div className="w-40 h-40 bg-gradient-to-br from-blue-100 to-blue-200 rounded flex flex-col items-center justify-center mb-2">
                        <span className="text-4xl mb-2">💳</span>
                        <span className="text-xs font-medium text-gray-600">Payment QR Code</span>
                        <span className="text-xs text-gray-500 mt-1">GCash / PayMaya</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-center text-muted-foreground font-medium">
                    Scan to pay via GCash or PayMaya
                  </p>
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    Elimar Spring Garden Resort
                  </p>
                  <p className="text-sm text-center font-bold text-primary mt-2">
                    Amount: ₱{totalPrice.toLocaleString('en-PH')}
                  </p>
                </div>

                {/* Right: Upload Proof */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="event-proof-of-payment" className="text-base font-medium">
                      Upload Proof of Payment *
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Upload a screenshot of your payment confirmation
                    </p>
                    <Input 
                      id="event-proof-of-payment"
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    {proofOfPayment && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-green-600">
                          ✓ {proofOfPayment.name}
                        </p>
                        {proofOfPaymentPreview && (
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-green-500">
                            <Image
                              src={proofOfPaymentPreview}
                              alt="Payment proof preview"
                              fill
                              style={{objectFit: "contain"}}
                              className="bg-muted"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Payment Instructions:</p>
                    <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Scan the QR code with your payment app</li>
                      <li>Complete the payment</li>
                      <li>Take a screenshot of the confirmation</li>
                      <li>Upload the screenshot above</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Book Now Button */}
          <Button 
            onClick={handleBookEvent} 
            className="w-full h-12 text-lg"
            disabled={!selectedEvent || !bookingDate || !proofOfPayment}
          >
            {selectedEvent ? `Book Event - ₱${totalPrice.toLocaleString('en-PH')}` : 'Select Event Package'}
          </Button>
          
          {!selectedEvent && (
            <p className="text-sm text-center text-muted-foreground mt-2">
              Please select an event package to proceed
            </p>
          )}
          {selectedEvent && !bookingDate && (
            <p className="text-sm text-center text-muted-foreground mt-2">
              Please select an event date to proceed
            </p>
          )}
          {selectedEvent && bookingDate && !proofOfPayment && (
            <p className="text-sm text-center text-muted-foreground mt-2">
              Please upload proof of payment to proceed
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
