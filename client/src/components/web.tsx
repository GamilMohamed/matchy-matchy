// import React, { useEffect, useState, useRef } from "react";
// import { socket } from "@/context/auth-context";
// import { toast } from "@/hooks/use-toast";

// export default function Web() {
//   const [messages, setMessages] = useState<string[]>([]);
//   const [input, setInput] = useState<string>("");
//   const [eventName, setEventName] = useState<string>("message");
//   const [isConnected, setIsConnected] = useState<boolean>(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // Scroll to bottom of messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // Socket setup
//   useEffect(() => {
//     // Add system message
//     setMessages(prev => [...prev, `System: Using event name "${eventName}" for communication`]);
    
//     // Set up connection status
//     setIsConnected(socket.connected);
    
//     // Set up event listeners
//     socket.on("connect", () => {
//       setIsConnected(true);
//       console.log("Connected to server");
//       setMessages(prev => [...prev, "System: Connected to server"]);
//     });

//     socket.on("disconnect", () => {
//       setIsConnected(false);
//       console.log("Disconnected from server");
//       setMessages(prev => [...prev, "System: Disconnected from server"]);
//     });

//     // Set up dynamic event listener
//     const messageHandler = (message: any) => {
//       toast({
//         title: "Success",
//         description: message,
//       });
//       console.log(`Received on "${eventName}":`, message);
//       let displayMessage = typeof message === 'object' 
//         ? JSON.stringify(message) 
//         : message.toString();
//       setMessages(prev => [...prev, `Server (${eventName}): ${displayMessage}`]);
//     };
    
//     // Remove any existing listeners first to avoid duplicates
//     socket.off(eventName);
    
//     // Add the new listener
//     socket.on(eventName, messageHandler);
    
//     // Listen for all events in debug mode
//     socket.onAny((event, ...args) => {
//       console.log(`DEBUG - Event "${event}" received:`, args);
//     });

//     // Send test message on component mount
//     if (socket.connected) {
//       console.log(`Sending test message on "${eventName}" event`);
//       const response = socket.emit(eventName, "Hello from the client!");
//       console.log("Emit response:", response);
//     } else {
//       console.log("Socket not connected, attempting to connect...");
//       socket.connect();
      
//       // Try sending after connection
//       setTimeout(() => {
//         if (socket.connected) {
//           console.log(`Sending delayed test message on "${eventName}" event`);
//           socket.emit(eventName, "Hello from the client (after connection)!");
//         }
//       }, 1000);
//     }

//     // Clean up event listeners on unmount or event name change
//     return () => {
//       socket.off("connect");
//       socket.off("disconnect");
//       socket.off(eventName, messageHandler);
//       socket.offAny();
//     };
//   }, [eventName]);

//   const handleSendMessage = () => {
//     if (input.trim()) {
//       // Check socket connection before sending
//       if (!socket.connected) {
//         console.log("Socket not connected, attempting to reconnect...");
//         socket.connect();
        
//         // Add error message to chat
//         setMessages(prev => [...prev, "System: Connection error. Trying to reconnect..."]);
        
//         // Attempt to send after a brief delay to allow connection
//         setTimeout(() => {
//           const response = socket.emit(eventName, input);
//           console.log(`Delayed emit on "${eventName}":`, response);
//           setMessages((prevMessages) => [...prevMessages, `You (${eventName}): ${input} (Sent after reconnection)`]);
//           setInput("");
//         }, 1000);
//         return;
//       }
      
//       // Normal sending path
//       console.log(`Sending on "${eventName}":`, input);
//       const response = socket.emit(eventName, input);
//       console.log("Emit response:", response);
      
//       // Add your own message to the list
//       setMessages((prevMessages) => [...prevMessages, `You (${eventName}): ${input}`]);
//       setInput("");
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter") {
//       handleSendMessage();
//     }
//   };

//   return (
//     <div className="w-full h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
//       <div className="w-full max-w-md bg-white shadow-md rounded-lg overflow-hidden">
//         <div className="p-4 bg-blue-600 text-white">
//           <h2 className="text-xl font-semibold">WebSocket Test</h2>
//           <div className="flex justify-between items-center mt-2">
//             <p className="text-sm">
//               Status: {isConnected ? 
//                 <span className="text-green-300">Connected</span> : 
//                 <span className="text-red-300">Disconnected</span>}
//             </p>
//             <div className="flex items-center space-x-2">
//               <label className="text-sm">Event:</label>
//               <select 
//                 value={eventName}
//                 onChange={(e) => setEventName(e.target.value)}
//                 className="text-xs text-black p-1 rounded"
//               >
//                 <option value="message">message</option>
//                 <option value="chat">chat</option>
//                 <option value="data">data</option>
//                 <option value="notification">notification</option>
//               </select>
//             </div>
//           </div>
//         </div>
        
//         <div className="h-80 overflow-y-auto p-4 bg-gray-100">
//           {messages.length > 0 ? (
//             <ul className="space-y-2">
//               {messages.map((message, index) => (
//                 <li 
//                   key={index}
//                   className={`p-2 rounded text-sm ${
//                     message.startsWith("You") 
//                       ? "bg-blue-100 ml-8" 
//                       : message.startsWith("System") 
//                         ? "bg-yellow-100 text-yellow-800 border border-yellow-200" 
//                         : "bg-white mr-8 shadow-sm"
//                   }`}
//                 >
//                   {message}
//                 </li>
//               ))}
//               <div ref={messagesEndRef} />
//             </ul>
//           ) : (
//             <div className="text-center text-gray-500 h-full flex items-center justify-center">
//               No messages yet
//             </div>
//           )}
//         </div>
        
//         <div className="p-4 border-t">
//           <div className="flex mb-2">
//             <button
//               onClick={() => socket.connect()}
//               className="text-xs px-2 py-1 bg-green-500 text-white rounded mr-2 hover:bg-green-600"
//             >
//               Connect
//             </button>
//             <button
//               onClick={() => {
//                 socket.disconnect();
//                 setMessages(prev => [...prev, "System: Manually disconnected"]);
//               }}
//               className="text-xs px-2 py-1 bg-red-500 text-white rounded mr-2 hover:bg-red-600"
//             >
//               Disconnect
//             </button>
//             <button
//               onClick={() => {
//                 const socketInfo = {
//                   connected: socket.connected,
//                   id: socket.id,
//                   nsp: socket.nsp
//                 };
//                 console.log("Socket debug info:", socket);
//                 setMessages(prev => [...prev, `System: Socket debug - ${JSON.stringify(socketInfo)}`]);
//               }}
//               className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
//             >
//               Debug Info
//             </button>
//           </div>
          
//           <div className="flex">
//             <input
//               type="text"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={handleKeyDown}
//               placeholder={`Type a message to send on "${eventName}" event...`}
//               className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//               onClick={handleSendMessage}
//               disabled={!isConnected}
//               className={`px-4 py-2 rounded-r ${
//                 isConnected 
//                   ? "bg-blue-600 hover:bg-blue-700 text-white" 
//                   : "bg-gray-400 text-gray-200 cursor-not-allowed"
//               }`}
//             >
//               Send
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }