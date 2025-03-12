import { useAuth } from "@/context/auth-context";
import { User } from "@/types/auth";
import { useEffect, useState } from "react";
import { api } from "@/context/auth-context";
import UserList from "./UsersList";
import UserCarousel from "./user-carousel";
import { ToggleRightIcon } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { Card } from 'pixel-retroui';


export default function Test() {
  const { user } = useAuth();
  if (!user) {
    return <div className="w-full p-4"></div>;
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <Card>
      <h2>Card Title</h2>
      <p>This is the card content.</p>
      </Card>
    </div>
  );
}
