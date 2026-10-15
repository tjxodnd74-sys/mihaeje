# Background sound fix v34

The v33 assets contain decoded audio (garage mean -25.0 dB, peak -6.9 dB). Existing browser playback showed an advancing media time, so that alone did not establish audible speaker output. No hardware audio capture is available.

Music now stays on native HTMLAudioElement output rather than routing it through an independently suspended Web Audio graph. Native volume fades preserve effect/video ducking. Play failures remain retryable and never claim a playing state. Existing per-game progress and individual sound preferences remain intact.

The header explicitly shows sound off/on, the panel offers one combined music/effects enable button, and zero music volume has a clear notice. New music preferences start at 45%, while existing nonzero levels are preserved. The combined enable button restores a zero level to 45% intentionally.

Validation: v34 executable audit covers native audio when AudioContext construction is unavailable, combined enable, zero-volume notice, lazy loading, independent toggles, volume persistence, effect ducking, visibility recovery, saved-on gesture startup, rejected playback and pending-stop race. Browser QA verifies native unmuted media with progressing playback time and outputVolume > 0, separate effects state, zero-volume notice, saved-on reload/gesture restore. No actual loudspeaker listening claim is made.