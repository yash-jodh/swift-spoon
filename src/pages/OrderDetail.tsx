import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/services/api';
import { format } from 'date-fns';
import QRCode from 'qrcode';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { useToast } from '@/hooks/use-toast';

import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  UtensilsCrossed,
  Truck,
  ChefHat,
  PackageCheck,
  QrCode as QrCodeIcon,
  Copy,
} from 'lucide-react';

/* ---------------- STATUS CONFIG ---------------- */

const statusSteps = [
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { id: 'preparing', label: 'Preparing', icon: ChefHat },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: PackageCheck },
];

const statusColors: Record<string, string> = {
  pending: 'bg-warning text-warning-foreground',
  confirmed: 'bg-info text-info-foreground',
  preparing: 'bg-info text-info-foreground',
  out_for_delivery: 'bg-primary text-primary-foreground',
  delivered: 'bg-success text-success-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const paymentMethodLabels: Record<string, string> = {
  cash: 'Cash on Delivery',
  card: 'Credit/Debit Card',
  upi: 'UPI',
};

/* ---------------- RAZORPAY LOADER ---------------- */

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/* ---------------- STATUS TIMELINE ---------------- */

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = statusSteps.findIndex((s) => s.id === currentStatus);

  if (currentStatus === 'cancelled') {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg bg-destructive/10 p-4">
        <XCircle className="h-6 w-6 text-destructive" />
        <span className="font-medium text-destructive">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      {statusSteps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index <= currentIndex;

        return (
          <div key={step.id} className="flex flex-1 flex-col items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                isCompleted ? 'bg-primary text-white' : 'bg-muted'
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [upiLink, setUpiLink] = useState('');

  /* ---------- FETCH ORDER ---------- */

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id!),
    enabled: !!id,
    refetchInterval: 30000,
  });

  const order = data?.order;

  /* ---------- HELPER: CHECK PAYMENT STATUS ---------- */
  
  const isPaymentCompleted = (status: string | undefined) => {
    if (!status) return false;
    return status === 'completed' || status === 'paid';
  };

  /* ---------- CHECK IF PAYMENT NEEDED ---------- */
  
  const needsPayment = order && 
    (order.paymentMethod === 'card' || order.paymentMethod === 'upi') &&
    order.paymentStatus === 'pending';

  /* ---------- SAFE ADDRESS FORMAT ---------- */

  const formattedAddress = order?.deliveryAddress
    ? [
        order.deliveryAddress.street,
        order.deliveryAddress.city,
        order.deliveryAddress.state,
        order.deliveryAddress.zipCode,
      ]
        .filter(Boolean)
        .join(', ')
    : 'Address not available';

  /* ---------- GENERATE UPI QR CODE ---------- */

  const generateUPIQR = async () => {
    if (!order) return;

    try {
      // UPI payment link format
      const upiId = '8767791904@upi'; // Replace with your actual UPI ID
      const name = 'FoodDash';
      const amount = order.totalAmount.toFixed(2);
      const transactionNote = `Order ${order.orderNumber}`;
      
      const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&tn=${encodeURIComponent(transactionNote)}`;
      
      setUpiLink(upiString);

      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(upiString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      setQrCodeUrl(qrDataUrl);
      setShowQRDialog(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate QR code',
        variant: 'destructive',
      });
    }
  };

  /* ---------- COPY UPI LINK ---------- */

  const copyUPILink = () => {
    navigator.clipboard.writeText(upiLink);
    toast({
      title: 'Copied!',
      description: 'UPI link copied to clipboard',
    });
  };

  /* ---------- HANDLE PAYMENT ---------- */

  const handlePayNow = async () => {
    if (!order) return;

    // If UPI, show QR code option
    if (order.paymentMethod === 'upi') {
      const choice = confirm('Choose payment method:\nOK = Razorpay UPI\nCancel = Show QR Code');
      
      if (!choice) {
        generateUPIQR();
        return;
      }
    }

    try {
      setIsProcessingPayment(true);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast({
          title: 'Error',
          description: 'Failed to load payment gateway',
          variant: 'destructive',
        });
        setIsProcessingPayment(false);
        return;
      }

      console.log('Creating payment order for:', order._id, 'Amount:', order.totalAmount);

      // Create Razorpay order
      const response = await fetch('http://localhost:5000/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount: order.totalAmount,
          orderId: order._id,
        }),
      });

      const responseText = await response.text();
      console.log('Payment response:', responseText);

      let paymentData;
      try {
        paymentData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid response from server');
      }
      
      if (!paymentData.success) {
        throw new Error(paymentData.message || 'Failed to create payment order');
      }

      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');

      // Razorpay payment options
      const options = {
        key: paymentData.key,
        amount: paymentData.order.amount,
        currency: paymentData.order.currency,
        name: 'FoodDash',
        description: `Order #${order.orderNumber}`,
        order_id: paymentData.order.id,
        handler: async (response: any) => {
          // Payment successful - verify on backend
          try {
            const verifyResponse = await fetch('http://localhost:5000/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order._id,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              toast({
                title: 'Payment Successful!',
                description: 'Your order has been confirmed',
              });
              
              // Refresh order data
              refetch();
              queryClient.invalidateQueries({ queryKey: ['orders'] });
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            toast({
              title: 'Verification Failed',
              description: 'Payment verification failed. Please contact support.',
              variant: 'destructive',
            });
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: userData.name || '',
          email: userData.email || '',
          contact: userData.phone || '',
        },
        theme: {
          color: '#FF6B6B',
        },
        modal: {
          ondismiss: () => {
            toast({
              title: 'Payment Cancelled',
              description: 'You cancelled the payment',
            });
            setIsProcessingPayment(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      
      razorpay.on('payment.failed', (response: any) => {
        toast({
          title: 'Payment Failed',
          description: response.error.description || 'Payment was not completed',
          variant: 'destructive',
        });
        setIsProcessingPayment(false);
      });

      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Failed to initiate payment',
        variant: 'destructive',
      });
      setIsProcessingPayment(false);
    }
  };

  /* ---------- CANCEL ORDER ---------- */

  const canCancel = order && ['pending', 'confirmed'].includes(order.status);

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast({
        title: 'Reason required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCancelling(true);
      await ordersApi.cancel(id!, cancelReason);

      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      toast({ title: 'Order cancelled' });
    } catch (err: any) {
      toast({
        title: 'Failed to cancel',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  /* ---------- LOADING ---------- */

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-40 mb-6" />
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  /* ---------- NOT FOUND ---------- */

  if (!order) {
    return (
      <div className="container py-12 text-center">
        <Package className="mx-auto h-16 w-16 text-muted-foreground/40" />
        <h2 className="text-xl font-semibold mt-4">Order not found</h2>
        <Button asChild className="mt-4">
          <Link to="/orders">View Orders</Link>
        </Button>
      </div>
    );
  }

  /* ---------- UI ---------- */

  return (
    <div className="container py-8">

      <Button variant="ghost" onClick={() => navigate('/orders')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* HEADER */}
      <div className="flex justify-between items-center mt-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            Order #{order.orderNumber}
          </h1>

          <Badge className={statusColors[order.status]}>
            {statusLabels[order.status]}
          </Badge>
        </div>

        {canCancel && !needsPayment && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Cancel Order</Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                <AlertDialogDescription>
                  Provide cancellation reason
                </AlertDialogDescription>
              </AlertDialogHeader>

              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
              />

              <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>

                <AlertDialogAction
                  onClick={handleCancel}
                  disabled={isCancelling}
                >
                  {isCancelling && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* PAYMENT PENDING ALERT */}
      {needsPayment && (
        <Card className="mb-6 border-warning bg-warning/10">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-warning" />
                <div>
                  <h3 className="font-semibold">Payment Pending</h3>
                  <p className="text-sm text-muted-foreground">
                    Your order is waiting for payment. Complete payment to confirm your order.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {order.paymentMethod === 'upi' && (
                  <Button
                    onClick={generateUPIQR}
                    variant="outline"
                    disabled={isProcessingPayment}
                  >
                    <QrCodeIcon className="mr-2 h-4 w-4" />
                    Show QR
                  </Button>
                )}
                <Button
                  onClick={handlePayNow}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Pay Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* UPI QR CODE DIALOG */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR to Pay</DialogTitle>
            <DialogDescription>
              Scan this QR code with any UPI app to complete payment
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4">
            {qrCodeUrl && (
              <img 
                src={qrCodeUrl} 
                alt="UPI QR Code" 
                className="w-64 h-64 border-2 border-gray-300 rounded-lg"
              />
            )}
            
            <div className="w-full space-y-2">
              <p className="text-center text-lg font-semibold">
                Amount: ₹{order.totalAmount.toFixed(2)}
              </p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={upiLink}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border rounded bg-muted"
                />
                <Button onClick={copyUPILink} size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-xs text-center text-muted-foreground">
                After payment, please wait for confirmation or contact support
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* STATUS */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusTimeline currentStatus={order.status} />
        </CardContent>
      </Card>

      {/* REST OF THE COMPONENT - SAME AS BEFORE */}
      {/* (Restaurant, Address, Items, Payment Summary sections remain the same) */}

      {/* RESTAURANT */}
      {order.restaurant && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5" />
              Restaurant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {order.restaurant.image && (
                <img
                  src={order.restaurant.image}
                  alt={order.restaurant.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}
              <div>
                <p className="font-semibold">
                  {order.restaurant.name}
                </p>
                {order.restaurant.phone && (
                  <p className="text-sm flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" /> 
                    {order.restaurant.phone}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DELIVERY ADDRESS */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Delivery Address
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm">
            {formattedAddress}
          </p>
        </CardContent>
      </Card>

      {/* ITEMS */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {order.items?.map((item: any, index: number) => (
            <div key={item.menuItem?._id || index}>
              {index > 0 && <Separator className="my-4" />}
              <div className="flex items-center justify-between gap-4">
                {item.menuItem?.image && (
                  <img
                    src={item.menuItem.image}
                    alt={item.name || item.menuItem.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold">
                    {item.name || item.menuItem?.name || 'Item'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ₹{item.price?.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">
                  ₹{((item.price || 0) * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* PAYMENT & SUMMARY */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Payment Method & Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium">
                {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Payment Status</span>
              <Badge
                variant={isPaymentCompleted(order.paymentStatus) ? 'default' : 'secondary'}
                className={isPaymentCompleted(order.paymentStatus) ? 'bg-success' : ''}
              >
                {isPaymentCompleted(order.paymentStatus) ? (
                  <CheckCircle className="mr-1 h-3 w-3" />
                ) : (
                  <Clock className="mr-1 h-3 w-3" />
                )}
                {order.paymentStatus}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Price Breakdown */}
          <div className="space-y-2">
            {order.subtotal !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
            )}
            
            {order.deliveryFee !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>₹{order.deliveryFee.toFixed(2)}</span>
              </div>
            )}
            
            {order.tax !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>₹{order.tax.toFixed(2)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">
                ₹{order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Pay Now Button (if payment needed) */}
          {needsPayment && (
            <>
              <Separator />
              <div className="space-y-2">
                <Button
                  onClick={handlePayNow}
                  disabled={isProcessingPayment}
                  className="w-full"
                  size="lg"
                >
                  {isProcessingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay ₹{order.totalAmount.toFixed(2)}
                </Button>
                
                {order.paymentMethod === 'upi' && (
                  <Button
                    onClick={generateUPIQR}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <QrCodeIcon className="mr-2 h-4 w-4" />
                    Generate UPI QR Code
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Estimated Delivery */}
          {order.estimatedDeliveryTime && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Estimated Delivery</span>
                </div>
                <p className="mt-1 font-medium">
                  {format(new Date(order.estimatedDeliveryTime), 'MMM d, h:mm a')}
                </p>
              </div>
            </>
          )}

          {/* Special Instructions */}
          {order.specialInstructions && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm font-medium mb-1">Special Instructions</p>
                <p className="text-sm text-muted-foreground">
                  {order.specialInstructions}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

    </div>
  );
}