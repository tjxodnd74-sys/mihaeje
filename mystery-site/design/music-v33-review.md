# Background music v33

Eleven distinct Kevin MacLeod tracks: one lobby bed and one for each of the ten games. Selection follows the official catalog's instrumentation and mood descriptions; these are composed music recordings, not synthesized UI effects. The ohang bed is reflective ambient music, not a claim to reproduce a traditional Korean ritual.

Assets are excerpted, circularly crossfaded, normalized to -22 LUFS and encoded at 80 kbps stereo. Only the current track is assigned to the media element after a user gesture; no music is downloaded for a default-muted visit. Music, effects and music volume have separate controls and saved preferences. A new document waits for a user gesture even when the saved music preference is on. Hidden documents pause and keep the current playback position. Effects and foreground media lower the music gain.

Licensing source: https://incompetech.com/agent-section/ states the catalog is offered under CC BY 4.0. Current track title, artist, source link, license and processing changes are visible under Sound settings → Music credits; all credits are also stored under dist/assets/music/CREDITS.txt. Original downloads are outside dist and are not deployed.

Verified:
- Lifecycle regression: default lazy loading, independent effects switch, saved volume, effect ducking, visibility pause/resume, saved-on gesture restore, rejected playback retry and stop winning over pending play
- Actual browser playback for all ten case tracks and lobby; expected file, finite duration, unpaused media and playing state
- Initial source unset for all eleven routes; effects stayed off during music playback
- Saved 27% volume persisted across routes
- 390×844 phone control layout had no horizontal overflow

Browser playback and file structure were verified. Track selection is based on composer metadata; this pass does not claim a human listening panel or an iPhone hardware test.
