import { AssemblyAI } from "assemblyai";
import { NextResponse } from "next/server";

const assemblyAI = new AssemblyAI({ apiKey: process.env.ASSEMBLY_API_KEY });

export async function GET(req) {
  const token = assemblyAI.realtime.createTemporaryToken({ expires_in: 3600 });
  return NextResponse.json(token);
}
