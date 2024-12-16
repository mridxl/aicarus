"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useProject from "@/hooks/use-project";
import React from "react";
import { toast } from "sonner";

const InviteButton = () => {
  const { projectId } = useProject();
  const [open, setOpen] = React.useState(false);
  const [origin, setOrigin] = React.useState("");

  // not using window directly in the Input since window is not available in SSR when the component is rendered for the first time.
  // so, using useEffect ensures that the value is set only after the component is mounted.
  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite team members</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Ask them to copy and paste this link
          </p>
          <Input
            value={`${origin}/join/${projectId}`}
            readOnly
            className="mt-2"
            onClick={() => {
              navigator.clipboard.writeText(`${origin}/join/${projectId}`);
              toast.success("Link copied to clipboard");
            }}
          />
        </DialogContent>
      </Dialog>
      <Button
        size="sm"
        onClick={() => {
          setOpen(true);
        }}
      >
        Invite Members
      </Button>
    </>
  );
};

export default InviteButton;
