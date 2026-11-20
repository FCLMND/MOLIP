window.DJBooth = {
  createCinderBlock(blockMat, darkHoleMat) {
    const blk = new THREE.Group();
    const W = 0.39, H = 0.19, D = 0.19;

    const topWall = new THREE.Mesh(new THREE.BoxGeometry(W, 0.028, D), blockMat);
    topWall.position.y = H / 2 - 0.014; topWall.castShadow = true; topWall.receiveShadow = true; blk.add(topWall);

    const botWall = new THREE.Mesh(new THREE.BoxGeometry(W, 0.028, D), blockMat);
    botWall.position.y = -H / 2 + 0.014; botWall.castShadow = true; botWall.receiveShadow = true; blk.add(botWall);

    new Array(-0.155, -0.052, 0.052, 0.155).forEach(wx => {
      const web = new THREE.Mesh(new THREE.BoxGeometry(0.026, H - 0.052, D), blockMat);
      web.position.x = wx; web.castShadow = true; web.receiveShadow = true; blk.add(web);
    });

    new Array(-0.103, 0, 0.103).forEach(hx => {
      const holeShadow = new THREE.Mesh(new THREE.BoxGeometry(0.072, H - 0.06, D - 0.01), darkHoleMat);
      holeShadow.position.x = hx; blk.add(holeShadow);
    });

    return blk;
  },
  build(scene, mats) {
    const tbl = new THREE.Group();
    const tex = window.RoomTextures;

    const richWoodTex = tex.mkRichWalnutWood();
    const richWoodMat = new THREE.MeshStandardMaterial({
      map: richWoodTex,
      bumpMap: richWoodTex,
      bumpScale: 0.004,
      roughness: 0.36,
      metalness: 0.06
    });

    const boardY = 0.38;
    const tTop = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.065, 0.88), richWoodMat);
    tTop.position.set(0, boardY, 0);
    tTop.castShadow = true; tTop.receiveShadow = true;
    tbl.add(tTop);

    const cinderTex = tex.mkCinderBlockTex();
    const cinderMat = new THREE.MeshStandardMaterial({
      map: cinderTex,
      bumpMap: cinderTex,
      bumpScale: 0.008,
      roughness: 0.92,
      metalness: 0.02
    });
    const darkHoleMat = new THREE.MeshBasicMaterial({ color: 0x090a0c });

    new Array(-1.12, 0, 1.12).forEach((bx, idx) => {
      for (let tier = 0; tier < 2; tier++) {
        const yPos = 0.095 + tier * 0.185;
        const frontBlk = this.createCinderBlock(cinderMat, darkHoleMat);
        frontBlk.position.set(bx, yPos, 0.18);
        frontBlk.rotation.y = (tier === 1 && idx === 1) ? 0.03 : 0;
        tbl.add(frontBlk);

        const backBlk = this.createCinderBlock(cinderMat, darkHoleMat);
        backBlk.position.set(bx, yPos, -0.18);
        tbl.add(backBlk);
      }
    });

    const surfaceY = boardY + 0.033;
       // 3. TORSO S-4
    const s4 = new THREE.Group();
    const s4Body = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.042, 0.22), mats.blk);
    s4Body.castShadow = true; s4.add(s4Body);
    const s4Scr = new THREE.Mesh(new THREE.CircleGeometry(0.028, 24), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    s4Scr.rotation.x = -Math.PI / 2; s4Scr.position.set(-0.08, 0.022, -0.04); s4.add(s4Scr);
    for (let k = 0; k < 4; k++) {
      const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.016, 16), mats.alum);
      knob.position.set(-0.01 + k * 0.042, 0.028, -0.04); s4.add(knob);
    }
    for (let p = 0; p < 8; p++) {
      const btn = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.008, 0.018), new THREE.MeshBasicMaterial({ color: p % 2 === 0 ? 0xfbbf24 : 0xf87171 }));
      btn.position.set(-0.11 + p * 0.031, 0.024, 0.055); s4.add(btn);
    }
    s4.position.set(-1.02, surfaceY + 0.021, 0.08);
    s4.rotation.y = 0.14;
    tbl.add(s4);

    // 4. ELEKTRON DIGITAKT MK2
    const dt2 = new THREE.Group();
    const dtBody = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.046, 0.23), mats.metal);
    dtBody.castShadow = true; dt2.add(dtBody);
    const dtScr = new THREE.Mesh(new THREE.PlaneGeometry(0.095, 0.048), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    dtScr.rotation.x = -Math.PI / 2; dtScr.position.set(-0.08, 0.024, -0.045); dt2.add(dtScr);
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        const enc = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.016, 14), mats.blk);
        enc.position.set(0.01 + c * 0.038, 0.029, -0.065 + r * 0.042); dt2.add(enc);
      }
    }
    const trigCols = new Array(0xef4444, 0xf97316, 0xeab308, 0xfef08a);
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 8; col++) {
        const trig = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.009, 0.022), new THREE.MeshBasicMaterial({ color: trigCols.at((col + row) % 4) }));
        trig.position.set(-0.125 + col * 0.036, 0.026, 0.045 + row * 0.034); dt2.add(trig);
      }
    }
    dt2.position.set(-0.56, surfaceY + 0.023, 0.12);
    dt2.rotation.y = 0.06;
    tbl.add(dt2);

    // 5. ALLEN & HEATH XONE:96 (SILVER)
    const xone = new THREE.Group();
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xd8dce3, roughness: 0.24, metalness: 0.85 });
    const xoneChassis = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.065, 0.44), mats.blk);
    xoneChassis.castShadow = true; xone.add(xoneChassis);
    const silverFace = new THREE.Mesh(new THREE.BoxGeometry(0.41, 0.008, 0.43), silverMat);
    silverFace.position.y = 0.034; xone.add(silverFace);

    for (let ch = 0; ch < 6; ch++) {
      for (let k = 0; k < 4; k++) {
        const kMat = (k === 0) ? mats.alum : mats.blk;
        const eqKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.010, 0.015, 12), kMat);
        eqKnob.position.set(-0.13 + ch * 0.044, 0.043, -0.14 + k * 0.042); xone.add(eqKnob);
      }
      const fader = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.012, 0.024), mats.blk);
      fader.position.set(-0.13 + ch * 0.044, 0.042, 0.09 + ((ch % 2) * 0.03)); xone.add(fader);
    }
    const vuMeter = new THREE.Mesh(new THREE.PlaneGeometry(0.065, 0.11), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
    vuMeter.rotation.x = -Math.PI / 2; vuMeter.position.set(0.145, 0.039, -0.06); xone.add(vuMeter);
    xone.position.set(0.04, surfaceY + 0.032, 0.06);
    tbl.add(xone);

       // 6. 장비 간 오디오/MIDI 케이블 연결 (청취자 쪽 앞면 +Z 방향으로 자연스럽게 흐르는 배선)
    const interCables = new Array(
      // Torso S-4 앞쪽 -> Digitakt MK2 앞쪽 MIDI/Sync 연결
      { pts: new Array(new Array(-0.94, surfaceY + 0.025, 0.19), new Array(-0.80, surfaceY + 0.008, 0.31), new Array(-0.64, surfaceY + 0.025, 0.23)), col: 0x18191e },
      // Torso S-4 앞쪽 -> Xone:96 앞쪽 스테레오 오디오 라인 (좌/우 2가닥)
      { pts: new Array(new Array(-0.98, surfaceY + 0.025, 0.20), new Array(-0.72, surfaceY + 0.007, 0.37), new Array(-0.34, surfaceY + 0.007, 0.39), new Array(-0.10, surfaceY + 0.042, 0.27)), col: 0x23252c },
      { pts: new Array(new Array(-0.95, surfaceY + 0.025, 0.20), new Array(-0.69, surfaceY + 0.007, 0.40), new Array(-0.31, surfaceY + 0.007, 0.41), new Array(-0.06, surfaceY + 0.042, 0.27)), col: 0x23252c },
      // Digitakt MK2 앞쪽 -> Xone:96 앞쪽 스테레오 오디오 라인 (2가닥)
      { pts: new Array(new Array(-0.52, surfaceY + 0.028, 0.23), new Array(-0.35, surfaceY + 0.007, 0.33), new Array(-0.15, surfaceY + 0.007, 0.35), new Array(0.01, surfaceY + 0.042, 0.27)), col: 0xd97706 },
      { pts: new Array(new Array(-0.49, surfaceY + 0.028, 0.23), new Array(-0.32, surfaceY + 0.007, 0.36), new Array(-0.12, surfaceY + 0.007, 0.37), new Array(0.05, surfaceY + 0.042, 0.27)), col: 0x23252c },
      // 3단 유로랙 앞쪽 하단 -> Xone:96 앞쪽 메인 스테레오 아웃풋 연결 (2가닥)
      { pts: new Array(new Array(0.64, surfaceY + 0.05, 0.08), new Array(0.46, surfaceY + 0.008, 0.33), new Array(0.26, surfaceY + 0.008, 0.35), new Array(0.11, surfaceY + 0.042, 0.27)), col: 0xdc2626 },
      { pts: new Array(new Array(0.67, surfaceY + 0.05, 0.09), new Array(0.49, surfaceY + 0.008, 0.36), new Array(0.28, surfaceY + 0.008, 0.38), new Array(0.15, surfaceY + 0.042, 0.27)), col: 0x23252c }
    );
    interCables.forEach(item => {
      tbl.add(window.SpeakerSystem.createCable(item.pts, 0.0042, item.col));
    });
        // 7. 3단 64HP 유로랙 (오른쪽 1/3 구역에만 컬러 패치 케이블이 어지럽게 엉켜 있는 형태)
    const rack = new THREE.Group();
    const rackW = 0.42, rackH = 0.41, rackD = 0.22;
    const rLeft = new THREE.Mesh(new THREE.BoxGeometry(0.022, rackH, rackD), richWoodMat);
    rLeft.position.set(-rackW / 2, rackH / 2, 0); rLeft.castShadow = true; rack.add(rLeft);
    const rRight = new THREE.Mesh(new THREE.BoxGeometry(0.022, rackH, rackD), richWoodMat);
    rRight.position.set(rackW / 2, rackH / 2, 0); rRight.castShadow = true; rack.add(rRight);
    const rBack = new THREE.Mesh(new THREE.BoxGeometry(rackW, rackH, 0.06), mats.metal);
    rBack.position.set(0, rackH / 2, -rackD / 2 + 0.03); rack.add(rBack);

    const tiersGroup = new THREE.Group();
    tiersGroup.position.set(0, rackH / 2, 0.02);
    tiersGroup.rotation.x = -0.18;

    const rightSideJacks = new Array();
    for (let t = 0; t < 3; t++) {
      const ty = (1 - t) * 0.132;
      const tierPanel = new THREE.Mesh(new THREE.BoxGeometry(rackW - 0.024, 0.126, 0.012), t === 1 ? silverMat : mats.metal);
      tierPanel.position.set(0, ty, 0); tiersGroup.add(tierPanel);

      for (let m = 0; m < 8; m++) {
        const mx = -0.16 + m * 0.045;
        const mKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.009, 0.014, 12), m % 2 === 0 ? mats.alum : mats.blk);
        mKnob.rotation.x = Math.PI / 2; mKnob.position.set(mx, ty + 0.028, 0.012); tiersGroup.add(mKnob);

        const jack = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.008, 10), mats.alum);
        jack.rotation.x = Math.PI / 2; jack.position.set(mx, ty - 0.026, 0.009); tiersGroup.add(jack);

        if (m >= 5) {
          rightSideJacks.push(new THREE.Vector3(mx, ty - 0.026, 0.014));
          rightSideJacks.push(new THREE.Vector3(mx + 0.012, ty + 0.004, 0.014));
        }
      }
    }

    const patchColors = new Array(0xef4444, 0xfacc15, 0x3b82f6, 0x22c55e, 0xf97316, 0xe879f9, 0x38bdf8, 0xf43f5e);
    const rightPairs = new Array(
      new Array(0, 13), new Array(1, 16), new Array(2, 11), new Array(3, 14),
      new Array(4, 17), new Array(5, 12), new Array(6, 15), new Array(7, 10),
      new Array(8, 1), new Array(9, 4), new Array(11, 17), new Array(13, 2),
      new Array(15, 0), new Array(16, 5)
    );

    rightPairs.forEach((pr, idx) => {
      const p1 = rightSideJacks.at(pr.at(0));
      const p2 = rightSideJacks.at(pr.at(1));
      const sag = 0.055 + (idx % 5) * 0.024;
      const outZ = 0.048 + (idx % 6) * 0.019;
      const swirlX = ((idx % 2 === 0) ? 0.022 : -0.018);

      const mid1 = new THREE.Vector3(p1.x + swirlX, Math.min(p1.y, p2.y) - sag, outZ);
      const mid2 = new THREE.Vector3(p2.x - swirlX * 0.8, Math.min(p1.y, p2.y) - sag * 1.18, outZ + 0.016);

      const curve = new THREE.CatmullRomCurve3(new Array(p1, mid1, mid2, p2));
      const cableMat = new THREE.MeshStandardMaterial({ color: patchColors.at(idx % patchColors.length), roughness: 0.35, metalness: 0.1 });
      tiersGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.0035, 7, false), cableMat));
    });

    rack.add(tiersGroup);
    rack.position.set(0.76, surfaceY, -0.02);
    rack.rotation.y = -0.22;
    tbl.add(rack);

          // 8. 좌식 테이블 좌측 클래식 브라스 뱅커스 램프 (Banker's Lamp)
    const bankerLamp = new THREE.Group();

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xb88b4a,
      roughness: 0.28,
      metalness: 0.86
    });
    const darkWalnutBaseMat = new THREE.MeshStandardMaterial({
      color: 0x3a1c10,
      roughness: 0.34,
      metalness: 0.08
    });
    const emeraldGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x65c938,
      emissive: 0x3f9c1e,
      emissiveIntensity: 0.85,
      roughness: 0.12,
      metalness: 0.04,
      clearcoat: 0.96,
      clearcoatRoughness: 0.08,
      side: THREE.FrontSide
    });
    const innerWhiteShadeMat = new THREE.MeshBasicMaterial({
      color: 0xfffbeb,
      side: THREE.BackSide
    });

    // 1) 원형 짙은 월넛 우드 받침대 & 상단 황동 단차
    const woodBase = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.095, 0.028, 32), darkWalnutBaseMat);
    woodBase.position.y = 0.014;
    woodBase.castShadow = true;
    bankerLamp.add(woodBase);

    const brassCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.078, 0.008, 32), brassMat);
    brassCollar.position.y = 0.030;
    bankerLamp.add(brassCollar);

    // 2) 받침대 위 장식용 반원형 황동 가이드 레일 & 피니얼 꼭지
    const baseRailCurve = new THREE.CatmullRomCurve3(new Array(
      new THREE.Vector3(-0.048, 0.048, -0.01),
      new THREE.Vector3(-0.035, 0.048, 0.042),
      new THREE.Vector3(0.035, 0.048, 0.042),
      new THREE.Vector3(0.048, 0.048, -0.01)
    ));
    bankerLamp.add(new THREE.Mesh(new THREE.TubeGeometry(baseRailCurve, 20, 0.0045, 8, false), brassMat));

    new Array(-0.048, 0.048).forEach(px => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.010, 0.032, 14), brassMat);
      post.position.set(px, 0.046, -0.01);
      bankerLamp.add(post);
      const finial = new THREE.Mesh(new THREE.ConeGeometry(0.007, 0.018, 12), brassMat);
      finial.position.set(px, 0.070, -0.01);
      bankerLamp.add(finial);
    });

    // 3) 곡선형 황동 메인 지지대 (Stem)
    const stemCurve = new THREE.CatmullRomCurve3(new Array(
      new THREE.Vector3(0.032, 0.032, -0.025),
      new THREE.Vector3(0.032, 0.145, -0.025),
      new THREE.Vector3(0.028, 0.215, -0.015),
      new THREE.Vector3(0.004, 0.258, 0.012)
    ));
    const mainStem = new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 24, 0.0065, 10, false), brassMat);
    mainStem.castShadow = true;
    bankerLamp.add(mainStem);

    const jointHub = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.026, 16), brassMat);
    jointHub.rotation.z = Math.PI / 2;
    jointHub.position.set(0.032, 0.075, -0.025);
    bankerLamp.add(jointHub);

    // 4) 상단 U자형 황동 갓 지지 프레임 (Shade Yoke)
    const yokeCurve = new THREE.CatmullRomCurve3(new Array(
      new THREE.Vector3(-0.118, 0.285, 0.025),
      new THREE.Vector3(-0.112, 0.255, 0.068),
      new THREE.Vector3(0.112, 0.255, 0.068),
      new THREE.Vector3(0.118, 0.285, 0.025)
    ));
    bankerLamp.add(new THREE.Mesh(new THREE.TubeGeometry(yokeCurve, 24, 0.0048, 8, false), brassMat));

    // 5) 에메랄드 그린 유광 반원통형 갓 (열린 바닥면이 정확히 아래쪽 -Y를 향하고, 초록색 등갓이 청중 쪽을 향해 기울어짐)
    const shadeGroup = new THREE.Group();
    shadeGroup.position.set(0, 0.285, 0.025);
    shadeGroup.rotation.x = 0.36;

    const shadeR = 0.068, shadeW = 0.225;
    // 반원 아치가 위쪽(+Y)으로 솟고 열린 바닥이 아래쪽(-Y)을 향하도록 회전 정렬
    const outerShadeGeo = new THREE.CylinderGeometry(shadeR, shadeR, shadeW, 32, 1, true, 0, Math.PI);
    outerShadeGeo.rotateZ(Math.PI / 2);
    outerShadeGeo.rotateX(Math.PI / 2);

    const outerShade = new THREE.Mesh(outerShadeGeo, emeraldGlassMat);
    outerShade.castShadow = true;
    shadeGroup.add(outerShade);

    const innerShade = new THREE.Mesh(outerShadeGeo, innerWhiteShadeMat);
    innerShade.scale.set(0.985, 0.985, 0.985);
    shadeGroup.add(innerShade);

    // 갓 양쪽 끝 반원 마감판 (위쪽 반원이 갓 아치와 정확히 일치)
    const endCapGeo = new THREE.CircleGeometry(shadeR, 24, 0, Math.PI);
    const leftCap = new THREE.Mesh(endCapGeo, emeraldGlassMat);
    leftCap.rotation.y = -Math.PI / 2;
    leftCap.position.x = -shadeW / 2;
    shadeGroup.add(leftCap);

    const rightCap = new THREE.Mesh(endCapGeo, emeraldGlassMat);
    rightCap.rotation.y = Math.PI / 2;
    rightCap.position.x = shadeW / 2;
    shadeGroup.add(rightCap);

    new Array(-shadeW / 2 - 0.006, shadeW / 2 + 0.006).forEach(nx => {
      const capNut = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.014, 16), brassMat);
      capNut.rotation.z = Math.PI / 2;
      capNut.position.x = nx;
      shadeGroup.add(capNut);
    });

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xfff8dc })
    );
    bulb.position.set(0, 0.018, 0.005);
    shadeGroup.add(bulb);

    const pullChain = new THREE.Mesh(new THREE.CylinderGeometry(0.0014, 0.0014, 0.165, 8), brassMat);
    pullChain.position.set(0.018, -0.075, 0.012);
    shadeGroup.add(pullChain);

    const chainKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0025, 0.012, 10), brassMat);
    chainKnob.position.set(0.018, -0.158, 0.012);
    shadeGroup.add(chainKnob);

    bankerLamp.add(shadeGroup);

    const deskBulbLight = new THREE.PointLight(0xffe4b5, 0.95, 2.4, 1.8);
    deskBulbLight.position.set(0, 0.24, 0.06);
    bankerLamp.add(deskBulbLight);

    bankerLamp.position.set(-1.24, surfaceY, -0.20);
    bankerLamp.rotation.y = 0.28;
    tbl.add(bankerLamp);

    tbl.position.set(0, 0, -0.65);
    scene.add(tbl);
    return tbl;
  }
};
