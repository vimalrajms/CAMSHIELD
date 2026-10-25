# CAMSHIELD Website Prototype

A responsive, mobile-friendly camera privacy website prototype.

## Run it
1. Extract the ZIP.
2. Open `index.html` to view the dashboard.
3. For camera testing, use `localhost` or deploy to a trusted HTTPS host. Browsers require a secure context for camera access.
4. Press **Test my camera** and allow the browser permission prompt.
5. Press **Stop camera** to end the stream and add the session to the on-page history.

## Included
- Responsive dark cyberpunk design with pink, purple and cyan accents
- Browser camera permission test and preview
- Visible active-camera alert and stop control
- Session history for sessions started on this page
- English/Tamil toggle
- Video is not uploaded; no backend is connected yet

## Important limitation
This is a frontend prototype, not a device-wide camera detector. It only reports sessions started on this page. A website cannot independently detect when unrelated apps use the phone camera or laptop webcam. Device-wide monitoring needs a separate Android or Windows component and platform-supported signals. Session history is kept in page memory and resets after reload.

## Next step
Connect a Python FastAPI backend for user accounts, device registration, and securely stored event history. Build platform-specific monitoring separately.
