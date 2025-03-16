// import { useEffect, useState } from "react";
// import { socket, useAuth } from "@/context/auth-context";

// // Define types for clarity
// type LikedUser = {
//   username: string;
//   firstname: string;
//   lastname: string;
//   profile_picture: string;
//   liked_at: string;
// };

// export default function ConnectedUsers() {
//   const { user, connectedUsers } = useAuth();
//   if (!user) return null;

//   const likedUsers = user.liked as LikedUser[];

//   // Find users who are both connected and liked
//   const connectedAndLikedUsers = likedUsers.filter((likedUser) => connectedUsers.includes(likedUser.username));
//   const onlyUsernames = likedUsers.map((user) => user.username);
//   return (
//     <div className="bg-white shadow-md rounded-lg p-4 max-w-md">
//       <h1 className="text-xl font-bold mb-4">Connected and Liked Users</h1>

//       {connectedAndLikedUsers.length === 0 ? (
//         <p className="text-gray-500">No users are both connected and liked.</p>
//       ) : (
//         <ul className="divide-y">
//           {connectedAndLikedUsers.map((user) => (
//             <li key={user.username} className="py-3 flex items-center">
//               <img src={user.profile_picture} alt={`${user.firstname} ${user.lastname}`} className="w-10 h-10 rounded-full mr-3" />
//               <div>
//                 <p className="font-medium">
//                   {user.firstname} {user.lastname}
//                 </p>
//                 <p className="text-sm text-gray-500">@{user.username}</p>
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}

//       <div className="mt-4 pt-4 border-t">
//         <p className="text-sm text-gray-500">
//           I am {user.username} | Connected users: {connectedUsers.length} | users: {connectedUsers.map((user) => " " + user)}| Liked users: {likedUsers.length}
//         </p>
//         <pre>{JSON.stringify(onlyUsernames, null, 2)}</pre>
//       </div>
//     </div>
//   );
// }
