import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { setTimeout } from "timers/promises";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { image } = await request.json();
    const base64Data = image.split(",")[1];

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `Analyze this image and respond in this exact format without any asterisks or bullet points:
TITLE: Write a clear, brief title
TYPE: Choose one (Theft, Fire Outbreak, Medical Emergency, Natural Disaster, Violence, or Other)
DESCRIPTION: Write a clear, concise description
IS_EMERGENCY: true or false (true if the image shows signs of immediate danger, harm, or emergency situation)`;

    let retries = 3;
    let lastError;
    while (retries > 0) {
      try {
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg",
            },
          },
        ]);
        const text = await result.response.text();
        // Parse the response more precisely
        const titleMatch = text.match(/TITLE:\s*(.+)/);
        const typeMatch = text.match(/TYPE:\s*(.+)/);
        const descMatch = text.match(/DESCRIPTION:\s*(.+)/);
        const emergencyMatch = text.match(/IS_EMERGENCY:\s*(true|false)/i);
        return NextResponse.json({
          title: titleMatch?.[1]?.trim() || "",
          reportType: typeMatch?.[1]?.trim() || "",
          description: descMatch?.[1]?.trim() || "",
          isEmergency: emergencyMatch?.[1]?.toLowerCase() === "true" || false,
        });
      } catch (error: any) {
        lastError = error;
        // Check for 429 Too Many Requests
        if (error?.status === 429) {
          let delay = 40000; // default 40s
          // Try to extract retryDelay from error details
          if (error?.errorDetails) {
            const retryInfo = error.errorDetails.find((d: any) => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo");
            if (retryInfo && retryInfo.retryDelay) {
              // retryDelay is in the format '40s'
              const match = retryInfo.retryDelay.match(/(\d+)s/);
              if (match) delay = parseInt(match[1], 10) * 1000;
            }
          }
          await setTimeout(delay);
          retries--;
          continue;
        } else {
          throw error;
        }
      }
    }
    throw lastError;
  } catch (error) {
    console.error("Image analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}
