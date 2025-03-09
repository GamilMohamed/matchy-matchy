import { Card, CardContent } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface User {
  id: number
  name: string
  age: number
  location: string
  bio: string
  imageUrl: string
}

interface UserCardProps {
  user: User
}

export default function UserCard({ user }: UserCardProps) {
  return (
    <Card className="w-full h-full overflow-hidden shadow-lg rounded-xl border-2">
      <CardContent className="p-0 h-full flex flex-col">
        <div className="relative w-full h-3/4">
          <img src={user.imageUrl || "/placeholder.svg"} alt={user.name}  className="object-cover" priority />
        </div>
        <div className="p-4 bg-white flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <span className="text-xl">{user.age}</span>
          </div>
          <div className="flex items-center text-gray-500 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{user.location}</span>
          </div>
          <p className="text-gray-700">{user.bio}</p>
        </div>
      </CardContent>
    </Card>
  )
}

