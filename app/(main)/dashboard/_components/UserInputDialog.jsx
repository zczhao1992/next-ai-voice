import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoaderCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { CoachingExpert } from "@/services/Options";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const UserInputDialog = ({ children, coachingOption }) => {
  const [selectedExpert, setSelectedExpert] = useState();
  const [topic, setTopic] = useState();

  const createDiscussionRoom = useMutation(api.DiscussionRoom.CreateNewRoom);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const router = useRouter();

  const OnClickNext = async () => {
    setLoading(true);
    const result = await createDiscussionRoom({
      topic: topic,
      coachingOption: coachingOption?.name,
      expertName: selectedExpert,
    });
    console.log(result);
    setLoading(false);
    setOpenDialog(false);
    router.push("/discussion-room/" + result);
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{coachingOption.name}</DialogTitle>
          <DialogDescription asChild>
            <div className="mt-3">
              <h2 className="text-black">
                输入一个主题以掌握{coachingOption.name}
              </h2>
              <Textarea
                placeholder="请输入..."
                className="mt-2"
                onChange={(e) => setTopic(e.target.value)}
              />

              <h2 className="text-black mt-5">选择语音角色</h2>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-6 mt-3">
                {CoachingExpert.map((expert, index) => {
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedExpert(expert.name)}
                    >
                      <Image
                        src={expert.avatar}
                        alt={expert.name}
                        width={100}
                        height={100}
                        className={`rounded-2xl h-[80px] w-[80px] object-cover hover:scale-105 
                          transition-all cursor-pointer 
                          p-1 border-primary ${selectedExpert === expert.name && "border"}`}
                      />
                      <h2 className="text-center">{expert.name}</h2>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-5 justify-end mt-5">
                <DialogClose asChild>
                  <Button variant={"ghost"}>取消</Button>
                </DialogClose>

                <Button
                  disabled={!topic || !selectedExpert || loading}
                  onClick={OnClickNext}
                >
                  {loading && <LoaderCircle className="animate-spin" />}
                  开始
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default UserInputDialog;
