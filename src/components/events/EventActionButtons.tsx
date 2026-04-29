"use client";

import { Button } from "@/components/ui/button";
import { Phone, Share2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface EventActionButtonsProps {
  contactPhone?: string;
  eventTitle: string;
}

export function EventActionButtons({ contactPhone, eventTitle }: EventActionButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventTitle,
          text: `Check out this event: ${eventTitle}`,
          url: url,
        });
      } catch (err) {
        // Fallback to clipboard if share cancelled or failed
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-4 w-full md:w-auto">
      {contactPhone ? (
        <a href={`tel:${contactPhone}`} className="flex-1 md:flex-none">
          <Button className="h-14 w-full px-8 rounded-2xl font-black text-sm gap-3 shadow-lg shadow-primary/20 transition-all">
            <Phone className="w-4 h-4" />
            Contact Us
          </Button>
        </a>
      ) : (
        <a href="#contact" className="flex-1 md:flex-none">
          <Button className="h-14 w-full px-8 rounded-2xl font-black text-sm gap-3 shadow-lg shadow-primary/20 transition-all">
            <Phone className="w-4 h-4" />
            Contact Us
          </Button>
        </a>
      )}
      
      <Button 
        onClick={handleShare}
        variant="outline" 
        className="h-14 flex-1 md:flex-none px-8 rounded-2xl font-black text-sm gap-3 border-primary/20 text-primary hover:bg-primary/5 transition-all"
      >
        {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
        {copied ? "Copied!" : "Share"}
      </Button>
    </div>
  );
}
