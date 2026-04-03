import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, TrendingUp, Package, Truck, CheckCircle2, Clock,
  XCircle, Eye, Calendar, MapPin, Filter, Search, Loader2, Copy, Check, Download,
  ArrowUpRight, ArrowDownLeft, BarChart3, CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import PaymentDialog from "@/components/PaymentDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { jsPDF } from "jspdf";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

interface Order {
  id: string;
  rawId: string;
  item: string;
  category: string;
  quantity: string;
  total: number;
  date: string;
  status: OrderStatus;
  counterparty: string;
  location: string;
  trackingId?: string;
  paymentStatus?: "paid" | "pending" | "cod";
}

const statusConfig: Record<
  OrderStatus,
  { label: string; icon: React.ElementType; color: string }
> = {
  pending:   { label: "Pending",   icon: Clock,        color: "bg-warning/15 text-warning" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "bg-info/15 text-info" },
  shipped:   { label: "Shipped",   icon: Truck,        color: "bg-accent/15 text-accent-foreground" },
  delivered: { label: "Delivered", icon: CheckCircle2, color: "bg-success/15 text-success" },
  cancelled: { label: "Cancelled", icon: XCircle,      color: "bg-destructive/15 text-destructive" },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  paid:    { label: "Paid",   color: "bg-success/15 text-success" },
  pending: { label: "Unpaid", color: "bg-warning/15 text-warning" },
  cod:     { label: "COD",    color: "bg-info/15 text-info" },
};

const progressSteps: { status: OrderStatus; label: string }[] = [
  { status: "pending",   label: "Ordered"   },
  { status: "confirmed", label: "Confirmed" },
  { status: "shipped",   label: "Shipped"   },
  { status: "delivered", label: "Delivered" },
];

const mySales: Order[] = [
  { id: "SL-2048", rawId: "SL-2048", item: "Premium Basmati Rice",    category: "Grain",     quantity: "200 qtl",  total: 420000, date: "2026-02-11", status: "confirmed", counterparty: "Delhi Grain Market",     location: "New Delhi",      paymentStatus: "pending" },
  { id: "SL-2041", rawId: "SL-2041", item: "Fresh Onions (Grade A)",  category: "Vegetable", quantity: "50 qtl",   total: 87500,  date: "2026-02-08", status: "shipped",   counterparty: "Metro Fresh Pvt Ltd",    location: "Mumbai, MH",     trackingId: "TRK77234", paymentStatus: "paid" },
  { id: "SL-2055", rawId: "SL-2055", item: "Organic Turmeric Powder", category: "Spice",     quantity: "10 qtl",   total: 95000,  date: "2026-02-12", status: "pending",   counterparty: "SpiceWorld Exports",     location: "Kochi, KL",      paymentStatus: "pending" },
  { id: "SL-2033", rawId: "SL-2033", item: "Soybean (FAQ Grade)",     category: "Grain",     quantity: "100 qtl",  total: 450000, date: "2026-02-03", status: "delivered", counterparty: "Agri Commodities Ltd",   location: "Indore, MP",     paymentStatus: "paid" },
  { id: "SL-2028", rawId: "SL-2028", item: "Cotton Bales",            category: "Fiber",     quantity: "30 bales", total: 180000, date: "2026-01-25", status: "delivered", counterparty: "Textile Hub",            location: "Ahmedabad, GJ",  paymentStatus: "paid" },
];

const summaryStats = [
  { icon: ShoppingCart, label: "Total Orders",    value: "24",     change: "+3 this month",       color: "text-info" },
  { icon: TrendingUp,   label: "Total Sales",     value: "₹12.3L", change: "+18% vs last month",  color: "text-success" },
  { icon: Package,      label: "Active Shipments",value: "5",      change: "2 arriving today",    color: "text-warning" },
  { icon: BarChart3,    label: "Avg Order Value",  value: "₹3,450", change: "+8% growth",          color: "text-accent-foreground" },
];

