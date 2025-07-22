const express = require('express');

const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const r2 = require('../utils/r2client.js');
const { itineraryQueue, vibechecksQueue } = require('../queue.js');

dayjs.extend(utc);
dayjs.extend(timezone);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const authMiddleware = require('../middleware/auth.js');

const { generateVibeCheck } = require('../rag/utils/generateVibeCheck.js');
const { getRandomFallback } = require('../rag/utils/getRandomFallback.js');

// POST /trips - Create a new trip
router.post('/', authMiddleware, async (req, res) => {
  const user_id = req.user.id;
  const {
    title,
    description,
    start_date,
    end_date,
    country,
    thumbnail_url,
    tags,
    video_background,
    effects,
  } = req.body;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const userTimezone = tz || 'Asia/Singapore';
  const today = dayjs().tz(userTimezone).format('YYYY-MM-DD');
  const start = dayjs(start_date).tz(userTimezone).format('YYYY-MM-DD');

  const status = start === today ? 'ongoing' : 'upcoming';

  const { data, error } = await supabase
    .from('trips')
    .insert([
      {
        user_id,
        title,
        description,
        start_date,
        end_date,
        country,
        thumbnail_url,
        status,
        tags,
        video_background,
        effects,
      },
    ])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({
    message: 'Trip created',
    data,
    needsImmediateItinerary: status === 'ongoing',
  });
});

// GET /trips - Get all trips for the logged-in user (host or participant)
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  // Step 1: Get trip IDs where user is a participant
  const { data: participantTrips, error: participantErr } = await supabase
    .from('participants')
    .select('trip_id, is_pinned')
    .eq('user_id', userId);

  if (participantErr) {
    return res.status(500).json({ error: participantErr.message });
  }

  const participantTripIds = participantTrips.map((p) => p.trip_id);

  // Step 2: Get trips where user is host OR participant
  const { data: trips, error: tripsErr } = await supabase
    .from('trips')
    .select(
      `
      *,
      host:profiles (
        id,
        name,
        avatar_url
      )
    `,
    )
    .or(`user_id.eq.${userId},id.in.(${participantTripIds.join(',')})`);

  if (tripsErr) {
    return res.status(500).json({ error: tripsErr.message });
  }

  const enrichedTrips = trips.map((trip) => {
    const participantEntry = participantTrips.find(
      (p) => p.trip_id === trip.id,
    );
    return {
      ...trip,
      is_host: trip.user_id === userId,
      is_pinned: participantEntry?.is_pinned ?? false,
    };
  });

  return res.json(enrichedTrips);
});

// GET /trips/:id - Get a single trip by ID
router.get('/:id', authMiddleware, async (req, res) => {
  const tripId = req.params.id;
  const userId = req.user.id;

  const { data: trip, error } = await supabase
    .from('trips')
    .select(
      `
      *,
      host:profiles (
        id,
        name,
        avatar_url
      )
    `,
    )
    .eq('id', tripId)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const { data: participant, error: participantErr } = await supabase
    .from('participants')
    .select('is_pinned')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .single();

  if (participantErr && participantErr.code !== 'PGRST116') {
    // 'PGRST116' = no rows found
    return res.status(500).json({ error: participantErr.message });
  }

  return res.json({
    ...trip,
    is_host: trip.user_id === userId,
    is_pinned: participant?.is_pinned ?? false,
  });
});

