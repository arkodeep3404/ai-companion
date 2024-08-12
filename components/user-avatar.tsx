"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";

export const UserAvatar = () => {
  return (
    <Avatar className="h-12 w-12">
      {/* TODO: put user icon here */}
      <AvatarImage
        src={
          "https://t4.ftcdn.net/jpg/05/50/33/47/360_F_550334715_0d2cdaljV4Xd3x7yVUhRxfmLLEUyMdXr.jpg"
        }
      />
    </Avatar>
  );
};