// ─────────────────────────────────────────────────────────────────────────────
// OrderCard
// ─────────────────────────────────────────────────────────────────────────────
function OrderCard({
  order,
  type,
  onCancel,
  isCancelling,
}: {
  order: Order;
  type: "order" | "sale";
  onCancel: (order: Order) => void;
  isCancelling: boolean;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const config    = statusConfig[order.status];
  const payConfig = paymentStatusConfig[order.paymentStatus || "pending"];
  const Icon      = type === "order" ? ArrowUpRight : ArrowDownLeft;
  const currentStepIdx = progressSteps.findIndex((s) => s.status === order.status);

  const copyToClipboard = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "Copied!", description: "Token ID copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    },
    [toast]
  );

  // ── INVOICE PDF ────────────────────────────────────────────────────────────
  const handleDownloadInvoice = useCallback(() => {
    const doc = new jsPDF({ format: "a4", orientation: "portrait" });

    const PAGE_W = doc.internal.pageSize.getWidth();   // 210
    const PAGE_H = doc.internal.pageSize.getHeight();  // 297
    const ML = 18;
    const MR = 18;
    const CW = PAGE_W - ML - MR; // 174

    const GREEN_DARK  : [number,number,number] = [30,  100, 40];
    const GREEN_MID   : [number,number,number] = [46,  125, 50];
    const GREEN_LIGHT : [number,number,number] = [232, 245, 233];
    const GRAY_DARK   : [number,number,number] = [40,  40,  40];
    const GRAY_MID    : [number,number,number] = [100, 100, 100];
    const GRAY_LIGHT  : [number,number,number] = [245, 245, 245];
    const WHITE       : [number,number,number] = [255, 255, 255];

    // ── HEADER BAND ─────────────────────────────────────────────
    doc.setFillColor(...GREEN_MID);
    doc.rect(0, 0, PAGE_W, 48, "F");

    // Logo circle
    doc.setFillColor(...GREEN_DARK);
    doc.circle(ML + 8, 24, 8, "F");
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("AC", ML + 5.2, 25.5);

    // Company name + tagline
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WHITE);
    doc.text("AGRI COMPANION", ML + 20, 20);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Mandi-to-Market Platform for Indian Farmers", ML + 20, 27);
    doc.text("support@agricompanion.in  |  www.agricompanion.in", ML + 20, 33);

    // INVOICE label — right side of header
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WHITE);
    doc.text("INVOICE", PAGE_W - MR, 22, { align: "right" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      type === "order" ? "PURCHASE INVOICE" : "SALES INVOICE",
      PAGE_W - MR, 30, { align: "right" }
    );

    // ── TWO-COLUMN INFO SECTION ──────────────────────────────────
    // Left: invoice details   |   Right: party details
    // Each column has its own Y tracker — they never share yPos
    let LY = 58; // left column Y
    let RY = 58; // right column Y
    const RX = PAGE_W / 2 + 5; // right column X start

    // Left heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY_DARK);
    doc.text("INVOICE DETAILS", ML, LY);
    LY += 5;

    const invoiceDetails: [string, string][] = [
      ["Invoice No.",    order.id],
      ["Date",           order.date],
      ["Order Status",   order.status.charAt(0).toUpperCase() + order.status.slice(1)],
      ["Payment Status", (order.paymentStatus || "pending").charAt(0).toUpperCase() + (order.paymentStatus || "pending").slice(1)],
    ];

    invoiceDetails.forEach(([label, value]) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...GRAY_MID);
      doc.text(label + ":", ML, LY);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...GRAY_DARK);
      doc.text(value, ML + 38, LY);
      LY += 5.5;
    });

    // Right heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY_DARK);
    doc.text(type === "order" ? "SELLER DETAILS" : "BUYER DETAILS", RX, RY);
    RY += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY_DARK);
    const partyLines = doc.splitTextToSize(order.counterparty, CW / 2 - 5) as string[];
    partyLines.forEach((line) => {
      doc.text(line, RX, RY);
      RY += 5;
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GRAY_MID);
    doc.text("Location : " + order.location, RX, RY); RY += 5;
    doc.text("Platform : KrishiGrow Marketplace", RX, RY); RY += 5;

    // ── HORIZONTAL DIVIDER ───────────────────────────────────────
    let Y = Math.max(LY, RY) + 6;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(ML, Y, PAGE_W - MR, Y);
    Y += 8;

    // ── ITEMS TABLE ──────────────────────────────────────────────
    // Column X positions
    const C_DESC  = ML;
    const C_CAT   = ML + 72;
    const C_QTY   = ML + 108;
    const C_NET   = ML + 130;
    const C_TOTAL = ML + 155;

    // Table header row
    doc.setFillColor(...GREEN_MID);
    doc.rect(ML, Y, CW, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...WHITE);
    doc.text("Description",  C_DESC  + 2, Y + 5.5);
    doc.text("Category",     C_CAT   + 2, Y + 5.5);
    doc.text("Qty",          C_QTY   + 2, Y + 5.5);
    doc.text("Net Amt",      C_NET   + 2, Y + 5.5);
    doc.text("Total (INR)",  C_TOTAL + 2, Y + 5.5);
    Y += 10;

    // Single data row
    const GST_RATE  = 0.05;
    const taxableAmt = order.total / (1 + GST_RATE);
    const gstAmt     = order.total - taxableAmt;

    // Alternating row background
    doc.setFillColor(...GREEN_LIGHT);
    doc.rect(ML, Y - 1, CW, 12, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GRAY_DARK);

    const descLines = doc.splitTextToSize(order.item, 66) as string[];
    descLines.forEach((line, i) => {
      doc.text(line, C_DESC + 2, Y + 4 + i * 4.5);
    });
    const rowH = Math.max(12, descLines.length * 4.5 + 5);

    doc.text(order.category, C_CAT  + 2, Y + 6);
    doc.text(order.quantity,  C_QTY  + 2, Y + 6);
    doc.text(
      "Rs." + taxableAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
      C_NET + 2, Y + 6
    );
    doc.text(
      "Rs." + taxableAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
      C_TOTAL + 2, Y + 6
    );
    Y += rowH + 4;

    // Table bottom border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(ML, Y, PAGE_W - MR, Y);
    Y += 8;

    // ── TOTALS BLOCK (right-aligned) ─────────────────────────────
    const TX = PAGE_W - MR - 82; // label start X
    const VX = PAGE_W - MR;      // value right-edge X

    const drawRow = (
      label: string,
      value: string,
      bold  = false,
      big   = false,
      color: [number,number,number] = GRAY_DARK
    ) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(big ? 10.5 : 8.5);
      doc.setTextColor(...color);
      doc.text(label, TX,  Y);
      doc.text(value, VX,  Y, { align: "right" });
      Y += big ? 8 : 6;
    };

    drawRow(
      "Subtotal (excl. GST) :",
      "Rs." + taxableAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })
    );
    drawRow(
      "GST @ 5% :",
      "Rs." + gstAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })
    );

    // Separator above grand total
    doc.setDrawColor(...GREEN_MID);
    doc.setLineWidth(0.5);
    doc.line(TX, Y - 1, PAGE_W - MR, Y - 1);
    Y += 2;

    // Grand total highlight band
    doc.setFillColor(...GREEN_LIGHT);
    doc.rect(TX - 3, Y - 3, PAGE_W - MR - TX + 5, 11, "F");
    drawRow(
      "TOTAL AMOUNT :",
      "Rs." + order.total.toLocaleString("en-IN"),
      true, true, GREEN_DARK
    );

    Y += 4;

    // ── SECTION DIVIDER ──────────────────────────────────────────
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(ML, Y, PAGE_W - MR, Y);
    Y += 7;

    // ── PAYMENT INFO + TERMS (two columns) ───────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY_DARK);
    doc.text("PAYMENT INFORMATION", ML, Y);
    doc.text("TERMS & CONDITIONS",  RX, Y);
    Y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY_MID);

    const payLines: string[] = [
      "Status  : " + (order.paymentStatus || "pending").toUpperCase(),
      "Method  : As per agreed terms",
      "Ref     : Quote Invoice No. in payment",
    ];

    const termLines: string[] = [
      "1. Invoice valid for 30 days from issue date.",
      "2. Goods remain property of Agri Companion",
      "   until full payment is received.",
      "3. Disputes subject to Indian jurisdiction.",
      "4. Computer-generated; no signature needed.",
    ];

    const maxRows = Math.max(payLines.length, termLines.length);
    for (let i = 0; i < maxRows; i++) {
      if (payLines[i])  doc.text(payLines[i],  ML, Y + i * 5);
      if (termLines[i]) doc.text(termLines[i], RX, Y + i * 5);
    }
    Y += maxRows * 5 + 8;

    // ── TRACKING ID (if present) ─────────────────────────────────
    if (order.trackingId) {
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(ML, Y, PAGE_W - MR, Y);
      Y += 6;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...GRAY_DARK);
      doc.text("Tracking ID :", ML, Y);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY_MID);
      doc.text(order.trackingId, ML + 32, Y);
      Y += 8;
    }

    // ── FOOTER BAND ──────────────────────────────────────────────
    doc.setFillColor(...GRAY_LIGHT);
    doc.rect(0, PAGE_H - 22, PAGE_W, 22, "F");

    doc.setDrawColor(...GREEN_MID);
    doc.setLineWidth(0.8);
    doc.line(0, PAGE_H - 22, PAGE_W, PAGE_H - 22);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...GREEN_DARK);
    doc.text("Agri Companion", ML, PAGE_H - 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY_MID);
    doc.text(
      "This is a computer-generated invoice and is valid without a physical signature.",
      PAGE_W / 2, PAGE_H - 14, { align: "center" }
    );
    doc.text(
      "Generated: " + new Date().toLocaleString("en-IN"),
      PAGE_W - MR, PAGE_H - 14, { align: "right" }
    );

    doc.setTextColor(160, 160, 160);
    doc.setFontSize(6.5);
    doc.text(
      "Agri Companion  |  support@agricompanion.in  |  www.agricompanion.in",
      PAGE_W / 2, PAGE_H - 8, { align: "center" }
    );

    doc.save(`Invoice_${order.id}_${Date.now()}.pdf`);

    toast({
      title: "Invoice Downloaded",
      description: `Invoice for ${order.id} saved successfully.`,
    });
  }, [order, type, toast]);
  // ── END INVOICE PDF ────────────────────────────────────────────

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "glass-card-hover rounded-xl p-5 group transition-all duration-300 relative overflow-hidden",
          order.status === "cancelled"
            ? "border-red-500/40 bg-red-500/[0.03] grayscale-[0.3]"
            : ""
        )}
      >
        {order.status === "cancelled" && (
          <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none bg-red-600/5 backdrop-blur-[1px]">
            <div className="border-[8px] border-red-600/20 text-red-600/20 px-10 py-4 rounded-3xl rotate-[-15deg] font-heading font-black text-6xl uppercase tracking-[0.3em] select-none whitespace-nowrap shadow-inner">
              Cancelled
            </div>
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                type === "order" ? "bg-info/10" : "bg-success/10"
              }`}
            >
              <Icon className={`w-5 h-5 ${type === "order" ? "text-info" : "text-success"}`} />
            </div>
            <div className="min-w-0">
              <p className="font-heading font-semibold text-foreground text-sm truncate">
                {order.item}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{order.counterparty}</p>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {order.date}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {order.location}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0 space-y-1.5">
            <p className="font-mono font-bold text-foreground text-sm">
              ₹{order.total.toLocaleString("en-IN")}
            </p>
            <div className="flex flex-col items-end gap-1">
              <Badge className={`${config.color} border-0 text-[11px]`}>
                <config.icon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
              <Badge className={`${payConfig.color} border-0 text-[10px]`}>
                <CreditCard className="w-2.5 h-2.5 mr-0.5" />
                {payConfig.label}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground font-mono">{order.id}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(order.id);
              }}
              className="p-1 hover:bg-muted rounded-md transition-all opacity-0 group-hover:opacity-100"
              title="Copy Token ID"
            >
              {copied ? (
                <Check className="w-3 h-3 text-success" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
            <span className="text-xs text-muted-foreground font-mono">· {order.quantity}</span>
          </div>
          <div className="flex gap-2">
            {order.paymentStatus === "pending" && order.status !== "cancelled" && (
              <Button
                variant="default"
                size="sm"
                className="h-7 text-xs gradient-warm text-secondary-foreground border-0"
                onClick={() => setPaymentOpen(true)}
              >
                <CreditCard className="w-3 h-3 mr-1" /> Pay Now
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setDetailOpen(true)}
            >
              <Eye className="w-3 h-3 mr-1" /> Details
            </Button>
          </div>
        </div>
      </motion.div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {type === "order" ? "Order" : "Sale"} Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Progress Stepper */}
            {order.status !== "cancelled" && currentStepIdx !== -1 && (
              <div className="relative flex justify-between items-center py-4 mb-4">
                <div className="absolute top-[34px] left-[18px] right-[18px] h-0.5 bg-muted z-0">
                  <div
                    className="h-full bg-primary transition-all duration-700 ease-in-out"
                    style={{
                      width: `${(currentStepIdx / (progressSteps.length - 1)) * 100}%`,
                    }}
                  />
                </div>
                {progressSteps.map((step, idx) => {
                  const isActive  = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  const StepIcon  = statusConfig[step.status].icon;

                  return (
                    <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                          isActive
                            ? "bg-primary border-primary text-primary-foreground shadow-sm"
                            : "bg-background border-muted text-muted-foreground"
                        )}
                      >
                        {idx < currentStepIdx ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <StepIcon className="w-4 h-4" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-medium transition-colors duration-300",
                          isCurrent ? "text-foreground font-bold" : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2 text-sm">
              {(
                [
                  ["ID",       order.id],
                  ["Item",     order.item],
                  ["Category", order.category],
                  ["Quantity", order.quantity],
                  [type === "order" ? "Seller" : "Buyer", order.counterparty],
                  ["Location", order.location],
                  ["Date",     order.date],
                  ...(order.trackingId ? [["Tracking ID", order.trackingId]] : []),
                ] as [string, string][]
              ).map(([label, value]) => (
                <div key={label} className="flex justify-between items-center group/row">
                  <span className="text-muted-foreground">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{value}</span>
                    {label === "ID" && (
                      <button
                        onClick={() => copyToClipboard(order.id)}
                        className="p-1 hover:bg-muted rounded-md transition-all opacity-0 group-hover/row:opacity-100"
                      >
                        {copied ? (
                          <Check className="w-3 h-3 text-success" />
                        ) : (
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center bg-muted rounded-lg p-3">
              <span className="text-sm text-muted-foreground">Total Amount</span>
              <span className="font-mono font-bold text-lg text-foreground">
                ₹{order.total.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex gap-2">
              <Badge className={`${config.color} border-0 w-fit`}>
                <config.icon className="w-3 h-3 mr-1" /> {config.label}
              </Badge>
              <Badge className={`${payConfig.color} border-0 w-fit`}>
                <CreditCard className="w-3 h-3 mr-1" /> {payConfig.label}
              </Badge>
            </div>

            <Button variant="outline" className="w-full" onClick={handleDownloadInvoice}>
              <Download className="w-4 h-4 mr-2" /> Download Invoice
            </Button>

            {(order.status === "pending" || order.status === "confirmed") && (
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isCancelling}
                onClick={() => {
                  onCancel(order);
                  setDetailOpen(false);
                }}
              >
                {isCancelling ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Cancel Order
              </Button>
            )}

            {order.trackingId && order.status !== "cancelled" && (
              <Button
                variant="outline"
                className="w-full border-2"
                onClick={() =>
                  window.open(
                    `https://www.google.com/search?q=track+package+${order.trackingId}`,
                    "_blank"
                  )
                }
              >
                <Truck className="w-4 h-4 mr-2" /> Track Shipment
              </Button>
            )}

            {order.paymentStatus === "pending" && order.status !== "cancelled" && (
              <Button
                className="w-full gradient-warm text-secondary-foreground border-0"
                onClick={() => {
                  setDetailOpen(false);
                  setPaymentOpen(true);
                }}
              >
                <CreditCard className="w-4 h-4 mr-2" /> Pay ₹
                {order.total.toLocaleString("en-IN")}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {order.paymentStatus === "pending" && order.status !== "cancelled" && (
        <PaymentDialog
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          amount={order.total}
          description={`${type === "order" ? "Order" : "Sale"} ${order.id} — ${order.item}`}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Orders Page
// ─────────────────────────────────────────────────────────────────────────────
export default function Orders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sb = supabase as any;
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab]     = useState("orders");

  const cancelOrderMutation = useMutation({
    mutationFn: async (order: Order) => {
      const localKey    = `local_orders_${user?.id}`;
      const localOrders = JSON.parse(localStorage.getItem(localKey) || "[]");
      const updatedLocalOrders = localOrders.map((o: { id: string; status: string }) =>
        o.id === order.rawId ? { ...o, status: "cancelled" } : o
      );
      localStorage.setItem(localKey, JSON.stringify(updatedLocalOrders));

      if (!order.rawId.startsWith("SL-")) {
        try {
          await sb
            .from("marketplace_orders")
            .update({ status: "cancelled" })
            .eq("id", order.rawId);
        } catch {
          console.warn("DB sync skipped - using local data only");
        }
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myOrders", user?.id] });
      toast({ title: "Order Cancelled", description: "Your order has been cancelled successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Cancellation Failed", description: err.message, variant: "destructive" });
    },
  });

  const handleCancelOrder = useCallback(
    (order: Order) => { cancelOrderMutation.mutate(order); },
    [cancelOrderMutation]
  );

  const { data: fetchedOrders = [], isLoading } = useQuery({
    queryKey: ["myOrders", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const localKey    = `local_orders_${user.id}`;
      const localOrders: Record<string, unknown>[] = JSON.parse(
        localStorage.getItem(localKey) || "[]"
      );

      let dbOrders: Record<string, unknown>[] = [];
      try {
        const { data } = await sb
          .from("marketplace_orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (data) dbOrders = data;
      } catch {
        console.warn("Could not fetch from Supabase table. Using local data.");
      }

      const combined = [...localOrders, ...dbOrders];

      return combined.map((o) => {
        const safeId =
          typeof o.id === "string" ? o.id : String(o.id || Math.random());
        const items = (o.items as Array<{ name?: string; qty?: number }>) || [];
        return {
          id: safeId.startsWith("ORD-") ? safeId : safeId.slice(0, 8).toUpperCase(),
          rawId: safeId,
          item:
            (items[0]?.name || "Agricultural Item") +
            (items.length > 1 ? ` (+${items.length - 1} more)` : ""),
          category:      "Marketplace",
          quantity:      (items[0]?.qty || 1) + " units",
          total:         (o.total_price as number) || 0,
          date:          o.created_at
            ? new Date(o.created_at as string).toLocaleDateString()
            : new Date().toLocaleDateString(),
          status:        (o.status as OrderStatus) || "pending",
          counterparty:  "KrishiGrow Marketplace",
          location:      (o.shipping_address as string) || "Default Address",
          paymentStatus: (o.payment_status as "paid" | "pending" | "cod") || "pending",
          trackingId:    o.tracking_id as string | undefined,
        } as Order;
      });
    },
    enabled: !!user,
  });

  const filteredOrdersData = useMemo(
    () =>
      (activeTab === "orders" ? fetchedOrders : mySales).filter((o) => {
        const matchesSearch =
          (o.item?.toLowerCase()        || "").includes(search.toLowerCase()) ||
          (o.id?.toUpperCase()          || "").includes(search.toUpperCase()) ||
          (o.counterparty?.toLowerCase() || "").includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || o.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [fetchedOrders, search, statusFilter, activeTab]
  );

  return (
    <div className="space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-heading font-bold text-foreground"
        >
          Orders & Sales
        </motion.h1>
        <p className="text-muted-foreground mt-1">Track your purchases and manage your sales</p>
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {summaryStats.map((s) => (
          <div
            key={s.label}
            className="glass-card rounded-xl p-4 hover:shadow-[var(--shadow-hover)] transition-all"
          >
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className="font-mono font-bold text-xl text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-[11px] text-success mt-1">{s.change}</div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by Item, Counterparty or Token ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="orders" onValueChange={setActiveTab}>
        <TabsList className="bg-muted">
          <TabsTrigger value="orders" className="gap-1.5">
            <ShoppingCart className="w-4 h-4" /> My Orders
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-1.5">
            <TrendingUp className="w-4 h-4" /> Selling Items
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Fetching your orders...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredOrdersData.map((order) => (
                  <OrderCard
                    key={order.rawId}
                    order={order}
                    type="order"
                    onCancel={handleCancelOrder}
                    isCancelling={
                      cancelOrderMutation.isPending &&
                      cancelOrderMutation.variables?.rawId === order.rawId
                    }
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
          {!isLoading && filteredOrdersData.length === 0 && (
            <div className="text-center py-16">
              <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sales" className="mt-5">
          <div className="grid md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredOrdersData.map((order) => (
                <OrderCard
                  key={order.rawId}
                  order={order}
                  type="sale"
                  onCancel={handleCancelOrder}
                  isCancelling={
                    cancelOrderMutation.isPending &&
                    cancelOrderMutation.variables?.rawId === order.rawId
                  }
                />
              ))}
            </AnimatePresence>
          </div>
          {filteredOrdersData.length === 0 && (
            <div className="text-center py-16">
              <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No sales found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}