// DELETE /trips/:id - Delete a trip (host only)
router.delete('/:id', authMiddleware, async (req, res) => {
  const tripId = req.params.id;
  const userId = req.user.id;

  const { data: trip, error: fetchError } = await supabase
    .from('trips')
    .select('user_id')
    .eq('id', tripId)
    .single();

  if (fetchError) {
    return res.status(500).json({ error: fetchError.message });
  }

  if (!trip || trip.user_id !== userId) {
    return res.status(403).json({ error: 'You are not the trip owner.' });
  }

  try {
    // Step 1: Fetch all orbs for this trip
    const { data: orbs, error: orbFetchError } = await supabase
      .from('orbs')
      .select('id, video_key, hls_key, user_id')
      .eq('trip_id', tripId);

    if (orbFetchError) {
      console.error('[Orb Fetch Error]', orbFetchError.message);
      return res.status(500).json({ error: orbFetchError.message });
    }

    console.log(
      `[Trip Delete] Found ${orbs.length} orbs to delete for trip ${tripId}`,
    );

    // Step 2: Delete objects from R2 (both video and HLS files)
    if (orbs.length > 0) {
      const deletePromises = [];

      for (const orb of orbs) {
        console.log(`[Trip Delete] Processing orb ${orb.id}`);

        // Delete the main video file
        if (orb.video_key) {
          console.log(`[Trip Delete] Deleting video: ${orb.video_key}`);
          deletePromises.push(
            r2
              .send(
                new DeleteObjectCommand({
                  Bucket: process.env.R2_BUCKET_NAME_VIDEOS,
                  Key: orb.video_key,
                }),
              )
              .catch((err) => {
                console.error(
                  `[Trip Delete] Failed to delete video ${orb.video_key}:`,
                  err,
                );
                return null;
              }),
          );
        }

        // Delete HLS files
        if (orb.hls_key) {
          console.log(`[Trip Delete] Deleting HLS files for: ${orb.hls_key}`);
          const basePrefix = orb.hls_key.replace('/master.m3u8', '');

          // Delete master.m3u8
          deletePromises.push(
            r2
              .send(
                new DeleteObjectCommand({
                  Bucket: process.env.R2_BUCKET_NAME_VIDEOS,
                  Key: orb.hls_key,
                }),
              )
              .catch((err) => {
                console.error(
                  `[Trip Delete] Failed to delete HLS master ${orb.hls_key}:`,
                  err,
                );
                return null;
              }),
          );

          // Delete quality-specific playlists and segments
          // Based on your encoder output: 240p.m3u8, 480p.m3u8, etc.
          const qualities = ['240p', '480p', '720p', '1080p']; // Add more if needed

          for (const quality of qualities) {
            // Delete quality playlist (e.g., 240p.m3u8)
            deletePromises.push(
              r2
                .send(
                  new DeleteObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME_VIDEOS,
                    Key: `${basePrefix}/${quality}.m3u8`,
                  }),
                )
                .catch(() => null), // Silent fail for non-existent files
            );

            // Delete segments for this quality (e.g., 240p_000.ts, 240p_001.ts, etc.)
            for (let i = 0; i < 100; i++) {
              const segmentKey = `${basePrefix}/${quality}_${i
                .toString()
                .padStart(3, '0')}.ts`;
              deletePromises.push(
                r2
                  .send(
                    new DeleteObjectCommand({
                      Bucket: process.env.R2_BUCKET_NAME_VIDEOS,
                      Key: segmentKey,
                    }),
                  )
                  .catch(() => null), // Silent fail for non-existent segments
              );
            }
          }

          // Also delete any variant directories (v0, v1) in case you have both patterns
          const variants = ['v0', 'v1'];
          for (const variant of variants) {
            // Delete variant playlist
            deletePromises.push(
              r2
                .send(
                  new DeleteObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME_VIDEOS,
                    Key: `${basePrefix}/${variant}/index.m3u8`,
                  }),
                )
                .catch(() => null),
            );

            // Delete segments in variant directories
            for (let i = 0; i < 100; i++) {
              deletePromises.push(
                r2
                  .send(
                    new DeleteObjectCommand({
                      Bucket: process.env.R2_BUCKET_NAME_VIDEOS,
                      Key: `${basePrefix}/${variant}/seg-${i}.ts`,
                    }),
                  )
                  .catch(() => null),
              );
            }
          }

          // Delete any additional common file patterns
          const commonPatterns = ['playlist.m3u8', 'index.m3u8', 'stream.m3u8'];

          for (const pattern of commonPatterns) {
            deletePromises.push(
              r2
                .send(
                  new DeleteObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME_VIDEOS,
                    Key: `${basePrefix}/${pattern}`,
                  }),
                )
                .catch(() => null),
            );
          }
        }
      }

      console.log(
        `[Trip Delete] Executing ${deletePromises.length} delete operations`,
      );
      // eslint-disable-next-line node/no-unsupported-features/es-builtins
      const results = await Promise.allSettled(deletePromises);

      // Log any unexpected failures (not silent ones)
      results.forEach((result, index) => {
        if (result.status === 'rejected' && result.reason) {
          console.warn(
            `[Trip Delete] Delete operation ${index} failed:`,
            result.reason,
          );
        }
      });

      console.log(`[Trip Delete] Completed R2 cleanup for trip ${tripId}`);
    }

    // Step 3: Delete orbs from database
    const { error: orbDeleteError } = await supabase
      .from('orbs')
      .delete()
      .eq('trip_id', tripId);

    if (orbDeleteError) {
      console.error('[Orb DB Delete Error]', orbDeleteError.message);
      return res.status(500).json({ error: orbDeleteError.message });
    }

    console.log(`[Trip Delete] Deleted ${orbs.length} orbs from database`);

    // Step 4: Delete other related data
    const { error: participantsDeleteError } = await supabase
      .from('participants')
      .delete()
      .eq('trip_id', tripId);

    if (participantsDeleteError) {
      console.error(
        '[Participants Delete Error]',
        participantsDeleteError.message,
      );
    }

    const { error: itinerariesDeleteError } = await supabase
      .from('itineraries')
      .delete()
      .eq('trip_id', tripId);

    if (itinerariesDeleteError) {
      console.error(
        '[Itineraries Delete Error]',
        itinerariesDeleteError.message,
      );
    }

    const { error: vibechecksDeleteError } = await supabase
      .from('vibechecks')
      .delete()
      .eq('trip_id', tripId);

    if (vibechecksDeleteError) {
      console.error('[Vibechecks Delete Error]', vibechecksDeleteError.message);
    }
  } catch (cleanupError) {
    console.error('[Cleanup Error]', cleanupError);
    return res
      .status(500)
      .json({ error: 'Failed to delete associated content' });
  }

  // Step 5: Finally delete the trip itself
  const { error: deleteError } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId);

  if (deleteError) {
    console.error('[Trip Delete Error]', deleteError.message);
    return res.status(500).json({ error: deleteError.message });
  }

  console.log(`[Trip Delete] Successfully deleted trip ${tripId}`);
  return res.json({ success: true });
});

