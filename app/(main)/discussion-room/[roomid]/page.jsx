"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { api } from "@/convex/_generated/api";
import { CoachingExpert } from "@/services/Options";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { UserButton } from "@stackframe/stack";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { RealtimeTranscriber } from "assemblyai";
import { getToken } from "@/services/GlobalServices";
// import RecordRTC from "recordrtc";

const RecordRTC = dynamic(() => import("recordrtc"), { ssr: false });

function DiscussionRoom() {
  const { roomid } = useParams();
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
    id: roomid,
  });
  const [expert, setExpert] = useState();

  const [enableMic, setEnableMic] = useState(false);

  const recorder = useRef(null);

  const realtimeTranscriber = useRef(null);
  let silenceTimeout;

  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = CoachingExpert.find(
        (item) => item.name == DiscussionRoomData.expertName
      );
      console.log(Expert);
      setExpert(Expert);
    }
  }, [DiscussionRoomData]);

  const connectToServer = async () => {
    setEnableMic(true);

    realtimeTranscriber.current = new RealtimeTranscriber({
      token: await getToken(),
      sampleRate: 16_000,
    });

    realtimeTranscriber.current.on("transcript", async (transcript) => {
      console.log(transcript);
    });

    await realtimeTranscriber.current.connect();

    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          recorder.current = new RecordRTC(stream, {
            type: "audio",
            mimeType: "audio/webm;codecs=pcm",
            recorderType: RecordRTC.StereoAudioRedcorder,
            timeSlice: 250,
            desiredSampRate: 16000,
            numberOfAudioChannels: 1,
            bufferSize: 4096,
            audioBitsPerSecond: 128000,
            ondataavailable: async (blob) => {
              //   if (!realtimeTranscriber.current) return;

              clearTimeout(silenceTimeout);
              const buffer = await blob.arrayBuffer();
              console.log(buffer);
              silenceTimeout = setTimeout(() => {
                console.log("dddddd");
              }, 2000);
            },
          });
          recorder.current.startRecording();
        })
        .catch((err) => console.error(err));
    }
  };

  const disconnect = async (e) => {
    e.preventDefault();
    await realtimeTranscriber.current.close();
    recorder.current.pauseRecording();

    recorder.current = null;

    setEnableMic(false);
  };

  return (
    <div className="text-lg font-bold -mt-12">
      <h2>{DiscussionRoomData?.coachingOption}</h2>
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className=" h-[60vh] bg-secondary border rounded-4xl flex flex-col items-center justify-center relative">
            <Image
              src={expert?.avatar}
              alt="Avatar"
              width={200}
              height={200}
              className="h-[80px] w-[80px] rounded-full object-cover animate-pulse"
            />
            <h2 className="text-gray-500">{expert?.name}</h2>
            <div className="p-5 bg-gray-200 px-10 rounded-lg absolute bottom-10 right-10">
              <UserButton />
            </div>
          </div>
          <div className="mt-5 flex justify-center items-center">
            {!enableMic ? (
              <Button onClick={connectToServer}>开始对话</Button>
            ) : (
              <Button variant="destructive" onClick={disconnect}>
                取消对话
              </Button>
            )}
          </div>
        </div>
        <div>
          <div className="h-[60vh] bg-secondary border rounded-4xl flex flex-col items-center justify-center relative">
            <h2>聊天区</h2>
          </div>
          <div>
            <h2 className="mt-5 text-gray-400 text-sm">
              在您的对话结束时，我们将自动生成反馈/注释
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiscussionRoom;
