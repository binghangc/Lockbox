/**
 * File contains API routes for profiles using Supabase.
 */

const express = require("express");

const router = express.Router();
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
);

// API endpoint to get profile information
router.get("/", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or malformed Authorization header" });
  }

  const token = authHeader?.split(" ")[1];

  const { data, error } = await supabase.auth.getUser(token);
  const user = data?.user;

  if (error || !user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  console.log("Authenticated user ID:", user.id);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return res.status(400).json({ error: profileError.message });
  }

  res.status(200).json({ user, profile });
});

// API endpoint to edit profile information
router.patch("/edit", async (req, res) => {
  const { user_id, field, value } = req.body;

  if (!user_id || !field || typeof value !== "string") {
    return res.status(400).json({ error: "Missing or invalid params" });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ [field]: value })
    .eq("id", user_id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ message: "Profile updated successfully" });
});

router.post("/upload-avatar", upload.single("avatar"), async (req, res) => {
  const { user_id } = req.body;
  const { file } = req.file;

  if (!user_id || !file)
    return res.status(400).json({ error: "Missing user_id or file" });

  const fileExt = file.originalname.split(".").pop();
  const filePath = `avatars/${user_id}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) return res.status(500).json({ error: uploadError.message });

  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);
  const avatar_url = publicUrlData.publicUrl;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url })
    .eq("id", user_id);

  if (updateError) return res.status(500).json({ error: updateError.message });

  res.status(200).json({ avatar_url });
});

module.exports = router;
