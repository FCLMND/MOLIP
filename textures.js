window.RoomTextures = {
  // 인위적인 직선을 없애고 유기적으로 굽이치는 자연 원목 결 생성기
  mkWood(c1, c2) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512;
    const g = c.getContext('2d'); g.fillStyle = c1; g.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 260; i++) {
      const baseY = Math.random() * 512;
      const phase = Math.random() * Math.PI * 2;
      const amp = 6 + Math.random() * 14;
      const freq = 0.008 + Math.random() * 0.012;
      g.strokeStyle = c2;
      g.globalAlpha = 0.08 + Math.random() * 0.16;
      g.lineWidth = 1 + Math.random() * 2.2;
      g.beginPath();
      for (let x = 0; x <= 512; x += 16) {
        const y = baseY + Math.sin(x * freq + phase) * amp + Math.cos(x * freq * 0.45) * (amp * 0.5);
        x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.stroke();
    }
    g.globalAlpha = 1.0;
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  },

  mkPersianRug() {
    const w = 1536, h = 960, c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    const darkRust = '#52150d', deepMahogany = '#340b06', charcoal = '#14171f', antiqueBeige = '#cbb898', bronzeGold = '#9e6c2e', slateTeal = '#2c474d';

    g.fillStyle = deepMahogany; g.fillRect(0, 0, w, h);
    g.fillStyle = charcoal; g.fillRect(14, 14, w - 28, h - 28);
    g.strokeStyle = bronzeGold; g.lineWidth = 4; g.strokeRect(20, 20, w - 40, h - 40);
    g.strokeStyle = antiqueBeige; g.lineWidth = 3; g.strokeRect(96, 96, w - 192, h - 192);
    g.strokeStyle = bronzeGold; g.lineWidth = 4; g.strokeRect(108, 108, w - 216, h - 216);

    function drawDiamond(cx, cy, rx, ry, col1, col2, col3, col4) {
      g.beginPath(); g.moveTo(cx, cy - ry); g.lineTo(cx + rx, cy); g.lineTo(cx, cy + ry); g.lineTo(cx - rx, cy); g.closePath();
      g.fillStyle = col1; g.fill(); g.strokeStyle = antiqueBeige; g.lineWidth = 2; g.stroke();
      g.beginPath(); g.moveTo(cx, cy - ry * 0.72); g.lineTo(cx + rx * 0.72, cy); g.lineTo(cx, cy + ry * 0.72); g.lineTo(cx - rx * 0.72, cy); g.closePath();
      g.fillStyle = col2; g.fill();
      g.beginPath(); g.moveTo(cx, cy - ry * 0.45); g.lineTo(cx + rx * 0.45, cy); g.lineTo(cx, cy + ry * 0.45); g.lineTo(cx - rx * 0.45, cy); g.closePath();
      g.fillStyle = col3; g.fill();
      g.beginPath(); g.moveTo(cx, cy - ry * 0.20); g.lineTo(cx + rx * 0.20, cy); g.lineTo(cx, cy + ry * 0.20); g.lineTo(cx - rx * 0.20, cy); g.closePath();
      g.fillStyle = col4; g.fill();
    }

    for (let x = 56; x <= w - 56; x += 64) {
      new Array(58, h - 58).forEach(by => { drawDiamond(x, by, 26, 20, darkRust, antiqueBeige, slateTeal, bronzeGold); drawDiamond(x + 32, by, 10, 10, bronzeGold, charcoal, antiqueBeige, darkRust); });
    }
    for (let y = 118; y <= h - 118; y += 64) {
      new Array(58, w - 58).forEach(bx => { drawDiamond(bx, y, 20, 26, darkRust, antiqueBeige, slateTeal, bronzeGold); drawDiamond(bx, y + 32, 10, 10, bronzeGold, charcoal, antiqueBeige, darkRust); });
    }

    g.fillStyle = darkRust; g.fillRect(114, 114, w - 228, h - 228);
    g.save(); g.beginPath(); g.rect(116, 116, w - 232, h - 232); g.clip();
    const smX = 64, smY = 48;
    g.strokeStyle = 'rgba(203, 184, 152, 0.28)'; g.lineWidth = 1.6;
    for (let y = 100; y <= h - 80; y += smY) {
      for (let x = 100; x <= w - 80; x += smX) {
        g.beginPath(); g.moveTo(x, y - smY / 2); g.lineTo(x + smX / 2, y); g.lineTo(x, y + smY / 2); g.lineTo(x - smX / 2, y); g.closePath(); g.stroke();
        drawDiamond(x, y, 13, 10, charcoal, bronzeGold, antiqueBeige, darkRust);
      }
    }
    const medCoords = new Array(new Array(340, 270), new Array(340, 690), new Array(768, 220), new Array(768, 740), new Array(1196, 270), new Array(1196, 690), new Array(554, 480), new Array(982, 480));
    medCoords.forEach(pt => drawDiamond(pt.at(0), pt.at(1), 66, 48, charcoal, antiqueBeige, slateTeal, bronzeGold));
    new Array(340, 768, 1196).forEach(lx => drawDiamond(lx, h / 2, 138, 104, charcoal, antiqueBeige, darkRust, bronzeGold));
    g.restore();

    for (let y = 0; y < h; y += 3) { g.fillStyle = y % 6 === 0 ? 'rgba(255,240,220,0.04)' : 'rgba(10,4,2,0.16)'; g.fillRect(0, y, w, 1.5); }
    const t = new THREE.CanvasTexture(c); t.anisotropy = 8; return t;
  },

  mkRugBump() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#808080'; g.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 3) for (let x = 0; x < 256; x += 3) { const v = (x + y) % 6 === 0 ? 175 : 85; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, y, 2.5, 2.5); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(20, 12); return t;
  },

  mkIvoryFabric() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512; const g = c.getContext('2d');
    g.fillStyle = '#cfc3ad'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 180; i++) {
      g.fillStyle = i % 2 === 0 ? 'rgba(248, 240, 224, 0.16)' : 'rgba(95, 82, 62, 0.14)';
      g.beginPath(); g.arc(Math.random() * 512, Math.random() * 512, 18 + Math.random() * 45, 0, Math.PI * 2); g.fill();
    }
    for (let y = 0; y < 512; y += 3) { g.fillStyle = y % 6 === 0 ? 'rgba(255,250,240,0.34)' : 'rgba(82,70,52,0.26)'; g.fillRect(0, y, 512, 1.5); }
    for (let x = 0; x < 512; x += 3) { g.fillStyle = x % 6 === 0 ? 'rgba(255,250,240,0.28)' : 'rgba(82,70,52,0.22)'; g.fillRect(x, 0, 1.5, 512); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 5); return t;
  },
  mkBlueBaffle() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 1024; const g = c.getContext('2d');
    const v = g.createLinearGradient(0, 0, 0, 1024);
    v.addColorStop(0, '#22508f'); v.addColorStop(0.45, '#183b6e'); v.addColorStop(0.8, '#0f274d'); v.addColorStop(1, '#091833');
    g.fillStyle = v; g.fillRect(0, 0, 512, 1024);
    return new THREE.CanvasTexture(c);
  },

  mkCone() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512; const g = c.getContext('2d');
    const gr = g.createRadialGradient(256, 256, 28, 256, 256, 250);
    gr.addColorStop(0, '#08080a'); gr.addColorStop(0.35, '#191b20'); gr.addColorStop(0.72, '#2d3038'); gr.addColorStop(1, '#101114');
    g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
    for (let r = 52; r < 242; r += 15) {
      g.beginPath(); g.arc(256, 256, r, 0, Math.PI * 2); g.strokeStyle = 'rgba(225,230,240,0.18)'; g.lineWidth = 3.5; g.stroke();
      g.beginPath(); g.arc(256, 256, r + 4, 0, Math.PI * 2); g.strokeStyle = 'rgba(0,0,0,0.72)'; g.lineWidth = 4; g.stroke();
    }
    return new THREE.CanvasTexture(c);
  },

  mkPanel() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 192; const g = c.getContext('2d');
    g.fillStyle = '#121316'; g.fillRect(0, 0, 256, 192); g.strokeStyle = '#9ca3af'; g.lineWidth = 4; g.strokeRect(4, 4, 248, 184);
    g.fillStyle = '#ea580c'; g.fillRect(16, 18, 42, 22); g.fillStyle = '#fff';
    g.font = "600 10px -apple-system, 'Helvetica Neue', sans-serif";
    g.letterSpacing = '2.5px'; g.textAlign = 'center'; g.fillText('FCL.MND', 37, 34, 42);
    g.textAlign = 'left';
    g.fillStyle = '#e5e7eb'; g.font = 'bold 13px sans-serif'; g.fillText('4344', 68, 33);
    g.fillStyle = '#2563eb'; g.fillRect(16, 48, 224, 3);
    return new THREE.CanvasTexture(c);
  },

  mkConcreteFloor() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#121316'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 3000; i++) { g.fillStyle = Math.random() > 0.5 ? '#1a1b1f' : '#0b0c0e'; g.globalAlpha = 0.25; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 10); return t;
  },

  // 한국 전통 사찰(산사) 대청마루·우물마루 스타일 원목 바닥 텍스처
  mkTempleWoodFloor() {
    const size = 1024;
    const c = document.createElement('canvas'); c.width = size; c.height = size;
    const g = c.getContext('2d');

    // 마루 널 사이 깊은 나무 틈새(줄눈) 바탕
    g.fillStyle = '#120a05'; g.fillRect(0, 0, size, size);

    // 헬퍼: 특정 사각 판재(x, y, w, h) 내부에 자연스럽게 굽이치는 나뭇결(가로 또는 세로) 그리기
    function drawNaturalPlank(px, py, pw, ph, isVertical, baseTone) {
      g.save();
      g.beginPath(); g.rect(px, py, pw, ph); g.clip();

      g.fillStyle = baseTone;
      g.fillRect(px, py, pw, ph);

      // 판재 가장자리 은은한 마모 음영
      const edgeGrad = isVertical
        ? g.createLinearGradient(px, py, px + pw, py)
        : g.createLinearGradient(px, py, px, py + ph);
      edgeGrad.addColorStop(0.0, 'rgba(10, 5, 2, 0.35)');
      edgeGrad.addColorStop(0.15, 'rgba(255, 225, 190, 0.04)');
      edgeGrad.addColorStop(0.85, 'rgba(255, 225, 190, 0.03)');
      edgeGrad.addColorStop(1.0, 'rgba(10, 5, 2, 0.38)');
      g.fillStyle = edgeGrad;
      g.fillRect(px, py, pw, ph);

      // 인위적 직선을 없앤 유기적 파동 나뭇결 & 타원 옹이
      const lines = isVertical ? Math.floor(pw / 3) : Math.floor(ph / 3);
      const seedOff = (px * 0.13 + py * 0.27);
      for (let i = 0; i < lines; i++) {
        const ratio = i / Math.max(1, lines);
        g.strokeStyle = i % 3 === 0 ? 'rgba(18, 9, 4, 0.42)' : 'rgba(92, 56, 30, 0.24)';
        g.lineWidth = 1.0 + (i % 4) * 0.35;
        g.beginPath();
        if (isVertical) {
          const sx = px + ratio * pw;
          for (let y = py; y <= py + ph; y += 16) {
            const wave = Math.sin(y * 0.018 + seedOff + ratio * 6.0) * 7 + Math.cos(y * 0.007 - seedOff) * 5;
            const cx = Math.max(px, Math.min(px + pw, sx + wave));
            y === py ? g.moveTo(cx, y) : g.lineTo(cx, y);
          }
        } else {
          const sy = py + ratio * ph;
          for (let x = px; x <= px + pw; x += 16) {
            const wave = Math.sin(x * 0.018 + seedOff + ratio * 6.0) * 7 + Math.cos(x * 0.007 - seedOff) * 5;
            const cy = Math.max(py, Math.min(py + ph, sy + wave));
            x === px ? g.moveTo(x, cy) : g.lineTo(x, cy);
          }
        }
        g.stroke();
      }
      g.restore();
    }

    // 산사 전통 우물마루(장귀틀 + 동귀틀 + 청판 교차 조립) 그리드 생성
    const grid = 4; // 1024px 안에 4x4 우물마루 모듈 배치
    const cell = size / grid; // 256px
    const railThick = 34; // 굵은 귀틀(프레임 보) 두께
    const gap = 3; // 목재 판재 사이 미세 틈새
    const woodTones = new Array('#382213', '#311d10', '#3d2515', '#2c190d', '#351f11');

    for (let r = 0; r < grid; r++) {
      // 가로 장귀틀(Longitudinal Rail)
      drawNaturalPlank(0, r * cell + gap / 2, size, railThick - gap, false, '#2b180c');

      for (let c = 0; c < grid; c++) {
        const bx = c * cell;
        const by = r * cell + railThick;
        const innerH = cell - railThick;

        // 세로 동귀틀(Cross Rail)
        drawNaturalPlank(bx + gap / 2, by + gap / 2, railThick - gap, innerH - gap, true, '#2e1a0e');

        // 귀틀 안쪽을 채우는 3장의 청판(마루 널빤지) - 행마다 가로/세로 결을 교차시켜 산사 우물마루 특유의 리듬감 구현
        const panelX = bx + railThick;
        const panelW = cell - railThick;
        const subCols = 3;
        const plankW = panelW / subCols;
        const isVertPlank = (r + c) % 2 === 0;

        for (let p = 0; p < subCols; p++) {
          const tone = woodTones.at((r * 7 + c * 3 + p) % woodTones.length);
          if (isVertPlank) {
            drawNaturalPlank(panelX + p * plankW + gap / 2, by + gap / 2, plankW - gap, innerH - gap, true, tone);
          } else {
            const plankH = innerH / subCols;
            drawNaturalPlank(panelX + gap / 2, by + p * plankH + gap / 2, panelW - gap, plankH - gap, false, tone);
          }
        }
      }
    }

    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(7, 7);
    t.anisotropy = 8;
    return t;
  },

  mkHanjiPaper() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512; const g = c.getContext('2d');
    g.fillStyle = '#f5ebd6'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2400; i++) {
      const x = Math.random() * 512, y = Math.random() * 512, len = 4 + Math.random() * 14, ang = Math.random() * Math.PI * 2;
      g.strokeStyle = Math.random() > 0.4 ? 'rgba(255,252,245,0.55)' : 'rgba(195,175,140,0.25)'; g.lineWidth = 0.6 + Math.random() * 0.9;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); g.stroke();
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  },

  mkHanjiGlowGrad() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 512; const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.00, '#ffd89c'); grad.addColorStop(0.22, '#fff8e6'); grad.addColorStop(0.55, '#e89b4c'); grad.addColorStop(1.00, '#8f4716');
    g.fillStyle = grad; g.fillRect(0, 0, 256, 512);
    for (let i = 0; i < 1600; i++) {
      const x = Math.random() * 256, y = Math.random() * 512, len = 3 + Math.random() * 12, ang = Math.random() * Math.PI * 2;
      g.strokeStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.22)' : 'rgba(90,40,10,0.16)'; g.lineWidth = 0.7;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); g.stroke();
    }
    return new THREE.CanvasTexture(c);
  },

  // 장비 테이블용 유기적 통원목 나이테 텍스처 (일직선 제거, 자연스러운 물결·옹이 결)
  mkRichWalnutWood() {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const g = c.getContext('2d');
    g.fillStyle = '#4a2a16'; g.fillRect(0, 0, 1024, 512);

    // 1) 유기적으로 굽이치는 다중 파형 나뭇결
    for (let i = 0; i < 190; i++) {
      const baseY = (i / 190) * 512;
      const phase1 = Math.sin(i * 0.14) * 2.4;
      const phase2 = Math.cos(i * 0.07) * 1.8;
      const amp = 14 + Math.sin(i * 0.09) * 10;

      g.strokeStyle = i % 5 === 0 ? 'rgba(20, 9, 4, 0.52)' : 'rgba(116, 70, 36, 0.25)';
      g.lineWidth = 1.2 + (i % 4) * 0.45;
      g.beginPath();
      for (let x = 0; x <= 1024; x += 24) {
        const y = baseY
          + Math.sin(x * 0.0065 + phase1) * amp
          + Math.cos(x * 0.014 + phase2) * (amp * 0.42);
        x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.stroke();
    }

    // 2) 통원목 특유의 비대칭 타원 옹이(Knot) 및 나이테 소용돌이
    new Array(
      new Array(240, 165, 165, 34, -0.06),
      new Array(740, 335, 195, 38, 0.05),
      new Array(510, 110, 110, 20, 0.02)
    ).forEach(k => {
      for (let r = 1; r <= 8; r++) {
        g.strokeStyle = r % 2 === 0 ? 'rgba(22, 10, 4, 0.44)' : 'rgba(98, 58, 30, 0.28)';
        g.lineWidth = 1.5;
        g.beginPath();
        g.ellipse(k.at(0), k.at(1), k.at(2) * (r / 8), k.at(3) * (r / 8), k.at(4), 0, Math.PI * 2);
        g.stroke();
      }
    });

    const t = new THREE.CanvasTexture(c); t.anisotropy = 8; return t;
  },

  mkCinderBlockTex() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#8b9096'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 6500; i++) {
      const v = 95 + Math.floor(Math.random() * 85);
      g.fillStyle = `rgb(${v},${v + 2},${v + 4})`; g.globalAlpha = 0.42;
      g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  },


  // 압축 펠트(Felt) 흡음 패널용 미세 섬유질 차콜 텍스처
  mkAcousticFeltTex() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512;
    const g = c.getContext('2d');
    g.fillStyle = '#33363b'; g.fillRect(0, 0, 512, 512);

    // 펠트 특유의 미세한 섬유 가닥과 멜란지 그레이·차콜 톤 믹스
    for (let i = 0; i < 14000; i++) {
      const v = 36 + Math.floor(Math.random() * 44);
      g.fillStyle = `rgb(${v},${v + 1},${v + 4})`;
      g.globalAlpha = 0.45;
      g.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
    }
    for (let i = 0; i < 900; i++) {
      const x = Math.random() * 512, y = Math.random() * 512;
      const len = 3 + Math.random() * 8, ang = Math.random() * Math.PI * 2;
      g.strokeStyle = Math.random() > 0.5 ? 'rgba(130, 136, 146, 0.22)' : 'rgba(18, 20, 24, 0.25)';
      g.lineWidth = 0.6;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    return t;
    },
      
  // 중앙은 선명하고 바깥으로 갈수록 은은하게 흐려지는(Radial Fade) 국기 텍스처 생성기
  mkSoftFlagTex(countryCode) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const g = c.getContext('2d');

    // 1. 국가별 국기 그래픽 그리기
    if (countryCode === 'KR') {
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 256);
      // 태극 문양
      g.save(); g.translate(128, 128); g.rotate(-0.58);
      g.beginPath(); g.arc(0, 0, 44, Math.PI, 0); g.fillStyle = '#cd2e3a'; g.fill();
      g.beginPath(); g.arc(0, 0, 44, 0, Math.PI); g.fillStyle = '#0047a0'; g.fill();
      g.beginPath(); g.arc(-22, 0, 22, 0, Math.PI * 2); g.fillStyle = '#cd2e3a'; g.fill();
      g.beginPath(); g.arc(22, 0, 22, 0, Math.PI * 2); g.fillStyle = '#0047a0'; g.fill();
      g.restore();
      // 건곤감리 4괘 간략 포인트
      g.fillStyle = '#111111';
      g.fillRect(58, 64, 24, 6); g.fillRect(58, 74, 24, 6);
      g.fillRect(174, 64, 24, 6); g.fillRect(174, 74, 24, 6);
      g.fillRect(58, 176, 24, 6); g.fillRect(58, 186, 24, 6);
      g.fillRect(174, 176, 24, 6); g.fillRect(174, 186, 24, 6);
    } else if (countryCode === 'JP') {
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 256);
      g.beginPath(); g.arc(128, 128, 46, 0, Math.PI * 2);
      g.fillStyle = '#bc002d'; g.fill();
    } else if (countryCode === 'FR') {
      g.fillStyle = '#002395'; g.fillRect(0, 0, 86, 256);
      g.fillStyle = '#ffffff'; g.fillRect(86, 0, 84, 256);
      g.fillStyle = '#ed2939'; g.fillRect(170, 0, 86, 256);
    } else {
      // 기본: 웜 앰버 & 인디고 오로라 코어
      g.fillStyle = '#1e3a8a'; g.fillRect(0, 0, 256, 128);
      g.fillStyle = '#f59e0b'; g.fillRect(0, 128, 256, 128);
    }

    // 2. 중앙은 선명하게 유지하고 바깥쪽 가장자리로 갈수록 투명하게 흐려지는 방사형 마스크
    g.globalCompositeOperation = 'destination-in';
    const mask = g.createRadialGradient(128, 128, 18, 128, 128, 118);
    mask.addColorStop(0.00, 'rgba(0, 0, 0, 1.0)');   // 정중앙: 100% 선명함
    mask.addColorStop(0.42, 'rgba(0, 0, 0, 0.88)');  // 중단부: 선명한 형태 유지
    mask.addColorStop(0.75, 'rgba(0, 0, 0, 0.28)');  // 외곽부: 은은하게 번지며 흐려짐
    mask.addColorStop(1.00, 'rgba(0, 0, 0, 0.0)');   // 최외곽: 완전히 투명하게 소멸
    g.fillStyle = mask;
    g.fillRect(0, 0, 256, 256);
    g.globalCompositeOperation = 'source-over';

    return new THREE.CanvasTexture(c);
  }

  };
