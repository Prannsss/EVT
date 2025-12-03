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
import { Plus, Minus, Clock, Calendar, Loader2, AlertCircle, Info, Droplet, Sparkles, Check } from "lucide-react"
import Accommodation3D from "./Accommodation3D"
import { API_URL } from "@/lib/utils";
import Swal from 'sweetalert2';
import { useAvailability } from "@/hooks/use-availability";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import BookingConfirmationModal from "./BookingConfirmationModal";

interface Accommodation {
  id: number;
  name: string;
  type: 'room' | 'cottage';
  description: string;
  capacity: string;
  price: number | string;
  add_price?: number | string | null;
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
    kids: number;
    pwd: number;
    senior: number;
  };
  swimming: {
    adult: number;
    kids: number;
    pwd: number;
    senior: number;
  };
  night_swimming: {
    per_head: number;
  };
}

export default function BookingModal({ accommodation, isOpen, onClose }: BookingModalProps) {
  const router = useRouter()
  const { checkRegularAvailability, getUnavailableDates, getEventConflicts } = useAvailability()
  
  const [adultCount, setAdultCount] = useState(0)
  const [kidCount, setKidCount] = useState(0)
  const [pwdCount, setPwdCount] = useState(0)
  const [seniorCount, setSeniorCount] = useState(0)
  const [adultSwimming, setAdultSwimming] = useState(0)
  const [kidSwimming, setKidSwimming] = useState(0)
  const [pwdSwimming, setPwdSwimming] = useState(0)
  const [seniorSwimming, setSeniorSwimming] = useState(0)
  const [overnightStay, setOvernightStay] = useState(false)
  const [overnightSwimming, setOvernightSwimming] = useState(false)
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null)
  const [proofOfPaymentPreview, setProofOfPaymentPreview] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("details")
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined)
  const [bookingTime, setBookingTime] = useState("09:00")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Availability state
  const [unavailableDates, setUnavailableDates] = useState<string[]>([])
  const [partiallyAvailableDates, setPartiallyAvailableDates] = useState<Map<string, string[]>>(new Map())
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null)
  const [availabilityType, setAvailabilityType] = useState<'info' | 'warning' | 'error'>('info')
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>(['morning', 'afternoon', 'whole_day'])
  
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
          entrance: { adult: 70, kids: 50, pwd: 50, senior: 50 },
          swimming: { adult: 80, kids: 50, pwd: 50, senior: 50 },
          night_swimming: { per_head: 200 },
        }

        settings.forEach((setting: any) => {
          if (setting.category === 'entrance') {
            grouped.entrance[setting.type as 'adult' | 'kids' | 'pwd' | 'senior'] = Number(setting.price)
          } else if (setting.category === 'swimming') {
            grouped.swimming[setting.type as 'adult' | 'kids' | 'pwd' | 'senior'] = Number(setting.price)
          } else if (setting.category === 'night_swimming') {
            grouped.night_swimming.per_head = Number(setting.price)
          }
        })

        setPricing(grouped)
      } catch (error) {
        console.error('Error fetching pricing:', error)
        // Use default values on error
        setPricing({
          entrance: { adult: 70, kids: 50, pwd: 50, senior: 50 },
          swimming: { adult: 80, kids: 50, pwd: 50, senior: 50 },
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

  // Fetch unavailable dates when modal opens
  useEffect(() => {
    const fetchUnavailableDates = async () => {
      if (!isOpen || !accommodation) return
      
      const today = new Date()
      const threeMonthsLater = new Date()
      threeMonthsLater.setMonth(today.getMonth() + 3)
      
      const startDate = today.toISOString().split('T')[0]
      const endDate = threeMonthsLater.toISOString().split('T')[0]
      
      const result = await getUnavailableDates(accommodation.id, startDate, endDate)
      
      if (result) {
        setUnavailableDates(result.dates)
        
        // Store partially available dates
        const partialMap = new Map<string, string[]>()
        result.partiallyAvailable.forEach(item => {
          partialMap.set(item.date, item.availableSlots)
        })
        setPartiallyAvailableDates(partialMap)
      }
    }
    
    fetchUnavailableDates()
  }, [isOpen, accommodation, getUnavailableDates])

  // Check availability when date changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (!bookingDate || !accommodation) {
        setAvailabilityMessage(null)
        setAvailableTimeSlots(['morning', 'afternoon', 'whole_day'])
        return
      }
      
      setCheckingAvailability(true)
      
      // Format date properly to avoid timezone offset issues
      const year = bookingDate.getFullYear()
      const month = String(bookingDate.getMonth() + 1).padStart(2, '0')
      const day = String(bookingDate.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      
      // First check event conflicts
      const eventConflicts = await getEventConflicts(dateStr)
      
      if (eventConflicts) {
        if (eventConflicts.hasWholeDay) {
          setAvailabilityMessage('⚠️ This date is reserved for a whole-day event. Please select another date.')
          setAvailabilityType('error')
          setAvailableTimeSlots([])
          setCheckingAvailability(false)
          return
        }
        
        if (eventConflicts.hasMorning && eventConflicts.hasEvening) {
          setAvailabilityMessage('⚠️ This date has both morning and evening events. Please select another date.')
          setAvailabilityType('error')
          setAvailableTimeSlots([])
          setCheckingAvailability(false)
          return
        }
        
        if (eventConflicts.hasMorning) {
          setAvailabilityMessage('ℹ️ Only afternoon slot (1:00 PM - 5:00 PM) is available due to a morning event.')
          setAvailabilityType('info')
          setAvailableTimeSlots(['afternoon'])
        } else if (eventConflicts.hasEvening) {
          setAvailabilityMessage('ℹ️ Only morning slot (9:00 AM - 12:00 PM) is available due to an evening event.')
          setAvailabilityType('info')
          setAvailableTimeSlots(['morning'])
        } else {
          // No event conflicts, check regular bookings
          const result = await checkRegularAvailability(accommodation.id, dateStr)
          
          if (result && !result.available) {
            setAvailabilityMessage(`⚠️ ${result.reason || 'This date is not available'}`)
            setAvailabilityType('error')
            setAvailableTimeSlots([])
          } else {
            setAvailabilityMessage('✅ This date is available!')
            setAvailabilityType('info')
            setAvailableTimeSlots(['morning', 'afternoon', 'whole_day'])
          }
        }
      }
      
      setCheckingAvailability(false)
    }
    
    checkAvailability()
  }, [bookingDate, accommodation, getEventConflicts, checkRegularAvailability])

  // Generate time options based on available slots
  const timeOptions = useMemo(() => {
    const options = []
    
    // Determine which hours to show based on available slots
    const showMorning = availableTimeSlots.includes('morning') || availableTimeSlots.includes('whole_day')
    const showAfternoon = availableTimeSlots.includes('afternoon') || availableTimeSlots.includes('whole_day')
    
    for (let hour = 9; hour <= 17; hour++) {
      // Morning: 9 AM - 12 PM
      const isMorning = hour >= 9 && hour < 13
      // Afternoon: 1 PM - 5 PM  
      const isAfternoon = hour >= 13 && hour <= 17
      
      // Skip if slot is not available
      if ((isMorning && !showMorning) || (isAfternoon && !showAfternoon)) {
        continue
      }
      
      const time24 = `${hour.toString().padStart(2, '0')}:00`
      const hour12 = hour > 12 ? hour - 12 : hour
      const period = hour >= 12 ? 'PM' : 'AM'
      const time12Format = `${hour12}:00 ${period}`
      
      let label = time12Format
      if (isMorning && availableTimeSlots.includes('morning') && !availableTimeSlots.includes('whole_day')) {
        label += ' (Morning slot only)'
      } else if (isAfternoon && availableTimeSlots.includes('afternoon') && !availableTimeSlots.includes('whole_day')) {
        label += ' (Afternoon slot only)'
      }
      
      options.push({ value: time24, label })
    }
    
    return options
  }, [availableTimeSlots])

  // Calculate total price dynamically
  const totalPrice = useMemo(() => {
    if (!accommodation || !pricing) return 0

    let total = 0

    // For rooms with overnight stay, use add_price (whole day price) instead of base price
    if (accommodation.type === 'room' && overnightStay && accommodation.add_price) {
      total += Number(accommodation.add_price)
    } else {
      // Add accommodation base price (ensure it's a number)
      total += Number(accommodation.price)
    }

    // Add entrance fees only
    total += adultCount * pricing.entrance.adult
    total += kidCount * pricing.entrance.kids
    total += pwdCount * pricing.entrance.pwd
    total += seniorCount * pricing.entrance.senior

    // Add swimming fees based on checkboxes
    total += adultSwimming * pricing.swimming.adult
    total += kidSwimming * pricing.swimming.kids
    total += pwdSwimming * pricing.swimming.pwd
    total += seniorSwimming * pricing.swimming.senior

    // Add overnight swimming fee (only for cottages) - based on guests who are swimming
    if (overnightSwimming && accommodation.type === 'cottage') {
      total += (adultSwimming + kidSwimming + pwdSwimming + seniorSwimming) * pricing.night_swimming.per_head
    }

    return total
  }, [accommodation, pricing, adultCount, kidCount, pwdCount, seniorCount, adultSwimming, kidSwimming, pwdSwimming, seniorSwimming, overnightSwimming, overnightStay])

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
    // Check if user is logged in by checking localStorage
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const isLoggedIn = !!(token && userStr);

    if (!isLoggedIn) {
      // Store booking data in sessionStorage
      const bookingData = {
        accommodationId: accommodation?.id,
        accommodationName: accommodation?.name,
        adults: adultCount,
        kids: kidCount,
        pwd: pwdCount,
        senior: seniorCount,
        overnightStay,
        overnightSwimming,
        bookingTime,
        totalPrice,
        timestamp: new Date().toISOString()
      }
      sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData))
      
      // Redirect to signup/login
      Swal.fire({
        title: "Login Required",
        text: "Please sign up or log in to complete your booking",
        icon: "info",
        confirmButtonColor: "#3b82f6",
      });
      router.push('/signup')
      return
    }

    // Validate required fields
    if (!bookingDate) {
      Swal.fire({
        title: "Missing Information",
        text: "Please select a booking date",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
      });
      return
    }

    if (adultCount + kidCount + pwdCount + seniorCount === 0) {
      Swal.fire({
        title: "Missing Information",
        text: "Please add at least one guest",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
      });
      return
    }

    if (!proofOfPayment) {
      Swal.fire({
        title: "Payment Proof Required",
        text: "Please upload proof of payment to proceed",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
      });
      return
    }

    // Open confirmation modal instead of submitting directly
    setIsConfirmationModalOpen(true)
  }

  const handleConfirmSubmit = async () => {
    try {
      setIsSubmitting(true)
      const token = localStorage.getItem('token');

      // Create FormData for multipart/form-data request
      const formData = new FormData()
      formData.append('accommodation_id', accommodation!.id.toString())
      
      // Format date properly to avoid timezone offset issues
      const year = bookingDate!.getFullYear()
      const month = String(bookingDate!.getMonth() + 1).padStart(2, '0')
      const day = String(bookingDate!.getDate()).padStart(2, '0')
      const localDateString = `${year}-${month}-${day}`
      
      formData.append('check_in_date', localDateString)
      formData.append('booking_time', bookingTime + ':00') // Convert HH:mm to HH:mm:ss
      formData.append('adults', adultCount.toString())
      formData.append('kids', kidCount.toString())
      formData.append('pwd', pwdCount.toString())
      formData.append('senior', seniorCount.toString())
      formData.append('adult_swimming', adultSwimming.toString())
      formData.append('kid_swimming', kidSwimming.toString())
      formData.append('pwd_swimming', pwdSwimming.toString())
      formData.append('senior_swimming', seniorSwimming.toString())
      formData.append('overnight_stay', overnightStay.toString())
      formData.append('overnight_swimming', overnightSwimming.toString())
      formData.append('total_price', totalPrice.toString())
      formData.append('proof_of_payment', proofOfPayment!)

      // Send booking to API
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create booking')
      }

      Swal.fire({
        title: "Booking Submitted Successfully! 🎉",
        text: `Your booking for ₱${totalPrice.toLocaleString('en-PH')} has been submitted. Please wait for admin confirmation.`,
        icon: "success",
        confirmButtonColor: "#10b981",
      });
      
      // Close both modals
      setIsConfirmationModalOpen(false)
      handleClose()
      
      // Optionally redirect to bookings page
      setTimeout(() => router.push('/client/accommodations'), 1000)
    } catch (error) {
      console.error('Booking error:', error)
      Swal.fire({
        title: "Booking Failed",
        text: error instanceof Error ? error.message : 'Failed to submit booking. Please try again.',
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setAdultCount(0)
    setKidCount(0)
    setPwdCount(0)
    setSeniorCount(0)
    setAdultSwimming(0)
    setKidSwimming(0)
    setPwdSwimming(0)
    setSeniorSwimming(0)
    setOvernightStay(false)
    setOvernightSwimming(false)
    setProofOfPayment(null)
    setProofOfPaymentPreview(null)
    setBookingDate(undefined)
    setBookingTime("09:00")
    setCurrentImageIndex(0)
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
          <DialogHeader>
            <DialogTitle>Loading</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Loading pricing information...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Handle multiple images stored as JSON array or single image string
  let imageUrls: string[] = ['/placeholder-room.svg'];
  try {
    if (accommodation.image_url) {
      // Try to parse as JSON array
      const parsedImages = JSON.parse(accommodation.image_url);
      if (Array.isArray(parsedImages) && parsedImages.length > 0) {
        imageUrls = parsedImages.map(img => 
          img.startsWith('http') ? img : `${API_URL}${img}`
        );
      } else {
        throw new Error('Not an array');
      }
    }
  } catch {
    // If not JSON, treat as single image path
    if (accommodation.image_url) {
      const singleImage = accommodation.image_url.startsWith('http') 
        ? accommodation.image_url 
        : `${API_URL}${accommodation.image_url}`;
      imageUrls = [singleImage];
    }
  }

  const handlePreviousImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

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
              <div className="relative w-full aspect-[4/3] group/image">
                <Image
                  src={imageUrls[currentImageIndex]}
                  alt={`${accommodation.name} - Image ${currentImageIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{objectFit: "cover"}}
                  priority
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-room.svg';
                  }}
                />
                
                {/* Navigation Arrows - Only show if multiple images */}
                {imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 z-10"
                      aria-label="Previous image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 z-10"
                      aria-label="Next image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Image Counter */}
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      {currentImageIndex + 1} / {imageUrls.length}
                    </div>
                  </>
                )}
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
                  <p className="text-sm font-bold mb-3 text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Inclusions:
                  </p>
                  <ul className="space-y-2">
                    {inclusionsList.map((item, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <Check className="mr-2 h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <Label className="text-sm font-medium">PWD</Label>
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

              {/* Senior */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Senior</Label>
                  <p className="text-xs text-muted-foreground">With ID</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setSeniorCount(Math.max(0, seniorCount - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{seniorCount}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setSeniorCount(seniorCount + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Swimming Fee Checkboxes */}
          {(adultCount > 0 || kidCount > 0 || pwdCount > 0 || seniorCount > 0) && (
            <div className="mb-6">
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Droplet className="h-5 w-5 text-blue-500" />
                Swimming Add-ons
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Select which guests will be swimming (₱{pricing?.swimming.adult} per adult, ₱{pricing?.swimming.kids} per kid, ₱{pricing?.swimming.pwd} per PWD, ₱{pricing?.swimming.senior} per senior)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Adult Swimming */}
                {adultCount > 0 && (
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-semibold">Adult Swimming</Label>
                      <span className="text-xs text-muted-foreground">₱{pricing?.swimming.adult} each</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setAdultSwimming(Math.max(0, adultSwimming - 1))}
                        disabled={adultSwimming === 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-16 text-center font-medium">
                        {adultSwimming} / {adultCount}
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setAdultSwimming(Math.min(adultCount, adultSwimming + 1))}
                        disabled={adultSwimming >= adultCount}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Subtotal: ₱{(adultSwimming * (pricing?.swimming.adult || 0)).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Kid Swimming */}
                {kidCount > 0 && (
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-semibold">Kid Swimming</Label>
                      <span className="text-xs text-muted-foreground">₱{pricing?.swimming.kids} each</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setKidSwimming(Math.max(0, kidSwimming - 1))}
                        disabled={kidSwimming === 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-16 text-center font-medium">
                        {kidSwimming} / {kidCount}
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setKidSwimming(Math.min(kidCount, kidSwimming + 1))}
                        disabled={kidSwimming >= kidCount}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Subtotal: ₱{(kidSwimming * (pricing?.swimming.kids || 0)).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* PWD Swimming */}
                {pwdCount > 0 && (
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-semibold">PWD Swimming</Label>
                      <span className="text-xs text-muted-foreground">₱{pricing?.swimming.pwd} each</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPwdSwimming(Math.max(0, pwdSwimming - 1))}
                        disabled={pwdSwimming === 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-16 text-center font-medium">
                        {pwdSwimming} / {pwdCount}
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPwdSwimming(Math.min(pwdCount, pwdSwimming + 1))}
                        disabled={pwdSwimming >= pwdCount}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Subtotal: ₱{(pwdSwimming * (pricing?.swimming.pwd || 0)).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Senior Swimming */}
                {seniorCount > 0 && (
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-semibold">Senior Swimming</Label>
                      <span className="text-xs text-muted-foreground">₱{pricing?.swimming.senior} each</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setSeniorSwimming(Math.max(0, seniorSwimming - 1))}
                        disabled={seniorSwimming === 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-16 text-center font-medium">
                        {seniorSwimming} / {seniorCount}
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setSeniorSwimming(Math.min(seniorCount, seniorSwimming + 1))}
                        disabled={seniorSwimming >= seniorCount}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Subtotal: ₱{(seniorSwimming * (pricing?.swimming.senior || 0)).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

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
                      disabled={(date) => {
                        // Disable past dates
                        if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
                          return true
                        }
                        
                        // Disable dates with whole-day events or fully booked
                        const dateStr = date.toISOString().split('T')[0]
                        return unavailableDates.includes(dateStr)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Choose your booking date
                </p>
                
                {/* Availability Message */}
                {checkingAvailability && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Checking availability...</span>
                  </div>
                )}
                
                {!checkingAvailability && availabilityMessage && (
                  <Alert variant={availabilityType === 'error' ? 'destructive' : 'default'} className="mt-2">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {availabilityMessage}
                    </AlertDescription>
                  </Alert>
                )}
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

          {/* Checkboxes for Overnight Options - Show based on accommodation type */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4">Additional Options</h4>
            <div className="space-y-3">
              {/* Overnight Stay - Only for Rooms */}
              {accommodation.type === 'room' && accommodation.add_price && (
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
                    Overnight Stay (Whole Day - ₱{Number(accommodation.add_price).toLocaleString('en-PH')})
                  </Label>
                </div>
              )}
              
              {/* Overnight Swimming - Only for Cottages */}
              {accommodation.type === 'cottage' && (
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
              )}
              
              {/* Show message if no additional options available */}
              {accommodation.type === 'room' && !accommodation.add_price && (
                <p className="text-sm text-muted-foreground">No additional options available for this accommodation.</p>
              )}
            </div>
          </div>

          {/* Payment Section */}
          <div className="mb-6 border-t pt-6">
            <h4 className="text-lg font-semibold mb-4">Payment Summary</h4>
            
            {/* Price Breakdown */}
            <div className="mb-4 p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  Accommodation ({accommodation.name})
                  {accommodation.type === 'room' && overnightStay && accommodation.add_price && ' - Whole Day'}
                </span>
                <span className="font-medium">
                  ₱{(accommodation.type === 'room' && overnightStay && accommodation.add_price 
                    ? Number(accommodation.add_price) 
                    : Number(accommodation.price)
                  ).toFixed(2)}
                </span>
              </div>
              
              {adultCount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Adults ({adultCount}) - Entrance Fee</span>
                  <span className="font-medium">
                    ₱{(adultCount * pricing.entrance.adult).toFixed(2)}
                  </span>
                </div>
              )}
              
              {kidCount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Kids ({kidCount}) - Entrance Fee</span>
                  <span className="font-medium">
                    ₱{(kidCount * pricing.entrance.kids).toFixed(2)}
                  </span>
                </div>
              )}
              
              {pwdCount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>PWD ({pwdCount}) - Entrance Fee</span>
                  <span className="font-medium">
                    ₱{(pwdCount * pricing.entrance.pwd).toFixed(2)}
                  </span>
                </div>
              )}
              
              {seniorCount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Senior ({seniorCount}) - Entrance Fee</span>
                  <span className="font-medium">
                    ₱{(seniorCount * pricing.entrance.senior).toFixed(2)}
                  </span>
                </div>
              )}

              {adultSwimming > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Adults ({adultSwimming}) - Swimming Fee</span>
                  <span className="font-medium">
                    ₱{(adultSwimming * pricing.swimming.adult).toFixed(2)}
                  </span>
                </div>
              )}

              {kidSwimming > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Kids ({kidSwimming}) - Swimming Fee</span>
                  <span className="font-medium">
                    ₱{(kidSwimming * pricing.swimming.kids).toFixed(2)}
                  </span>
                </div>
              )}

              {pwdSwimming > 0 && (
                <div className="flex justify-between text-sm">
                  <span>PWD ({pwdSwimming}) - Swimming Fee</span>
                  <span className="font-medium">
                    ₱{(pwdSwimming * pricing.swimming.pwd).toFixed(2)}
                  </span>
                </div>
              )}

              {seniorSwimming > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Senior ({seniorSwimming}) - Swimming Fee</span>
                  <span className="font-medium">
                    ₱{(seniorSwimming * pricing.swimming.senior).toFixed(2)}
                  </span>
                </div>
              )}
              
              {overnightSwimming && accommodation.type === 'cottage' && (adultSwimming + kidSwimming + pwdSwimming + seniorSwimming) > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Night Swimming ({adultSwimming + kidSwimming + pwdSwimming + seniorSwimming} guests)</span>
                  <span className="font-medium">
                    ₱{((adultSwimming + kidSwimming + pwdSwimming + seniorSwimming) * pricing.night_swimming.per_head).toFixed(2)}
                  </span>
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
            disabled={
              !bookingDate || 
              adultCount + kidCount + pwdCount === 0 || 
              !proofOfPayment || 
              availabilityType === 'error' ||
              availableTimeSlots.length === 0 ||
              checkingAvailability
            }
          >
            {checkingAvailability ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking Availability...
              </>
            ) : (
              `Book Now - ₱${totalPrice.toFixed(2)}`
            )}
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
          {bookingDate && availableTimeSlots.length === 0 && (
            <p className="text-sm text-center text-destructive mt-2">
              This date is not available. Please select another date.
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

        {/* Booking Confirmation Modal */}
        <BookingConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={() => setIsConfirmationModalOpen(false)}
          onConfirm={handleConfirmSubmit}
          totalPrice={totalPrice}
          isLoading={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}
