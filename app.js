const $ = (id) => document.getElementById(id);

const video = $('video');
const preview = $('preview');
const start = $('start');
const stop = $('stop');
const message = $('message');
const historyBox = $('history');
const toast = $('toast');

const STORAGE_KEY = 'camshield_sessions_v1';
const MAX_SESSIONS = 50;

let stream = null;
let startedAt = null;
let sessions = loadSessions();
let isTamil = false;
let toastTimer = null;

const words = {
  en: {
    heroTitle: 'Your camera.<br><span>Your control.</span>',
    heroText: 'Understand when this website uses your camera, review test sessions, and stay in control.',
    statusHeading: 'Camera status',
    notActive: 'Not active',
    active: 'Camera is active',
    notStarted: 'Camera has not been started by this page.',
    started: 'This page is currently using your camera.',
    previewTitle: 'Your preview appears here',
    previewText: 'Nothing starts until you press the button below.',
    start: 'Test my camera',
    stop: 'Stop camera',
    permission: 'Your browser will ask for permission. Video stays in your browser and is not uploaded.',
    alertsHeading: 'Stay informed',
    alertTitle: 'Camera activity detected',
    alertIdle: 'Start the camera test to see an alert here.',
    alertActive: 'This website camera session is active. No video is uploaded.',
    noActivity: 'No recent activity',
    disclaimer: 'This prototype reports activity on this website only, not other apps on your device.',
    historyHeading: 'Session history',
    clear: 'Clear',
    emptyTitle: 'Nothing here yet',
    emptyText: 'Your camera test sessions will appear here.',
    footnote: "Only this website's test sessions are listed.",
    promiseTitle: 'A clear privacy promise',
    promiseText: 'CAMSHIELD records camera sessions started on this page. A website cannot independently detect when another app uses your camera. Device-wide monitoring needs a separate app with platform-supported access.',
    denied: 'Camera access failed. Check your browser permission and try again.',
    https: 'Camera access needs a secure connection (HTTPS or localhost).',
    stopped: 'Camera stopped. Session saved.',
    startedToast: 'Camera started. This page-only session is active.',
    cleared: 'Session history cleared.',
    session: 'Camera test session',
    stopFirst: 'Stop the active camera before clearing history.',
    cameraError: 'Camera could not start. Check whether another app is using it.',
    saveError: 'History could not be saved in this browser.'
  },

  ta: {
    heroTitle: 'உங்கள் கேமரா.<br><span>உங்கள் கட்டுப்பாடு.</span>',
    heroText: 'இந்த இணையதளம் கேமராவைப் பயன்படுத்தும் நேரத்தை அறிந்து, சோதனை வரலாற்றைப் பார்த்துக் கட்டுப்பாட்டில் வைத்திருங்கள்.',
    statusHeading: 'கேமரா நிலை',
    notActive: 'செயலில் இல்லை',
    active: 'கேமரா செயல்படுகிறது',
    notStarted: 'இந்தப் பக்கம் இன்னும் கேமராவைத் தொடங்கவில்லை.',
    started: 'இந்தப் பக்கம் தற்போது உங்கள் கேமராவைப் பயன்படுத்துகிறது.',
    previewTitle: 'உங்கள் கேமரா காட்சி இங்கே தோன்றும்',
    previewText: 'கீழே உள்ள பொத்தானை அழுத்தும் வரை கேமரா தொடங்காது.',
    start: 'கேமராவைச் சோதிக்கவும்',
    stop: 'கேமராவை நிறுத்தவும்',
    permission: 'உலாவி அனுமதி கேட்கும். வீடியோ உங்கள் உலாவியிலேயே இருக்கும்; பதிவேற்றப்படாது.',
    alertsHeading: 'தனியுரிமை எச்சரிக்கைகள்',
    alertTitle: 'கேமரா செயல்பாடு கண்டறியப்பட்டது',
    alertIdle: 'கேமரா சோதனையைத் தொடங்கினால் இங்கே எச்சரிக்கை தோன்றும்.',
    alertActive: 'இந்த இணையதளத்தின் கேமரா அமர்வு செயல்படுகிறது. வீடியோ பதிவேற்றப்படவில்லை.',
    noActivity: 'சமீபத்திய செயல்பாடு இல்லை',
    disclaimer: 'இந்த முன்மாதிரி இந்த இணையதளத்தின் செயல்பாட்டை மட்டுமே காட்டும்; மற்ற செயலிகளைக் கண்காணிக்காது.',
    historyHeading: 'அமர்வு வரலாறு',
    clear: 'அழி',
    emptyTitle: 'இன்னும் பதிவுகள் இல்லை',
    emptyText: 'உங்கள் கேமரா சோதனை அமர்வுகள் இங்கே தோன்றும்.',
    footnote: 'இந்த இணையதளத்தின் சோதனை அமர்வுகள் மட்டுமே பட்டியலிடப்படும்.',
    promiseTitle: 'தெளிவான தனியுரிமை உறுதி',
    promiseText: 'இந்தப் பக்கத்தில் தொடங்கிய கேமரா அமர்வுகளை CAMSHIELD பதிவு செய்கிறது. மற்ற செயலிகள் கேமராவைப் பயன்படுத்துவதை ஓர் இணையதளம் மட்டும் நேரடியாகக் கண்டறிய முடியாது. முழுச் சாதனக் கண்காணிப்பிற்கு தனி செயலியும் அதற்கான அனுமதிகளும் தேவை.',
    denied: 'கேமரா அனுமதி கிடைக்கவில்லை. உலாவி அனுமதியைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
    https: 'கேமராவைப் பயன்படுத்த HTTPS அல்லது localhost இணைப்பு தேவை.',
    stopped: 'கேமரா நிறுத்தப்பட்டது. அமர்வு சேமிக்கப்பட்டது.',
    startedToast: 'கேமரா தொடங்கப்பட்டது. இந்தப் பக்கத்தின் அமர்வு செயலில் உள்ளது.',
    cleared: 'அமர்வு வரலாறு அழிக்கப்பட்டது.',
    session: 'கேமரா சோதனை அமர்வு',
    stopFirst: 'வரலாற்றை அழிப்பதற்கு முன் கேமராவை நிறுத்தவும்.',
    cameraError: 'கேமராவைத் தொடங்க முடியவில்லை. வேறு செயலி அதைப் பயன்படுத்துகிறதா எனச் சரிபார்க்கவும்.',
    saveError: 'இந்த உலாவியில் வரலாற்றைச் சேமிக்க முடியவில்லை.'
  }
};

