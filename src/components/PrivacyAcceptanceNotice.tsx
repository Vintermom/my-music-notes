import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const PRIVACY_ACCEPTED_KEY = "mymusicnotes_privacy_accepted";

export function hasAcceptedPrivacy(): boolean {
  try {
    return localStorage.getItem(PRIVACY_ACCEPTED_KEY) === "true";
  } catch {
    return false;
  }
}

function acceptPrivacy(): void {
  try {
    localStorage.setItem(PRIVACY_ACCEPTED_KEY, "true");
  } catch {
    // Ignore storage errors
  }
}

export function PrivacyAcceptanceNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Show notice only if not previously accepted
    if (!hasAcceptedPrivacy()) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    acceptPrivacy();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Privacy Notice</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-foreground">
            This app uses Google Analytics to collect anonymous usage statistics to help us improve the app experience. No personal data or song content is collected.
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleAccept}>Accept</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
