// components/explanation/share-modal.tsx
"use client";

import React from "react";
import { Explanation } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, ExternalLink, AlertTriangle } from "lucide-react";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  explanation: Explanation | null;
  shareUrl: string | null;
  isSharing: boolean;
  onConfirmShare: () => void;
  onCancel: () => void;
}

export function ShareModal({
  open,
  onOpenChange,
  explanation,
  shareUrl,
  isSharing,
  onConfirmShare,
  onCancel,
}: ShareModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            {shareUrl ? "Share Link" : "Share Explanation"}
          </DialogTitle>
          <DialogDescription className="space-y-3">
            {!shareUrl ? (
              <>
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <div className="font-medium mb-1">Notice</div>
                    <div>
                      After sharing, this explanation will become public content
                      that anyone can access through the link.
                    </div>
                  </div>
                </div>

                {explanation && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      Content to share:
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {explanation.question}
                    </div>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  A public share link will be generated after confirmation.
                </div>
              </>
            ) : (
              <>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-medium text-green-800 mb-2">
                    Share link is ready!
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 text-xs bg-white border border-gray-300 rounded px-2 py-1 font-mono"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(shareUrl)}
                      className="text-xs"
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Link generated. You can copy and share it with others.
                </div>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          {!shareUrl ? (
            <>
              <Button variant="outline" onClick={onCancel} disabled={isSharing}>
                Cancel
              </Button>
              <Button
                onClick={onConfirmShare}
                disabled={isSharing}
                className="gap-2"
              >
                {isSharing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    Confirm Share
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onCancel}>
                Close
              </Button>
              <Button
                onClick={() => window.open(shareUrl, "_blank")}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Share Page
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
