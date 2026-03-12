// ════════════════════════════════════════════════════════════════
//  guestbook-write.js — Netlify Function
//  Saves a guestbook entry to Netlify Blobs.
//  Called via AJAX POST from the frontend.
// ════════════════════════════════════════════════════════════════

import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    const handle  = (body.handle || "").trim().slice(0, 30) || "ANONYMOUS";
    const message = (body.message || "").trim().slice(0, 500);

    if (!message) {
      return new Response(JSON.stringify({ error: "Message required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const store = getStore("guestbook");

    // Use timestamp + random suffix as key for uniqueness
    const key = `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const entry = {
      handle,
      message,
      date: new Date().toISOString(),
      key
    };

    await store.setJSON(key, entry);

    return new Response(JSON.stringify({ success: true, entry }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
