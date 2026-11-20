window.SpeakerSystem = {
  createDriver(ux, uy, uz, r, bolts, mats) {
    const ug = new THREE.Group(); ug.position.set(ux, uy, uz);
    const seal = new THREE.Mesh(new THREE.CircleGeometry(r * 0.92, 32), mats.blk); seal.position.z = -0.001; ug.add(seal);
    ug.add(new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.065, 16, 48), mats.alum));
    const sur = new THREE.Mesh(new THREE.TorusGeometry(r * 0.89, r * 0.055, 16, 48), mats.blk); sur.position.z = 0.003; ug.add(sur);
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.86, r * 0.24, r * 0.20, 48, 1, true), mats.cone); cone.rotation.x = Math.PI / 2; cone.position.z = -r * 0.07; ug.add(cone);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(r * 0.26, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.45), mats.blk); cap.rotation.x = Math.PI / 2; cap.position.z = -r * 0.14; ug.add(cap);
    for (let b = 0; b < bolts; b++) {
      const a = (b / bolts) * Math.PI * 2;
      const bt = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.006, 8), mats.metal);
      bt.rotation.x = Math.PI / 2; bt.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.006); ug.add(bt);
    }
    return ug;
  },

  createJBL4344(xPos, rotY, isRight, mats) {
    const root = new THREE.Group(), mir = isRight ? -1 : 1, standH = 0.30;
    new Array(-0.26, 0.26).forEach(lx => {
      const lf = new THREE.Mesh(new THREE.BoxGeometry(0.035, standH, 0.035), mats.metal); lf.position.set(lx, standH / 2, 0.16); root.add(lf);
      const lb = new THREE.Mesh(new THREE.BoxGeometry(0.035, standH - 0.02, 0.035), mats.metal); lb.position.set(lx, (standH - 0.02) / 2, -0.16); root.add(lb);
    });
    const cab = new THREE.Group(); cab.position.set(0, standH - 0.01, 0); cab.rotation.x = -0.06;
    const W = 0.635, H = 1.051, D = 0.435, rim = 0.022, rec = 0.018, bZ = D / 2 - rec;

    const back = new THREE.Mesh(new THREE.BoxGeometry(W, H, D - rec), mats.jblCab); back.position.set(0, H / 2, -rec / 2); back.castShadow = true; cab.add(back);
    const tL = new THREE.Mesh(new THREE.BoxGeometry(W, rim, rec), mats.jblCab); tL.position.set(0, H - rim / 2, D / 2 - rec / 2); cab.add(tL);
    const bL = new THREE.Mesh(new THREE.BoxGeometry(W, rim, rec), mats.jblCab); bL.position.set(0, rim / 2, D / 2 - rec / 2); cab.add(bL);
    const lL = new THREE.Mesh(new THREE.BoxGeometry(rim, H - rim * 2, rec), mats.jblCab); lL.position.set(-W / 2 + rim / 2, H / 2, D / 2 - rec / 2); cab.add(lL);
    const rL = new THREE.Mesh(new THREE.BoxGeometry(rim, H - rim * 2, rec), mats.jblCab); rL.position.set(W / 2 - rim / 2, H / 2, D / 2 - rec / 2); cab.add(rL);
    const baffle = new THREE.Mesh(new THREE.PlaneGeometry(W - rim * 2, H - rim * 2), mats.jblBlue); baffle.position.set(0, H / 2, bZ + 0.001); cab.add(baffle);

    const pegX = W / 2 - rim - 0.018;
    new Array(-pegX, pegX).forEach(gx => new Array(0.048, 0.375, 0.695, H - 0.048).forEach(gy => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.0085, 0.0022, 10, 24), mats.metal); ring.position.set(gx, gy, bZ + 0.002); cab.add(ring);
      const hole = new THREE.Mesh(new THREE.CircleGeometry(0.007, 16), new THREE.MeshBasicMaterial({ color: 0x020204 })); hole.position.set(gx, gy, bZ + 0.0025); cab.add(hole);
    }));

    cab.add(this.createDriver(0, 0.275, bZ + 0.004, 0.19, 8, mats));
    new Array(-0.205, 0.205).forEach(px => { const p = new THREE.Mesh(new THREE.CircleGeometry(0.035, 24), new THREE.MeshBasicMaterial({ color: 0x050507 })); p.position.set(px, 0.09, bZ + 0.002); cab.add(p); });
    cab.add(this.createDriver(-0.135 * mir, 0.625, bZ + 0.004, 0.125, 6, mats));

    const lensX = 0.115 * mir, lensY = 0.745;
    const lBox = new THREE.Mesh(new THREE.BoxGeometry(0.245, 0.165, 0.025), mats.metal); lBox.position.set(lensX, lensY, bZ + 0.012); cab.add(lBox);
    for (let f = -3; f <= 3; f++) { const fin = new THREE.Mesh(new THREE.BoxGeometry(0.235, 0.004, 0.038), mats.alum); fin.position.set(lensX, lensY + f * 0.021, bZ + 0.022); fin.rotation.x = 0.22; cab.add(fin); }

    const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.048, 0.016, 32), mats.alum); tw.rotation.x = Math.PI / 2; tw.position.set(0.135 * mir, 0.915, bZ + 0.008); cab.add(tw);
    const ctrl = new THREE.Mesh(new THREE.BoxGeometry(0.185, 0.14, 0.008), mats.panel); ctrl.position.set(-0.14 * mir, 0.885, bZ + 0.004); cab.add(ctrl);

    root.add(cab); root.position.set(xPos, 0, -1.55); root.rotation.y = rotY; return root;
  },

  mkOjasWoodTex() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512; const g = c.getContext('2d');
    g.fillStyle = '#6f7f8f'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 450; i++) { g.fillStyle = i % 2 === 0 ? 'rgba(42,52,64,0.22)' : 'rgba(155,172,188,0.16)'; g.fillRect(0, Math.random() * 512, 512, 1.5 + Math.random() * 3.5); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  },

  mkHornDepthGradTex() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0.0, '#07080a');
    grad.addColorStop(0.45, '#1b2026');
    grad.addColorStop(0.85, '#434b54');
    grad.addColorStop(1.0, '#626d7a');
    g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  },

  createOjasSpeakerSystem(xPos, rotY, mats) {
    const ojasGroup = new THREE.Group();
    const ojasTex = this.mkOjasWoodTex();
    const ojasWoodMat = new THREE.MeshStandardMaterial({ map: ojasTex, bumpMap: ojasTex, bumpScale: 0.003, roughness: 0.52, metalness: 0.06 });

    const satinOuterMat = new THREE.MeshPhysicalMaterial({
      color: 0x48515c, roughness: 0.34, metalness: 0.35, clearcoat: 0.35, clearcoatRoughness: 0.32
    });
    const hornDepthTex = this.mkHornDepthGradTex();
    const satinInnerDepthMat = new THREE.MeshPhysicalMaterial({
      map: hornDepthTex, roughness: 0.38, metalness: 0.25, clearcoat: 0.25, clearcoatRoughness: 0.35
    });
    const lightBlockMat = new THREE.MeshBasicMaterial({ color: 0x030405, side: THREE.DoubleSide });

    const W = 0.94, H = 1.18, D = 0.56, fZ = D / 2 + 0.001;
    const cab = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), ojasWoodMat);
    cab.position.y = H / 2; cab.castShadow = true; cab.receiveShadow = true; ojasGroup.add(cab);

    const seamMat = new THREE.MeshBasicMaterial({ color: 0x3b4652 });
    new Array(-0.25, 0.25).forEach(sx => { const v = new THREE.Mesh(new THREE.PlaneGeometry(0.004, H - 0.02), seamMat); v.position.set(sx, H / 2, fZ); ojasGroup.add(v); });

    ojasGroup.add(this.createDriver(0, 0.74, fZ + 0.003, 0.20, 8, mats));
    ojasGroup.add(this.createDriver(0, 0.30, fZ + 0.003, 0.20, 8, mats));

    const twPlate = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.012), mats.alum); twPlate.position.set(0, 1.03, fZ + 0.004); ojasGroup.add(twPlate);
    const twCore = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.085, 0.016), mats.blk); twCore.position.set(0, 1.03, fZ + 0.006); ojasGroup.add(twCore);
    const twSlit = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.055, 0.02), mats.alum); twSlit.position.set(0, 1.03, fZ + 0.007); ojasGroup.add(twSlit);

    new Array(-0.36, 0.36).forEach(px => {
      const topS = new THREE.Mesh(new THREE.PlaneGeometry(0.032, 0.25), lightBlockMat); topS.position.set(px, 0.76, fZ + 0.001); ojasGroup.add(topS);
      const botS = new THREE.Mesh(new THREE.PlaneGeometry(0.032, 0.25), lightBlockMat); botS.position.set(px, 0.32, fZ + 0.001); ojasGroup.add(botS);
    });

    const hornGrp = new THREE.Group();
    hornGrp.position.set(0, H + 0.28, 0.04);

    const rearSealBox = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.46, 0.14), lightBlockMat);
    rearSealBox.position.set(0, 0, -0.16); hornGrp.add(rearSealBox);

    const driverCan = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.22, 24), satinOuterMat);
    driverCan.rotation.x = Math.PI / 2; driverCan.position.set(0, 0, -0.26); driverCan.castShadow = true; hornGrp.add(driverCan);

    const cols = 5, rows = 2;
    const cellW = 0.162, cellH = 0.252, cellD = 0.38;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = (c - (cols - 1) / 2) * (cellW * 0.96);
        const cy = (0.5 - r) * (cellH * 0.96);
        const yawAngle = (c - 2) * 0.14;
        const pitchAngle = (r === 0 ? -0.10 : 0.10);

        const cell = new THREE.Group();
        cell.position.set(cx, cy, 0.06);
        cell.rotation.set(pitchAngle, yawAngle, 0);

        const outerFlare = new THREE.Mesh(new THREE.BoxGeometry(cellW, cellH, cellD), satinOuterMat);
        outerFlare.castShadow = true;
        cell.add(outerFlare);

        const innerMouth = new THREE.Mesh(new THREE.BoxGeometry(cellW - 0.014, cellH - 0.014, 0.01), satinInnerDepthMat);
        innerMouth.position.z = cellD / 2 + 0.001;
        cell.add(innerMouth);

        const throatHole = new THREE.Mesh(new THREE.PlaneGeometry(cellW * 0.42, cellH * 0.42), lightBlockMat);
        throatHole.position.z = cellD / 2 + 0.007;
        cell.add(throatHole);

        hornGrp.add(cell);
      }
    }

    ojasGroup.add(hornGrp);
    ojasGroup.position.set(xPos, 0, -1.35);
    ojasGroup.rotation.y = rotY;
    return ojasGroup;
  },
  // 실제 크기 비율(W: 0.42m x H: 0.21m x D: 0.31m) 매킨토시 MC275 진공관 파워 앰프 (컨트롤면이 청중 쪽 +Z를 향함)
  createMcIntoshAmp(mats) {
    const mc = new THREE.Group();
    const W = 0.42, H = 0.21, D = 0.31;

    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.14, metalness: 0.94 });
    const glossBlackMat = new THREE.MeshPhysicalMaterial({ color: 0x0b0c0e, roughness: 0.18, metalness: 0.35, clearcoat: 0.85 });
    const glassTubeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffe4c4, transparent: true, opacity: 0.42, roughness: 0.1, metalness: 0.05, clearcoat: 0.95
    });
    const heaterGlowMat = new THREE.MeshBasicMaterial({ color: 0xff7b29 });

    // 1) 미러 크롬 스테인리스 메인 섀시 베이스
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(W, 0.068, D), chromeMat);
    chassis.position.y = 0.034;
    chassis.castShadow = true; chassis.receiveShadow = true;
    mc.add(chassis);

    // 2) 전면 블랙 글래스 컨트롤 스트립 & 그린 로고, 좌·우 게인 노브, 스피커 단자 (청중 정면 +Z)
    const frontStrip = new THREE.Mesh(new THREE.BoxGeometry(W - 0.008, 0.054, 0.006), glossBlackMat);
    frontStrip.position.set(0, 0.034, D / 2 + 0.002);
    mc.add(frontStrip);

    // 매킨토시 시그니처 그린 일루미네이션 로고 플레이트
    const logoCvs = document.createElement('canvas');
    logoCvs.width = 256; logoCvs.height = 64;
    const lg = logoCvs.getContext('2d');
    lg.fillStyle = '#050806'; lg.fillRect(0, 0, 256, 64);
    lg.font = "600 21px -apple-system, 'Helvetica Neue', sans-serif";
    lg.letterSpacing = '2.5px';
    lg.fillStyle = '#22c55e';
    lg.shadowColor = '#22c55e'; lg.shadowBlur = 10;
    lg.textAlign = 'center'; lg.textBaseline = 'middle';
    lg.fillText('FCL.MND', 128, 34);
    const logoTex = new THREE.CanvasTexture(logoCvs);

    const logoPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.135, 0.032), new THREE.MeshBasicMaterial({ map: logoTex }));
    logoPlate.position.set(0, 0.036, D / 2 + 0.006);
    mc.add(logoPlate);

    // 전면 좌·우 입력 게인 컨트롤 노브 (알루미늄 + 블랙 캡) & 스피커 바인딩 포스트
    new Array(-0.155, 0.155).forEach(kx => {
      const gainKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.014, 0.022, 20), chromeMat);
      gainKnob.rotation.x = Math.PI / 2;
      gainKnob.position.set(kx, 0.035, D / 2 + 0.012);
      mc.add(gainKnob);
    });

    // 전면 하단 금도금/레드 스피커 출력 단자 & XLR/RCA 입력 단자 디테일
    new Array(-0.095, -0.075, 0.075, 0.095).forEach((bx, idx) => {
      const postMat = (idx % 2 === 0) ? new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 }) : mats.blk;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.016, 12), postMat);
      post.rotation.x = Math.PI / 2;
      post.position.set(bx, 0.034, D / 2 + 0.009);
      mc.add(post);
    });

    // 3) 후면부 대형 블랙 출력 트랜스포머 2기 & 전원 트랜스포머 1기
    const trafoSpecs = new Array(
      { x: -0.132, w: 0.125, h: 0.138, d: 0.135 },
      { x: 0.0,    w: 0.128, h: 0.142, d: 0.138 },
      { x: 0.132,  w: 0.125, h: 0.138, d: 0.135 }
    );
    trafoSpecs.forEach(tr => {
      const box = new THREE.Mesh(new THREE.BoxGeometry(tr.w, tr.h, tr.d), glossBlackMat);
      box.position.set(tr.x, 0.068 + tr.h / 2, -0.068);
      box.castShadow = true;
      mc.add(box);
    });

    // 4) 전면부 노출형 진공관 배열: 대형 KT88 출력관 4개 + 소형 12AX7/12AT7 초단관 7개
    const kt88X = new Array(-0.155, -0.055, 0.055, 0.155);
    kt88X.forEach(tx => {
      const baseRing = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.020, 0.016, 20), mats.blk);
      baseRing.position.set(tx, 0.076, 0.078);
      mc.add(baseRing);

      const tubeGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.018, 0.088, 20), glassTubeMat);
      tubeGlass.position.set(tx, 0.126, 0.078);
      mc.add(tubeGlass);

      const filament = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.052, 10), heaterGlowMat);
      filament.position.set(tx, 0.122, 0.078);
      mc.add(filament);
    });

    for (let s = 0; s < 7; s++) {
      const sx = -0.15 + s * 0.05;
      const smallTube = new THREE.Mesh(new THREE.CylinderGeometry(0.0085, 0.009, 0.046, 14), glassTubeMat);
      smallTube.position.set(sx, 0.091, 0.025);
      mc.add(smallTube);

      const smallGlow = new THREE.Mesh(new THREE.SphereGeometry(0.0035, 8, 8), heaterGlowMat);
      smallGlow.position.set(sx, 0.086, 0.025);
      mc.add(smallGlow);
    }

    // 진공관 히터에서 퍼지는 은은한 호박색 불빛
    const tubeLight = new THREE.PointLight(0xff8c3b, 0.65, 1.4, 1.8);
    tubeLight.position.set(0, 0.18, 0.08);
    mc.add(tubeLight);

    return mc;
  },

  // 실제 크기 비율(W: 0.44m x H: 0.14m x D: 0.36m) 빈티지 마란츠 2270 실버 리시버 (컨트롤 패널이 청중 쪽 +Z를 향함)
  createMarantzReceiver(mats) {
    const mz = new THREE.Group();
    const W = 0.44, H = 0.142, D = 0.36;

    const walnutCaseMat = new THREE.MeshStandardMaterial({ color: 0x5c3419, roughness: 0.38, metalness: 0.05 });
    const brushedSilverMat = new THREE.MeshStandardMaterial({ color: 0xe2e6ec, roughness: 0.22, metalness: 0.88 });

    // 1) 빈티지 월넛 우드 캐비닛 본체
    const woodCab = new THREE.Mesh(new THREE.BoxGeometry(W, H, D - 0.018), walnutCaseMat);
    woodCab.position.set(0, H / 2 + 0.008, -0.009);
    woodCab.castShadow = true; woodCab.receiveShadow = true;
    mz.add(woodCab);

    // 2) 마란츠 시그니처 샴페인 실버 아노다이징 전면 알루미늄 페이스플레이트 (청중 정면 +Z)
    const facePlate = new THREE.Mesh(new THREE.BoxGeometry(W + 0.006, H + 0.004, 0.016), brushedSilverMat);
    facePlate.position.set(0, H / 2 + 0.008, D / 2 - 0.008);
    facePlate.castShadow = true;
    mz.add(facePlate);

    const fZ = D / 2 + 0.001;

    // 3) 마란츠 특유의 시그니처 블루 튜닝 다이얼 & 신호 미터 창 캔버스
    const dialCvs = document.createElement('canvas');
    dialCvs.width = 512; dialCvs.height = 128;
    const dg = dialCvs.getContext('2d');
    dg.fillStyle = '#070b14'; dg.fillRect(0, 0, 512, 128);

    // 좌측 듀얼 튜닝/시그널 블루 미터
    dg.fillStyle = '#0ea5e9';
    dg.fillRect(24, 24, 52, 80);
    dg.fillRect(88, 24, 52, 80);

    // 우측 FM/AM 블루 주파수 눈금창
    const blueGrad = dg.createLinearGradient(160, 0, 488, 0);
    blueGrad.addColorStop(0, '#0284c7');
    blueGrad.addColorStop(0.5, '#38bdf8');
    blueGrad.addColorStop(1, '#0284c7');
    dg.fillStyle = blueGrad;
    dg.fillRect(160, 26, 326, 76);

    // 눈금 눈금선 및 붉은 스테레오 인디케이터 점
    dg.fillStyle = '#e0f2fe';
    for (let x = 175; x < 475; x += 14) {
      dg.fillRect(x, 46, 2, 26);
    }
    dg.fillStyle = '#ef4444';
    dg.beginPath(); dg.arc(465, 42, 6, 0, Math.PI * 2); dg.fill();

    const dialTex = new THREE.CanvasTexture(dialCvs);
    const dialWindow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.32, 0.046),
      new THREE.MeshBasicMaterial({ map: dialTex })
    );
    dialWindow.position.set(-0.038, H * 0.68 + 0.008, fZ + 0.001);
    mz.add(dialWindow);

    // 4) 우측 자이로 터치(Gyro-Touch) 수평 튜닝 휠
    const gyroWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.014, 24), brushedSilverMat);
    gyroWheel.position.set(0.165, H * 0.68 + 0.008, fZ - 0.002);
    mz.add(gyroWheel);

    // 5) 하단부 6개의 은색 알루미늄 로터리 컨트롤 노브 (셀렉터, 베이스, 미드, 트레블, 밸런스, 볼륨)
    const knobPositions = new Array(-0.175, -0.115, -0.055, 0.005, 0.065, 0.165);
    knobPositions.forEach((kx, idx) => {
      const kRadius = (idx === 0 || idx === 5) ? 0.015 : 0.012;
      const knob = new THREE.Mesh(new THREE.CylinderGeometry(kRadius, kRadius, 0.020, 20), brushedSilverMat);
      knob.rotation.x = Math.PI / 2;
      knob.position.set(kx, H * 0.25 + 0.008, fZ + 0.009);
      mz.add(knob);
    });

    // 6) 중앙 푸시 버튼 5개 & 좌·우 토글 스위치 디테일
    for (let b = 0; b < 5; b++) {
      const btn = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.008, 0.012), brushedSilverMat);
      btn.position.set(0.095 + b * 0.011, H * 0.25 + 0.008, fZ + 0.005);
      mz.add(btn);
    }

    const blueDialGlow = new THREE.PointLight(0x38bdf8, 0.45, 1.1, 1.8);
    blueDialGlow.position.set(0, 0.11, D / 2 + 0.08);
    mz.add(blueDialGlow);

    return mz;
  },
  createCable(pts, r, col) {
    const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p.at(0), p.at(1), p.at(2))));
    return new THREE.Mesh(new THREE.TubeGeometry(curve, 48, r, 8, false), new THREE.MeshStandardMaterial({ color: col, roughness: 0.45, metalness: 0.15 }));
  },

  buildAll(scene, mats) {
    // 좌·우 JBL 4344 및 OJAS 스피커 배치
    scene.add(this.createJBL4344(-2.65, 0.22, false, mats));
    scene.add(this.createJBL4344(2.65, -0.22, true, mats));
    scene.add(this.createOjasSpeakerSystem(-4.65, 0.34, mats));
    scene.add(this.createOjasSpeakerSystem(4.65, -0.34, mats));

    // 오른쪽 JBL(x = 2.65)과 오른쪽 OJAS(x = 4.65) 사이(x = 3.68, z = -1.42)에 저상 원목 앰프 랙 배치
    const rackGroup = new THREE.Group();
    const rackW = 1.04, rackH = 0.22, rackD = 0.44;

    const topBoard = new THREE.Mesh(new THREE.BoxGeometry(rackW, 0.036, rackD), mats.wal);
    topBoard.position.y = rackH - 0.018;
    topBoard.castShadow = true; topBoard.receiveShadow = true;
    rackGroup.add(topBoard);

    new Array(-0.44, 0.44).forEach(lx => {
      new Array(-0.15, 0.15).forEach(lz => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.045, rackH - 0.036, 0.045), mats.metal);
        leg.position.set(lx, (rackH - 0.036) / 2, lz);
        leg.castShadow = true;
        rackGroup.add(leg);
      });
    });

    // 왼쪽 슬롯: 빈티지 마란츠 2270 실버 리시버 (컨트롤 패널이 청중 정면을 향함)
    const marantz = this.createMarantzReceiver(mats);
    marantz.position.set(-0.25, rackH, 0.01);
    rackGroup.add(marantz);

    // 오른쪽 슬롯: 매킨토시 MC275 진공관 파워 앰프 (그린 로고와 노브, 진공관이 청중 정면을 향함)
    const mcintosh = this.createMcIntoshAmp(mats);
    mcintosh.position.set(0.25, rackH, 0.02);
    rackGroup.add(mcintosh);

    rackGroup.position.set(3.68, 0, -1.42);
    rackGroup.rotation.y = -0.26;
    scene.add(rackGroup);
    

    // 오디오 & 스피커 케이블 배선 (DJ 부스 -> 마란츠 리시버 -> 매킨토시 앰프 -> 좌/우 JBL & OJAS 스피커)
    const cables = new Array(
            // 1) DJ 부스 우측 아웃풋 -> 마란츠 리시버 입력단 스테레오 라인 케이블 (러그 위 구불구불한 자연 배선 & 바닥 꺼짐 방지)
      {
        pts: new Array(
          new Array(1.35, 0.36, -0.75),
          new Array(1.52, 0.08, -0.82),
          new Array(1.78, 0.038, -0.76),
          new Array(2.12, 0.038, -0.98),
          new Array(2.48, 0.038, -0.88),
          new Array(2.85, 0.038, -1.16),
          new Array(3.18, 0.038, -1.36),
          new Array(3.34, 0.09, -1.45),
          new Array(3.40, 0.28, -1.48)
        ),
        col: 0x16171c,
        r: 0.007
      },
      {
        pts: new Array(
          new Array(1.38, 0.36, -0.72),
          new Array(1.56, 0.08, -0.78),
          new Array(1.84, 0.038, -0.71),
          new Array(2.18, 0.038, -0.93),
          new Array(2.54, 0.038, -0.83),
          new Array(2.90, 0.038, -1.12),
          new Array(3.22, 0.038, -1.32),
          new Array(3.37, 0.09, -1.42),
          new Array(3.43, 0.28, -1.45)
        ),
        col: 0xb91c1c,
        r: 0.007
      },

      // 2) 마란츠 리시버 프리 아웃 -> 매킨토시 MC275 입력단 RCA 인터커넥트 케이블 (2가닥)
      { pts: new Array(new Array(3.46, 0.28, -1.52), new Array(3.68, 0.235, -1.62), new Array(3.88, 0.26, -1.54)), col: 0xd97706, r: 0.0055 },
      { pts: new Array(new Array(3.49, 0.28, -1.49), new Array(3.70, 0.235, -1.59), new Array(3.91, 0.26, -1.51)), col: 0x1f2937, r: 0.0055 },

      // 3) 매킨토시 파워 앰프 출력단 -> 오른쪽 JBL 4344 스피커 케이블 (러그 위 자연 굴곡 & 스탠드 다리 회피)
      {
        pts: new Array(
          new Array(3.86, 0.25, -1.32),
          new Array(3.72, 0.08, -1.34),
          new Array(3.48, 0.038, -1.32),
          new Array(3.22, 0.038, -1.54),
          new Array(2.94, 0.038, -1.46),
          new Array(2.74, 0.038, -1.66),
          new Array(2.68, 0.10, -1.72),
          new Array(2.68, 0.34, -1.74)
        ),
        col: 0x991b1b,
        r: 0.0085
      },
      {
        pts: new Array(
          new Array(3.89, 0.25, -1.30),
          new Array(3.75, 0.08, -1.31),
          new Array(3.51, 0.038, -1.29),
          new Array(3.25, 0.038, -1.50),
          new Array(2.97, 0.038, -1.42),
          new Array(2.77, 0.038, -1.63),
          new Array(2.71, 0.10, -1.69),
          new Array(2.71, 0.34, -1.71)
        ),
        col: 0x111216,
        r: 0.0085
      },

      // 4) 매킨토시 파워 앰프 출력단 -> 오른쪽 OJAS 스피커 후면 단자 연결 케이블
      {
        pts: new Array(
          new Array(3.98, 0.25, -1.35),
          new Array(4.10, 0.08, -1.36),
          new Array(4.28, 0.038, -1.32),
          new Array(4.52, 0.038, -1.52),
          new Array(4.74, 0.08, -1.64),
          new Array(4.74, 0.28, -1.62)
        ),
        col: 0x991b1b,
        r: 0.0085
      },
      {
        pts: new Array(
          new Array(4.01, 0.25, -1.33),
          new Array(4.13, 0.08, -1.33),
          new Array(4.31, 0.038, -1.29),
          new Array(4.55, 0.038, -1.49),
          new Array(4.76, 0.08, -1.61),
          new Array(4.76, 0.28, -1.59)
        ),
        col: 0x111216,
        r: 0.0085
      },
      // 5) DJ 부스 좌측 -> 왼쪽 JBL 4344 & 왼쪽 OJAS 스피커 연결 케이블
      {
        pts: new Array(
          new Array(-1.36, 0.36, -0.75),
          new Array(-1.52, 0.08, -0.82),
          new Array(-1.74, 0.038, -0.76),
          new Array(-1.98, 0.038, -0.98),
          new Array(-2.18, 0.038, -1.32),
          new Array(-2.45, 0.038, -1.56),
          new Array(-2.68, 0.09, -1.72),
          new Array(-2.70, 0.34, -1.76)
        ),
        col: 0x141519,
        r: 0.009
      },
      {
        pts: new Array(
          new Array(-1.42, 0.36, -0.78),
          new Array(-1.62, 0.08, -0.94),
          new Array(-1.92, 0.038, -1.16),
          new Array(-2.35, 0.038, -1.04),
          new Array(-2.88, 0.038, -1.28),
          new Array(-3.45, 0.038, -1.18),
          new Array(-4.05, 0.038, -1.48),
          new Array(-4.52, 0.038, -1.64),
          new Array(-4.74, 0.08, -1.64),
          new Array(-4.74, 0.28, -1.62)
        ),
        col: 0x141519,
        r: 0.009
      }




    );

    cables.forEach(item => {
      scene.add(this.createCable(item.pts, item.r, item.col));
    });
  }
};
