// import React, { useEffect, useCallback, useState } from "react";
// import ReactPlayer from "react-player";
// import peer from "../service/peer";
// import { useSocket } from "../context/SocketProvider";

// const RoomPage = () => {
//   const socket = useSocket();
//   const [remoteSocketId, setRemoteSocketId] = useState(null);
//   const [myStream, setMyStream] = useState();
//   const [remoteStream, setRemoteStream] = useState();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");

//   const handleUserJoined = useCallback(({ username, id }) => {
//     console.log(`username ${username} joined room`);
//     setRemoteSocketId(id);
//   }, []);

//   const handleCallUser = useCallback(async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({
//       audio: true,
//       video: true,
//     });
//     const offer = await peer.getOffer();
//     socket.emit("user:call", { to: remoteSocketId, offer });
//     setMyStream(stream);
//   }, [remoteSocketId, socket]);

//   const handleIncommingCall = useCallback(
//     async ({ from, offer }) => {
//       setRemoteSocketId(from);
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//         video: true,
//       });
//       setMyStream(stream);
//       console.log(`Incoming Call`, from, offer);
//       const ans = await peer.getAnswer(offer);
//       socket.emit("call:accepted", { to: from, ans });
//     },
//     [socket]
//   );

//   const sendStreams = useCallback(() => {
//     for (const track of myStream.getTracks()) {
//       peer.peer.addTrack(track, myStream);
//     }
//   }, [myStream]);

//   const handleCallAccepted = useCallback(
//     ({ from, ans }) => {
//       peer.setLocalDescription(ans);
//       console.log("Call Accepted!");
//       sendStreams();
//     },
//     [sendStreams]
//   );

//   const handleNegoNeeded = useCallback(async () => {
//     const offer = await peer.getOffer();
//     socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
//   }, [remoteSocketId, socket]);

//   useEffect(() => {
//     peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
//     return () => {
//       peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
//     };
//   }, [handleNegoNeeded]);

//   const handleNegoNeedIncomming = useCallback(
//     async ({ from, offer }) => {
//       const ans = await peer.getAnswer(offer);
//       socket.emit("peer:nego:done", { to: from, ans });
//     },
//     [socket]
//   );

//   const handleNegoNeedFinal = useCallback(async ({ ans }) => {
//     await peer.setLocalDescription(ans);
//   }, []);

//   useEffect(() => {
//     peer.peer.addEventListener("track", async (ev) => {
//       const remoteStream = ev.streams;
//       console.log("GOT TRACKS!!");
//       setRemoteStream(remoteStream[0]);
//     });
//   }, []);

//   useEffect(() => {
//     socket.on("user:joined", handleUserJoined);
//     socket.on("incomming:call", handleIncommingCall);
//     socket.on("call:accepted", handleCallAccepted);
//     socket.on("peer:nego:needed", handleNegoNeedIncomming);
//     socket.on("peer:nego:final", handleNegoNeedFinal);

//     return () => {
//       socket.off("user:joined", handleUserJoined);
//       socket.off("incomming:call", handleIncommingCall);
//       socket.off("call:accepted", handleCallAccepted);
//       socket.off("peer:nego:needed", handleNegoNeedIncomming);
//       socket.off("peer:nego:final", handleNegoNeedFinal);
//     };
//   }, [
//     socket,
//     handleUserJoined,
//     handleIncommingCall,
//     handleCallAccepted,
//     handleNegoNeedIncomming,
//     handleNegoNeedFinal,
//   ]);

//   // Handle chat messages
//   const handleSendMessage = useCallback(() => {
//     if (newMessage.trim() !== "") {
//       socket.emit("chat:message", { to: remoteSocketId, message: newMessage });
//       setMessages((prev) => [...prev, { sender: "me", message: newMessage }]);
//       setNewMessage("");
//     }
//   }, [newMessage, remoteSocketId, socket]);

//   const handleIncomingMessage = useCallback(({ message }) => {
//     setMessages((prev) => [...prev, { sender: "remote", message }]);
//   }, []);