// POST /trips/:id/leave - Leave a trip (participant only)
router.post('/:id/leave', authMiddleware, async (req, res) => {
  const tripId = req.params.id;
  const userId = req.user.id;

  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('user_id')
    .eq('id', tripId)
    .single();

  if (tripError) {
    return res.status(500).json({ error: tripError.message });
  }

  if (trip?.user_id === userId) {
    return res.status(400).json({ error: 'Host cannot leave their own trip.' });
  }

  const { error: leaveError } = await supabase
    .from('participants')
    .delete()
    .match({ trip_id: tripId, user_id: userId });

  if (leaveError) {
    return res.status(500).json({ error: leaveError.message });
  }

  return res.json({ success: true });
});

// API endpoint for users to edit their trips.
router.patch('/:id/edit', authMiddleware, async (req, res) => {
  const trip_id = req.params.id;
  const {
    title,
    description,
    thumbnail_url,
    start_date,
    end_date,
    country,
    tags,
    video_background,
    effects,
  } = req.body;
  const user_id = req.user.id;

  if (!trip_id) {
    return res.status(400).json({ error: 'Missing or invalid params' });
  }

  const { data: trip, error } = await supabase
    .from('trips')
    .update({
      title,
      description,
      start_date,
      end_date,
      country,
      thumbnail_url,
      tags,
      video_background,
      effects,
    })
    .eq('id', trip_id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (trip?.user_id !== user_id) {
    return res.status(400).json({ error: 'Only hosts can edit trip.' });
  }

  return res.status(200).json({ trip, message: 'Trip updated successfully' });
});

// API endpoint for retrieving the participants in a trip
router.get('/:id/participants', authMiddleware, async (req, res) => {
  const trip_id = req.params.id;

  try {
    const { data, error } = await supabase
      .from('participants')
      .select('user_id, role, profile:profiles(*)')
      .eq('trip_id', trip_id);

    if (error) throw error;
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// API endpoint for users to pin trips
router.patch('/:trip_id/pin', authMiddleware, async (req, res) => {
  const { trip_id } = req.params;
  const user_id = req.user.id;

  try {
    const { data: participant, error: fetchError } = await supabase
      .from('participants')
      .select('is_pinned')
      .eq('trip_id', trip_id)
      .eq('user_id', user_id)
      .single();

    if (fetchError || !participant)
      return res.status(404).json({ error: 'Participant not found' });

    const newPinState = !participant.is_pinned;

    const { error: updateError } = await supabase
      .from('participants')
      .update({ is_pinned: newPinState })
      .eq('trip_id', trip_id)
      .eq('user_id', user_id);

    if (updateError)
      return res.status(500).json({ error: updateError.message });

    return res.json({
      message: 'Pin state toggled',
      is_pinned: newPinState,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// API endpoint for users to save their itineraries and generate vibechecks
router.post('/:id/submit-itinerary', authMiddleware, async (req, res) => {
  const trip_id = req.params.id;
  const { user } = req;
  const itineraries = req.body;

  if (!Array.isArray(itineraries) || itineraries.length === 0) {
    return res
      .status(400)
      .json({ error: 'Itinerary must be a non-empty array' });
  }

  try {
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, user_id, title, country')
      .eq('id', trip_id)
      .single();

    if (tripError || !trip) throw new Error('Trip not found');

    if (trip.user_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Step 0: check if edited itineraries are the same
    const { data: existing, error: existingError } = await supabase
      .from('itineraries')
      .select('id, date, itinerary')
      .eq('trip_id', trip_id);

    if (existingError) throw existingError;
    const existingMap = new Map(
      existing.map((e) => [e.date, e.itinerary.trim()]),
    );

    // Filter only changed entries
    const changed = itineraries.filter((entry) => {
      const old = existingMap.get(entry.date);
      return old === undefined || old !== entry.itinerary.trim();
    });

    if (changed.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: 'No changes detected' });
    }

    // Step 1: insert itineraries
    const payload = changed.map((entry, index) => ({
      trip_id,
      date: entry.date,
      itinerary: entry.itinerary,
      day_index: index + 1,
      updated_at: new Date().toISOString(),
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('itineraries')
      .upsert(payload, { onConflict: ['trip_id', 'date'] })
      .select();

    if (insertError) throw insertError;

    const vibechecks = await Promise.all(
      inserted.map(async (entry) => {
        const vibecheck = await generateVibeCheck({
          itineraryText: entry.itinerary,
          tripDate: entry.date,
          tripTitle: trip.title,
          country: trip.country,
          description: trip.description,
        });

        return {
          trip_id,
          date: entry.date,
          vibecheck: vibecheck,
          itinerary_id: entry.id,
        };
      }),
    );

    const { data: insertedVibechecks, error: vibeInsertError } = await supabase
      .from('vibechecks')
      .upsert(vibechecks, { onConflict: ['trip_id', 'date'] })
      .select();

    if (vibeInsertError) throw vibeInsertError;

    // Step 4: Queue itinerary embeddings
    if (process.env.RUN_WORKERS) {
      await Promise.all(
        inserted.map((entry) =>
          itineraryQueue.add(
            'embed-itinerary',
            {
              itinerary: entry.itinerary,
              itinerary_id: entry.id,
              trip_id: trip.id,
              country: trip.country,
            },
            { removeOnComplete: true },
          ),
        ),
      );

      // Step 5: Queue vibecheck embeddings
      await Promise.all(
        insertedVibechecks.map((vc) =>
          vibechecksQueue.add(
            'embed-vibecheck',
            {
              vibecheck_id: vc.id,
              text: vc.vibecheck,
              user_id: trip.user_id,
            },
            { removeOnComplete: true },
          ),
        ),
      );
    }

    console.log('[submit-itinerary] Queued vibechecks:', insertedVibechecks);

    return res.status(200).json({
      success: true,
      insertedItineraries: inserted.length,
      insertedVibechecks: insertedVibechecks.length,
    });
  } catch (err) {
    console.error('[POST trips/:id/submit-itinerary] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

router.get('/:trip_id/itinerary/', authMiddleware, async (req, res) => {
  const { trip_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('itineraries')
      .select('date, itinerary')
      .eq('trip_id', trip_id);

    if (error && error.code !== 'PGRST116') throw error;

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// API endpoint to get vibechecks for a date
router.get('/:id/vibecheck/:date', authMiddleware, async (req, res) => {
  const trip_id = req.params.id;
  const { date } = req.params;

  if (!date) {
    return res.status(400).json({ error: 'Missing date query parameter' });
  }

  try {
    const { data } = await supabase
      .from('vibechecks')
      .select('id, vibecheck')
      .eq('trip_id', trip_id)
      .eq('date', date)
      .single();

    if (data) {
      return res.json({
        vibecheck: data.vibecheck,
        vibecheck_id: data.id,
      });
    }

    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('start_date, end_date')
      .eq('id', trip_id)
      .single();

    if (tripError || !trip) {
      console.error(
        'Trip not found or error fetching trip:',
        tripError?.message,
      );
      return res.status(404).json({ error: 'Trip not found' });
    }

    const reqDate = new Date(date);
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);

    if (reqDate < startDate || reqDate > endDate) {
      return res
        .status(404)
        .json({ error: 'No vibecheck available for that date' });
    }

    const fallback = getRandomFallback();
    const insert = await supabase
      .from('vibechecks')
      .insert({ trip_id, date, vibecheck: fallback.vibecheck })
      .select('id')
      .single();

    if (insert.error) {
      console.error('Error inserting fallback:', insert.error.message);
      return res.json({ vibecheck: fallback.vibecheck });
    }

    return res.json({
      vibecheck: fallback,
      vibecheck_id: insert.data.id,
    });
  } catch (err) {
    console.error('Error fetching vibecheck:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to update vibechecks for a date
router.patch('/:id/vibecheck/:date', authMiddleware, async (req, res) => {
  const { id, date } = req.params;
  const { vibecheck_id } = req.body;
  const { user } = req;

  if (!vibecheck_id) {
    return res.status(400).json({ error: 'Missing vibecheck_id in body.' });
  }

  const { data: existingOrbs, error: orbError } = await supabase
    .from('orbs')
    .select('id')
    .eq('vibecheck_id', vibecheck_id)
    .limit(1);

  if (orbError) {
    console.error('Orb query failed:', orbError.message);
    return res.status(500).json({ error: 'Failed to check orbs.' });
  }

  if (existingOrbs && existingOrbs.length > 0) {
    return res.json({
      reshuffleAllowed: false,
      message: 'Cannot reshuffle. Orbs already submitted for this vibecheck.',
    });
  }

  const { data, error: itineraryError } = await supabase
    .from('itineraries')
    .select('id, itinerary')
    .eq('trip_id', id)
    .eq('date', date)
    .limit(1);

  if (itineraryError) {
    console.error('Itinerary query failed:', itineraryError.message);
    return res.status(500).json({ error: 'Failed to fetch itinerary.' });
  }

  const itinerary = data?.[0] ?? null;

  let vibecheckText;
  let itineraryId = null;

  if (itinerary?.itinerary) {
    // AI-generated vibecheck
    vibecheckText = await generateVibeCheck({
      itineraryText: itinerary.itinerary,
      tripDate: date,
    });
    itineraryId = itinerary.id;
  } else {
    // Fallback vibecheck
    const fallback = getRandomFallback();
    vibecheckText = fallback.vibecheck;
  }

  let updateQuery = supabase
    .from('vibechecks')
    .update({ vibecheck: vibecheckText })
    .eq('trip_id', id)
    .eq('date', date);

  if (itineraryId) {
    updateQuery = updateQuery.eq('itinerary_id', itineraryId);
  }
  if (process.env.RUN_WORKERS) {
    await Promise.all(
      vibechecksQueue.add(
        'embed-vibecheck',
        {
          vibecheck_id,
          text: vibecheckText,
          user_id: user.id,
        },
        { removeOnComplete: true },
      ),
    );
  }

  const { error } = await updateQuery;

  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    reshuffleAllowed: true,
    vibecheck: vibecheckText,
    vibecheck_id,
  });
});

module.exports = router;
