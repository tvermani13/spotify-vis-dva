import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_DROPBOX_CSV_URL;
  const dropboxRes = await fetch(url);
  if (!dropboxRes.ok) {
    return NextResponse.error(); // 500
  }
  const csvText = await dropboxRes.text();

  return new NextResponse(csvText, {
    headers: {
      "Content-Type": "text/csv",
      "Cache-Control": "s-maxage=86400, stale-while-revalidate",
    },
  });
}
