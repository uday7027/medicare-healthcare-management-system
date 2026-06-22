import React, { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { JitsiMeeting } from "@jitsi/react-sdk";

import axios from "axios";

import { toast } from "react-toastify";

export default function VideoCall() {

  const { roomName } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [allowed, setAllowed] = useState(false);

  // ====================================================
  // VALIDATE ROOM ACCESS
  // ====================================================

  useEffect(() => {

    validateMeeting();

  }, []);

  const validateMeeting = async () => {

    try {

      // OPTIONAL:
      // Later you can validate from backend

      setAllowed(true);

    } catch (error) {

      console.error(error);

      toast.error("Unauthorized access");

      navigate("/");
    }

    setLoading(false);
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {

    return (

      <div className="h-screen flex items-center justify-center text-xl font-semibold">

        Loading Consultation...

      </div>
    );
  }

  // ====================================================
  // ACCESS DENIED
  // ====================================================

  if (!allowed) {

    return (

      <div className="h-screen flex items-center justify-center text-red-500 text-xl font-semibold">

        Access Denied

      </div>
    );
  }

  // ====================================================
  // VIDEO CALL UI
  // ====================================================

  return (

    <div className="h-screen w-full bg-black">

      <JitsiMeeting

        domain="meet.jit.si"

        roomName={roomName}

        configOverwrite={{

          startWithAudioMuted: false,

          startWithVideoMuted: false,

          disableModeratorIndicator: true,

          enableEmailInStats: false,
        }}

        interfaceConfigOverwrite={{

          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,

          SHOW_JITSI_WATERMARK: false,

          SHOW_WATERMARK_FOR_GUESTS: false,
        }}

        getIFrameRef={(iframeRef) => {

          iframeRef.style.height = "100vh";

          iframeRef.style.width = "100%";
        }}

        onReadyToClose={() => {

          navigate("/doctor/appointments");
        }}

      />

    </div>
  );
}