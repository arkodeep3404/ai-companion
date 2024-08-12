"use client";

import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ImageUploadProps {
  value: string;
  onChange: (src: string) => void;
  disabled?: boolean;
}

export const ImageUpload = ({
  value,
  onChange,
  disabled,
}: ImageUploadProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    console.log("file upload", file);
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post("/api/imageUpload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      //console.log(response);

      //onChange(response.data.xyz);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e)}
        disabled={disabled}
        className="hidden"
        id="upload-input"
      />
      <label
        htmlFor="upload-input"
        className="
          flex 
          cursor-pointer 
          flex-col
          items-center 
          justify-center 
          space-y-2 
          rounded-lg 
          border-4 
          border-dashed 
          border-primary/10 
          p-4 
          transition
          hover:opacity-75
        "
      >
        <div className="relative h-40 w-40">
          <Image
            fill
            alt="Upload"
            src={value || "/placeholder.svg"}
            className="rounded-lg object-cover"
          />
        </div>
        <span>Upload Image</span>
      </label>
    </div>
  );
};
