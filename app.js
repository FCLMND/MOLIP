(function() {
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'fclmnd';
  const introLoader = document.getElementById('molip-loader');
  const introProgressBar = document.getElementById('molip-loader-progress');
  const introProgressTrack = document.getElementById('molip-loader-track');
  const introStatus = document.getElementById('molip-loader-status');
  const visitorCountryCodes = 'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');
  const visitorCountryCodeSet = new Set(visitorCountryCodes);
  const englishRegionNames = typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null;
  const koreanRegionNames = typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames(['ko'], { type: 'region' })
    : null;
  const timezoneCountryCodes = {
    'Asia/Seoul': 'KR', 'Asia/Tokyo': 'JP', 'Asia/Shanghai': 'CN', 'Asia/Urumqi': 'CN',
    'Asia/Hong_Kong': 'HK', 'Asia/Macau': 'MO', 'Asia/Taipei': 'TW', 'Asia/Singapore': 'SG',
    'Asia/Bangkok': 'TH', 'Asia/Ho_Chi_Minh': 'VN', 'Asia/Jakarta': 'ID', 'Asia/Pontianak': 'ID',
    'Asia/Makassar': 'ID', 'Asia/Jayapura': 'ID', 'Asia/Manila': 'PH', 'Asia/Kuala_Lumpur': 'MY',
    'Asia/Kuching': 'MY', 'Asia/Brunei': 'BN', 'Asia/Phnom_Penh': 'KH', 'Asia/Vientiane': 'LA',
    'Asia/Dhaka': 'BD', 'Asia/Kolkata': 'IN', 'Asia/Karachi': 'PK',
    'Asia/Colombo': 'LK', 'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Jerusalem': 'IL',
    'Asia/Kathmandu': 'NP', 'Europe/London': 'GB', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE',
    'Europe/Rome': 'IT', 'Europe/Madrid': 'ES', 'Europe/Lisbon': 'PT', 'Europe/Amsterdam': 'NL',
    'Europe/Brussels': 'BE', 'Europe/Vienna': 'AT', 'Europe/Zurich': 'CH', 'Europe/Stockholm': 'SE',
    'Europe/Oslo': 'NO', 'Europe/Copenhagen': 'DK', 'Europe/Helsinki': 'FI', 'Europe/Warsaw': 'PL',
    'Europe/Prague': 'CZ', 'Europe/Athens': 'GR', 'Europe/Bucharest': 'RO', 'Europe/Kyiv': 'UA',
    'Europe/Moscow': 'RU', 'Africa/Cairo': 'EG', 'Africa/Johannesburg': 'ZA', 'Africa/Lagos': 'NG',
    'America/Los_Angeles': 'US', 'America/Denver': 'US', 'America/Chicago': 'US',
    'America/New_York': 'US', 'America/Phoenix': 'US', 'America/Anchorage': 'US',
    'Pacific/Honolulu': 'US', 'America/Toronto': 'CA', 'America/Vancouver': 'CA',
    'America/Edmonton': 'CA', 'America/Winnipeg': 'CA', 'America/Halifax': 'CA',
    'America/Mexico_City': 'MX', 'America/Sao_Paulo': 'BR', 'America/Argentina/Buenos_Aires': 'AR',
    'America/Santiago': 'CL', 'America/Bogota': 'CO', 'America/Lima': 'PE',
    'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU',
    'Australia/Perth': 'AU', 'Pacific/Auckland': 'NZ'
  };
  function normalizeVisitorCountry(code) {
    const normalizedCode = typeof code === 'string' ? code.trim().toUpperCase() : '';
    return visitorCountryCodeSet.has(normalizedCode) ? normalizedCode : null;
  }
  function detectVisitorCountry() {
    const language = navigator.language || '';
    let languageRegion = '';
    try {
      if (language && typeof Intl.Locale === 'function') {
        languageRegion = new Intl.Locale(language.replace(/_/g, '-')).region || '';
      }
    } catch (error) {
      console.warn('Visitor country could not be read from the browser language:', error);
    }
    if (!languageRegion) {
      const regionMatch = language.match(/(?:^|[-_])([A-Za-z]{2})(?:$|-)/);
      languageRegion = regionMatch ? regionMatch[1] : '';
    }
    const languageCountry = normalizeVisitorCountry(languageRegion);
    if (languageCountry) return languageCountry;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    return timezoneCountryCodes[timezone] || 'KR';
  }
  const savedVisitorCountry = localStorage.getItem('molip_visitor_country');
  let visitorCountryCode = normalizeVisitorCountry(savedVisitorCountry) || detectVisitorCountry();
  if (savedVisitorCountry !== visitorCountryCode) {
    localStorage.setItem('molip_visitor_country', visitorCountryCode);
  }
  function countryFlagEmoji(code) {
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => 127397 + c.charCodeAt(0)));
  }
  const visitorCountrySelector = document.getElementById('visitor-country-selector');
  const visitorCountryBadge = document.getElementById('visitor-country-badge');
  const visitorCountryFlag = document.getElementById('visitor-country-flag');
  const visitorCountryCodeLabel = document.getElementById('visitor-country-code');
  const visitorCountryPopup = document.getElementById('visitor-country-popup');
  const visitorCountrySearch = document.getElementById('visitor-country-search');
  const visitorCountryList = document.getElementById('visitor-country-list');
  const visitorCountryOptions = visitorCountryCodes.map(code => ({
    code,
    englishName: englishRegionNames ? englishRegionNames.of(code) || code : code,
    koreanName: koreanRegionNames ? koreanRegionNames.of(code) || code : code
  })).sort((a, b) => a.englishName.localeCompare(b.englishName));
  function updateVisitorCountryBadge() {
    if (!visitorCountryFlag || !visitorCountryCodeLabel) return;
    visitorCountryFlag.textContent = countryFlagEmoji(visitorCountryCode);
    visitorCountryCodeLabel.textContent = visitorCountryCode;
  }
  function renderVisitorCountryOptions(query) {
    if (!visitorCountryList) return;
    const normalizedQuery = query.trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const matches = visitorCountryOptions.filter(country =>
      `${country.code} ${country.englishName} ${country.koreanName}`
        .toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedQuery)
    );
    visitorCountryList.replaceChildren();
    matches.forEach(country => {
      const option = document.createElement('button');
      option.type = 'button';
      option.setAttribute('role', 'option');
      option.dataset.countryCode = country.code;
      const flag = document.createElement('span');
      flag.className = 'country-flag';
      flag.setAttribute('aria-hidden', 'true');
      flag.textContent = countryFlagEmoji(country.code);
      const name = document.createElement('span');
      name.textContent = country.englishName;
      const code = document.createElement('span');
      code.className = 'country-code';
      code.textContent = country.code;
      option.append(flag, name, code);
      visitorCountryList.appendChild(option);
    });
    if (!matches.length) {
      const empty = document.createElement('div');
      empty.id = 'visitor-country-empty';
      empty.textContent = 'No countries found';
      visitorCountryList.appendChild(empty);
    }
  }
  function closeVisitorCountryPopup() {
    if (!visitorCountryPopup || !visitorCountryBadge) return;
    visitorCountryPopup.hidden = true;
    visitorCountryBadge.setAttribute('aria-expanded', 'false');
  }
  updateVisitorCountryBadge();
  if (visitorCountryBadge && visitorCountryPopup) {
    visitorCountryBadge.addEventListener('click', () => {
      visitorCountryPopup.hidden = !visitorCountryPopup.hidden;
      visitorCountryBadge.setAttribute('aria-expanded', String(!visitorCountryPopup.hidden));
      if (!visitorCountryPopup.hidden) {
        renderVisitorCountryOptions(visitorCountrySearch ? visitorCountrySearch.value : '');
        if (visitorCountrySearch) visitorCountrySearch.focus();
      }
    });
  }
  if (visitorCountrySearch) {
    visitorCountrySearch.addEventListener('input', () => renderVisitorCountryOptions(visitorCountrySearch.value));
    visitorCountrySearch.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeVisitorCountryPopup();
    });
  }
  if (visitorCountryList) {
    visitorCountryList.addEventListener('click', event => {
      const option = event.target.closest('button[data-country-code]');
      if (!option) return;
      visitorCountryCode = option.dataset.countryCode;
      localStorage.setItem('molip_visitor_country', visitorCountryCode);
      updateVisitorCountryBadge();
      window.updateAvatarCountry(visitorCountryCode);
      closeVisitorCountryPopup();
    });
  }
  document.addEventListener('pointerdown', event => {
    if (visitorCountrySelector && !visitorCountrySelector.contains(event.target)) closeVisitorCountryPopup();
  });
  if (visitorCountrySelector) {
    visitorCountrySelector.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeVisitorCountryPopup();
    });
  }
  let introReady = false, introDismissed = false, introIsCompleting = false, introLoadComplete = false;
  let introRenderedFrames = 0;
  const introAudio = typeof window.Audio === 'function' ? new window.Audio() : null;
  const introAudioPaths = ['./media/shop_sound.mp3'];
  let introAudioUnavailable = false, introAudioPlayPending = false;
  let introAudioStopping = false, introAudioFadeFrame = 0;

  function markIntroAudioUnavailable() {
    if (introAudioUnavailable) return;
    introAudioUnavailable = true;
    console.warn('No playable intro soundtrack found in the configured fallback paths.');
  }

  function tryPlayIntroAudio() {
    if (!introAudio || introAudioUnavailable || !introAudio.paused || introAudioPlayPending) return;
    introAudioPlayPending = true;
    let playAttempt;
    try {
      playAttempt = introAudio.play();
    } catch (error) {
      introAudioPlayPending = false;
      console.warn('Intro audio playback could not start:', error);
      return;
    }
    if (playAttempt && typeof playAttempt.then === 'function') {
      playAttempt.then(() => {
        introAudioPlayPending = false;
      }).catch(error => {
        introAudioPlayPending = false;
        if (error.name === 'NotAllowedError' || (error.name === 'AbortError' && introAudioStopping)) return;
        if (error.name === 'NotSupportedError') {
          markIntroAudioUnavailable();
          return;
        }
        console.warn('Intro audio playback could not start:', error);
      });
    } else {
      introAudioPlayPending = false;
    }
  }

  function fadeOutIntroAudio(duration) {
    if (!introAudio) return;
    introAudioStopping = true;
    if (introAudioFadeFrame) cancelAnimationFrame(introAudioFadeFrame);
    const startVolume = introAudio.volume;
    if (introAudio.paused || startVolume <= 0) {
      introAudio.pause();
      return;
    }
    const startTime = performance.now();
    const fade = now => {
      const progress = Math.min(1, (now - startTime) / duration);
      introAudio.volume = startVolume * (1 - progress);
      if (progress < 1) {
        introAudioFadeFrame = requestAnimationFrame(fade);
      } else {
        introAudio.pause();
        introAudioFadeFrame = 0;
      }
    };
    introAudioFadeFrame = requestAnimationFrame(fade);
  }

  if (introAudio) {
    introAudio.loop = true;
    introAudio.volume = 0.45;
    introAudio.preload = 'metadata';
    introAudioPaths.forEach(path => {
      const source = document.createElement('source');
      source.src = path;
      introAudio.appendChild(source);
    });
    introAudio.addEventListener('error', markIntroAudioUnavailable);
    introAudio.load();
    tryPlayIntroAudio();
  }

  function setIntroProgress(value) {
    const progress = Math.max(0, Math.min(100, Math.round(value)));
    if (introProgressBar) introProgressBar.style.width = `${progress}%`;
    if (introProgressTrack) introProgressTrack.setAttribute('aria-valuenow', String(progress));
  }

  function dismissIntro(startMedia) {
    if (!introLoader || !introReady || introDismissed) return;
    introDismissed = true;
    if (startMedia) {
      if (vEl && vEl.src) playMedia(vEl);
      startMainAudioWithFade(850);
    }
    fadeOutIntroAudio(850);
    introLoader.classList.add('is-exiting');
    window.setTimeout(() => introLoader.remove(), 850);
  }

  function startRoomMediaFromGesture() {
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(error => console.warn('Audio context could not resume:', error));
    }

    if (aEl) {
      aEl.muted = false;
      aEl.volume = 1.0;
      if (aEl.src && aEl.readyState === HTMLMediaElement.HAVE_NOTHING) aEl.load();
      try {
        const playAttempt = aEl.play();
        if (playAttempt && typeof playAttempt.catch === 'function') {
          playAttempt.catch(error => console.warn('Room audio playback could not start:', error));
        }
      } catch (error) {
        console.warn('Room audio playback could not start:', error);
      }
    }

    if (vEl) {
      vEl.muted = true;
      try {
        const playAttempt = vEl.play();
        if (playAttempt && typeof playAttempt.catch === 'function') {
          playAttempt.catch(error => console.warn('Room visual playback could not start:', error));
        }
      } catch (error) {
        console.warn('Room visual playback could not start:', error);
      }
    }
  }

  function finishIntroLoading() {
    if (!introLoader || introLoadComplete) return;
    introLoadComplete = true;
    setIntroProgress(100);
    updateIntroEntryAvailability();
  }

  if (introLoader) {
    setIntroProgress(0);
    introLoader.addEventListener('mousemove', tryPlayIntroAudio, { passive: true });
    const handleIntroEntry = event => {
      if (introDismissed) return;
      if (event.target instanceof Element && event.target.closest('#visitor-country-selector')) {
        tryPlayIntroAudio();
        return;
      }
      if (!introReady) {
        tryPlayIntroAudio();
        event.stopPropagation();
        return;
      }
      if (isTouchDevice || event.pointerType === 'touch') {
        startRoomMediaFromGesture();
        dismissIntro(false);
      } else {
        tryPlayIntroAudio();
        dismissIntro(true);
      }
    };
    introLoader.addEventListener('pointerdown', handleIntroEntry, true);
    introLoader.addEventListener('touchend', handleIntroEntry, { capture: true, passive: true });
    introLoader.addEventListener('click', handleIntroEntry, true);
  }

  setIntroProgress(8);
  const HOST_SECRET_KEY = 'mykey';
  const urlParams = new URLSearchParams(window.location.search);
  const isHostUser = (urlParams.get('host') === HOST_SECRET_KEY);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x040406);
  scene.fog = new THREE.FogExp2(0x040406, 0.019);

  const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 140);
  const defaultCameraFov = camera.fov;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
    preserveDrawingBuffer: false,
    failIfMajorPerformanceCaveat: false
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = false;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.14;
  document.body.appendChild(renderer.domElement);
  function updateCameraViewport() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov = isTouchDevice && window.innerHeight > window.innerWidth ? 76 : defaultCameraFov;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  updateCameraViewport();
  setIntroProgress(18);

  // WebGL 컨텍스트 손실 시 자동 복구 핸들러
  renderer.domElement.addEventListener('webglcontextlost', e => {
    e.preventDefault();
  }, false);
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    window.location.reload();
  }, false);



  let camMode = isHostUser ? 'overview' : 'seat';
  let drag = false, downX = 0, downY = 0, px = 0, py = 0;
  let ax = 0, ay = 0.22, rad = 15.2, seatYaw = 0, seatPitch = 0.08;
