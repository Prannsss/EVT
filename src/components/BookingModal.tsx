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
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar as CalendarComponent } from "./ui/calendar"
import { Plus, Minus, Clock, Calendar, Loader2 } from "lucide-react"
import Accommodation3D from "./Accommodation3D"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Accommodation {
  id: number;
  name: string;
  type: 'room' | 'cottage';
  description: string;
  capacity: string;
  price: number | string;
  inclusions: string;
  image_url: string;
  panoramic_url?: string;
}

interface BookingModalProps {
  accommodation: Accommodation | null
  isOpen: boolean
  onClose: () => void
}

interface DynamicPricing {
  entrance: {
    adult: number;
    kids_senior_pwd: number;
  };
  swimming: {
    adult: number;
    kids_senior_pwd: number;
  };
  night_swimming: {
    per_head: number;
  };
}

export default function BookingModal({ accommodation, isOpen, onClose }: BookingModalProps) {
  const router = useRouter()
  const [adultCount, setAdultCount] = useState(0)
  const [kidCount, setKidCount] = useState(0)
  const [pwdCount, setPwdCount] = useState(0)
  const [overnightStay, setOvernightStay] = useState(false)
  const [overnightSwimming, setOvernightSwimming] = useState(false)
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null)
  const [proofOfPaymentPreview, setProofOfPaymentPreview] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("details")
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined)
  const [bookingTime, setBookingTime] = useState("09:00")
  
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
          entrance: { adult: 70, kids_senior_pwd: 50 },
          swimming: { adult: 80, kids_senior_pwd: 50 },
          night_swimming: { per_head: 200 },
        }

        settings.forEach((setting: any) => {
          if (setting.category === 'entrance') {
            grouped.entrance[setting.type as 'adult' | 'kids_senior_pwd'] = Number(setting.price)
          } else if (setting.category === 'swimming') {
            grouped.swimming[setting.type as 'adult' | 'kids_senior_pwd'] = Number(setting.price)
          } else if (setting.category === 'night_swimming') {
            grouped.night_swimming.per_head = Number(setting.price)
          }
        })

        setPricing(grouped)
      } catch (error) {
        console.error('Error fetching pricing:', error)
        // Use default values on error
        setPricing({
          entrance: { adult: 70, kids_senior_pwd: 50 },
          swimming: { adult: 80, kids_senior_pwd: 50 },
          night_swimming: { per_head: 200 },
        })
      } finally {
        setLoadingPricing(false)
      }
    }

    if (isOpen) {
      fetchPricing()
    }
  }, [isOpen])

  // Generate time options from 9am to 5pm
  const timeOptions = []
  for (let hour = 9; hour <= 17; hour++) {
    const time24 = `${hour.toString().padStart(2, '0')}:00`
    const hour12 = hour > 12 ? hour - 12 : hour
    const period = hour >= 12 ? 'PM' : 'AM'
    const time12Format = `${hour12}:00 ${period}`
    timeOptions.push({ value: time24, label: time12Format })
  }

  // Calculate total price dynamically
  const totalPrice = useMemo(() => {
    if (!accommodation || !pricing) return 0

    let total = 0

    // Add accommodation base price (ensure it's a number)
    total += Number(accommodation.price)

    // Add entrance fees
    total += adultCount * pricing.entrance.adult
    total += (kidCount + pwdCount) * pricing.entrance.kids_senior_pwd

    // Add swimming fees (if it's a cottage, rooms have free swimming)
    if (accommodation.type === 'cottage') {
      total += adultCount * pricing.swimming.adult
      total += (kidCount + pwdCount) * pricing.swimming.kids_senior_pwd
    }

    // Add overnight swimming fee
    if (overnightSwimming) {
      total += (adultCount + kidCount + pwdCount) * pricing.night_swimming.per_head
    }

    return total
  }, [accommodation, pricing, adultCount, kidCount, pwdCount, overnightSwimming])

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

  const handleBookNow = () => {
    // Check if user is logged in (placeholder - replace with actual auth check)
    const isLoggedIn = false // TODO: Replace with actual auth state check

    if (!isLoggedIn) {
      // Store booking data in sessionStorage
      const bookingData = {
        accommodationId: accommodation?.id,
        accommodationName: accommodation?.name,
        adults: adultCount,
        kids: kidCount,
        pwd: pwdCount,
        overnightStay,
        overnightSwimming,
        bookingTime,
        totalPrice,
        timestamp: new Date().toISOString()
      }
      sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData))
      
      // Redirect to signup/login
      alert("Please sign up or log in to complete your booking")
      router.push('/signup')
      return
    }

    // If logged in, proceed with booking
    // In a real app, this would create a notification via API
    // For now, we'll use localStorage to simulate cross-tab communication
    const notificationData = {
      type: 'booking',
      title: 'New Booking Request',
      message: `New booking for ${accommodation?.name}`,
      clientName: 'Guest User', // TODO: Replace with actual user name
      accommodationType: accommodation?.type,
      bookingTime,
      totalPrice,
      timestamp: new Date().toISOString()
    }
    
    // Store in localStorage for admin to pick up
    const existingNotifications = localStorage.getItem('pendingNotifications')
    const notifications = existingNotifications ? JSON.parse(existingNotifications) : []
    notifications.push(notificationData)
    localStorage.setItem('pendingNotifications', JSON.stringify(notifications))
    
    console.log({
      accommodation: accommodation?.id,
      adults: adultCount,
      kids: kidCount,
      pwd: pwdCount,
      overnightStay,
      overnightSwimming,
      bookingTime,
      totalPrice,
      proofOfPayment: proofOfPayment?.name
    })
    
    alert(`Booking submitted successfully! Total: ₱${totalPrice.toLocaleString('en-PH')}`)
    handleClose()
  }

  const resetForm = () => {
    setAdultCount(0)
    setKidCount(0)
    setPwdCount(0)
    setOvernightStay(false)
    setOvernightSwimming(false)
    setProofOfPayment(null)
    setProofOfPaymentPreview(null)
    setBookingDate(undefined)
    setBookingTime("09:00")
  }

  const handleClose = () => {
    resetForm()
    setActiveTab("details")
    onClose()
  }

  if (!accommodation) return null

  // Show loading state while fetching pricing
  if (loadingPricing || !pricing) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Loading pricing information...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Handle multiple images stored as JSON array or single image string
  let imageUrl = '/placeholder-room.svg';
  try {
    if (accommodation.image_url) {
      // Try to parse as JSON array
      const parsedImages = JSON.parse(accommodation.image_url);
      if (Array.isArray(parsedImages) && parsedImages.length > 0) {
        imageUrl = parsedImages[0].startsWith('http') 
          ? parsedImages[0] 
          : `${API_URL}${parsedImages[0]}`;
      } else {
        throw new Error('Not an array');
      }
    }
  } catch {
    // If not JSON, treat as single image path
    if (accommodation.image_url) {
      imageUrl = accommodation.image_url.startsWith('http') 
        ? accommodation.image_url 
        : `${API_URL}${accommodation.image_url}`;
    }
  }

  const panoramicUrl = accommodation.panoramic_url?.startsWith('http')
    ? accommodation.panoramic_url
    : accommodation.panoramic_url ? `${API_URL}${accommodation.panoramic_url}` : null;

  // Parse inclusions (split by newline if it's a string)
  const inclusionsList = accommodation.inclusions 
    ? accommodation.inclusions.split('\n').filter(item => item.trim()) 
    : [];

  // Format price
  const formattedPrice = `₱${accommodation.price.toLocaleString()}`;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] w-full max-h-[90vh] overflow-y-auto" style={{maxWidth: '900px'}}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{accommodation.name}</DialogTitle>
          <DialogDescription className="text-sm">
            Complete your booking details below
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-12">
            <TabsTrigger value="details" className="text-base">Booking Details</TabsTrigger>
            <TabsTrigger value="panoramic" className="text-base">360° View</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
          {/* Top Section: Image and Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Left: Image */}
            <div className="w-full rounded-xl overflow-hidden shadow-lg bg-muted border">
              <div className="relative w-full aspect-[4/3]">
                <Image
                  src={imageUrl}
                  alt={accommodation.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{objectFit: "cover"}}
                  priority
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-room.svg';
                  }}
                />
              </div>
            </div>

            {/* Right: Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-3">{accommodation.name}</h3>
                <Badge variant="outline" className="mb-3 px-3 py-1 text-sm">
                  {accommodation.type === 'room' ? 'Room' : 'Cottage'}
                </Badge>
                <p className="text-base leading-relaxed text-muted-foreground">{accommodation.description}</p>
              </div>

              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Capacity:</span>
                  <span className="text-sm font-medium">{accommodation.capacity}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm font-semibold">Base Price:</span>
                  <span className="text-xl font-bold text-primary">{formattedPrice}</span>
                </div>
              </div>

              {inclusionsList.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-3 text-muted-foreground">✨ Inclusions:</p>
                  <ul className="space-y-2">
                    {inclusionsList.map((item, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <span className="mr-2 text-primary font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Guest Count Controls */}
          <div className="mb-6">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">Number of Guests</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Adults */}
              <div className="flex items-center justify-between p-4 border-2 rounded-lg shadow-sm bg-card hover:border-primary/50 transition-colors">
                <div>
                  <Label className="text-sm font-semibold">Adults</Label>
                  <p className="text-xs text-muted-foreground">Age 18+</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setAdultCount(Math.max(0, adultCount - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{adultCount}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setAdultCount(adultCount + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Kids */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Kids</Label>
                  <p className="text-xs text-muted-foreground">Under 18</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setKidCount(Math.max(0, kidCount - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{kidCount}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setKidCount(kidCount + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* PWD */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">PWD/Senior</Label>
                  <p className="text-xs text-muted-foreground">With ID</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setPwdCount(Math.max(0, pwdCount - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{pwdCount}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setPwdCount(pwdCount + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Time and Date Selection */}
          <div className="mb-6">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Booking Time and Date
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="booking-date" className="text-sm font-medium">
                  Select Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full h-11 justify-start text-left font-normal ${!bookingDate && "text-muted-foreground"}`}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {bookingDate ? format(bookingDate, "PPP") : "Pick a date"}
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
                <p className="text-xs text-muted-foreground">
                  Choose your booking date
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking-time" className="text-sm font-medium">
                  Select Time
                </Label>
                <Select value={bookingTime} onValueChange={setBookingTime}>
                  <SelectTrigger id="booking-time" className="h-11">
                    <SelectValue placeholder="Select booking time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose your preferred arrival time
                </p>
              </div>
            </div>
          </div>

          {/* Checkboxes for Overnight Options */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4">Additional Options</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="overnight-stay" 
                  checked={overnightStay}
                  onCheckedChange={(checked) => setOvernightStay(checked as boolean)}
                />
                <Label 
                  htmlFor="overnight-stay" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Overnight Stay
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="overnight-swimming" 
                  checked={overnightSwimming}
                  onCheckedChange={(checked) => setOvernightSwimming(checked as boolean)}
                />
                <Label 
                  htmlFor="overnight-swimming" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Overnight Swimming (Night Swimming - ₱{pricing.night_swimming.per_head.toLocaleString('en-PH')} per head)
                </Label>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="mb-6 border-t pt-6">
            <h4 className="text-lg font-semibold mb-4">Payment Summary</h4>
            
            {/* Price Breakdown */}
            <div className="mb-4 p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Accommodation ({accommodation.name})</span>
                <span className="font-medium">₱{Number(accommodation.price).toFixed(2)}</span>
              </div>
              
              {adultCount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Adults ({adultCount}) - Entrance & Swimming</span>
                  <span className="font-medium">
                    ₱{((adultCount * pricing.entrance.adult) + (accommodation.type === 'cottage' ? adultCount * pricing.swimming.adult : 0)).toFixed(2)}
                  </span>
                </div>
              )}
              
              {kidCount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Kids ({kidCount}) - Entrance & Swimming</span>
                  <span className="font-medium">
                    ₱{((kidCount * pricing.entrance.kids_senior_pwd) + (accommodation.type === 'cottage' ? kidCount * pricing.swimming.kids_senior_pwd : 0)).toFixed(2)}
                  </span>
                </div>
              )}
              
              {pwdCount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>PWD/Senior ({pwdCount}) - Entrance & Swimming</span>
                  <span className="font-medium">
                    ₱{((pwdCount * pricing.entrance.kids_senior_pwd) + (accommodation.type === 'cottage' ? pwdCount * pricing.swimming.kids_senior_pwd : 0)).toFixed(2)}
                  </span>
                </div>
              )}
              
              {overnightSwimming && (
                <div className="flex justify-between text-sm">
                  <span>Night Swimming ({adultCount + kidCount + pwdCount} guests)</span>
                  <span className="font-medium">
                    ₱{((adultCount + kidCount + pwdCount) * pricing.night_swimming.per_head).toFixed(2)}
                  </span>
                </div>
              )}
              
              {accommodation.type === 'room' && (adultCount + kidCount + pwdCount) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Free Swimming (Room Guest)</span>
                  <span className="font-medium">Included</span>
                </div>
              )}
              
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="font-bold text-lg">Total Amount</span>
                <span className="font-bold text-lg text-primary">₱{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: QR Code */}
              <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-muted">
                <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center mb-4 border-2">
                  {/* Placeholder for QR Code - Replace /assets/payment-qr.png with actual QR code image */}
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
                  Amount: ₱{totalPrice.toFixed(2)}
                </p>
              </div>

              {/* Right: Upload Proof */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="proof-of-payment" className="text-base font-medium">
                    Upload Proof of Payment
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Upload a screenshot of your payment confirmation
                  </p>
                  <Input 
                    id="proof-of-payment"
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
          </div>

          {/* Book Now Button */}
          <Button 
            onClick={handleBookNow} 
            className="w-full h-12 text-lg"
            disabled={!bookingDate || adultCount + kidCount + pwdCount === 0 || !proofOfPayment}
          >
            Book Now - ₱{totalPrice.toFixed(2)}
          </Button>
          
          {!bookingDate && (
            <p className="text-sm text-center text-muted-foreground mt-2">
              Please select a booking date to proceed
            </p>
          )}
          {bookingDate && (adultCount + kidCount + pwdCount === 0) && (
            <p className="text-sm text-center text-muted-foreground mt-2">
              Please add at least one guest to proceed
            </p>
          )}
          {bookingDate && !proofOfPayment && (adultCount + kidCount + pwdCount > 0) && (
            <p className="text-sm text-center text-muted-foreground mt-2">
              Please upload proof of payment to proceed
            </p>
          )}
          </TabsContent>

          <TabsContent value="panoramic" className="mt-6">
            {panoramicUrl ? (
              <div className="space-y-4">
                <Accommodation3D
                  imageUrl={panoramicUrl}
                  height="600px"
                  visible={activeTab === "panoramic" && isOpen}
                  className="rounded-xl overflow-hidden shadow-2xl border-4 border-primary/20"
                  onReady={() => console.log('Panorama loaded for:', accommodation.name)}
                  onError={(err) => console.error('Panorama error:', err)}
                />
                <div className="text-center space-y-2">
                  <p className="text-lg font-semibold">Interactive 360° Tour</p>
                  <div className="flex justify-center gap-8 text-sm text-muted-foreground">
                    <span>Click & drag to look around</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full rounded-xl bg-muted p-16 text-center border-2 border-dashed">
                <div className="text-6xl mb-4">🚫</div>
                <p className="text-xl font-semibold text-muted-foreground">No 360° view available</p>
                <p className="text-sm text-muted-foreground mt-2">Please check the regular images in the Booking Details tab</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
