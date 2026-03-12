// ════════════════════════════════════════════════════════════════
//  guestbook-read.js — Netlify Function
//  Reads guestbook entries from Netlify Blobs and returns JSON.
//  No API keys needed — Blobs auth is automatic on Netlify.
// ════════════════════════════════════════════════════════════════

import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  try {
    const store = getStore("guestbook");
    const { blobs } = await store.list();

    // Read all entries
    const entries = [];
    for (const blob of blobs) {
      try {
        const data = await store.get(blob.key, { type: "json" });
        if (data) entries.push(data);
      } catch (e) {
        // skip broken entries
      }
    }

    // Sort newest first
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));

    return new Response(JSON.stringify(entries), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=30"
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