let shopZoom = 0.35; 
  const camPosCurrent = new THREE.Vector3(0, 4.8, 18.5);
  const camLookCurrent = new THREE.Vector3(0, 2.0, -1.2);
  const camPosTarget = new THREE.Vector3();
  const camLookTarget = new THREE.Vector3();
  const cameraDirection = new THREE.Vector3();
  const minCameraTargetDistance = 0.7;

  const tex = window.RoomTextures;
  const concTex = tex.mkConcreteFloor(), templeFloorTex = tex.mkTempleWoodFloor(), coneTex = tex.mkCone(), ivoryTex = tex.mkIvoryFabric();
  const mats = {
    floor: new THREE.MeshStandardMaterial({ map: templeFloorTex, bumpMap: templeFloorTex, bumpScale: 0.008, roughness: 0.56, metalness: 0.04 }),
    wall: new THREE.MeshStandardMaterial({ map: concTex, roughness: 0.88, side: THREE.DoubleSide }),
    wal: new THREE.MeshStandardMaterial({ map: tex.mkWood('#4a2c18', '#1f1007'), roughness: 0.38 }),
    jblCab: new THREE.MeshStandardMaterial({ map: tex.mkWood('#6b3e1e', '#261206'), roughness: 0.34 }),
    jblBlue: new THREE.MeshStandardMaterial({ map: tex.mkBlueBaffle(), roughness: 0.72 }),
    cone: new THREE.MeshStandardMaterial({ map: coneTex, bumpMap: coneTex, bumpScale: 0.01, roughness: 0.78, side: THREE.DoubleSide }),
    ivory: new THREE.MeshStandardMaterial({ map: ivoryTex, bumpMap: ivoryTex, bumpScale: 0.005, roughness: 0.88 }),
    ivoryCushion: new THREE.MeshStandardMaterial({ color: 0xc9beaa, map: ivoryTex, bumpMap: ivoryTex, bumpScale: 0.004, roughness: 0.85 }),
    blanket: new THREE.MeshStandardMaterial({ color: 0x262932, map: ivoryTex, bumpMap: ivoryTex, bumpScale: 0.006, roughness: 0.92 }),
    blk: new THREE.MeshStandardMaterial({ color: 0x101014, roughness: 0.4 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x18181d, roughness: 0.28, metalness: 0.82 }),
    alum: new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.22, metalness: 0.92 }),
    panel: new THREE.MeshStandardMaterial({ map: tex.mkPanel(), roughness: 0.35, metalness: 0.5 })
  };
  setIntroProgress(38);

  scene.add(new THREE.AmbientLight(0x93c5fd, 0.09));
  const mainSpot = new THREE.SpotLight(0xffcf96, 1.6); mainSpot.position.set(1.4, 7.6, 2.2); mainSpot.angle = Math.PI / 3.2; mainSpot.penumbra = 0.9; mainSpot.castShadow = false; scene.add(mainSpot);

  const screenGlow = new THREE.PointLight(0x7aa2f7, 2.2, 26); screenGlow.position.set(0, 3.2, -2.2); scene.add(screenGlow);

  const beds = window.RoomBuilder.build(scene, mats, tex);
  const archiveShop = window.ArchiveShop ? window.ArchiveShop.build(scene, mats, tex, isAdmin) : null;
  if (archiveShop && archiveShop.group) archiveShop.group.visible = true;
  window.DJBooth.build(scene, mats);
  // DJ table footprint (2.85 x 0.88 m) expanded by avatar clearance.
  const djTableCollider = { minX: -1.605, maxX: 1.605, minZ: -1.27, maxZ: -0.03 };
  const isInsideDjTable = (x, z) =>
    x > djTableCollider.minX && x < djTableCollider.maxX &&
    z > djTableCollider.minZ && z < djTableCollider.maxZ;
  window.SpeakerSystem.buildAll(scene, mats);
  setIntroProgress(65);

  const djAvatar = window.DJAvatarSystem.create(tex, 'FCLMND', 'KR');
  scene.add(djAvatar.root);

  const avatars = [];
  function assignSeatOrWait(avatar, preferredIdx = -1) {
    const emptyBeds = beds.filter(b => !b.occupied);
    if (emptyBeds.length > 0) {
      const target = (preferredIdx >= 0 && beds.at(preferredIdx) && !beds.at(preferredIdx).occupied) ? beds.at(preferredIdx) : emptyBeds.at(0);
      avatar.sitOnBed(target);
      return true;
    } else {
      avatar.standInWaitingZone((Math.random() - 0.5) * 4.2, 19.2);
      return false;
    }
  }

  const playerAvatar = window.AvatarSystem.create(tex, visitorCountryCode, true);
  scene.add(playerAvatar.root);
  if (isHostUser) {
    playerAvatar.standInWaitingZone(-7.2, 19.2);
  } else {
    assignSeatOrWait(playerAvatar, 4);
  }
  avatars.push(playerAvatar);

  const archiveShopPOIs = [
    { x: -11.2, z: 18.8, lookAt: { x: -12.2, z: 17.8 } },
    { x: -12.6, z: 18.1, lookAt: { x: -12.6, z: 17.1 } },
    { x: -14.2, z: 18.2, lookAt: { x: -19.02, z: 16.05 } },
    { x: -15.3, z: 18.9, lookAt: { x: -16.3, z: 18.9 } },
    { x: -13.5, z: 19.5, lookAt: { x: -13.5, z: 20.5 } }
  ];

  const jpAvatar = window.AvatarSystem.create(tex, 'JP', false);
  scene.add(jpAvatar.root); assignSeatOrWait(jpAvatar, 14); avatars.push(jpAvatar);
  jpAvatar.walkTo(archiveShopPOIs[0].x, archiveShopPOIs[0].z, null);

  const emptyForFr = beds.filter(b => !b.occupied);
  if (emptyForFr.length > 0) {
    emptyForFr.sort((a, b) => (b.x + b.z) - (a.x + a.z));
    const frAvatar = window.AvatarSystem.create(tex, 'FR', false);
    scene.add(frAvatar.root); frAvatar.sitOnBed(emptyForFr.at(0)); avatars.push(frAvatar);
    frAvatar.walkTo(archiveShopPOIs[1].x, archiveShopPOIs[1].z, null);
  }

  const ambientWalker = window.AvatarSystem.create(tex, 'DE', false);
  scene.add(ambientWalker.root); assignSeatOrWait(ambientWalker); avatars.push(ambientWalker);

  function disableShadows(root) {
    root.traverse(object => {
      if (object.isMesh) {
        object.castShadow = false;
        object.receiveShadow = false;
      }
    });
  }
  scene.children.forEach(root => {
    if (!archiveShop || root !== archiveShop.group) disableShadows(root);
  });

  let prevPlayerState = playerAvatar.state, isSimFullMode = false, simNpcList = [];
  const statusBadge = document.getElementById('status-badge');
  const viewBtn = document.getElementById('view-btn');
  const simBtn = document.getElementById('sim-btn');
  const visualUploadButton = document.querySelector('label[for="v-up"]');
  const audioUploadButton = document.querySelector('label[for="a-up"]');
  const hostPanel = document.getElementById('host-panel');
  const djInitialInput = document.getElementById('dj-initial-input');
  const djViewBtn = document.getElementById('dj-view-btn');
  const adminPanel = document.getElementById('admin-panel');
  const adminShopSignInput = document.getElementById('admin-shop-sign-input');
  const savedShopSignText = localStorage.getItem('molip_shop_sign_text');

  if (adminPanel) adminPanel.style.display = isAdmin ? 'flex' : 'none';
  if (hostPanel) hostPanel.style.display = isAdmin ? 'flex' : 'none';
  if (djViewBtn) djViewBtn.style.display = isAdmin ? 'block' : 'none';
  if (visualUploadButton) visualUploadButton.style.display = isAdmin ? 'inline-block' : 'none';
  if (audioUploadButton) audioUploadButton.style.display = isAdmin ? 'inline-block' : 'none';
  if (simBtn) simBtn.style.display = isAdmin ? 'inline-block' : 'none';
  if (adminShopSignInput) {
    adminShopSignInput.value = savedShopSignText ?? '';
    if (savedShopSignText !== null && window.updateShopSignText) {
      window.updateShopSignText(savedShopSignText);
    }
    if (isAdmin) {
      adminShopSignInput.addEventListener('input', e => {
        localStorage.setItem('molip_shop_sign_text', e.target.value);
        if (window.updateShopSignText) window.updateShopSignText(e.target.value);
      });
    }
  }

  function updateIntroEntryAvailability() {
    if (!introLoadComplete || introDismissed) return;
    const badgeText = statusBadge ? statusBadge.textContent : '';
    const isFull = badgeText.startsWith('0 / ');
    introReady = !isFull;
    if (introStatus) {
      introStatus.querySelector('.status-en').textContent = isFull
        ? 'SANCTUARY IS AT FULL CAPACITY'
        : 'CLICK TO ENTER';
      introStatus.querySelector('.status-ko').textContent = isFull
        ? '현재 접속자가 많아 입장이 대기 중입니다'
        : '클릭하여 공간에 입장하기';
      introStatus.classList.toggle('is-ready', !isFull);
    }
  }

  if (isAdmin && hostPanel) {
    hostPanel.style.display = 'flex';
    if (djInitialInput) djInitialInput.value = 'FCLMND';
    if (djViewBtn) {
      djViewBtn.addEventListener('click', () => {
        camMode = (camMode === 'dj') ? 'overview' : 'dj';
        seatYaw = 0;
        seatPitch = 0.04;
        updateStatusUI();
      });
    }
  }

  function isPlayerInShop() {
    return playerAvatar.root.position.x < -9.5;
  }

  function isArchiveShopAudioActive() {
    return playerAvatar.root.position.x < -9.8 || (camMode === 'shop' && playerAvatar.state === 'waiting');
  }

  let shopNavBtn = null;
  function updateStatusUI() {
    const totalSeats = beds.length;
    const emptyCount = beds.filter(b => !b.occupied).length;
    const inShop = isPlayerInShop();
    if (statusBadge) {
      statusBadge.textContent = `${emptyCount} / ${totalSeats} Seats`;
      if (inShop) {
        statusBadge.style.borderColor = 'rgba(217, 119, 54, 0.72)';
        statusBadge.style.color = '#fde68a';
      } else if (isHostUser) {
        statusBadge.style.borderColor = 'rgba(255, 85, 105, 0.55)';
        statusBadge.style.color = '#fecdd3';
      } else if (playerAvatar.state === 'waiting') {
        statusBadge.style.borderColor = emptyCount > 0 ? 'rgba(255, 184, 102, 0.75)' : 'rgba(255, 255, 255, 0.16)';
        statusBadge.style.color = emptyCount > 0 ? '#ffd599' : '#d1d5db';
      } else {
        statusBadge.style.borderColor = 'rgba(255, 255, 255, 0.14)';
        statusBadge.style.color = '#e5e7eb';
      }
    }
    if (viewBtn) {
      viewBtn.textContent = 'Overview';
      viewBtn.classList.toggle('active', inShop || camMode === 'seat' || camMode === 'waiting' || camMode === 'dj');
    }
    if (shopNavBtn) shopNavBtn.textContent = inShop ? '← Listening Room' : 'Archive Shop';
    if (djViewBtn) {
      djViewBtn.classList.toggle('active', camMode === 'dj');
    }
    updateIntroEntryAvailability();
  }
  updateStatusUI();

  if (viewBtn) {
    viewBtn.addEventListener('click', () => {
      if (isPlayerInShop()) camMode = camMode === 'shop' ? 'overview' : 'shop';
      else if (camMode === 'seat' || camMode === 'waiting' || camMode === 'dj') camMode = 'overview';
      else { camMode = (playerAvatar.state === 'waiting') ? 'waiting' : 'seat'; seatYaw = 0; seatPitch = 0.08; }
      updateStatusUI();
    });
  }

  if (simBtn) {
    simBtn.addEventListener('click', () => {
      if (!isSimFullMode) {
        isSimFullMode = true; simBtn.textContent = 'One Seat Available'; simBtn.classList.add('active');
        if (!isHostUser) { playerAvatar.standInWaitingZone(0.0, 19.2); camMode = 'waiting'; seatYaw = 0; seatPitch = 0.04; }
        const flags = ['JP', 'FR', 'DE', 'US', 'GB', 'ES', 'IT', 'BR'];
        beds.forEach((b, idx) => {
          if (!b.occupied) {
            const npc = window.AvatarSystem.create(tex, flags.at(idx % flags.length), false);
            disableShadows(npc.root);
            scene.add(npc.root); npc.sitOnBed(b); avatars.push(npc); simNpcList.push(npc);
          }
        });
        updateStatusUI();
      } else if (simNpcList.length > 0) {
        const leavingNpc = simNpcList.pop();
        if (leavingNpc.bedRef) leavingNpc.bedRef.occupied = false;
        scene.remove(leavingNpc.root);
        const idx = avatars.indexOf(leavingNpc);
        if (idx > -1) avatars.splice(idx, 1);
        isSimFullMode = false; simBtn.textContent = 'Full Room Test'; simBtn.classList.remove('active');
        updateStatusUI();
      }
    });
  }
  const clickMarker = new THREE.Mesh(
    new THREE.RingGeometry(0.18, 0.24, 32),
    new THREE.MeshBasicMaterial({ color: 0xffb866, side: THREE.DoubleSide, transparent: true, opacity: 0.0 })
  );
  clickMarker.rotation.x = -Math.PI / 2; clickMarker.position.y = 0.015; scene.add(clickMarker);

  const raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const bedMeshes = [];
  beds.forEach(b => b.mesh.traverse(c => { if (c.isMesh) { c.userData.bedRef = b; bedMeshes.push(c); } }));
  const shopClickables = archiveShop ? archiveShop.clickables : [];
  const shopFloorMesh = archiveShop ? archiveShop.floorMesh : null;
  const shopEntryTrigger = archiveShop ? archiveShop.entryTrigger : null;

  shopNavBtn = document.createElement('button');
  shopNavBtn.textContent = isPlayerInShop() ? '← Listening Room' : 'Archive Shop';
  shopNavBtn.style.cssText = 'padding:8px 15px;border-radius:999px;border:1px solid rgba(217,119,54,0.65);background:rgba(18,16,14,0.82);backdrop-filter:blur(10px);color:#fde68a;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:12.5px;font-weight:600;cursor:pointer;z-index:30;transition:all 0.2s;';
  document.getElementById('ui-bar').appendChild(shopNavBtn);

  function enterArchiveShopDirect() {
    if (playerAvatar.bedRef) {
      playerAvatar.bedRef.occupied = false;
      playerAvatar.bedRef = null;
    }
    playerAvatar.state = 'waiting';
    playerAvatar.sitProg = 0;
    playerAvatar.targetPos = null;
    playerAvatar.targetBed = null;
    playerAvatar.root.position.set(-11.4, 0, 18.8);
    playerAvatar.root.rotation.y = Math.PI / 2;

    camMode = 'shop';
    seatYaw = 0;
    seatPitch = 0.02;
    startShopAudioFromUserGesture();
    updateStatusUI();
  }

  shopNavBtn.addEventListener('click', () => {
    if (!archiveShop) return;
    if (isPlayerInShop()) {
      playerAvatar.root.position.set(-7.6, 0, 18.8);
      playerAvatar.walkTo(-6.8, 18.8, null);
      camMode = 'overview';
      updateStatusUI();
    } else {
      enterArchiveShopDirect();
    }
  });

  function updateMouseCoords(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  window.addEventListener('mousedown', e => {
    if (e.target !== renderer.domElement) return;
    drag = true; downX = px = e.clientX; downY = py = e.clientY;
  });

  window.addEventListener('mousemove', e => {
    if (drag) {
      const dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY;
      if (camMode === 'shop') {
        seatYaw -= dx * 0.0085;
        seatPitch = Math.max(-0.48, Math.min(0.68, seatPitch + dy * 0.0065));
      } else if (camMode === 'seat' || camMode === 'waiting' || camMode === 'dj') {
        seatYaw = camMode === 'dj'
          ? seatYaw - dx * 0.0075
          : Math.max(-2.6, Math.min(2.6, seatYaw - dx * 0.0075));
        seatPitch = Math.max(-0.28, Math.min(0.65, seatPitch + dy * 0.006));
      } else {
        ax -= dx * 0.0075;
        ay = Math.max(0.02, Math.min(0.75, ay + dy * 0.0065));
      }
      return;
    }
    if (e.target === renderer.domElement) {
      updateMouseCoords(e); raycaster.setFromCamera(mouse, camera);
      const shopHits = shopClickables.length > 0 ? raycaster.intersectObjects(shopClickables, false) : [];
      if (shopHits.length > 0) {
        document.body.style.cursor = 'pointer';
        return;
      }
      if (shopEntryTrigger && raycaster.intersectObject(shopEntryTrigger, false).length > 0) {
        document.body.style.cursor = 'pointer';
        return;
      }
      if (isPlayerInShop() && shopFloorMesh && raycaster.intersectObject(shopFloorMesh, false).length > 0) {
        document.body.style.cursor = 'pointer';
        return;
      }
      const hits = raycaster.intersectObjects(bedMeshes, false);
      document.body.style.cursor = (hits.length > 0 && !hits.at(0).object.userData.bedRef.occupied) ? 'pointer' : 'default';
    }
  });

  window.addEventListener('keydown', e => {
    if (camMode !== 'dj' ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement) return;
    const key = e.key.toLowerCase();
    if (!['w', 'a', 's', 'd'].includes(key)) return;
    e.preventDefault();
    if (key === 'a') seatYaw += 0.08;
    else if (key === 'd') seatYaw -= 0.08;
    else if (key === 'w') seatPitch = Math.min(0.65, seatPitch + 0.04);
    else if (key === 's') seatPitch = Math.max(-0.28, seatPitch - 0.04);
  });

  window.addEventListener('mouseup', e => {
    const moved = Math.hypot(e.clientX - downX, e.clientY - downY); drag = false;
    if (e.target === renderer.domElement && moved < 5) {
      updateMouseCoords(e); raycaster.setFromCamera(mouse, camera);

      const shopHits = shopClickables.length > 0 ? raycaster.intersectObjects(shopClickables, false) : [];
      if (shopHits.length > 0 && archiveShop) {
        const hitItem = shopHits.at(0).object.userData.shopItem;
        if (hitItem) {
          archiveShop.openItemModal(hitItem);
          return;
        }
      }

      if (!isPlayerInShop() && shopEntryTrigger && raycaster.intersectObject(shopEntryTrigger, false).length > 0) {
        enterArchiveShopDirect();
        return;
      }

      if (isPlayerInShop()) {
        if (shopFloorMesh) {
          const shopFloorHits = raycaster.intersectObject(shopFloorMesh, false);
          if (shopFloorHits.length > 0) {
            const pt = shopFloorHits.at(0).point;
            const targetX = Math.max(-22.4, Math.min(-10.5, pt.x));
            const targetZ = Math.max(16.0, Math.min(21.6, pt.z));
            playerAvatar.walkTo(targetX, targetZ, null);
            clickMarker.position.set(targetX, 0.035, targetZ);
            clickMarker.scale.set(1.0, 1.0, 1.0);
            clickMarker.material.opacity = 0.85;
          }
        }
        return;
      }

      const bedHits = raycaster.intersectObjects(bedMeshes, false);
      if (bedHits.length > 0) {
        const clickedBed = bedHits.at(0).object.userData.bedRef;
        if (!clickedBed.occupied) {
          const optA = { x: clickedBed.x + Math.cos(clickedBed.rotY) * 0.68, z: clickedBed.z - Math.sin(clickedBed.rotY) * 0.68 };
          const optB = { x: clickedBed.x - Math.cos(clickedBed.rotY) * 0.68, z: clickedBed.z + Math.sin(clickedBed.rotY) * 0.68 };
          const getClearance = pt => {
            if (Math.abs(pt.x) > 8.6 || pt.z < 0.8 || pt.z > 20.6) return -999;
            let minD = 999;
            for (let i = 0; i < beds.length; i++) if (beds.at(i).id !== clickedBed.id) minD = Math.min(minD, Math.hypot(pt.x - beds.at(i).x, pt.z - beds.at(i).z));
            return minD;
          };
          const bestEntry = getClearance(optA) >= getClearance(optB) ? optA : optB;
          playerAvatar.walkTo(bestEntry.x, bestEntry.z, clickedBed);
          camMode = 'overview'; updateStatusUI();
          clickMarker.position.set(clickedBed.x, 0.015, clickedBed.z); clickMarker.scale.set(2.2, 2.2, 1); clickMarker.material.opacity = 0.75;
          return;
        }
      }

      const hitPt = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(groundPlane, hitPt)) {
        const safeX = Math.max(-8.4, Math.min(8.4, hitPt.x));
        const safeZ = Math.max(0.8, Math.min(20.6, hitPt.z));
        playerAvatar.walkTo(safeX, safeZ, null);
        camMode = 'overview'; updateStatusUI();
        clickMarker.position.set(safeX, 0.015, safeZ); clickMarker.scale.set(1.0, 1.0, 1.0); clickMarker.material.opacity = 0.85;
      }
    }
  });

    window.addEventListener('wheel', e => {
    if (camMode === 'overview') {
      rad = Math.max(2.0, Math.min(16.5, rad + e.deltaY * 0.006));
    } else if (camMode === 'shop') {
      shopZoom = Math.max(0.0, Math.min(1.0, shopZoom + e.deltaY * 0.0012));
    }
  });

  const cvs = document.createElement('canvas'); cvs.width = 1024; cvs.height = 576;
  const ctx = cvs.getContext('2d'), fTex = new THREE.CanvasTexture(cvs);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(19.4, 7.18), new THREE.MeshBasicMaterial({ map: fTex, fog: false, side: THREE.DoubleSide }));
  wall.position.set(0, 3.59, -3.25); scene.add(wall);

  let blanketProg = 0, isFs = false, waveformFrame = 0;
  const bBtn = document.getElementById('breathe-btn');
  const breathingToast = document.getElementById('breathing-toast');
  let breathingToastTimer = 0;
  if (bBtn) {
    bBtn.addEventListener('click', () => {
      if (!breathingToast) return;
      window.clearTimeout(breathingToastTimer);
      breathingToast.classList.add('is-visible');
      breathingToast.setAttribute('aria-hidden', 'false');
      breathingToastTimer = window.setTimeout(() => {
        breathingToast.classList.remove('is-visible');
        breathingToast.setAttribute('aria-hidden', 'true');
      }, 2000);
    });
  }

  const fsWrap = document.getElementById('td-fs-wrap'), fsVideo = document.getElementById('td-fs-video'), fsCanvas = document.getElementById('td-fs-canvas'), fsCtx = fsCanvas ? fsCanvas.getContext('2d') : null;
  const vEl = document.getElementById('td-v'), aEl = document.getElementById('rm-a');
  const shopVisual = document.getElementById('shop-v');
  if (fsVideo) {
    fsVideo.muted = true;
    fsVideo.loop = true;
    fsVideo.playsInline = true;
    fsVideo.preload = 'auto';
    fsVideo.setAttribute('playsinline', '');
    fsVideo.setAttribute('webkit-playsinline', '');
  }
  if (shopVisual) {
    shopVisual.muted = true;
    shopVisual.loop = true;
    shopVisual.playsInline = true;
    shopVisual.preload = 'auto';
    shopVisual.setAttribute('playsinline', '');
    shopVisual.setAttribute('webkit-playsinline', '');
  }
  let shopVisualActive = false;
  const shopAudio = typeof window.Audio === 'function' ? new window.Audio() : null;
  const shopAudioPaths = ['./media/shop_sound.mp3'];
  let shopAudioPathIndex = 0;

  function loadShopAudioFallback() {
    if (!shopAudio) return;
    if (shopAudioPathIndex >= shopAudioPaths.length) {
      console.warn('No archive shop soundtrack found in the configured fallback paths.');
      return;
    }
    shopAudio.src = shopAudioPaths[shopAudioPathIndex++];
    shopAudio.load();
  }

  if (shopAudio) {
    shopAudio.loop = true;
    shopAudio.volume = 0;
    shopAudio.preload = 'auto';
    shopAudio.addEventListener('error', loadShopAudioFallback);
    loadShopAudioFallback();
  }

  const DEFAULT_VISUAL_URL = 'media/visual.mp4';
  const DEFAULT_SOUND_URL = './media/Sound.mp3';
  const pendingVideoPlayback = new WeakSet();

  function playMedia(media) {
    if (!media || typeof media.play !== 'function') return;
    if (media instanceof HTMLVideoElement && media.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
      if (!pendingVideoPlayback.has(media)) {
        pendingVideoPlayback.add(media);
        const startWhenReady = () => {
          if (!pendingVideoPlayback.delete(media)) return;
          if (media.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) playMedia(media);
        };
        const clearPending = () => pendingVideoPlayback.delete(media);
        media.addEventListener('canplay', startWhenReady, { once: true });
        media.addEventListener('error', clearPending, { once: true });
      }
      return;
    }
    const playResult = media.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(error => console.warn('Media playback could not start:', error));
    }
    return playResult;
  }

  function pauseMedia(media) {
    if (!media || typeof media.pause !== 'function') return;
    if (media instanceof HTMLVideoElement) pendingVideoPlayback.delete(media);
    media.pause();
  }

  function createVideoTexture(video) {
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
  }

  if (vEl) {
    vEl.preload = 'auto';
    vEl.loop = true;
    vEl.muted = true;
    vEl.playsInline = true;
    vEl.setAttribute('webkit-playsinline', '');
    vEl.crossOrigin = 'anonymous';
    vEl.src = DEFAULT_VISUAL_URL;
    wall.material.map = createVideoTexture(vEl);
    wall.material.needsUpdate = true;
    playMedia(vEl);
    vEl.addEventListener('pause', () => {
      if (!isArchiveShopAudioActive()) playMedia(vEl);
    });
  }

  if (aEl) {
    aEl.src = DEFAULT_SOUND_URL;
    window.addEventListener('pointerdown', function startDefaultAudio() {
      if (isArchiveShopAudioActive()) return;
      if (aEl.paused && aEl.src) {
        initAudio();
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        playMedia(aEl);
      }
      window.removeEventListener('pointerdown', startDefaultAudio);
    });
  }

  const fsBtn = document.getElementById('fs-btn');
  if (fsBtn) {
    fsBtn.addEventListener('click', () => {
      if (!fsWrap) return;
      isFs = true; fsWrap.classList.add('active');
      if (vEl && fsVideo && fsCanvas && vEl.src) {
        fsVideo.src = vEl.src; fsVideo.currentTime = vEl.currentTime; fsVideo.style.display = 'block'; fsCanvas.style.display = 'none';
        if (!vEl.paused) playMedia(fsVideo);
      } else if (fsVideo && fsCanvas) {
        fsVideo.style.display = 'none'; fsCanvas.style.display = 'block';
      }
      if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
    });
  }
  function exitFs() {
    isFs = false;
    if (fsWrap) fsWrap.classList.remove('active');
    if (fsVideo) fsVideo.pause();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }
  const exitFsBtn = document.getElementById('exit-fs-btn');
  if (exitFsBtn) exitFsBtn.addEventListener('click', exitFs);
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && isFs) exitFs(); });

  let audioCtx, analyser, muffleFilter, dataArray;
  function initAudio() {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx && aEl && AudioContextConstructor) {
      audioCtx = new AudioContextConstructor();
      analyser = audioCtx.createAnalyser();
      muffleFilter = audioCtx.createBiquadFilter();
      muffleFilter.type = 'lowpass';
      muffleFilter.frequency.value = 20000;
      muffleFilter.Q.value = 0.7;

      const src = audioCtx.createMediaElementSource(aEl);
      src.connect(muffleFilter);
      muffleFilter.connect(analyser);
      analyser.connect(audioCtx.destination);
      analyser.fftSize = 128;
      dataArray = new Uint8Array(analyser.frequencyBinCount);
    }
  }
  function startMainAudioWithFade(duration) {
    if (!aEl || !aEl.src || isArchiveShopAudioActive()) return;
    if (mainAudioFadeFrame) cancelAnimationFrame(mainAudioFadeFrame);
    mainAudioFadeFrame = 0;
    const shouldCrossfade = Boolean(introAudio && !introAudio.paused && aEl.paused);
    const targetVolume = aEl.volume;
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    if (!aEl.paused) return;
    if (shouldCrossfade) aEl.volume = 0;
    const playAttempt = playMedia(aEl);
    if (!shouldCrossfade) return;

    const fadeIn = () => {
      const startTime = performance.now();
      const fade = now => {
        const progress = Math.min(1, (now - startTime) / duration);
        aEl.volume = targetVolume * progress;
        if (progress < 1) mainAudioFadeFrame = requestAnimationFrame(fade);
        else {
          mainAudioFadeFrame = 0;
          aEl.volume = targetVolume;
        }
      };
      mainAudioFadeFrame = requestAnimationFrame(fade);
    };

    if (playAttempt && typeof playAttempt.then === 'function') {
      playAttempt.then(fadeIn).catch(() => { aEl.volume = targetVolume; });
    } else {
      fadeIn();
    }
  }
  let mainAudioFadeFrame = 0, shopAudioFadeFrame = 0, shopAudioPlayPending = false;
  function fadeShopAudioTo(targetVolume, duration, pauseAtEnd = false) {
    if (!shopAudio) return;
    if (shopAudioFadeFrame) cancelAnimationFrame(shopAudioFadeFrame);
    const startVolume = shopAudio.volume;
    const startTime = performance.now();
    const fade = now => {
      const progress = Math.min(1, (now - startTime) / duration);
      shopAudio.volume = startVolume + (targetVolume - startVolume) * progress;
      if (progress < 1) {
        shopAudioFadeFrame = requestAnimationFrame(fade);
      } else {
        shopAudioFadeFrame = 0;
        if (pauseAtEnd) shopAudio.pause();
      }
    };
    shopAudioFadeFrame = requestAnimationFrame(fade);
  }
  function startShopAudioFromUserGesture() {
    if (!shopAudio) return;
    shopAudio.muted = false;
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(error => console.warn('Audio context could not resume:', error));
    }
    if (shopAudio.paused) shopAudio.volume = 0;
    let playAttempt;
    try {
      playAttempt = shopAudio.play();
    } catch (error) {
      console.warn('Archive shop audio playback could not start:', error);
      return;
    }
    shopAudioPlayPending = true;
    if (playAttempt && typeof playAttempt.then === 'function') {
      playAttempt.then(() => {
        shopAudioPlayPending = false;
        if (!isArchiveShopAudioActive()) {
          fadeShopAudioTo(0, 250, true);
          return;
        }
        fadeShopAudioTo(0.12, 850);
      }).catch(error => {
        shopAudioPlayPending = false;
        if (error.name !== 'NotAllowedError') console.warn('Archive shop audio playback could not start:', error);
      });
    } else {
      shopAudioPlayPending = false;
      fadeShopAudioTo(0.12, 850);
    }
  }
  function fadeOutMainAudio(duration) {
    if (!aEl || aEl.paused) return;
    if (mainAudioFadeFrame) cancelAnimationFrame(mainAudioFadeFrame);
    const targetVolume = aEl.volume;
    const startTime = performance.now();
    const fade = now => {
      const progress = Math.min(1, (now - startTime) / duration);
      aEl.volume = targetVolume * (1 - progress);
      if (progress < 1) {
        mainAudioFadeFrame = requestAnimationFrame(fade);
      } else {
        mainAudioFadeFrame = 0;
        aEl.pause();
        aEl.volume = targetVolume;
      }
    };
    mainAudioFadeFrame = requestAnimationFrame(fade);
  }
  function fadeInMainAudioAfterShop(duration) {
    if (!aEl || !aEl.src) return;
    if (mainAudioFadeFrame) cancelAnimationFrame(mainAudioFadeFrame);
    mainAudioFadeFrame = 0;
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    const targetVolume = 1.0;
    aEl.volume = 0;
    const playAttempt = playMedia(aEl);
    const fadeIn = () => {
      const startTime = performance.now();
      const fade = now => {
        const progress = Math.min(1, (now - startTime) / duration);
        aEl.volume = targetVolume * progress;
        if (progress < 1) mainAudioFadeFrame = requestAnimationFrame(fade);
        else {
          mainAudioFadeFrame = 0;
          aEl.volume = targetVolume;
        }
      };
      mainAudioFadeFrame = requestAnimationFrame(fade);
    };
    if (playAttempt && typeof playAttempt.then === 'function') {
      playAttempt.then(fadeIn).catch(() => { aEl.volume = targetVolume; });
    } else {
      fadeIn();
    }
  }
  const visualUpload = document.getElementById('v-up');
  if (visualUpload) {
    visualUpload.addEventListener('change', e => {
      const file = e.target.files && e.target.files.item(0);
      if (!file || !vEl) return;
      vEl.src = URL.createObjectURL(file);
      wall.material.map = createVideoTexture(vEl);
      wall.material.needsUpdate = true;
      if (isArchiveShopAudioActive()) pauseMedia(vEl);
      else playMedia(vEl);
    });
  }
  const audioUpload = document.getElementById('a-up');
  if (audioUpload) {
    audioUpload.addEventListener('change', e => {
      const file = e.target.files && e.target.files.item(0);
      if (!file || !aEl) return;
      aEl.src = URL.createObjectURL(file);
      if (isArchiveShopAudioActive()) return;
      initAudio();
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      playMedia(aEl);
      if (vEl && vEl.src) playMedia(vEl);
    });
  }
  const playbackBtn = document.getElementById('pp-btn');
  if (playbackBtn) {
    playbackBtn.addEventListener('click', () => {
      if (!aEl) return;
      if (aEl.paused) {
        if (isArchiveShopAudioActive()) return;
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        if (aEl.src) playMedia(aEl);
        if (vEl && vEl.src) playMedia(vEl);
      } else {
        aEl.pause();
      }
    });
  }

  const uiBarEl = document.getElementById('ui-bar');
  let uiHideTimer = null;
  if (uiBarEl) {
    uiBarEl.style.transition = 'opacity 0.65s ease, transform 0.65s ease';
  }
  function wakeCinematicUI() {
    if (!uiBarEl) return;
    uiBarEl.style.opacity = '1';
    uiBarEl.style.transform = 'translateX(-50%) translateY(0px)';
    uiBarEl.style.pointerEvents = 'auto';

    clearTimeout(uiHideTimer);
    uiHideTimer = setTimeout(() => {
      if (uiBarEl && !uiBarEl.matches(':hover') && document.activeElement !== djInitialInput) {
        uiBarEl.style.opacity = '0';
        uiBarEl.style.transform = 'translateX(-50%) translateY(14px)';
        uiBarEl.style.pointerEvents = 'none';
      }
    }, 2500);
  }
  window.addEventListener('mousemove', wakeCinematicUI);
  window.addEventListener('mousedown', wakeCinematicUI);
  window.addEventListener('keydown', wakeCinematicUI);
  window.addEventListener('wheel', wakeCinematicUI);
  wakeCinematicUI();
  let ambientTimer = 0, wasInShop = false, resumeMainAudioAfterShop = false;
  let ambientShopVisitPhase = null, ambientShopDwellTimer = 0, ambientShopDwellDuration = 0, ambientReturnBed = null;
  const ambientShopWaypoints = archiveShopPOIs;
  const shopTourStates = new WeakMap();
  function nearestArchiveShopPoiIndex(position) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    archiveShopPOIs.forEach((point, index) => {
      const distance = Math.hypot(point.x - position.x, point.z - position.z);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    return nearestIndex;
  }
  function startArchiveShopTour(avatar, poiIndex, returnBed = null) {
    if (avatar === ambientWalker) {
      ambientShopVisitPhase = 'entering';
      ambientShopDwellTimer = 0;
      ambientShopDwellDuration = 0;
      ambientReturnBed = returnBed;
    }
    shopTourStates.set(avatar, {
      phase: 'entering',
      poiIndex,
      stopCount: 2 + Math.floor(Math.random() * 2),
      stopsVisited: 0,
      dwellTime: 0,
      dwellDuration: 0,
      returnBed
    });
  }
  function sendAmbientWalkerBackToMain(returnBed) {
    const candidates = beds.filter(b => !b.occupied);
    const availableBed = returnBed && !returnBed.occupied
      ? returnBed
      : candidates.at(Math.floor(Math.random() * candidates.length));
    if (availableBed) {
      ambientWalker.walkTo(availableBed.x + Math.cos(availableBed.rotY) * 0.68, availableBed.z - Math.sin(availableBed.rotY) * 0.68, availableBed);
    } else {
      ambientWalker.walkTo(-7.2, 18.8, null);
    }
  }
  function updateArchiveShopTour(avatar, dt) {
    const tour = shopTourStates.get(avatar);
    if (!tour) return;

    if ((tour.phase === 'entering' || tour.phase === 'walking') &&
        avatar.state === 'waiting' && avatar.root.position.x >= -8.6 && !avatar.targetPos) {
      shopTourStates.delete(avatar);
      avatar.lookTarget = null;
      if (avatar === ambientWalker) {
        ambientShopVisitPhase = null;
        ambientShopDwellTimer = 0;
        ambientShopDwellDuration = 0;
        const returnBed = ambientReturnBed || tour.returnBed;
        ambientReturnBed = null;
        sendAmbientWalkerBackToMain(returnBed);
      }
      return;
    }

    if (avatar === ambientWalker) ambientShopVisitPhase = tour.phase;
    if ((tour.phase === 'entering' || tour.phase === 'walking') &&
        avatar.state === 'waiting' && avatar.root.position.x < -9.8 && !avatar.targetPos) {
      tour.stopsVisited += 1;
      tour.phase = 'dwelling';
      tour.dwellTime = 0;
      tour.dwellDuration = 2.5 + Math.random() * 1.45;
      avatar.lookTarget = archiveShopPOIs[tour.poiIndex].lookAt;
      if (avatar === ambientWalker) {
        ambientShopVisitPhase = 'dwelling';
        ambientShopDwellTimer = 0;
        ambientShopDwellDuration = tour.dwellDuration;
      }
    } else if (tour.phase === 'dwelling') {
      tour.dwellTime += dt;
      if (avatar === ambientWalker) ambientShopDwellTimer = tour.dwellTime;
      if (tour.dwellTime >= tour.dwellDuration) {
        avatar.lookTarget = null;
        if (tour.stopsVisited >= tour.stopCount) {
          tour.phase = 'exiting';
          if (avatar === ambientWalker) ambientShopVisitPhase = 'exiting';
          avatar.walkTo(-7.2, 18.8, null);
        } else {
          let nextPoiIndex = Math.floor(Math.random() * (archiveShopPOIs.length - 1));
          if (nextPoiIndex >= tour.poiIndex) nextPoiIndex += 1;
          tour.poiIndex = nextPoiIndex;
          tour.phase = 'walking';
          if (avatar === ambientWalker) ambientShopVisitPhase = 'walking';
          const point = archiveShopPOIs[nextPoiIndex];
          avatar.walkTo(point.x, point.z, null);
        }
      }
    } else if (tour.phase === 'exiting' &&
               avatar.state === 'waiting' && avatar.root.position.x >= -8.6 && !avatar.targetPos) {
      shopTourStates.delete(avatar);
      avatar.lookTarget = null;
      if (avatar === ambientWalker) {
        ambientShopVisitPhase = null;
        ambientShopDwellTimer = 0;
        ambientShopDwellDuration = 0;
        const returnBed = ambientReturnBed || tour.returnBed;
        ambientReturnBed = null;
        sendAmbientWalkerBackToMain(returnBed);
      }
    }
  }
  const visitorStallWatch = new WeakMap();
  function recoverStalledVisitor(avatar, dt) {
    if (avatar.isPlayer || avatar.state !== 'walking' || !avatar.targetPos) {
      visitorStallWatch.delete(avatar);
      return;
    }

    let watch = visitorStallWatch.get(avatar);
    if (!watch) {
      visitorStallWatch.set(avatar, {
        x: avatar.root.position.x,
        z: avatar.root.position.z,
        elapsed: 0,
        recoveries: 0
      });
      return;
    }

    watch.elapsed += dt;
    if (watch.elapsed < 1.5) return;

    const distance = Math.hypot(
      avatar.root.position.x - watch.x,
      avatar.root.position.z - watch.z
    );
    if (distance < 0.05) {
      const inArchiveShop = avatar.root.position.x < -9.8;
      const destination = watch.recoveries % 2 === 0
        ? (inArchiveShop ? { x: -7.2, z: 18.8 } : { x: -12.8, z: 18.8 })
        : { x: -6.2, z: 16.8 };
      watch.recoveries += 1;
      avatar.walkTo(destination.x, destination.z, null);
    }

    watch.x = avatar.root.position.x;
    watch.z = avatar.root.position.z;
    watch.elapsed = 0;
  }
  const clk = new THREE.Clock();
    function loop() {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, clk.getDelta()), t = clk.getElapsedTime();
    if (clickMarker.material.opacity > 0.01) clickMarker.material.opacity *= 0.96;

    djAvatar.update(t, Boolean(aEl && !aEl.paused));

    if (!ambientShopVisitPhase && !shopTourStates.has(ambientWalker) && !isSimFullMode &&
        (ambientWalker.state === 'sitting' || (ambientWalker.state === 'waiting' && ambientWalker.root.position.x >= -9.8 && !ambientWalker.targetPos))) {
      ambientTimer += dt;
      if (ambientTimer > 10.0) {
        ambientTimer = 0;
        if (archiveShop && Math.random() < 0.28) {
          const poiIndex = Math.floor(Math.random() * ambientShopWaypoints.length);
          const point = ambientShopWaypoints[poiIndex];
          const returnBed = ambientWalker.bedRef;
          startArchiveShopTour(ambientWalker, poiIndex, returnBed);
          ambientWalker.walkTo(point.x, point.z, null);
        } else {
          const candidates = beds.filter(b => !b.occupied);
          if (candidates.length > 0) {
            const nextBed = candidates.at(Math.floor(Math.random() * candidates.length));
            ambientWalker.walkTo(nextBed.x + Math.cos(nextBed.rotY) * 0.68, nextBed.z - Math.sin(nextBed.rotY) * 0.68, nextBed);
          }
        }
      }
    }

    const isSeatedListenerView = (camMode === 'seat' && playerAvatar.state === 'sitting');
    const previousPlayerX = playerAvatar.root.position.x;
    const previousPlayerZ = playerAvatar.root.position.z;
    for (let i = 0; i < avatars.length; i++) {
      const av = avatars.at(i);
      if (!av.isPlayer && !shopTourStates.has(av) && av.shopDestination) {
        startArchiveShopTour(av, nearestArchiveShopPoiIndex(av.shopDestination));
      }
      av.update(dt, t, blanketProg);
      updateArchiveShopTour(av, dt);
      recoverStalledVisitor(av, dt);
      av.setFilteredVisibility(
        isSeatedListenerView ? (av.isPlayer || av.state === 'sitting') : true,
        !av.isPlayer && av.root.position.x < -9.8
      );
    }
    const playerPosition = playerAvatar.root.position;
    if (isInsideDjTable(playerPosition.x, playerPosition.z)) {
      if (isInsideDjTable(previousPlayerX, previousPlayerZ)) {
        const exits = [
          { axis: 'x', value: djTableCollider.minX - 0.02, distance: playerPosition.x - djTableCollider.minX },
          { axis: 'x', value: djTableCollider.maxX + 0.02, distance: djTableCollider.maxX - playerPosition.x },
          { axis: 'z', value: djTableCollider.minZ - 0.02, distance: playerPosition.z - djTableCollider.minZ },
          { axis: 'z', value: djTableCollider.maxZ + 0.02, distance: djTableCollider.maxZ - playerPosition.z }
        ];
        const exit = exits.reduce((nearest, candidate) =>
          candidate.distance < nearest.distance ? candidate : nearest
        );
        if (exit.axis === 'x') playerPosition.x = exit.value;
        else playerPosition.z = exit.value;
      } else {
        let resolvedX = playerPosition.x, resolvedZ = playerPosition.z;
        if (isInsideDjTable(resolvedX, previousPlayerZ)) resolvedX = previousPlayerX;
        if (isInsideDjTable(resolvedX, resolvedZ)) {
          if (!isInsideDjTable(previousPlayerX, resolvedZ)) resolvedX = previousPlayerX;
          else resolvedZ = previousPlayerZ;
        }
        playerPosition.setX(resolvedX);
        playerPosition.setZ(resolvedZ);
      }
    }

    const inShopNow = isArchiveShopAudioActive();
    const shouldPlayShopVisual = camMode === 'shop' || (inShopNow && camera.position.x <= -8.5);
    if (shopVisual && shouldPlayShopVisual !== shopVisualActive) {
      shopVisualActive = shouldPlayShopVisual;
      if (shopVisualActive) shopVisual.play().catch(e => console.warn('Shop video play error:', e));
      else shopVisual.pause();
    }
    if (inShopNow) {
      if (!wasInShop) {
        resumeMainAudioAfterShop = Boolean(aEl && !aEl.paused);
        fadeOutMainAudio(850);
        if (vEl) pauseMedia(vEl);
        if (introAudio) fadeOutIntroAudio(850);
        if (shopAudio && shopAudio.paused && !shopAudioPlayPending) startShopAudioFromUserGesture();
      }
      if (shopAudio) shopAudio.muted = false;
    } else {
      if (wasInShop && shopAudio) {
        fadeShopAudioTo(0, 850, true);
      }
      if (wasInShop && vEl) playMedia(vEl);
      if (wasInShop && resumeMainAudioAfterShop && aEl) {
        fadeInMainAudioAfterShop(850);
      }
      resumeMainAudioAfterShop = false;
    }
    wasInShop = inShopNow;

    if (vEl && !vEl.paused && vEl.readyState >= 2 &&
        wall.material.map && wall.material.map.isVideoTexture) {
      wall.material.map.needsUpdate = true;
    }
    if (archiveShop && archiveShop.shopVideoEl && !archiveShop.shopVideoEl.paused &&
        archiveShop.shopVideoEl.readyState >= 2 && archiveShop.shopArtMat.map &&
        archiveShop.shopArtMat.map.isVideoTexture) {
      archiveShop.shopArtMat.map.needsUpdate = true;
    }

    if (scene.fog) {
      const targetFog = inShopNow ? 0.014 : 0.019;
      scene.fog.density += (targetFog - scene.fog.density) * 0.15;
    }
        if (camMode === 'shop') {
      const avPos = playerAvatar.root.position;
      const baseLookYaw = Math.PI / 2 + seatYaw;

      // 줌인(shopZoom = 0): 아바타 눈높이(1.58m) / 줌아웃(shopZoom = 1): 아바타 머리 살짝 위 전경 시점(1.96m)
      const closeX = Math.max(-21.6, Math.min(-10.3, avPos.x + 0.55));
      const closeY = 1.58;
      const closeZ = Math.max(16.2, Math.min(21.4, avPos.z));

      const wideX = Math.max(-18.5, Math.min(-10.4, avPos.x + 1.45));
      const wideY = 1.96;
      const wideZ = 18.8 + (avPos.z - 18.8) * 0.45;

      camPosTarget.set(
        closeX + (wideX - closeX) * shopZoom,
        closeY + (wideY - closeY) * shopZoom,
        closeZ + (wideZ - closeZ) * shopZoom
      );

      const lookDist = 4.2 + shopZoom * 2.8;
      camLookTarget.set(
        camPosTarget.x - Math.sin(baseLookYaw) * lookDist,
        (1.48 - shopZoom * 0.06) + Math.sin(seatPitch) * 2.4,
        camPosTarget.z - Math.cos(baseLookYaw) * lookDist
      );
    } else if (camMode === 'dj') {

      const yaw = seatYaw;
      camPosTarget.set(Math.sin(yaw) * -1.1 + 0.24, 1.35, -1.65);
      camLookTarget.set(Math.sin(yaw) * 4.5, 1.05 + Math.sin(seatPitch) * 2.2, 5.2);
    } else if (camMode === 'seat' && playerAvatar.state === 'sitting') {
      const avPos = playerAvatar.root.position, yaw = playerAvatar.root.rotation.y + seatYaw;
      camPosTarget.set(
        Math.max(-9.05, Math.min(9.05, avPos.x + Math.sin(yaw) * 1.12 + Math.cos(yaw) * 0.16)),
        Math.max(0.45, Math.min(7.05, 1.16)),
        Math.max(-2.4, Math.min(21.0, avPos.z + Math.cos(yaw) * 1.12 - Math.sin(yaw) * 0.16))
      );
      camLookTarget.set(avPos.x - Math.sin(yaw) * 4.2, 1.12 + Math.sin(seatPitch) * 2.2, avPos.z - Math.cos(yaw) * 4.2);
    } else if (camMode === 'waiting' && playerAvatar.state === 'waiting') {
      const avPos = playerAvatar.root.position, yaw = seatYaw;
      const camX = Math.max(-8.8, Math.min(8.8, avPos.x + Math.sin(yaw) * 1.15 + 0.22));
      const camZ = Math.max(-2.4, Math.min(21.0, avPos.z + Math.cos(yaw) * 1.15));
      camPosTarget.set(camX, 1.68, camZ);
      camLookTarget.set(
        avPos.x - Math.sin(yaw) * 9.5,
        1.55 + Math.sin(seatPitch) * 2.8,
        avPos.z - Math.cos(yaw) * 9.5
      );
    } else {
      const safeRad = Math.min(rad, 16.5);
      const rawX = Math.sin(ax) * Math.cos(ay) * safeRad;
      const rawY = 2.2 + Math.sin(ay) * safeRad;
      const rawZ = 4.6 + Math.cos(ax) * Math.cos(ay) * safeRad;

      camPosTarget.set(
        Math.max(-9.1, Math.min(9.1, rawX)),
        Math.max(0.6, Math.min(7.05, rawY)),
        Math.max(-2.2, Math.min(21.0, rawZ))
      );
      camLookTarget.set(0, 2.4, 1.5);
    }


    camPosCurrent.lerp(camPosTarget, 0.14); camLookCurrent.lerp(camLookTarget, 0.16);
    const cameraTargetDistance = camPosCurrent.distanceTo(camLookCurrent);
    if (cameraTargetDistance <= minCameraTargetDistance) {
      if (cameraTargetDistance > 1e-6) {
        cameraDirection.subVectors(camLookCurrent, camPosCurrent).normalize();
      } else {
        camera.getWorldDirection(cameraDirection);
      }
      camLookCurrent.copy(camPosCurrent).addScaledVector(cameraDirection, minCameraTargetDistance);
    }
    camera.position.copy(camPosCurrent); camera.lookAt(camLookCurrent);

    if (!vEl || !vEl.src) {
      if (ctx) {
        ctx.fillStyle = '#0a0d16'; ctx.fillRect(0, 0, 1024, 576);
        ctx.strokeStyle = 'rgba(145, 190, 255, 0.72)'; ctx.lineWidth = 2.4;
        for (let j = 0; j < 16; j++) {
          ctx.beginPath();
          for (let x = 0; x <= 1024; x += 12) {
            const y = 288 + Math.sin(x * 0.007 + t * 1.1 + j * 0.35) * (38 + j * 8);
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
      if (ctx && ++waveformFrame % 2 === 0) fTex.needsUpdate = true;
      if (isFs && fsCtx) fsCtx.drawImage(cvs, 0, 0);
    }
    if (analyser && dataArray && aEl && !aEl.paused) { analyser.getByteFrequencyData(dataArray); const bass = dataArray.at(1) / 255; screenGlow.intensity = 2.0 + bass * 3.0; mainSpot.intensity = 1.5 + bass * 0.8; }
    renderer.render(scene, camera);
    if (introLoader && !introReady && !introIsCompleting) {
      introRenderedFrames++;
      if (introRenderedFrames < 5) {
        setIntroProgress(80 + introRenderedFrames * 4);
      } else {
        introIsCompleting = true;
        setIntroProgress(100);
        window.setTimeout(finishIntroLoading, 260);
      }
    }
  }
  window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
  setIntroProgress(80);
  loop();
})();
