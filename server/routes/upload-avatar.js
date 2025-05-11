const express = require('express');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);

router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
    const { user_id } = req.body;
    const file = req.file;

    if (!user_id || !file) return res.status(400).json({ error: 'Missing user_id or file' });

    const fileExt = file.originalname.split('.').pop();
    const filePath = `avatars/${user_id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
        });

    if (uploadError) return res.status(500).json({ error: uploadError.message });

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const avatar_url = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url })
        .eq('id', user_id);

    if (updateError) return res.status(500).json({ error: updateError.message });

    res.status(200).json({ avatar_url });
});

module.exports = router;

