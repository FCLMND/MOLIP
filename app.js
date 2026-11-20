(function() {
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'fclmnd';
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const BOOK_DETAILS = {
    "creativeAct": {
      "cover": "media/book1.jpg",
      "titleEn": "The Creative Act: A Way of Being",
      "subtitleKo": "창조적 행위: 존재의 방식",
      "author": "릭 루빈 · Rick Rubin",
      "curationNoteEn": "When I first started reading this book, I was honestly a little skeptical.\n\nThe first third or so is filled with rather abstract and philosophical reflections on what creativity is, how everyone has the potential to be a creator, and the importance of observing the world around us and remaining open to our senses. Much of it felt like something I had already come to understand through my own creative practice. At times, some of the ideas seemed so obvious that I wondered whether they really needed to be stated at all.\n\nHowever, as I moved further into the book, my perspective gradually began to change.\n\nRather than focusing on philosophical declarations about creativity, the book begins to explore the challenges that arise in the actual creative process and the mindset needed to navigate them.\n\nWhat I found particularly interesting was how many of these ideas resonated with things I had independently discovered through trial and error while making music. They weren't techniques I had learned from someone else, but principles that had naturally taken shape over years of working. Seeing those experiences reflected and articulated through another creator's perspective turned out to be more meaningful than I had expected.\n\nA book I'd recommend to anyone engaged in any form of creative practice.",
      "curationNoteKo": "\n처음 이 책을 읽기 시작했을 때는 솔직히 조금 회의적이었다.\n책의 초반부 약 3분의 1까지는 창작이란 무엇인가, 누구나 창작자가 될 수 있다는 것, 주변을 관찰하고 감각을 열어두라는 식의 다소 추상적이고 원론적인 이야기들이 이어진다. 이미 창작 활동을 해오면서 스스로 체득한 생각들이기도 했고, 어쩌면 너무 당연해서 굳이 책을 통해 다시 확인할 필요가 있을까 싶은 하나마나한 내용들도 있었다.\n\n하지만 중반부를 지나면서 책을 바라보는 시선이 조금씩 달라졌다.\n 창작을 둘러싼 철학적인 선언보다는 실제 작업 과정에서 마주하게 되는 문제들과 그것을 다루는 태도에 관한 이야기들이 등장한다.\n\n 흥미로웠던 것은 그중 상당수가 내가 음악을 만들면서 혼자 시행착오를 거쳐 발견했던 것들과 상당히 맞닿아 있었다는 점이다. 누군가에게 배워서 적용했다기보다는 오랜 시간 작업하면서 자연스럽게 형성된 나름의 원칙들이었는데, 그것을 다른 창작자의 언어로 다시 확인하는 경험은 생각보다 유의미했다. \n\n당신이 어떤형태로든 창작중이라면 추천해주고싶은 도서",
      "excerptEn": "Selected excerpt coming soon.",
      "excerptKo": "Experimentation. Try Everything. Crafting. Momentum. Breaking the Sameness. Completion.",
      "tocKo": "목차 정보를 준비 중입니다.",
      "tocEn": "Table of contents coming soon."
    }
  };
  const BOOK_DETAILS_STORAGE_KEY = 'molip_book_details_v1';
  const BOOK_DETAIL_EDITABLE_FIELDS = [
    'curationNoteKo', 'curationNoteEn', 'excerptKo',
    'excerptEn', 'tocKo', 'tocEn'
  ];
  let bookDetails = { ...BOOK_DETAILS.creativeAct };
  try {
    const savedBookDetails = localStorage.getItem(BOOK_DETAILS_STORAGE_KEY);
    if (savedBookDetails) {
      const parsedBookDetails = JSON.parse(savedBookDetails);
      const savedCreativeAct = parsedBookDetails && parsedBookDetails.creativeAct;
      if (savedCreativeAct && typeof savedCreativeAct === 'object' && !Array.isArray(savedCreativeAct)) {
        BOOK_DETAIL_EDITABLE_FIELDS.forEach(field => {
          if (typeof savedCreativeAct[field] === 'string') bookDetails[field] = savedCreativeAct[field];
        });
      }
    }
  } catch (error) {
    console.warn('Book curation details could not be loaded:', error);
  }
  const fsBtn = document.getElementById('fs-btn');
  const spaceFullscreenBtn = document.getElementById('space-fullscreen-btn');
  if (isStandalone && fsBtn) fsBtn.style.setProperty('display', 'none', 'important');
  if (isStandalone && spaceFullscreenBtn) spaceFullscreenBtn.style.setProperty('display', 'none', 'important');
  const bookDetailOverlay = document.getElementById('book-detail-overlay');
  const bookDetailsCard = document.getElementById('book-details-card');
  const bookPageElements = bookDetailOverlay ? [...bookDetailOverlay.querySelectorAll('[data-book-page]')] : [];
  const bookPageIndicator = document.getElementById('book-page-indicator');
  const bookPagePrev = document.getElementById('book-page-prev');
  const bookPageNext = document.getElementById('book-page-next');
  const bookAdminEditButton = document.getElementById('book-admin-edit-btn');
  const bookAdminEditor = document.getElementById('book-admin-editor');
  let activeBookPage = 0;
  const bookDetailTextElements = {
    titleEn: document.getElementById('book-title-en'),
    subtitleKo: document.getElementById('book-title-ko'),
    author: document.getElementById('book-author'),
    curationNoteEn: document.getElementById('book-curation-en'),
    curationNoteKo: document.getElementById('book-curation-ko'),
    excerptEn: document.getElementById('book-excerpt-en'),
    excerptKo: document.getElementById('book-excerpt-ko'),
    tocKo: document.getElementById('book-toc-ko'),
    tocEn: document.getElementById('book-toc-en')
  };
  function renderBookDetails() {
    Object.entries(bookDetailTextElements).forEach(([field, element]) => {
      if (element) element.textContent = bookDetails[field] || '';
    });
    const cover = document.getElementById('book-cover');
    if (cover) {
      cover.src = bookDetails.cover;
      cover.alt = `${bookDetails.titleEn} book cover`;
    }
  }
  function setBookDetailPage(pageIndex) {
    activeBookPage = Math.max(0, Math.min(1, pageIndex));
    bookPageElements.forEach((page, index) => {
      const isActive = index === activeBookPage;
      page.classList.toggle('is-active', isActive);
      page.setAttribute('aria-hidden', String(!isActive));
      if (isActive) page.scrollTop = 0;
    });
    if (bookPageIndicator) bookPageIndicator.textContent = `${activeBookPage + 1} / 2`;
    if (bookPagePrev) bookPagePrev.disabled = activeBookPage === 0;
    if (bookPageNext) bookPageNext.disabled = activeBookPage === 1;
  }
  function openBookDetailsModal(bookId) {
    if (bookId !== 'creativeAct' || !bookDetailOverlay || !bookDetailsCard) return false;
    renderBookDetails();
    setBookDetailPage(0);
    if (bookAdminEditButton) bookAdminEditButton.hidden = !isAdmin;
    if (bookAdminEditor) bookAdminEditor.hidden = true;
    bookDetailsCard.classList.remove('is-editing');
    bookDetailOverlay.setAttribute('aria-hidden', 'false');
    window.requestAnimationFrame(() => bookDetailOverlay.classList.add('is-open'));
    return true;
  }
  function closeBookDetailsModal() {
    if (!bookDetailOverlay) return;
    bookDetailOverlay.classList.remove('is-open');
    bookDetailOverlay.setAttribute('aria-hidden', 'true');
    if (bookAdminEditor) bookAdminEditor.hidden = true;
    if (bookDetailsCard) bookDetailsCard.classList.remove('is-editing');
  }
  if (bookDetailOverlay) {
    bookDetailOverlay.addEventListener('click', event => {
      if (event.target === bookDetailOverlay) closeBookDetailsModal();
    });
  }
  const bookModalClose = document.getElementById('book-modal-close');
  if (bookModalClose) bookModalClose.addEventListener('click', closeBookDetailsModal);
  if (bookPagePrev) bookPagePrev.addEventListener('click', () => setBookDetailPage(activeBookPage - 1));
  if (bookPageNext) bookPageNext.addEventListener('click', () => setBookDetailPage(activeBookPage + 1));
  let bookSwipeStart = null;
  const bookModalPages = document.getElementById('book-modal-pages');
  if (bookModalPages) {
    bookModalPages.addEventListener('touchstart', event => {
      const touch = event.changedTouches.item(0);
      if (touch) bookSwipeStart = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });
    bookModalPages.addEventListener('touchend', event => {
      const touch = event.changedTouches.item(0);
      if (!touch || !bookSwipeStart || (bookAdminEditor && !bookAdminEditor.hidden)) return;
      const deltaX = touch.clientX - bookSwipeStart.x;
      const deltaY = touch.clientY - bookSwipeStart.y;
      if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY)) {
        setBookDetailPage(activeBookPage + (deltaX < 0 ? 1 : -1));
      }
      bookSwipeStart = null;
    }, { passive: true });
  }
  document.addEventListener('keydown', event => {
    if (!bookDetailOverlay || !bookDetailOverlay.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeBookDetailsModal();
    else if (!bookAdminEditor || bookAdminEditor.hidden) {
      if (event.key === 'ArrowRight') setBookDetailPage(activeBookPage + 1);
      else if (event.key === 'ArrowLeft') setBookDetailPage(activeBookPage - 1);
    }
  });
  if (isAdmin && bookAdminEditButton && bookAdminEditor && bookDetailsCard) {
    const bookEditorInputs = {
      curationNoteEn: document.getElementById('book-edit-curation-en'),
      curationNoteKo: document.getElementById('book-edit-curation-ko'),
      excerptEn: document.getElementById('book-edit-excerpt-en'),
      excerptKo: document.getElementById('book-edit-excerpt-ko'),
      tocKo: document.getElementById('book-edit-toc-ko'),
      tocEn: document.getElementById('book-edit-toc-en')
    };
    const bookEditorStatus = document.getElementById('book-editor-status');
    const bookEditorClose = document.getElementById('book-editor-close');
    const bookEditorPreview = document.getElementById('book-editor-preview');
    const bookEditorCopy = document.getElementById('book-editor-copy');
    bookAdminEditButton.addEventListener('click', () => {
      BOOK_DETAIL_EDITABLE_FIELDS.forEach(field => {
        if (bookEditorInputs[field]) bookEditorInputs[field].value = bookDetails[field];
      });
      if (bookEditorStatus) bookEditorStatus.textContent = '';
      bookAdminEditor.hidden = false;
      bookDetailsCard.classList.add('is-editing');
    });
    if (bookEditorClose) bookEditorClose.addEventListener('click', () => {
      bookAdminEditor.hidden = true;
      bookDetailsCard.classList.remove('is-editing');
    });
    if (bookEditorPreview) bookEditorPreview.addEventListener('click', () => {
      BOOK_DETAIL_EDITABLE_FIELDS.forEach(field => {
        if (bookEditorInputs[field]) bookDetails[field] = bookEditorInputs[field].value;
      });
      renderBookDetails();
      try {
        localStorage.setItem(BOOK_DETAILS_STORAGE_KEY, JSON.stringify({ creativeAct: bookDetails }));
        bookAdminEditor.hidden = true;
        bookDetailsCard.classList.remove('is-editing');
        if (bookEditorStatus) bookEditorStatus.textContent = '미리보기에 적용하고 저장했습니다.';
      } catch (error) {
        console.warn('Book curation details could not be saved:', error);
        if (bookEditorStatus) bookEditorStatus.textContent = '저장에 실패했습니다. 브라우저 저장 공간을 확인해 주세요.';
      }
    });
    if (bookEditorCopy) bookEditorCopy.addEventListener('click', () => {
      const exportData = { ...BOOK_DETAILS.creativeAct };
      BOOK_DETAIL_EDITABLE_FIELDS.forEach(field => {
        if (bookEditorInputs[field]) exportData[field] = bookEditorInputs[field].value;
      });
      const sourceCode = `const BOOK_DETAILS = ${JSON.stringify({ creativeAct: exportData }, null, 2)};`;
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
        if (bookEditorStatus) bookEditorStatus.textContent = '이 브라우저에서는 클립보드 복사를 지원하지 않습니다.';
        return;
      }
      try {
        navigator.clipboard.writeText(sourceCode).then(() => {
          if (bookEditorStatus) bookEditorStatus.textContent = 'BOOK_DETAILS 코드를 복사했습니다.';
        }).catch(error => {
          console.warn('Book details code could not be copied:', error);
          if (bookEditorStatus) bookEditorStatus.textContent = '복사할 수 없습니다. 브라우저 권한을 확인해 주세요.';
        });
      } catch (error) {
        console.warn('Book details code could not be copied:', error);
        if (bookEditorStatus) bookEditorStatus.textContent = '복사할 수 없습니다. 브라우저 권한을 확인해 주세요.';
      }
    });
  }
  const introLoader = document.getElementById('molip-loader');
  const introProgressBar = document.getElementById('molip-loader-progress');
  const introProgressTrack = document.getElementById('molip-loader-track');
  const introStatus = document.getElementById('molip-loader-status');
  const introEnter = document.getElementById('molip-enter');
  const aEl = document.getElementById('rm-a');
  const DEFAULT_SOUND_URL = './media/Sound.mp3';
  let introAudioReady = false, introSceneReady = false;
  aEl.preload = 'auto';
  aEl.src = DEFAULT_SOUND_URL;
  const introAudioTimeout = window.setTimeout(() => {
    console.warn('Room audio preload timed out; entry will continue.');
    finishRoomAudioLoading();
  }, 4500);
  function finishRoomAudioLoading() {
    if (introAudioReady) return;
    introAudioReady = true;
    window.clearTimeout(introAudioTimeout);
    aEl.removeEventListener('canplay', finishRoomAudioLoading);
    aEl.removeEventListener('canplaythrough', finishRoomAudioLoading);
    if (introSceneReady) finishIntroLoading();
  }
  aEl.addEventListener('canplay', finishRoomAudioLoading);
  aEl.addEventListener('canplaythrough', finishRoomAudioLoading);
  aEl.load();
  if (aEl.readyState >= 3) finishRoomAudioLoading();
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
    if (introAudioFadeFrame) clearInterval(introAudioFadeFrame);
    const startVolume = introAudio.volume;
    if (introAudio.paused || startVolume <= 0) {
      introAudio.pause();
      introAudioFadeFrame = 0;
      return;
    }
    const startTime = performance.now();
    introAudioFadeFrame = setInterval(() => {
      const progress = Math.min(1, (performance.now() - startTime) / duration);
      introAudio.volume = startVolume * (1 - progress);
      if (progress >= 1) {
        clearInterval(introAudioFadeFrame);
        introAudio.pause();
        introAudioFadeFrame = 0;
      }
    }, 50);
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

  function dismissIntro() {
    if (!introLoader || !introReady || introDismissed) return;
    introDismissed = true;
    fadeOutIntroAudio(850);
    document.getElementById('ui-bar').classList.add('is-entered');
    introLoader.classList.add('is-exiting');
    window.setTimeout(() => introLoader.remove(), 850);
  }

  let audioHardwarePulsePlayed = false;
  function startRoomAudioFromGesture(reset = false) {
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(error => console.warn('Audio context could not resume:', error));
    }

    if (reset) {
      if (shopAudioFadeFrame) clearInterval(shopAudioFadeFrame);
      shopAudioFadeFrame = 0;
      if (shopAudio) {
        shopAudio.pause();
        shopAudio.volume = 0;
      }
      if (aEl) aEl.currentTime = 0;
    }

    if (aEl) {
      aEl.muted = false;
      aEl.volume = 1.0;
      try {
        const playAttempt = aEl.play();
        if (playAttempt && typeof playAttempt.catch === 'function') {
          playAttempt.catch(error => console.warn('Room audio playback could not start:', error));
        }
      } catch (error) {
        console.warn('Room audio playback could not start:', error);
      }
    }
    if (audioCtx && !audioHardwarePulsePlayed) {
      audioHardwarePulsePlayed = true;
      try {
        const pulse = audioCtx.createOscillator();
        const pulseGain = audioCtx.createGain();
        pulse.frequency.value = 440;
        pulseGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        pulse.connect(pulseGain);
        pulseGain.connect(audioCtx.destination);
        pulse.start();
        pulse.stop(audioCtx.currentTime + 0.02);
      } catch (error) {
        console.warn('Audio hardware could not be activated:', error);
      }
    }
  }

  function finishIntroLoading() {
    if (!introLoader || introLoadComplete || !introAudioReady || !introSceneReady) return;
    introLoadComplete = true;
    setIntroProgress(100);
    updateIntroEntryAvailability();
  }

  if (introLoader) {
    setIntroProgress(0);
    introLoader.addEventListener('mousemove', tryPlayIntroAudio, { passive: true });
    introLoader.addEventListener('pointerdown', event => {
      if (event.target !== introEnter) tryPlayIntroAudio();
    }, { passive: true });
    introEnter.addEventListener('click', () => {
      initAudio();
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(error => console.warn('Audio context could not resume:', error));
      }
      aEl.muted = false;
      aEl.volume = 1.0;
      aEl.play().catch(error => console.warn('Room audio playback could not start:', error));
      syncRoomMedia(isArchiveShopAudioActive());
      dismissIntro();
    });
  }

  setIntroProgress(8);
  const HOST_SECRET_KEY = 'mykey';
  const urlParams = new URLSearchParams(window.location.search);
  const isHostUser = (urlParams.get('host') === HOST_SECRET_KEY);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x040406);
  scene.fog = new THREE.FogExp2(0x040406, 0.019);

  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 140);
  const defaultCameraFov = camera.fov;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
    preserveDrawingBuffer: false,
    failIfMajorPerformanceCaveat: false
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = false;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.14;
  document.body.appendChild(renderer.domElement);
  renderer.domElement.style.position = 'fixed';
  renderer.domElement.style.inset = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  function updateCameraViewport() {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth || document.documentElement.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight || document.documentElement.clientHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = (width <= 768 || height > width) && camera.aspect < 1 ? 76 : defaultCameraFov;
    camera.updateProjectionMatrix();
  }
  let viewportUpdateTimeout = 0;
  function scheduleCameraViewportUpdate() {
    updateCameraViewport();
    window.clearTimeout(viewportUpdateTimeout);
    viewportUpdateTimeout = window.setTimeout(updateCameraViewport, 150);
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
        : 'READY TO ENTER';
      introStatus.querySelector('.status-ko').textContent = isFull
        ? '현재 접속자가 많아 입장이 대기 중입니다'
        : '클릭하여 공간에 입장하기';
      introStatus.classList.toggle('is-ready', !isFull);
    }
    if (introEnter) introEnter.hidden = isFull;
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
  function setControlLabel(button, label) {
    if (!button) return;
    let labelElement = button.querySelector('.button-label');
    if (!labelElement) {
      labelElement = document.createElement('span');
      labelElement.className = 'button-label';
      const subLabelElement = button.querySelector('.mobile-sub');
      button.insertBefore(labelElement, subLabelElement);
    }
    labelElement.textContent = label;
    button.setAttribute('aria-label', label);
  }
  function setControlSubLabel(button, label) {
    if (!button) return;
    const subLabelElement = button.querySelector('.mobile-sub');
    if (subLabelElement) subLabelElement.textContent = label;
  }
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
      setControlLabel(viewBtn, 'Overview');
      setControlSubLabel(viewBtn, camMode === 'overview' ? '관람시점' : '전체시점');
      viewBtn.classList.toggle('active', inShop || camMode === 'seat' || camMode === 'waiting' || camMode === 'dj');
    }
    if (shopNavBtn) {
      setControlLabel(shopNavBtn, inShop ? '← Listening Room' : 'Archive Shop');
      setControlSubLabel(shopNavBtn, inShop ? '리스닝룸 복귀' : '큐레이션 관람');
    }
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
  shopNavBtn.innerHTML = '<svg class="control-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 10 12 3.5l8.5 6.5v9a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z" /><path d="M9 20.5v-7h6v7" /></svg><span class="button-label"></span><span class="mobile-sub"></span>';
  setControlLabel(shopNavBtn, isPlayerInShop() ? '← Listening Room' : 'Archive Shop');
  setControlSubLabel(shopNavBtn, isPlayerInShop() ? '리스닝룸 복귀' : '큐레이션 관람');
  shopNavBtn.style.cssText = 'padding:8px 15px;border-radius:999px;border:1px solid rgba(255,255,255,0.25);background:rgba(255,255,255,0.14);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);color:#fde68a;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:12.5px;font-weight:600;cursor:pointer;z-index:30;transition:all 0.2s;';
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
    syncRoomMedia(true);
    startShopAudioFromUserGesture();
    updateStatusUI();
  }

  let lastShopNavActivation = 0;
  const handleShopNavActivation = event => {
    if (event.cancelable) event.preventDefault();
    event.stopPropagation();
    if (!archiveShop) return;
    const now = performance.now();
    if (now - lastShopNavActivation < 500) return;
    lastShopNavActivation = now;
    if (isPlayerInShop()) {
      playerAvatar.root.position.set(-7.6, 0, 18.8);
      playerAvatar.walkTo(-6.8, 18.8, null);
      camMode = 'overview';
      syncRoomMedia(false);
      updateStatusUI();
    } else {
      enterArchiveShopDirect();
    }
  };
  ['pointerup', 'touchend', 'click'].forEach(type => {
    shopNavBtn.addEventListener(type, handleShopNavActivation);
  });

  function updateMouseCoords(e) {
    const width = document.documentElement.clientWidth || window.innerWidth;
    const height = window.innerHeight || document.documentElement.clientHeight;
    mouse.x = (e.clientX / width) * 2 - 1;
    mouse.y = -(e.clientY / height) * 2 + 1;
  }

  function rotateCamera(dx, dy) {
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
  }

  window.addEventListener('mousedown', e => {
    if (e.target !== renderer.domElement) return;
    drag = true; downX = px = e.clientX; downY = py = e.clientY;
  });

  let lastTouchDistance = 0, multiTouchGesture = false;
  const touchDistance = touches => Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY
  );
  renderer.domElement.style.touchAction = 'none';
  renderer.domElement.addEventListener('touchstart', event => {
    event.preventDefault();
    if (event.touches.length === 1 && !multiTouchGesture) {
      const touch = event.touches[0];
      drag = true;
      downX = px = touch.clientX;
      downY = py = touch.clientY;
    } else if (event.touches.length >= 2) {
      multiTouchGesture = true;
      drag = false;
      lastTouchDistance = touchDistance(event.touches);
    }
  }, { passive: false });
  renderer.domElement.addEventListener('touchmove', event => {
    event.preventDefault();
    if (event.touches.length === 1 && drag) {
      const touch = event.touches[0];
      const dx = touch.clientX - px, dy = touch.clientY - py;
      px = touch.clientX;
      py = touch.clientY;
      rotateCamera(dx, dy);
    } else if (event.touches.length >= 2) {
      const distance = touchDistance(event.touches);
      if (lastTouchDistance > 0) {
        const zoomDelta = lastTouchDistance - distance;
        if (camMode === 'shop') {
          shopZoom = Math.max(0, Math.min(1, shopZoom + zoomDelta * 0.003));
        } else if (camMode === 'overview') {
          rad = Math.max(2.0, Math.min(16.5, rad + zoomDelta * 0.015));
        }
      }
      lastTouchDistance = distance;
    }
  }, { passive: false });
  renderer.domElement.addEventListener('touchend', event => {
    event.preventDefault();
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      downX = px = touch.clientX;
      downY = py = touch.clientY;
      drag = true;
      lastTouchDistance = 0;
      return;
    }
    if (event.touches.length === 0) {
      const touch = event.changedTouches[0];
      drag = false;
      if (!multiTouchGesture && touch &&
          Math.hypot(touch.clientX - downX, touch.clientY - downY) < 5) {
        renderer.domElement.dispatchEvent(new MouseEvent('mouseup', {
          clientX: touch.clientX,
          clientY: touch.clientY,
          bubbles: true
        }));
      }
      multiTouchGesture = false;
      lastTouchDistance = 0;
    }
  }, { passive: false });
  renderer.domElement.addEventListener('touchcancel', () => {
    drag = false;
    multiTouchGesture = false;
    lastTouchDistance = 0;
  }, { passive: true });

  window.addEventListener('mousemove', e => {
    if (drag) {
      const dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY;
      rotateCamera(dx, dy);
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
          if (openBookDetailsModal(hitItem.bookId)) return;
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
      const uiBar = document.getElementById('ui-bar');
      const bottom = uiBar ? Math.max(16, window.innerHeight - uiBar.getBoundingClientRect().top + 10) : 88;
      breathingToast.style.bottom = `${bottom}px`;
      breathingToast.classList.add('is-visible');
      breathingToast.setAttribute('aria-hidden', 'false');
      breathingToastTimer = window.setTimeout(() => {
        breathingToast.classList.remove('is-visible');
        breathingToast.setAttribute('aria-hidden', 'true');
      }, 2500);
    });
  }

  const fsWrap = document.getElementById('td-fs-wrap'), fsVideo = document.getElementById('td-fs-video'), fsCanvas = document.getElementById('td-fs-canvas'), fsCtx = fsCanvas ? fsCanvas.getContext('2d') : null;
  const vEl = document.getElementById('td-v');
  const shopVisual = document.getElementById('shop-v');
  if (fsVideo) {
    fsVideo.muted = true;
    fsVideo.loop = true;
    fsVideo.playsInline = true;
    fsVideo.preload = 'auto';
    fsVideo.setAttribute('playsinline', '');
    fsVideo.setAttribute('webkit-playsinline', '');
  }
  function syncRoomMedia(isShop) {
    const shopVideo = archiveShop && shopVisual;
    if (isShop) {
      if (vEl) vEl.pause();
      if (shopVideo) {
        shopVideo.muted = true;
        shopVideo.playsInline = true;
        shopVideo.play().catch(error => {
          if (error.name !== 'AbortError') console.warn('Archive shop video playback could not start:', error);
        });
      }
    } else {
      if (shopVideo) shopVideo.pause();
      if (vEl) {
        vEl.play().catch(error => {
          if (error.name !== 'AbortError') console.warn('Room visual playback could not start:', error);
        });
      }
    }
  }
  const shopAudio = typeof window.Audio === 'function' ? new window.Audio() : null;
  const SHOP_AUDIO_VOLUME = 0.48;
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
    shopAudio.volume = SHOP_AUDIO_VOLUME;
    shopAudio.preload = 'auto';
    shopAudio.addEventListener('error', loadShopAudioFallback);
    loadShopAudioFallback();
  }

  const DEFAULT_VISUAL_URL = 'media/visual.mp4';
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
    vEl.setAttribute('loop', '');
    vEl.setAttribute('muted', '');
    vEl.setAttribute('playsinline', '');
    vEl.setAttribute('webkit-playsinline', '');
    vEl.crossOrigin = 'anonymous';
    vEl.src = DEFAULT_VISUAL_URL;
    wall.material.map = createVideoTexture(vEl);
    wall.material.needsUpdate = true;
  }

  if (aEl) {
    aEl.setAttribute('playsinline', '');
    window.addEventListener('pointerdown', function startDefaultAudio() {
      if (!introDismissed) return;
      if (isArchiveShopAudioActive()) return;
      if (aEl.paused && aEl.src) {
        initAudio();
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        playMedia(aEl);
      }
      window.removeEventListener('pointerdown', startDefaultAudio);
    });
  }

  let fullscreenHintToast = null, fullscreenHintTimer = 0;
  function showFullscreenHint() {
    if (!fullscreenHintToast) {
      fullscreenHintToast = document.createElement('div');
      fullscreenHintToast.setAttribute('role', 'status');
      fullscreenHintToast.setAttribute('aria-live', 'polite');
      fullscreenHintToast.textContent = 'For true fullscreen on iPhone: Tap Share → Add to Home Screen';
      fullscreenHintToast.style.cssText = 'position:fixed;left:50%;z-index:10000;width:max-content;max-width:calc(100vw - 32px);padding:10px 16px;color:rgba(255,255,255,0.92);font:12px -apple-system,BlinkMacSystemFont,sans-serif;text-align:center;background:rgba(18,18,22,0.78);border:1px solid rgba(255,255,255,0.16);border-radius:16px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);opacity:0;pointer-events:none;transform:translate(-50%,8px);transition:opacity 0.3s ease,transform 0.3s ease;';
      document.body.appendChild(fullscreenHintToast);
    }
    const uiBar = document.getElementById('ui-bar');
    const bottom = uiBar ? Math.max(16, window.innerHeight - uiBar.getBoundingClientRect().top + 10) : 88;
    fullscreenHintToast.style.bottom = `${bottom}px`;
    fullscreenHintToast.setAttribute('aria-hidden', 'false');
    window.clearTimeout(fullscreenHintTimer);
    requestAnimationFrame(() => {
      fullscreenHintToast.style.opacity = '1';
      fullscreenHintToast.style.transform = 'translate(-50%,0)';
    });
    fullscreenHintTimer = window.setTimeout(() => {
      fullscreenHintToast.style.opacity = '0';
      fullscreenHintToast.style.transform = 'translate(-50%,8px)';
      fullscreenHintToast.setAttribute('aria-hidden', 'true');
    }, 3500);
  }
  function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }
  let isSpaceFullscreen = false;
  function updateSpaceFullscreenButton() {
    if (!spaceFullscreenBtn) return;
    const icon = spaceFullscreenBtn.querySelector('svg');
    const isFullscreen = Boolean(getFullscreenElement());
    if (icon) {
      icon.innerHTML = isFullscreen
        ? '<path d="M8 3v5H3M16 3v5h5M3 16h5v5M21 16h-5v5" />'
        : '<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5" />';
    }
    spaceFullscreenBtn.setAttribute('aria-label', isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen');
  }
  function toggleSpaceFullscreen() {
    if (getFullscreenElement()) {
      const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
      if (typeof exitFullscreen !== 'function') {
        console.warn('Fullscreen exit is not supported by this browser.');
        return;
      }
      try {
        const exitAttempt = exitFullscreen.call(document);
        if (exitAttempt && typeof exitAttempt.catch === 'function') {
          exitAttempt.catch(error => {
            console.warn('Space fullscreen exit failed:', error);
            updateSpaceFullscreenButton();
            scheduleCameraViewportUpdate();
          });
        }
      } catch (error) {
        console.warn('Space fullscreen exit failed:', error);
        updateSpaceFullscreenButton();
        scheduleCameraViewportUpdate();
      }
      return;
    }

    const root = document.documentElement;
    const requestFullscreen = root.requestFullscreen || root.webkitRequestFullscreen;
    if (typeof requestFullscreen !== 'function') {
      console.warn('Fullscreen is not supported by this browser.');
      return;
    }
    isSpaceFullscreen = true;
    try {
      const request = requestFullscreen.call(root);
      if (request && typeof request.catch === 'function') {
        request.catch(error => {
          console.warn('Space fullscreen request failed:', error);
          isSpaceFullscreen = false;
          updateSpaceFullscreenButton();
          scheduleCameraViewportUpdate();
        });
      }
    } catch (error) {
      console.warn('Space fullscreen request failed:', error);
      isSpaceFullscreen = false;
      updateSpaceFullscreenButton();
      scheduleCameraViewportUpdate();
    }
  }
  function showFullscreenVideo() {
    document.documentElement.classList.remove('cinema-mode');
    document.body.classList.remove('cinema-mode');
    document.body.classList.add('native-fullscreen');
    if (fsBtn) setControlLabel(fsBtn, 'Exit Fullscreen');
    if (fsWrap) fsWrap.classList.add('active');
    const activeVisual = isArchiveShopAudioActive() && shopVisual ? shopVisual : vEl;
    if (activeVisual && fsVideo && fsCanvas && activeVisual.src) {
      fsVideo.src = activeVisual.src;
      fsVideo.currentTime = activeVisual.currentTime;
      fsVideo.style.display = 'block';
      fsCanvas.style.display = 'none';
      if (!activeVisual.paused) playMedia(fsVideo);
    } else if (fsVideo && fsCanvas) {
      fsVideo.style.display = 'none';
      fsCanvas.style.display = 'block';
    }
  }
  function enterCinemaMode() {
    document.body.classList.remove('native-fullscreen');
    if (fsBtn) setControlLabel(fsBtn, 'Fullscreen');
    if (fsWrap) fsWrap.classList.remove('active');
    if (fsVideo && !fsVideo.paused) fsVideo.pause();
    document.documentElement.classList.add('cinema-mode');
    document.body.classList.add('cinema-mode');
    updateCameraViewport();
    window.scrollTo(0, 1);
  }
  function enterFullscreen() {
    const fullscreenElement = getFullscreenElement();
    const isVisualFullscreen = isFs &&
      (document.body.classList.contains('native-fullscreen') || document.body.classList.contains('cinema-mode'));
    if (isVisualFullscreen) {
      exitFs(!(isSpaceFullscreen && fullscreenElement));
      return;
    }
    if (fullscreenElement && isSpaceFullscreen) {
      isFs = true;
      showFullscreenVideo();
      scheduleCameraViewportUpdate();
      return;
    }
    if (fullscreenElement) {
      exitFs();
      return;
    }
    const root = document.documentElement;
    const isIPhone = /iPhone/i.test(navigator.userAgent) || /iPhone/i.test(navigator.platform);
    if (isIPhone && !isStandalone &&
        typeof root.requestFullscreen !== 'function' && typeof root.webkitRequestFullscreen !== 'function') {
      showFullscreenHint();
      return;
    }
    isFs = true;
    const requestFullscreen = root.requestFullscreen || root.webkitRequestFullscreen;
    if (typeof requestFullscreen !== 'function') {
      enterCinemaMode();
      return;
    }
    try {
      const request = requestFullscreen.call(root);
      if (request && typeof request.catch === 'function') {
        request.catch(error => {
          console.warn('Fullscreen request failed; using cinema mode:', error);
          if (isFs && !getFullscreenElement()) enterCinemaMode();
        });
      }
    } catch (error) {
      console.warn('Fullscreen request failed; using cinema mode:', error);
      enterCinemaMode();
    }
  }
  if (fsBtn) fsBtn.addEventListener('click', enterFullscreen);
  function exitFs(exitNativeFullscreen = true) {
    isFs = false;
    document.body.classList.remove('native-fullscreen');
    document.documentElement.classList.remove('cinema-mode');
    document.body.classList.remove('cinema-mode');
    if (fsWrap) fsWrap.classList.remove('active');
    if (fsVideo && !fsVideo.paused) fsVideo.pause();
    if (fsBtn) setControlLabel(fsBtn, 'Fullscreen');
    if (exitNativeFullscreen && getFullscreenElement()) {
      const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
      if (typeof exitFullscreen === 'function') {
        try {
          const exitAttempt = exitFullscreen.call(document);
          if (exitAttempt && typeof exitAttempt.catch === 'function') {
            exitAttempt.catch(error => {
              console.warn('Fullscreen exit failed:', error);
              syncFullscreenState();
            });
          }
        } catch (error) {
          console.warn('Fullscreen exit failed:', error);
          syncFullscreenState();
        }
      } else {
        console.warn('Fullscreen exit is not supported by this browser.');
        syncFullscreenState();
      }
    }
    scheduleCameraViewportUpdate();
    window.scrollTo(0, 0);
  }
  const exitFsBtn = document.getElementById('exit-fs-btn');
  if (exitFsBtn) exitFsBtn.addEventListener('click', exitFs);
  function syncFullscreenState() {
    const fullscreenElement = getFullscreenElement();
    if (!fullscreenElement && isSpaceFullscreen) isSpaceFullscreen = false;
    updateSpaceFullscreenButton();
    if (fullscreenElement && isSpaceFullscreen) {
      scheduleCameraViewportUpdate();
      return;
    }
    if (fullscreenElement) {
      isFs = true;
      showFullscreenVideo();
      scheduleCameraViewportUpdate();
    } else if (document.body.classList.contains('native-fullscreen')) {
      exitFs(false);
    } else {
      if (!document.body.classList.contains('cinema-mode')) {
        isFs = false;
        if (fsBtn) setControlLabel(fsBtn, 'Fullscreen');
      }
      scheduleCameraViewportUpdate();
    }
  }
  document.addEventListener('fullscreenchange', syncFullscreenState);
  document.addEventListener('webkitfullscreenchange', syncFullscreenState);
  if (spaceFullscreenBtn) {
    spaceFullscreenBtn.addEventListener('click', toggleSpaceFullscreen);
    updateSpaceFullscreenButton();
  }

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
  let mainAudioFadeFrame = 0, shopAudioFadeFrame = 0, shopAudioPlayPending = false, shopAudioPlayRequest = 0;
  function fadeMediaVolume(media, targetVolume, duration, onComplete) {
    const startVolume = media.volume;
    const startTime = performance.now();
    const timer = setInterval(() => {
      const progress = Math.min(1, (performance.now() - startTime) / duration);
      media.volume = startVolume + (targetVolume - startVolume) * progress;
      if (progress >= 1) {
        clearInterval(timer);
        onComplete();
      }
    }, 50);
    return timer;
  }
  function fadeShopAudioTo(targetVolume, duration, pauseAtEnd = false) {
    if (!shopAudio) return;
    if (shopAudioFadeFrame) clearInterval(shopAudioFadeFrame);
    shopAudioFadeFrame = fadeMediaVolume(shopAudio, targetVolume, duration, () => {
      shopAudioFadeFrame = 0;
      if (pauseAtEnd) shopAudio.pause();
    });
  }
  function startShopAudioFromUserGesture() {
    if (!shopAudio) return;
    if (shopAudioFadeFrame) clearInterval(shopAudioFadeFrame);
    shopAudioFadeFrame = 0;
    const playRequest = ++shopAudioPlayRequest;
    shopAudioPlayPending = false;
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
        if (playRequest !== shopAudioPlayRequest) return;
        shopAudioPlayPending = false;
        if (!isArchiveShopAudioActive()) {
          fadeShopAudioTo(0, 250, true);
          return;
        }
        fadeShopAudioTo(SHOP_AUDIO_VOLUME, 850);
      }).catch(error => {
        if (playRequest !== shopAudioPlayRequest) return;
        shopAudioPlayPending = false;
        console.warn('Archive shop audio playback could not start:', error);
      });
    } else {
      shopAudioPlayPending = false;
      if (isArchiveShopAudioActive()) fadeShopAudioTo(SHOP_AUDIO_VOLUME, 850);
      else fadeShopAudioTo(0, 250, true);
    }
  }
  function fadeOutMainAudio(duration) {
    if (!aEl || aEl.paused) return;
    if (mainAudioFadeFrame) clearInterval(mainAudioFadeFrame);
    mainAudioFadeFrame = fadeMediaVolume(aEl, 0, duration, () => {
      mainAudioFadeFrame = 0;
      aEl.pause();
    });
  }
  function fadeInMainAudioAfterShop(duration) {
    if (!aEl || !aEl.src) return;
    if (mainAudioFadeFrame) clearInterval(mainAudioFadeFrame);
    mainAudioFadeFrame = 0;
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(error => console.warn('Audio context could not resume:', error));
    }
    aEl.muted = false;
    playMedia(aEl);
    mainAudioFadeFrame = fadeMediaVolume(aEl, 1.0, duration, () => { mainAudioFadeFrame = 0; });
  }
  const visualUpload = document.getElementById('v-up');
  if (visualUpload) {
    visualUpload.addEventListener('change', e => {
      const file = e.target.files && e.target.files.item(0);
      if (!file || !vEl) return;
      vEl.src = URL.createObjectURL(file);
      wall.material.map = createVideoTexture(vEl);
      wall.material.needsUpdate = true;
      syncRoomMedia(isArchiveShopAudioActive());
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
      syncRoomMedia(false);
    });
  }
  const playbackBtn = document.getElementById('pp-btn');
  function updatePlaybackButton() {
    if (!playbackBtn) return;
    const media = isArchiveShopAudioActive() ? shopAudio : aEl;
    const isPlaying = Boolean(media && !media.paused);
    setControlLabel(playbackBtn, isPlaying ? 'Pause' : 'Play');
    const icon = playbackBtn.querySelector('.control-icon path');
    if (icon) icon.setAttribute('d', isPlaying ? 'M8 5.5v13M16 5.5v13' : 'M8 5.5v13l10-6.5z');
  }
  if (playbackBtn) {
    [aEl, shopAudio].forEach(media => {
      if (!media) return;
      media.addEventListener('play', updatePlaybackButton);
      media.addEventListener('pause', updatePlaybackButton);
      media.addEventListener('ended', updatePlaybackButton);
    });
    updatePlaybackButton();
    playbackBtn.addEventListener('click', () => {
      if (isArchiveShopAudioActive()) {
        if (!shopAudio) return;
        if (shopAudio.paused && !shopAudioPlayPending) {
          startShopAudioFromUserGesture();
        } else {
          ++shopAudioPlayRequest;
          shopAudioPlayPending = false;
          if (shopAudioFadeFrame) clearInterval(shopAudioFadeFrame);
          shopAudioFadeFrame = 0;
          shopAudio.pause();
        }
        updatePlaybackButton();
        return;
      }
      if (!aEl) return;
      if (aEl.paused) {
        startRoomAudioFromGesture();
        syncRoomMedia(false);
      } else {
        if (mainAudioFadeFrame) clearInterval(mainAudioFadeFrame);
        mainAudioFadeFrame = 0;
        aEl.pause();
      }
      updatePlaybackButton();
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
    uiBarEl.style.pointerEvents = 'none';

    clearTimeout(uiHideTimer);
    if (window.innerWidth <= 768) return;
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
  window.addEventListener('resize', wakeCinematicUI);
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
    if (inShopNow) {
      if (!wasInShop) {
        syncRoomMedia(true);
        resumeMainAudioAfterShop = Boolean(aEl && !aEl.paused);
        fadeOutMainAudio(850);
        if (introAudio) fadeOutIntroAudio(850);
        if (shopAudio && !shopAudioPlayPending) {
          if (shopAudio.paused) startShopAudioFromUserGesture();
          else if (shopAudioFadeFrame) fadeShopAudioTo(SHOP_AUDIO_VOLUME, 850);
        }
      }
    } else {
      if (wasInShop && shopAudio) {
        fadeShopAudioTo(0, 850, true);
      }
      if (wasInShop) syncRoomMedia(false);
      if (wasInShop && resumeMainAudioAfterShop && aEl) {
        fadeInMainAudioAfterShop(850);
      }
      resumeMainAudioAfterShop = false;
    }
    if (inShopNow !== wasInShop) updatePlaybackButton();
    wasInShop = inShopNow;

    if (vEl && !vEl.paused && vEl.readyState >= 2 &&
        wall.material.map && wall.material.map.isVideoTexture) {
      wall.material.map.needsUpdate = true;
    }
    if (inShopNow && archiveShop && archiveShop.shopArtMat.map &&
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
        introSceneReady = true;
        setIntroProgress(98);
        finishIntroLoading();
      }
    }
  }
  window.addEventListener('resize', scheduleCameraViewportUpdate);
  window.addEventListener('orientationchange', scheduleCameraViewportUpdate);
  setIntroProgress(80);
  loop();
})();