//   useEffect(() => {
//     socket.on("chat:message", handleIncomingMessage);
//     return () => {
//       socket.off("chat:message", handleIncomingMessage);
//     };
//   }, [socket, handleIncomingMessage]);

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
//       <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
//         <h1 className="text-2xl font-bold mb-4 text-center">Room Page</h1>
//         <h4 className="text-lg font-medium mb-4">
//           {remoteSocketId ? "Connected" : "No one in room"}
//         </h4>
//         <div className="space-y-4">
//           {myStream && (
//             <button
//               onClick={sendStreams}
//               className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
//             >
//               Send My Stream
//             </button>
//           )}
//           {remoteSocketId && (
//             <button
//               onClick={handleCallUser}
//               className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
//             >
//               CALL
//             </button>
//           )}
//         </div>
//         <div className="mt-6">
//           {myStream && (
//             <div className="mb-4">
//               <h2 className="text-xl font-semibold">My Video</h2>
//               <ReactPlayer
//                 playing
//                 muted
//                 height="200px"
//                 width="100%"
//                 url={myStream}
//                 className="rounded mt-2"
//               />
//             </div>
//           )}
//           {remoteStream && (
//             <div>
//               <h2 className="text-xl font-semibold">Remote Video</h2>
//               <ReactPlayer
//                 playing
//                 muted
//                 height="200px"
//                 width="100%"
//                 url={remoteStream}
//                 className="rounded mt-2"
//               />
//             </div>
//           )}
//         </div>
//         <div className="mt-6">
//           <h2 className="text-xl font-semibold mb-2">Chat</h2>
//           <div className="border p-2 h-64 overflow-y-auto mb-4">
//             {messages.map((msg, index) => (
//               <div key={index} className={`p-2 ${msg.sender === "me" ? "text-right" : "text-left"}`}>
//                 <span className={`inline-block px-4 py-2 rounded ${msg.sender === "me" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>
//                   {msg.message}
//                 </span>
//               </div>
//             ))}
//           </div>
//           <div className="flex">
//             <input
//               type="text"
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               className="flex-grow border p-2 rounded-l"
//             />
//             <button
//               onClick={handleSendMessage}
//               className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600"
//             >
//               Send
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RoomPage;

import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

const RoomPage = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const handleUserJoined = useCallback(({ username, id }) => {
    console.log(`username ${username} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    if (myStream) {
      for (const track of myStream.getTracks()) {
        peer.peer.addTrack(track, myStream);
      }
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams[0];
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  // Handle chat messages
  const handleSendMessage = useCallback(() => {
    if (newMessage.trim() !== "") {
      socket.emit("chat:message", { to: remoteSocketId, message: newMessage });
      setMessages((prev) => [...prev, { sender: "me", message: newMessage }]);
      setNewMessage("");
    }
  }, [newMessage, remoteSocketId, socket]);

  const handleIncomingMessage = useCallback(({ message }) => {
    setMessages((prev) => [...prev, { sender: "remote", message }]);
  }, []);

  useEffect(() => {
    socket.on("chat:message", handleIncomingMessage);
    return () => {
      socket.off("chat:message", handleIncomingMessage);
    };
  }, [socket, handleIncomingMessage]);

  // Handle quit functionality
  const handleQuit = useCallback(() => {
    if (myStream) {
      myStream.getTracks().forEach(track => track.stop());
      setMyStream(null);
    }
    if (peer.peer) {
      peer.peer.close();
    }
    socket.disconnect(); // Disconnect from the socket server
    navigate("/"); // Redirect to the home page or any other page
  }, [myStream, navigate, socket]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Room Page</h1>
        <h4 className="text-lg font-medium mb-4">
          {remoteSocketId ? "Connected" : "No one in room"}
        </h4>
        <div className="space-y-4">
          {myStream && (
            <button
              onClick={sendStreams}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Send My Stream
            </button>
          )}
          {remoteSocketId && (
            <button
              onClick={handleCallUser}
              className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
            >
              CALL
            </button>
          )}
          <button
            onClick={handleQuit}
            className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
          >
            End
          </button>
        </div>
        <div className="mt-6">
          {myStream && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold">My Video</h2>
              <ReactPlayer
                playing
                muted
                height="200px"
                width="100%"
                url={myStream}
                className="rounded mt-2"
              />
            </div>
          )}
          {remoteStream && (
            <div>
              <h2 className="text-xl font-semibold">Remote Video</h2>
              <ReactPlayer
                playing
                muted
                height="200px"
                width="100%"
                url={remoteStream}
                className="rounded mt-2"
              />
            </div>
          )}
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Chat</h2>
          <div className="border p-2 h-64 overflow-y-auto mb-4">
            {messages.map((msg, index) => (
              <div key={index} className={`p-2 ${msg.sender === "me" ? "text-right" : "text-left"}`}>
                <span className={`inline-block px-4 py-2 rounded ${msg.sender === "me" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>
                  {msg.message}
                </span>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow border p-2 rounded-l"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
