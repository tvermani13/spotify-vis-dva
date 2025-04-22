import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  try {
    const res = await fetch(
      "https://spotify-popularity-model.onrender.com/predict",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } else {
      const text = await res.text();
      return NextResponse.json({ message: text }, { status: res.status });
    }
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json(
      { error: "Failed to reach prediction service" },
      { status: 502 }
    );
  }
}