const t = (key) =>
  (isTamil ? words.ta : words.en)[key] || words.en[key] || key;

function loadSessions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) =>
        item &&
        typeof item.start === 'string' &&
        typeof item.end === 'string' &&
        Number.isFinite(item.duration) &&
        Number.isFinite(Date.parse(item.start)) &&
        Number.isFinite(Date.parse(item.end))
      )
      .slice(0, MAX_SESSIONS)
      .map((item) => ({
        start: new Date(item.start),
        end: new Date(item.end),
        duration: Math.max(0, item.duration)
      }));
  } catch {
    return [];
  }
}

function saveSessions() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        sessions.slice(0, MAX_SESSIONS).map((item) => ({
          start: item.start.toISOString(),
          end: item.end.toISOString(),
          duration: item.duration
        }))
      )
    );
    return true;
  } catch {
    return false;
  }
}

function toastMsg(text) {
  toast.textContent = text;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

function inform(text, error = false) {
  message.textContent = text;
  message.hidden = false;
  message.classList.toggle('error', error);
}

function clock(date) {
  return new Intl.DateTimeFormat(isTamil ? 'ta-IN' : 'en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
}

function stamp(date) {
  return new Intl.DateTimeFormat(isTamil ? 'ta-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function duration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours) return `${hours}h ${minutes % 60}m`;
  if (minutes) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function statusUI(active) {
  $('status').textContent = active ? t('active') : t('notActive');
  $('statusSub').textContent = active ? t('started') : t('notStarted');

  $('statusMark').textContent = active ? '●' : '◈';
  $('statusMark').style.color = active ? '#f472b6' : '#6ee7b7';

  start.disabled = active;
  stop.disabled = !active;

  preview.classList.toggle('live', active);

  $('alertTitle').textContent = t('alertTitle');
  $('alertText').textContent = active ? t('alertActive') : t('alertIdle');

  if (active && startedAt) {
    $('alertTime').textContent = `${t('active')} · ${clock(startedAt)}`;
  } else if (sessions.length) {
    $('alertTime').textContent = `${t('noActivity')} · ${clock(sessions[0].end)}`;
  } else {
    $('alertTime').textContent = t('noActivity');
  }

  $('alertDot').classList.toggle('active', active);
}

async function startCamera() {
  message.hidden = true;

  if (stream) return;

  if (!window.isSecureContext) {
    inform(t('https'), true);
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    inform(t('denied'), true);
    return;
  }

  start.disabled = true;

  try {
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false
    });

    stream = newStream;
    startedAt = new Date();
    video.srcObject = stream;

    await video.play();

    statusUI(true);
    inform(t('startedToast'));
    toastMsg(t('startedToast'));

    stream.getVideoTracks().forEach((track) => {
      track.addEventListener('ended', handleTrackEnded, { once: true });
    });
  } catch (error) {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    stream = null;
    startedAt = null;
    video.srcObject = null;
    statusUI(false);

    inform(
      error?.name === 'NotAllowedError' ? t('denied') : t('cameraError'),
      true
    );
  }
}

function handleTrackEnded() {
  if (stream) stopCamera();
}

function stopCamera() {
  if (!stream) return;

  const currentStream = stream;
  const end = new Date();
  const startTime = startedAt || end;

  stream = null;
  startedAt = null;

  currentStream.getTracks().forEach((track) => track.stop());
  video.srcObject = null;

  sessions.unshift({
    start: startTime,
    end,
    duration: Math.max(0, end.getTime() - startTime.getTime())
  });

  sessions = sessions.slice(0, MAX_SESSIONS);

  const saved = saveSessions();

  statusUI(false);
  renderHistory();

  if (saved) {
    inform(t('stopped'));
    toastMsg(t('stopped'));
  } else {
    inform(t('saveError'), true);
    toastMsg(t('saveError'));
  }
}

function renderHistory() {
  historyBox.replaceChildren();

  if (!sessions.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';

    const icon = document.createElement('span');
    icon.textContent = '◷';

    const title = document.createElement('strong');
    title.textContent = t('emptyTitle');

    const description = document.createElement('p');
    description.textContent = t('emptyText');

    empty.append(icon, title, description);
    historyBox.appendChild(empty);
    return;
  }

  sessions.forEach((session) => {
    const row = document.createElement('div');
    row.className = 'history-row';

    const icon = document.createElement('span');
    icon.className = 'history-check';
    icon.textContent = '✓';

    const box = document.createElement('div');
    box.className = 'history-copy';

    const title = document.createElement('strong');
    title.textContent = t('session');

    const time = document.createElement('span');
    time.textContent = `${stamp(session.start)} – ${clock(session.end)}`;

    const dur = document.createElement('span');
    dur.className = 'duration';
    dur.textContent = duration(session.duration);

    box.append(title, time);
    row.append(icon, box, dur);
    historyBox.appendChild(row);
  });
}

function applyLanguage() {
  document.documentElement.lang = isTamil ? 'ta' : 'en';

  $('heroTitle').innerHTML = t('heroTitle');

  const elements = {
    heroText: 'heroText',
    statusHeading: 'statusHeading',
    previewTitle: 'previewTitle',
    previewText: 'previewText',
    startText: 'start',
    stopText: 'stop',
    permission: 'permission',
    alertsHeading: 'alertsHeading',
    historyHeading: 'historyHeading',
    clear: 'clear',
    footnote: 'footnote',
    promiseTitle: 'promiseTitle',
    promiseText: 'promiseText',
    disclaimer: 'disclaimer'
  };

  Object.entries(elements).forEach(([id, key]) => {
    $(id).textContent = t(key);
  });

  $('language').textContent = isTamil ? 'English' : 'தமிழ் / EN';

  statusUI(Boolean(stream));
  renderHistory();
}

start.addEventListener('click', startCamera);
stop.addEventListener('click', stopCamera);

$('language').addEventListener('click', () => {
  isTamil = !isTamil;
  applyLanguage();
});

$('clear').addEventListener('click', () => {
  if (stream) {
    toastMsg(t('stopFirst'));
    return;
  }

  sessions = [];

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    inform(t('saveError'), true);
    return;
  }

  renderHistory();
  statusUI(false);
  toastMsg(t('cleared'));
});

window.addEventListener('pagehide', () => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
});

applyLanguage();