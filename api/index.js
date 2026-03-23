const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    const articles = (req.body && req.body.articles) || [];
    const to = (req.body && req.body.email) || process.env.RECIPIENT_EMAIL;
    if (!articles.length) return res.status(400).json({ error: "No articles" });
    const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const rows = articles.map((a, i) => `<tr><td style="padding:16px 0;border-bottom:1px solid #eee"><p style="margin:0;color:#888;font-size:12px">${a.source || ""} - ${a.date || ""}</p><h3 style="margin:4px 0">${i + 1}. ${a.title}</h3><p style="color:#444">${a.summary}</p><a href="${a.url}">Read more</a></td></tr>`).join("");
    const html = `<html><body style="font-family:sans-serif;max-width:600px;margin:0 auto"><div style="background:#2563eb;padding:24px;color:#fff"><h1 style="margin:0">â¡ Vibe Coding Digest</h1><p style="opacity:.8;margin:4px 0 0">${date}</p></div><div style="padding:16px"><table width="100%">${rows}</table></div></body></html>`;
    const t = nodemailer.createTransport({ service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
    await t.sendMail({ from: `"Vibe Digest" <${process.env.GMAIL_USER}>`, to, subject: `Vibe Coding Digest - ${date}`, html, text: articles.map((a, i) => `${i + 1}. ${a.title}\n${a.summary}\n${a.url}`).join("\n\n") });
    return res.status(200).json({ success: true, count: articles.length });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
