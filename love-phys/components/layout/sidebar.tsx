"use client";

import React, { useState } from "react";
import { Session } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, MessageSquare, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SidebarProps {
  sessions: Session[];
  activeSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession?: (sessionId: string) => void;
  className?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function Sidebar({
  sessions,
  activeSessionId,
  onSessionSelect,
  onNewSession,
  onDeleteSession,
  className,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: SidebarProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

  const handleDeleteClick = (session: Session, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessionToDelete(session);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (sessionToDelete && onDeleteSession) {
      await onDeleteSession(sessionToDelete._id);
    }
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  return (
    <>
      <div
        className={cn(
          "w-80 border-r bg-muted/50 flex flex-col h-full",
          className
        )}
      >
        {/* Header - Fixed height */}
        <div className="p-4 space-y-4 shrink-0">
          <div className="space-y-2">
            <div
              onClick={onNewSession}
              className="w-full flex items-center justify-start p-3 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3">
                <Plus className="h-4 w-4 text-black" />
              </div>
              <span className="text-foreground font-medium">New chat</span>
            </div>
          </div>
          <Separator />
        </div>

        {/* Sessions List - Scrollable area */}
        <div className="flex-1 overflow-hidden px-4 pb-4">
          <div className="h-full overflow-y-auto space-y-2 pr-2">
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No conversation history yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click New chat to start exploring
                </p>
              </div>
            ) : (
              sessions.map((session) => (
                <Card
                  key={session._id}
                  className={cn(
                    "p-3 cursor-pointer transition-all duration-200 hover:bg-accent hover:shadow-sm group",
                    activeSessionId === session._id &&
                      "bg-accent border-primary shadow-sm"
                  )}
                  onClick={() => onSessionSelect(session._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate leading-5">
                          {session.title}
                        </p>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    {onDeleteSession && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => handleDeleteClick(session, e)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Conversation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </Card>
              ))
            )}
            {sessions.length > 0 && hasMore && (
              <div className="pt-2">
                <Button
                  variant="ghost"
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  {isLoadingMore ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the conversation &quot;
              {sessionToDelete?.title}&quot;? This action cannot be undone and
              will permanently delete the conversation and all its contents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
