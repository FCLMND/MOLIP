window.RoomBuilder = {
  build(scene, mats, tex) {
    function createHerringboneCanvas(isBump) {
      const tileSize = 256;
      const canvas = document.createElement('canvas');
      canvas.width = tileSize;
      canvas.height = tileSize;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = isBump ? '#303030' : '#2e1708';
      ctx.fillRect(0, 0, tileSize, tileSize);

      const plankWidth = 24;
      const plankLength = plankWidth * 4.2;
      const plankColors = ['#2b180c', '#25140a', '#201108', '#311c0e'];
      const offsets = [-tileSize, 0, tileSize];
      for (let row = 0; row < 4; row++) {
        for (let column = 0; column < 4; column++) {
          const boardSeed = ((row + 1) * 73856093 ^ (column + 1) * 19349663) >>> 0;
          for (const offsetX of offsets) {
            for (const offsetY of offsets) {
              let seed = boardSeed;
              const random = () => {
                seed = (seed * 1664525 + 1013904223) >>> 0;
                return seed / 4294967296;
              };
              const baseColor = plankColors[Math.floor(random() * plankColors.length)];
              ctx.save();
              ctx.translate(32 + column * 64 + (row % 2) * 32 + offsetX, 32 + row * 64 + offsetY);
              ctx.rotate((row + column) % 2 === 0 ? Math.PI / 4 : -Math.PI / 4);

              const plankGradient = ctx.createLinearGradient(0, -plankWidth / 2, 0, plankWidth / 2);
              if (isBump) {
                const height = 112 + Math.floor(random() * 25);
                plankGradient.addColorStop(0, `rgb(${height - 24},${height - 24},${height - 24})`);
                plankGradient.addColorStop(0.18, `rgb(${height + 12},${height + 12},${height + 12})`);
                plankGradient.addColorStop(0.82, `rgb(${height + 4},${height + 4},${height + 4})`);
                plankGradient.addColorStop(1, `rgb(${height - 18},${height - 18},${height - 18})`);
              } else {
                plankGradient.addColorStop(0, baseColor);
                plankGradient.addColorStop(0.18, baseColor);
                plankGradient.addColorStop(0.82, baseColor);
                plankGradient.addColorStop(1, baseColor);
              }
              ctx.fillStyle = plankGradient;
              ctx.fillRect(-plankLength / 2, -plankWidth / 2, plankLength, plankWidth);

              const grainCount = 5 + Math.floor(random() * 4);
              for (let grain = 0; grain < grainCount; grain++) {
                const y = -plankWidth / 2 + 3 + random() * (plankWidth - 6);
                ctx.beginPath();
                ctx.moveTo(-plankLength / 2 + 3, y);
                ctx.bezierCurveTo(
                  -plankLength / 4, y + (random() - 0.5) * 2,
                  plankLength / 4, y + (random() - 0.5) * 2,
                  plankLength / 2 - 3, y + (random() - 0.5) * 2
                );
                const grainShade = random() < 0.5 ? 82 : 166;
                ctx.strokeStyle = isBump
                  ? `rgba(${grainShade},${grainShade},${grainShade},0.55)`
                  : random() < 0.5 ? 'rgba(24,12,5,0.22)' : 'rgba(105,84,66,0.12)';
                ctx.lineWidth = 0.45 + random() * 0.75;
                ctx.stroke();
              }

              ctx.strokeStyle = isBump ? '#202020' : '#120904';
              ctx.lineWidth = 1.5;
              ctx.strokeRect(-plankLength / 2, -plankWidth / 2, plankLength, plankWidth);
              ctx.restore();
            }
          }
        }
      }

      const seamlessCanvas = document.createElement('canvas');
      seamlessCanvas.width = 1024;
      seamlessCanvas.height = 1024;
      const seamlessCtx = seamlessCanvas.getContext('2d');
      for (let y = 0; y < 1024; y += tileSize) {
        for (let x = 0; x < 1024; x += tileSize) {
          seamlessCtx.drawImage(canvas, x, y);
        }
      }
      return seamlessCanvas;
    }

    const colorMap = new THREE.CanvasTexture(createHerringboneCanvas(false));
    const bumpMap = new THREE.CanvasTexture(createHerringboneCanvas(true));
    [colorMap, bumpMap].forEach(map => {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(7, 7);
      map.anisotropy = 8;
      map.needsUpdate = true;
    });
    const mainFloorMaterial = new THREE.MeshStandardMaterial({
      map: colorMap,
      bumpMap,
      bumpScale: 0.008,
      roughness: 0.78,
      metalness: 0.01,
      envMapIntensity: 0.35
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(56, 56), mainFloorMaterial);
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

    const rugGroup = new THREE.Group();
    const rugW = 6.4, rugD = 3.8, rugGeo = new THREE.PlaneGeometry(rugW, rugD, 110, 70);
    rugGeo.rotateX(-Math.PI / 2);
    const pos = rugGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i), vz = pos.getZ(i);
      const wave = Math.sin(vx * 1.8 + vz * 2.1) * 0.0085 + Math.cos(vx * 3.4 - vz * 2.6) * 0.004;
      const curl = Math.pow((Math.abs(vx) / (rugW / 2)) * (Math.abs(vz) / (rugD / 2)), 3) * 0.020;
      const flat = (Math.abs(vx) < 1.65 && vz < 0.25 && vz > -0.95) ? 0.22 : 1.0;
      pos.setY(i, Math.max(0.003, 0.008 + wave * flat + curl));
    }
    rugGeo.computeVertexNormals();
    const rugMesh = new THREE.Mesh(rugGeo, new THREE.MeshStandardMaterial({ map: tex.mkPersianRug(), bumpMap: tex.mkRugBump(), bumpScale: 0.009, roughness: 0.92 }));
    rugMesh.castShadow = true; rugMesh.receiveShadow = true; rugGroup.add(rugMesh);
    rugGroup.position.set(0, 0, -0.35); scene.add(rugGroup);

    const hanjiTex = tex.mkHanjiPaper(), hanjiGlowTex = tex.mkHanjiGlowGrad();
    const hanjiShadeMat = new THREE.MeshStandardMaterial({
      map: hanjiTex, bumpMap: hanjiTex, bumpScale: 0.003,
      emissive: 0xffa84c, emissiveMap: hanjiGlowTex, emissiveIntensity: 1.35,
      roughness: 0.85, metalness: 0.0, side: THREE.DoubleSide
    });
    const ribWoodMat = new THREE.MeshStandardMaterial({ color: 0x2b190e, roughness: 0.55 });

    const topR = 0.17, botR = 0.24, shadeH = 0.34, shadeY = 1.48;
    const pleatedShadeGeo = new THREE.CylinderGeometry(topR, botR, shadeH, 144, 8, true);
    const sPos = pleatedShadeGeo.attributes.position;
    for (let i = 0; i < sPos.count; i++) {
      const vx = sPos.getX(i), vz = sPos.getZ(i), curR = Math.hypot(vx, vz);
      if (curR > 0.001) {
        const angle = Math.atan2(vz, vx);
        const wave = Math.abs(((angle * 36 / (Math.PI * 2)) % 1 + 1) % 1 - 0.5) * 2 - 0.5;
        const newR = curR + wave * 0.0085;
        sPos.setX(i, (vx / curR) * newR); sPos.setZ(i, (vz / curR) * newR);
      }
    }
    pleatedShadeGeo.computeVertexNormals();

    function createFloorStand(fx, fz, idx) {
      const st = new THREE.Group();
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 0.025, 28), mats.metal); base.position.y = 0.0125; st.add(base);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.015, 1.56, 16), ribWoodMat); pole.position.y = 0.78; st.add(pole);
      const shade = new THREE.Mesh(pleatedShadeGeo, hanjiShadeMat); shade.position.y = shadeY; st.add(shade);
      const topRing = new THREE.Mesh(new THREE.TorusGeometry(topR, 0.0055, 10, 48), ribWoodMat); topRing.rotation.x = Math.PI / 2; topRing.position.y = shadeY + shadeH / 2; st.add(topRing);
      const botRing = new THREE.Mesh(new THREE.TorusGeometry(botR, 0.0065, 10, 48), ribWoodMat); botRing.rotation.x = Math.PI / 2; botRing.position.y = shadeY - shadeH / 2; st.add(botRing);

      const upperBulbLight = new THREE.PointLight(0xffb866, 2.3, 7.2, 1.6); upperBulbLight.position.set(0, shadeY + 0.09, 0); st.add(upperBulbLight);
      const lowerGlowLight = new THREE.PointLight(0xd97724, 0.7, 4.5, 2.0); lowerGlowLight.position.set(0, shadeY - 0.14, 0); st.add(lowerGlowLight);

      const wallX = fx < 0 ? -9.55 : 9.55, dx = wallX - fx, dir = idx % 2 === 0 ? 1 : -1, amp = 0.28 + (idx % 3) * 0.14;
      const cordPts = new Array(
        new Array(0, 0.05, 0), new Array(dx * 0.12, 0.008, 0.18 * dir),
        new Array(dx * 0.34, 0.008, -amp * dir), new Array(dx * 0.58, 0.008, (amp * 0.85) * dir),
        new Array(dx * 0.82, 0.008, (-amp * 0.55) * dir), new Array(dx, 0.008, 0.12 * dir)
      );
      st.add(window.SpeakerSystem.createCable(cordPts, 0.0075, 0x16171b));
      st.position.set(fx, 0, fz); return st;
    }

    const standSpots = new Array(new Array(-4.2, 3.6), new Array(4.2, 4.0), new Array(-2.6, 7.4), new Array(2.8, 7.8));
    standSpots.forEach((pt, idx) => scene.add(createFloorStand(pt.at(0), pt.at(1), idx)));

    function createSoftCushionGeo(w, h, d, radius) {
      const shape = new THREE.Shape(), hw = w / 2 - radius, hd = d / 2 - radius;
      shape.moveTo(-hw, -d / 2); shape.lineTo(hw, -d / 2);
      shape.quadraticCurveTo(w / 2, -d / 2, w / 2, -hd); shape.lineTo(w / 2, hd);
      shape.quadraticCurveTo(w / 2, d / 2, hw, d / 2); shape.lineTo(-hw, d / 2);
      shape.quadraticCurveTo(-w / 2, d / 2, -w / 2, hd); shape.lineTo(-w / 2, -hd);
      shape.quadraticCurveTo(-w / 2, -d / 2, -hw, -d / 2);
      const geo = new THREE.ExtrudeGeometry(shape, { steps: 1, depth: Math.max(0.01, h - radius * 1.4), bevelEnabled: true, bevelSegments: 4, bevelSize: radius * 0.85, bevelThickness: radius * 0.7 });
      geo.rotateX(Math.PI / 2); geo.center(); return geo;
    }

    function createPlumpPillowGeo(w, h, d) {
      const geo = new THREE.BoxGeometry(w, h, d, 16, 8, 12), p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const vx = p.getX(i), vy = p.getY(i), vz = p.getZ(i), nx = vx / (w / 2), nz = vz / (d / 2);
        const puff = Math.max(0, 1 - (nx * nx * 0.75 + nz * nz * 0.75));
        p.setY(i, vy * (0.35 + puff * 0.95));
      }
      geo.computeVertexNormals(); return geo;
    }

    const softBaseGeo = createSoftCushionGeo(0.90, 0.07, 1.72, 0.025);
    const softMattressGeo = createSoftCushionGeo(0.86, 0.16, 1.66, 0.055);
    const softBackGeo = createSoftCushionGeo(0.84, 0.25, 0.22, 0.055);
    const plumpPillowGeo = createPlumpPillowGeo(0.60, 0.13, 0.34);

    function createDrapedBlanketGeo(w, d) {
      const geo = new THREE.BoxGeometry(w, 0.024, d, 52, 2, 40);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        const vz = pos.getZ(i);

        const nx = vx / (w / 2);
        const nz = vz / (d / 2);

        const wrinkleA = Math.sin(vx * 11.5 + vz * 6.2) * 0.0045;
        const wrinkleB = Math.cos(vx * 18.0 - vz * 14.0) * 0.0028;
        const crossFold = Math.sin(vz * 9.5 + Math.sin(vx * 4.0)) * 0.004;

        const bodyArchX = Math.max(0, 1 - Math.pow(nx / 0.72, 2));
        const bodyArchZ = Math.max(0, 1 - Math.pow(nz / 0.94, 4));
        const bodyDome = Math.pow(bodyArchX, 1.35) * bodyArchZ * 0.115;

        const sideDrop = Math.pow(Math.max(0, Math.abs(nx) - 0.68) / 0.32, 2) * 0.055;
        const endTuck = Math.pow(Math.abs(nz), 3.5) * 0.025;

        pos.setY(i, vy + bodyDome + wrinkleA + wrinkleB + crossFold - sideDrop - endTuck);
      }
      geo.computeVertexNormals();
      return geo;
    }

    const softBlanketGeo = createDrapedBlanketGeo(0.92, 1.08);
    const beigeBlanketMat = new THREE.MeshStandardMaterial({
      color: 0xdfd4c2,
      map: mats.ivory.map,
      bumpMap: mats.ivory.map,
      bumpScale: 0.011,
      roughness: 0.96,
      metalness: 0.0
    });

    function createIvorySofaBed(rotY) {
      const bed = new THREE.Group();
      const base = new THREE.Mesh(softBaseGeo, mats.wal); base.position.y = 0.035; base.castShadow = true; base.receiveShadow = true; bed.add(base);
      const mat = new THREE.Mesh(softMattressGeo, mats.ivory); mat.position.y = 0.145; mat.castShadow = true; mat.receiveShadow = true; bed.add(mat);
      const back = new THREE.Mesh(softBackGeo, mats.ivoryCushion); back.position.set(0, 0.29, 0.67); back.rotation.x = 0.26; back.castShadow = true; bed.add(back);
      const pil = new THREE.Mesh(plumpPillowGeo, mats.ivory); pil.position.set(0, 0.265, 0.43); pil.rotation.x = 0.20; pil.castShadow = true; bed.add(pil);

      const blanket = new THREE.Mesh(softBlanketGeo, beigeBlanketMat);
      blanket.position.set(0, 0.236, -0.58);
      blanket.scale.set(1, 1, 0.24);
      blanket.castShadow = true;
      blanket.receiveShadow = true;
      bed.add(blanket);

      bed.rotation.y = rotY;
      return { mesh: bed, blanket: blanket };
    }
    let seed = 77;
    function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    const beds = new Array();
    let attempts = 0;

    while (beds.length < 32 && attempts < 15000) {
      attempts++;
      const bx = (rand() - 0.5) * 15.2;
      const bz = 2.2 + rand() * 10.4;
      let ov = false;

      for (let i = 0; i < standSpots.length; i++) {
        if (Math.hypot(bx - standSpots.at(i).at(0), bz - standSpots.at(i).at(1)) < 1.75) { ov = true; break; }
      }
      if (!ov) {
        for (let i = 0; i < beds.length; i++) {
          if (Math.abs(bx - beds.at(i).x) < 2.05 && Math.abs(bz - beds.at(i).z) < 2.75) { ov = true; break; }
        }
      }
      if (!ov) {
        const rotY = Math.atan2(bx, bz + 1.5) + (rand() - 0.5) * 0.88;
        const sb = createIvorySofaBed(rotY);
        sb.mesh.position.set(bx, 0, bz);
        scene.add(sb.mesh);

        beds.push({
          id: beds.length,
          x: bx,
          z: bz,
          rotY: rotY,
          mesh: sb.mesh,
          blanket: sb.blanket,
          occupied: false
        });
      }
    }

    const roomHeight = 8.4;
    const roomDepth = 25.2;
    const roomCenterZ = 9.2;
    const backWallZ = 21.8;

    function createTadaoConcreteTex() {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 1024;
      const g = c.getContext('2d');

      g.fillStyle = '#161515';
      g.fillRect(0, 0, 1024, 1024);

      let cSeed = 809;
      function cRand() { cSeed = (cSeed * 16807) % 2147483647; return (cSeed - 1) / 2147483646; }

      for (let i = 0; i < 480; i++) {
        const rx = cRand() * 1024, ry = cRand() * 1024, rr = 18 + cRand() * 65;
        const grad = g.createRadialGradient(rx, ry, 2, rx, ry, rr);
        const shade = cRand() > 0.48 ? 'rgba(34, 33, 32, 0.16)' : 'rgba(8, 8, 8, 0.22)';
        grad.addColorStop(0, shade);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grad;
        g.beginPath(); g.arc(rx, ry, rr, 0, Math.PI * 2); g.fill();
      }

      for (let i = 0; i < 16000; i++) {
        const px = cRand() * 1024, py = cRand() * 1024;
        const sz = cRand() > 0.90 ? 1.8 : 1.0;
        g.fillStyle = cRand() > 0.5 ? 'rgba(42, 41, 40, 0.22)' : 'rgba(6, 6, 6, 0.35)';
        g.fillRect(px, py, sz, sz);
      }

      const cols = 2, rows = 4;
      const cellW = 1024 / cols, cellH = 1024 / rows;

      for (let r = 0; r < rows; r++) {
        for (let cIdx = 0; cIdx < cols; cIdx++) {
          const x0 = cIdx * cellW, y0 = r * cellH;

          g.strokeStyle = 'rgba(4, 4, 4, 0.96)';
          g.lineWidth = 2.8;
          g.strokeRect(x0 + 1.2, y0 + 1.2, cellW - 2.4, cellH - 2.4);

          g.strokeStyle = 'rgba(135, 130, 124, 0.52)';
          g.lineWidth = 1.4;
          g.strokeRect(x0 + 3.6, y0 + 3.6, cellW - 7.2, cellH - 7.2);

          const holeOffsetsX = new Array(0.16, 0.50, 0.84);
          const holeOffsetsY = new Array(0.28, 0.72);
          for (let hy = 0; hy < holeOffsetsY.length; hy++) {
            for (let hx = 0; hx < holeOffsetsX.length; hx++) {
              const cx = x0 + cellW * holeOffsetsX.at(hx);
              const cy = y0 + cellH * holeOffsetsY.at(hy);
              const holeR = 8.5;

              g.fillStyle = 'rgba(86, 83, 79, 0.52)';
              g.beginPath(); g.arc(cx, cy + 1.4, holeR + 2.6, 0, Math.PI * 2); g.fill();

              const hGrad = g.createRadialGradient(cx - 1.4, cy - 1.4, 0.8, cx, cy, holeR);
              hGrad.addColorStop(0, '#030303');
              hGrad.addColorStop(0.70, '#121111');
              hGrad.addColorStop(1, '#363432');
              g.fillStyle = hGrad;
              g.beginPath(); g.arc(cx, cy, holeR, 0, Math.PI * 2); g.fill();
            }
          }
        }
      }

      const texObj = new THREE.CanvasTexture(c);
      texObj.wrapS = THREE.RepeatWrapping;
      texObj.wrapT = THREE.RepeatWrapping;
      return texObj;
    }

    const tadaoConcTex = createTadaoConcreteTex();
    const velvetTex = (tex && typeof tex.mkAcousticFelt === 'function')
      ? tex.mkAcousticFelt()
      : ((tex && typeof tex.mkFelt === 'function') ? tex.mkFelt() : tex.mkIvoryFabric());

    const velvetMats = new Array(
      new THREE.MeshStandardMaterial({ color: 0x111112, map: velvetTex, bumpMap: velvetTex, bumpScale: 0.006, roughness: 0.98, metalness: 0.0, side: THREE.DoubleSide }),
      new THREE.MeshStandardMaterial({ color: 0x161618, map: velvetTex, bumpMap: velvetTex, bumpScale: 0.006, roughness: 0.97, metalness: 0.0, side: THREE.DoubleSide })
    );

    function buildAlternatingSideWall(sideSign) {
      const wallGroup = new THREE.Group();
      const baseWallX = sideSign * 9.88;

      const concreteWallTex = tadaoConcTex.clone();
      concreteWallTex.needsUpdate = true;
      concreteWallTex.repeat.set(6.0, 2.0);

      const sideConcMat = new THREE.MeshStandardMaterial({
        color: 0x6b655e,
        map: concreteWallTex,
        bumpMap: concreteWallTex,
        bumpScale: 0.018,
        roughness: 0.94,
        metalness: 0.0
      });

      const wallMinZ = roomCenterZ - roomDepth / 2;
      const wallMaxZ = roomCenterZ + roomDepth / 2;
      const doorMinZ = 17.6;
      const doorMaxZ = 20.0;
      const doorH = 3.6;

      if (sideSign === -1) {
        const frontLen = doorMinZ - wallMinZ;
        const frontConc = new THREE.Mesh(new THREE.BoxGeometry(0.08, roomHeight, frontLen), sideConcMat);
        frontConc.position.set(baseWallX, roomHeight / 2, wallMinZ + frontLen / 2);
        frontConc.receiveShadow = true;
        wallGroup.add(frontConc);

        const rearLen = wallMaxZ - doorMaxZ;
        const rearConc = new THREE.Mesh(new THREE.BoxGeometry(0.08, roomHeight, rearLen), sideConcMat);
        rearConc.position.set(baseWallX, roomHeight / 2, doorMaxZ + rearLen / 2);
        rearConc.receiveShadow = true;
        wallGroup.add(rearConc);

        const headerH = roomHeight - doorH;
        const headerConc = new THREE.Mesh(new THREE.BoxGeometry(0.08, headerH, doorMaxZ - doorMinZ), sideConcMat);
        headerConc.position.set(baseWallX, doorH + headerH / 2, (doorMinZ + doorMaxZ) / 2);
        headerConc.receiveShadow = true;
        wallGroup.add(headerConc);
      } else {
        const concreteWall = new THREE.Mesh(new THREE.BoxGeometry(0.16, roomHeight, roomDepth), sideConcMat);
        concreteWall.position.set(baseWallX, roomHeight / 2, roomCenterZ);
        concreteWall.receiveShadow = true;
        wallGroup.add(concreteWall);
      }

      const layoutBlocks = new Array(
        { type: 'curtain', len: 3.0 },
        { type: 'concrete', len: 1.8 },
        { type: 'curtain', len: 3.0 },
        { type: 'concrete', len: 1.8 },
        { type: 'curtain', len: 3.0 },
        { type: 'concrete', len: 1.8 },
        { type: 'curtain', len: 3.0 },
        { type: 'concrete', len: 1.8 },
        { type: 'curtain', len: 3.0 },
        { type: 'curtain', len: 3.0 }
      );

      let curZ = wallMinZ;
      const curtainHeight = 8.38;

      for (let bIdx = 0; bIdx < layoutBlocks.length; bIdx++) {
        const block = layoutBlocks.at(bIdx);

        if (block.type === 'curtain') {
          const subPanels = 3;
          const panelW = (block.len / subPanels) * 1.015;

          for (let sp = 0; sp < subPanels; sp++) {
            const panelCenterZ = curZ + (sp + 0.5) * (block.len / subPanels);

            if (sideSign === -1 &&
                panelCenterZ + panelW / 2 >= 16.5 &&
                panelCenterZ - panelW / 2 <= 21.0) {
              continue;
            }

            const pSeed = (sideSign === -1 ? 100 : 300) + bIdx * 43 + sp * 17;
            const geo = new THREE.PlaneGeometry(panelW, curtainHeight, 120, 32);
            const posAttr = geo.attributes.position;

            const pleatCount = 13.0 + ((pSeed * 11) % 3) * 1.0;
            const subRipple = 27.0 + ((pSeed * 19) % 4) * 1.5;
            const ph1 = (pSeed * 0.67) % (Math.PI * 2);
            const ph2 = (pSeed * 1.41) % (Math.PI * 2);
            const ph3 = (pSeed * 2.19) % (Math.PI * 2);

            for (let i = 0; i < posAttr.count; i++) {
              const lx = posAttr.getX(i);
              const ly = posAttr.getY(i);
              const uY = Math.max(0, Math.min(1, 0.5 - (ly / curtainHeight)));
              const uX = Math.max(0, Math.min(1, (lx / panelW) + 0.5));

              const drapeWeight = 0.58 + Math.pow(uY, 0.72) * 0.58;
              const waveShift = Math.sin(uY * 2.4 + ph3) * 0.28 + Math.cos(uY * 1.3 + ph1) * 0.18;
              const mainPleat = Math.sin(uX * pleatCount * Math.PI + ph1 + waveShift);
              const fineFold = Math.sin(uX * subRipple * Math.PI + ph2 - waveShift * 0.6) * 0.32;
              const naturalSway = Math.cos(uX * 5.0 * Math.PI + ph3 + uY * 0.7) * 0.26;

              const edgeMask = 0.18 + 0.82 * Math.pow(Math.sin(uX * Math.PI), 0.32);

              const foldZ = (mainPleat * 0.088 + fineFold * 0.032 + naturalSway * 0.038) * drapeWeight * edgeMask + 0.135;
              const hemWeight = Math.pow(uY, 4.5) * 0.022;
              posAttr.setZ(i, foldZ + hemWeight);
            }

            geo.computeVertexNormals();
            const curtainMesh = new THREE.Mesh(geo, velvetMats.at((bIdx + sp) % velvetMats.length));
            curtainMesh.position.set(sideSign * 9.79, curtainHeight / 2, panelCenterZ);
            curtainMesh.rotation.y = (sideSign === -1) ? (Math.PI / 2) : (-Math.PI / 2);
            curtainMesh.castShadow = true;
            curtainMesh.receiveShadow = true;
            wallGroup.add(curtainMesh);
          }
        }
        curZ += block.len;
      }

      scene.add(wallGroup);
    }

    buildAlternatingSideWall(-1);
    buildAlternatingSideWall(1);

    const backWallWidth = 20.0, backWallHeight = 7.6, backWallDepth = 0.45;
    const windowLeftX = -8.6, windowRightX = -1.4;
    const windowBottomY = 1.15, windowTopY = 3.6;
    const windowWidth = windowRightX - windowLeftX;
    const windowHeight = windowTopY - windowBottomY;
    const windowCenterX = (windowLeftX + windowRightX) / 2;
    const windowCenterY = (windowBottomY + windowTopY) / 2;

    const backConcreteTex = tadaoConcTex.clone();
    backConcreteTex.needsUpdate = true;
    backConcreteTex.repeat.set(6.0, 2.0);
    const backConcreteMat = new THREE.MeshStandardMaterial({
      color: 0x6b655e,
      map: backConcreteTex,
      bumpMap: backConcreteTex,
      bumpScale: 0.018,
      roughness: 0.94,
      metalness: 0.0
    });
    const backWallGroup = new THREE.Group();
    const wallParts = [
      { width: windowLeftX + backWallWidth / 2, height: backWallHeight, x: (-backWallWidth / 2 + windowLeftX) / 2, y: backWallHeight / 2 },
      { width: backWallWidth / 2 - windowRightX, height: backWallHeight, x: (windowRightX + backWallWidth / 2) / 2, y: backWallHeight / 2 },
      { width: windowWidth, height: windowBottomY, x: windowCenterX, y: windowBottomY / 2 },
      { width: windowWidth, height: backWallHeight - windowTopY, x: windowCenterX, y: windowTopY + (backWallHeight - windowTopY) / 2 }
    ];
    wallParts.forEach(part => {
      const wallSection = new THREE.Mesh(
        new THREE.BoxGeometry(part.width, part.height, backWallDepth),
        backConcreteMat
      );
      wallSection.position.set(part.x, part.y, backWallZ);
      wallSection.receiveShadow = true;
      backWallGroup.add(wallSection);
    });
    scene.add(backWallGroup);

    const gardenMat = new THREE.MeshBasicMaterial({ fog: false, side: THREE.DoubleSide });
    const gardenPlane = new THREE.Mesh(new THREE.PlaneGeometry(7.35, 2.55), gardenMat);
    gardenPlane.position.set(windowCenterX, windowCenterY, 22.04);
    scene.add(gardenPlane);

    const gardenImagePaths = [
      './media/back_garden.png',
      './media/back_garden.jpeg',
      './media/back_garden.jpg',
      './back_garden.png'
    ];
    function loadGardenImage(index) {
      if (index >= gardenImagePaths.length) {
        console.error('Unable to load the back garden image from the configured paths.');
        return;
      }
      const image = new Image();
      image.onload = () => {
        gardenMat.map = new THREE.Texture(image);
        gardenMat.map.needsUpdate = true;
        gardenMat.needsUpdate = true;
      };
      image.onerror = () => loadGardenImage(index + 1);
      image.src = gardenImagePaths[index];
    }
    loadGardenImage(0);

    const windowLight = new THREE.PointLight(0xfff4e0, 1.3, 9.5, 1.5);
    windowLight.position.set(-5.0, 2.45, 21.05);
    windowLight.castShadow = false;
    scene.add(windowLight);

    const rayCanvas = document.createElement('canvas');
    rayCanvas.width = 512;
    rayCanvas.height = 512;
    const rayContext = rayCanvas.getContext('2d');
    const rayGradient = rayContext.createLinearGradient(0, 0, 0, 512);
    rayGradient.addColorStop(0, 'rgba(255, 248, 232, 0.22)');
    rayGradient.addColorStop(0.10, 'rgba(255, 248, 232, 0.18)');
    rayGradient.addColorStop(0.20, 'rgba(255, 248, 232, 0.09)');
    rayGradient.addColorStop(0.27, 'rgba(255, 248, 232, 0)');
    rayGradient.addColorStop(1, 'rgba(255, 248, 232, 0)');
    rayContext.fillStyle = rayGradient;
    rayContext.fillRect(0, 0, 512, 512);
    rayContext.globalCompositeOperation = 'destination-in';
    const rayEdgeGradient = rayContext.createLinearGradient(0, 0, 512, 0);
    rayEdgeGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    rayEdgeGradient.addColorStop(0.16, 'rgba(255, 255, 255, 0.18)');
    rayEdgeGradient.addColorStop(0.36, 'rgba(255, 255, 255, 0.82)');
    rayEdgeGradient.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
    rayEdgeGradient.addColorStop(0.64, 'rgba(255, 255, 255, 0.82)');
    rayEdgeGradient.addColorStop(0.84, 'rgba(255, 255, 255, 0.18)');
    rayEdgeGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    rayContext.fillStyle = rayEdgeGradient;
    rayContext.fillRect(0, 0, 512, 512);
    const windowRayTex = new THREE.CanvasTexture(rayCanvas);
    const windowRayMat = new THREE.MeshBasicMaterial({
      map: windowRayTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false
    });
    const windowRayGeo = new THREE.PlaneGeometry(6.8, 4.8);
    windowRayGeo.translate(0, -2.4, 0);
    const windowRay = new THREE.Mesh(windowRayGeo, windowRayMat);
    windowRay.position.set(windowCenterX, windowBottomY - 0.04, backWallZ - 0.3);
    windowRay.rotation.x = 38 * Math.PI / 180;
    scene.add(windowRay);

    const poolCanvas = document.createElement('canvas');
    poolCanvas.width = 128;
    poolCanvas.height = 128;
    const poolContext = poolCanvas.getContext('2d');
    const poolGradient = poolContext.createRadialGradient(64, 64, 0, 64, 64, 64);
    poolGradient.addColorStop(0, 'rgba(255, 246, 226, 0.12)');
    poolGradient.addColorStop(0.55, 'rgba(255, 246, 226, 0.055)');
    poolGradient.addColorStop(1, 'rgba(255, 246, 226, 0)');
    poolContext.fillStyle = poolGradient;
    poolContext.fillRect(0, 0, 128, 128);
    const floorPoolTex = new THREE.CanvasTexture(poolCanvas);
    const floorPoolMat = new THREE.MeshBasicMaterial({
      map: floorPoolTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const floorPool = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 3.4), floorPoolMat);
    floorPool.rotation.x = -Math.PI / 2;
    floorPool.position.set(-5.0, 0.014, 19.3);
    scene.add(floorPool);

    const frontHeaderWall = new THREE.Mesh(new THREE.BoxGeometry(19.6, 1.65, 0.12), mats.blk);
    frontHeaderWall.position.set(0, 7.6, -3.28);
    scene.add(frontHeaderWall);

    const ceilingGroup = new THREE.Group();
    const ceilW = 19.6, ceilD = roomDepth, ceilCenterZ = roomCenterZ, ceilTopY = 8.38;

    const ceilBacking = new THREE.Mesh(
      new THREE.PlaneGeometry(ceilW, ceilD),
      new THREE.MeshStandardMaterial({ color: 0x070709, roughness: 0.94 })
    );
    ceilBacking.rotation.x = Math.PI / 2;
    ceilBacking.position.set(0, ceilTopY, ceilCenterZ);
    ceilingGroup.add(ceilBacking);

    const darkCherryTex = tex.mkWood('#3a1d12', '#1a0b06');
    const louverWoodMat = new THREE.MeshStandardMaterial({
      map: darkCherryTex,
      bumpMap: darkCherryTex,
      bumpScale: 0.006,
      roughness: 0.42,
      metalness: 0.06
    });

    const slatCount = 72;
    const slatThickness = 0.052;
    const slatSpacing = ceilD / slatCount;
    const xSegments = 84;

    for (let s = 0; s < slatCount; s++) {
      const sz = (ceilCenterZ - ceilD / 2) + (s + 0.5) * slatSpacing;
      const slatGeo = new THREE.BoxGeometry(ceilW, 1.0, slatThickness, xSegments, 1, 1);
      const pAttr = slatGeo.attributes.position;

      for (let i = 0; i < pAttr.count; i++) {
        const vx = pAttr.getX(i);
        const vy = pAttr.getY(i);

        if (vy < 0) {
          const waveA = Math.sin(vx * 0.42 + sz * 0.34) * 0.24;
          const waveB = Math.cos(vx * 0.26 - sz * 0.48 + Math.sin(vx * 0.18) * 1.4) * 0.22;
          const waveC = Math.sin(vx * 0.78 + sz * 0.62) * 0.07;

          const edgeFade = Math.cos((vx / (ceilW * 0.52)) * (Math.PI * 0.42));
          const waveHeight = (waveA + waveB + waveC + 0.53) * Math.max(0.45, edgeFade);
          const dropDepth = 0.98 + Math.min(0.62, Math.max(0.0, waveHeight * 0.62));

          pAttr.setY(i, ceilTopY - dropDepth);
        } else {
          pAttr.setY(i, ceilTopY);
        }
      }

      slatGeo.computeVertexNormals();
      const slatMesh = new THREE.Mesh(slatGeo, louverWoodMat);
      slatMesh.position.set(0, 0, sz);
      slatMesh.receiveShadow = true;
      ceilingGroup.add(slatMesh);
    }

    const ceilSubtleLight1 = new THREE.PointLight(0xd97736, 0.36, 22, 1.8);
    ceilSubtleLight1.position.set(-4.2, 6.6, 5.2);
    ceilingGroup.add(ceilSubtleLight1);

    const ceilSubtleLight2 = new THREE.PointLight(0xd97736, 0.36, 22, 1.8);
    ceilSubtleLight2.position.set(4.2, 6.6, 13.5);
    ceilingGroup.add(ceilSubtleLight2);

    scene.add(ceilingGroup);

    return beds;
  }
};
window.ArchiveShop = {
  build(scene, mats, tex, isAdmin) {
    const shopGroup = new THREE.Group();
    const clickables = [];
    const staticShadowCasters = [];
    const rectShadowCanvas = document.createElement('canvas');
    rectShadowCanvas.width = 64;
    rectShadowCanvas.height = 64;
    const rectShadowCtx = rectShadowCanvas.getContext('2d');
    const rectShadowPixels = rectShadowCtx.createImageData(64, 64);
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const edge = Math.max(Math.abs(x - 32), Math.abs(y - 32)) / 32;
        const alpha = 0.42 * Math.pow(Math.max(0, 1 - edge), 2);
        const pixel = (y * 64 + x) * 4;
        rectShadowPixels.data[pixel] = 10;
        rectShadowPixels.data[pixel + 1] = 8;
        rectShadowPixels.data[pixel + 2] = 6;
        rectShadowPixels.data[pixel + 3] = Math.round(alpha * 255);
      }
    }
    rectShadowCtx.putImageData(rectShadowPixels, 0, 0);
    const rectShadowTex = new THREE.CanvasTexture(rectShadowCanvas);

    const roundShadowCanvas = document.createElement('canvas');
    roundShadowCanvas.width = 64;
    roundShadowCanvas.height = 64;
    const roundShadowCtx = roundShadowCanvas.getContext('2d');
    const roundShadowGradient = roundShadowCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    roundShadowGradient.addColorStop(0, 'rgba(10, 8, 6, 0.48)');
    roundShadowGradient.addColorStop(1, 'rgba(10, 8, 6, 0)');
    roundShadowCtx.fillStyle = roundShadowGradient;
    roundShadowCtx.fillRect(0, 0, 64, 64);
    const roundShadowTex = new THREE.CanvasTexture(roundShadowCanvas);
    const rectShadowMat = new THREE.MeshBasicMaterial({
      map: rectShadowTex,
      transparent: true,
      depthWrite: false
    });
    const roundShadowMat = new THREE.MeshBasicMaterial({
      map: roundShadowTex,
      transparent: true,
      depthWrite: false
    });

    function addRectContactShadow(parent, x, y, z, width, height) {
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(width, height), rectShadowMat);
      shadow.position.set(x, y, z);
      parent.add(shadow);
    }

    function addRoundContactShadow(parent, x, y, z, width, depth) {
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), roundShadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(x, y, z);
      parent.add(shadow);
    }

    const entryX = -9.92;
    const entryZ = 18.8;
    const shopW = 14.5;
    const shopD = 6.8;
    const shopH = 4.2;
    const centerX = entryX - shopW / 2 - 0.08;
    const centerZ = entryZ;

    const cedarWoodMat = new THREE.MeshStandardMaterial({
      map: tex.mkWood('#381e10', '#170b05'),
      roughness: 0.45,
      metalness: 0.05
    });
    const darkBeamMat = new THREE.MeshStandardMaterial({
      map: tex.mkWood('#1e0f07', '#0c0502'),
      roughness: 0.55
    });
    const plasterWallMat = new THREE.MeshStandardMaterial({
      color: 0x6a635b,
      roughness: 0.92,
      metalness: 0.0
    });
    const hanjiTex = tex.mkHanjiPaper();
    const shojiPaperMat = new THREE.MeshStandardMaterial({
      color: 0xffe8c2,
      map: hanjiTex,
      emissive: 0xd97736,
      emissiveIntensity: 0.55,
      roughness: 0.88,
      side: THREE.DoubleSide
    });

    const shopFloorMat = new THREE.MeshStandardMaterial({
      color: 0xc8c3b8,
      bumpScale: 0.035,
      roughness: 0.88
    });
    const edgePebbleMat = new THREE.MeshStandardMaterial({
      bumpScale: 0.025,
      roughness: 0.90
    });
    const pebbleImagePaths = ['./media/pebbles.png', './media/pebbles.jpeg', './media/pebbles.jpg'];
    function tryLoadPebbles(index) {
      if (index >= pebbleImagePaths.length) {
        console.error('Unable to load the archive shop pebble texture from the configured paths.');
        return;
      }
      const image = new Image();
      image.onload = () => {
        const loadedTex = new THREE.Texture(image);
        loadedTex.wrapS = THREE.RepeatWrapping;
        loadedTex.wrapT = THREE.RepeatWrapping;
        loadedTex.repeat.set(9, 4);
        loadedTex.anisotropy = 16;
        loadedTex.needsUpdate = true;
        shopFloorMat.map = loadedTex;
        shopFloorMat.bumpMap = loadedTex;
        shopFloorMat.needsUpdate = true;
        edgePebbleMat.map = loadedTex;
        edgePebbleMat.bumpMap = loadedTex;
        edgePebbleMat.needsUpdate = true;
      };
      image.onerror = () => tryLoadPebbles(index + 1);
      image.src = pebbleImagePaths[index];
    }
    tryLoadPebbles(0);

    const shopFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(shopW + 0.24, shopD + 0.2),
      shopFloorMat
    );
    shopFloor.rotation.x = -Math.PI / 2;
    shopFloor.position.set(centerX - 0.08, 0.005, centerZ);
    shopFloor.receiveShadow = true;
    shopGroup.add(shopFloor);

    const woodWalkway = new THREE.Mesh(new THREE.BoxGeometry(shopW - 1.6, 0.018, 3.6), cedarWoodMat);
    woodWalkway.position.set(centerX + 0.3, 0.009, centerZ);
    woodWalkway.receiveShadow = true;
    shopGroup.add(woodWalkway);

    const ceilCap = new THREE.Mesh(
      new THREE.PlaneGeometry(shopW + 0.6, shopD + 0.2),
      new THREE.MeshStandardMaterial({ color: 0x3b322b, roughness: 0.94, fog: false })
    );
    ceilCap.rotation.x = Math.PI / 2;
    ceilCap.position.set(centerX + 0.1, shopH, centerZ);
    shopGroup.add(ceilCap);

    // 입구 문틀 & 반쯤 열린 한지 장지문
    const doorH = 3.6;
    const doorFrameGroup = new THREE.Group();
    const frameThick = 0.16;
    const leftPost = new THREE.Mesh(new THREE.BoxGeometry(frameThick, doorH, 0.12), darkBeamMat);
    leftPost.position.set(entryX, doorH / 2, entryZ + 1.24);
    doorFrameGroup.add(leftPost);

    const rightPost = new THREE.Mesh(new THREE.BoxGeometry(frameThick, doorH, 0.12), darkBeamMat);
    rightPost.position.set(entryX, doorH / 2, entryZ - 1.24);
    doorFrameGroup.add(rightPost);

    const lintel = new THREE.Mesh(new THREE.BoxGeometry(frameThick, shopH - doorH + 0.45, shopD), darkBeamMat);
    lintel.position.set(entryX, doorH + (shopH - doorH) / 2 - 0.15, entryZ);
    doorFrameGroup.add(lintel);

    const sideBlock1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, doorH, 2.25), darkBeamMat);
    sideBlock1.position.set(entryX - 0.05, doorH / 2, entryZ - 2.32);
    doorFrameGroup.add(sideBlock1);

    const sideBlock2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, doorH, 2.25), darkBeamMat);
    sideBlock2.position.set(entryX - 0.05, doorH / 2, entryZ + 2.32);
    doorFrameGroup.add(sideBlock2);

    const shojiDoor = new THREE.Group();
    const doorW = 1.15, shojiH = doorH - 0.35;
    const paperSheet = new THREE.Mesh(new THREE.PlaneGeometry(doorW - 0.06, shojiH - 0.06), shojiPaperMat);
    paperSheet.rotation.y = Math.PI / 2;
    shojiDoor.add(paperSheet);

    for (let gy = -shojiH / 2; gy <= shojiH / 2; gy += 0.42) {
      const hBar = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.022, doorW), darkBeamMat);
      hBar.position.y = gy;
      shojiDoor.add(hBar);
    }
    for (let gz = -doorW / 2; gz <= doorW / 2; gz += 0.28) {
      const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.028, shojiH, 0.022), darkBeamMat);
      vBar.position.z = gz;
      shojiDoor.add(vBar);
    }
    shojiDoor.position.set(entryX - 0.04, shojiH / 2, entryZ - 0.78);
    doorFrameGroup.add(shojiDoor);

    scene.add(doorFrameGroup);

    // 좌측 대형 통창 & 창밖 실사 중정 정원 (창틀 안쪽으로 초록색 띠가 삐져나오지 않도록 정밀 배치)
    const leftWallZ = entryZ + shopD / 2;
    const winW = 10.4, winH = 2.65, winY = 1.82;

    const winBottomWall = new THREE.Mesh(new THREE.BoxGeometry(shopW, 0.50, 0.18), plasterWallMat);
    winBottomWall.position.set(centerX, 0.25, leftWallZ);
    shopGroup.add(winBottomWall);

    const winTopWall = new THREE.Mesh(new THREE.BoxGeometry(shopW, 1.05, 0.18), plasterWallMat);
    winTopWall.position.set(centerX, shopH - 0.525, leftWallZ);
    shopGroup.add(winTopWall);

    const winLeftPillar = new THREE.Mesh(new THREE.BoxGeometry(2.1, shopH, 0.18), plasterWallMat);
    winLeftPillar.position.set(entryX - 1.05, shopH / 2, leftWallZ);
    shopGroup.add(winLeftPillar);

    const winRightPillar = new THREE.Mesh(new THREE.BoxGeometry(2.1, shopH, 0.18), plasterWallMat);
    winRightPillar.position.set(entryX - shopW + 1.05, shopH / 2, leftWallZ);
    shopGroup.add(winRightPillar);

    const winSill = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.2, 0.07, 0.32), cedarWoodMat);
    winSill.position.set(centerX, 0.50, leftWallZ);
    shopGroup.add(winSill);

    for (let mx = centerX - winW / 2; mx <= centerX + winW / 2; mx += 1.30) {
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.045, winH, 0.12), darkBeamMat);
      mullion.position.set(mx, winY, leftWallZ);
      shopGroup.add(mullion);
    }

        const gardenGroup = new THREE.Group();
    const gardenZ = leftWallZ + 1.45;

    const gCvs = document.createElement('canvas');
    gCvs.width = 1024; gCvs.height = 512;
    const gg = gCvs.getContext('2d');
    gg.fillStyle = '#d8e3dc';
    gg.fillRect(0, 0, 1024, 512);
    const gardenPhotoTex = new THREE.CanvasTexture(gCvs);

    const skyBackdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(winW + 4.2, 4.1),
      new THREE.MeshBasicMaterial({ map: gardenPhotoTex, fog: false, side: THREE.DoubleSide })
    );
    skyBackdrop.position.set(centerX, 2.05, gardenZ);
    skyBackdrop.rotation.y = Math.PI;
    gardenGroup.add(skyBackdrop);

    function applyGardenImageUrl(url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const loadedTex = new THREE.Texture(img);
        loadedTex.needsUpdate = true;
        skyBackdrop.material.map = loadedTex;
        skyBackdrop.material.needsUpdate = true;
      };
      img.src = url;
    }

    const candidatePaths = ['./media/garden.jpeg', './media/garden.jpg', './garden.jpeg', './garden.jpg'];
    function tryLoadGarden(idx) {
      if (idx >= candidatePaths.length) return;
      const testImg = new Image();
      testImg.onload = () => {
        const loadedTex = new THREE.Texture(testImg);
        loadedTex.needsUpdate = true;
        skyBackdrop.material.map = loadedTex;
        skyBackdrop.material.needsUpdate = true;
      };
      testImg.onerror = () => tryLoadGarden(idx + 1);
      testImg.src = candidatePaths.at(idx);
    }
    tryLoadGarden(0);

    const gardenFileInput = document.createElement('input');
    gardenFileInput.type = 'file';
    gardenFileInput.accept = 'image/*';
    gardenFileInput.style.display = 'none';
    gardenFileInput.disabled = !isAdmin;
    document.body.appendChild(gardenFileInput);
    gardenFileInput.addEventListener('change', e => {
      if (e.target.files && e.target.files.length > 0) {
        applyGardenImageUrl(URL.createObjectURL(e.target.files.item(0)));
      }
    });

    const gardenPickBtn = document.createElement('button');
    gardenPickBtn.textContent = '정원 사진 변경';
    gardenPickBtn.style.cssText = 'position:fixed;top:18px;right:185px;padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,0.22);background:rgba(18,16,14,0.82);backdrop-filter:blur(10px);color:#e5e7eb;font-size:12px;font-weight:600;cursor:pointer;z-index:30;';
    gardenPickBtn.style.display = isAdmin ? 'block' : 'none';
    gardenPickBtn.onclick = () => { if (isAdmin) gardenFileInput.click(); };
    document.body.appendChild(gardenPickBtn);

    const nearGround = new THREE.Mesh(
      new THREE.PlaneGeometry(winW + 0.1, 1.75),
      new THREE.MeshStandardMaterial({ color: 0x385226, roughness: 0.94, fog: false })
    );
    nearGround.rotation.x = -Math.PI / 2;
    nearGround.position.set(centerX, 0.44, leftWallZ + 1.05);
    gardenGroup.add(nearGround);

    const gravelBorder = new THREE.Mesh(
      new THREE.PlaneGeometry(winW + 0.1, 0.38),
      new THREE.MeshStandardMaterial({ color: 0x9e9a90, roughness: 0.95, fog: false })
    );
    gravelBorder.rotation.x = -Math.PI / 2;
    gravelBorder.position.set(centerX, 0.445, leftWallZ + 0.34);
    gardenGroup.add(gravelBorder);

    let gSeed = 314;
    function gRand() { gSeed = (gSeed * 16807) % 2147483647; return (gSeed - 1) / 2147483646; }
    const foliageCvs = document.createElement('canvas');
    foliageCvs.width = 512; foliageCvs.height = 256;
    const fg = foliageCvs.getContext('2d');
    const foliagePalette = ['#284718', '#4d7530', '#5e8a38', '#7ba648', '#38662c', '#355b2a'];
    for (let p = 0; p < 480; p++) {
      const fx = 24 + gRand() * 464;
      const fh = 45 + gRand() * 190;
      const lean = (gRand() - 0.5) * 75;
      fg.strokeStyle = foliagePalette[Math.floor(gRand() * foliagePalette.length)];
      fg.lineWidth = 3.0 + gRand() * 3.5;
      fg.beginPath();
      fg.moveTo(fx, 256);
      fg.quadraticCurveTo(fx + lean * 0.4, 256 - fh * 0.55, fx + lean, 256 - fh);
      fg.stroke();
    }
    const foliageTex = new THREE.CanvasTexture(foliageCvs);
    const foliageMat = new THREE.MeshBasicMaterial({
      map: foliageTex,
      alphaTest: 0.35,
      transparent: true,
      side: THREE.DoubleSide,
      fog: false
    });

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 5; col++) {
        const card = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.78), foliageMat);
        card.position.set((centerX - 4.0) + col * 2.0 + (row * 0.3), 0.78, leftWallZ + 0.38 + row * 0.42);
        card.rotation.x = -0.12;
        gardenGroup.add(card);
      }
    }
    shopGroup.add(gardenGroup);

    // 정면 끝 벽면: 16:9(6.4m x 3.6m) 터치디자이너 비주얼 아트 월
    const endWallX = entryX - shopW;
    const endWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, shopH, shopD), plasterWallMat);
    endWall.position.set(endWallX, shopH / 2, centerZ);
    endWall.receiveShadow = true;
    shopGroup.add(endWall);

        const artW = 6.6, artH = 4.0, artY = 2.06;

    const artFrameBack = new THREE.Mesh(new THREE.BoxGeometry(0.06, artH + 0.14, artW + 0.14), darkBeamMat);
    artFrameBack.position.set(endWallX + 0.11, artY, centerZ);
    shopGroup.add(artFrameBack);

    const shopArtCvs = document.createElement('canvas');
    shopArtCvs.width = 1024; shopArtCvs.height = 576;
    const sag = shopArtCvs.getContext('2d');
    sag.fillStyle = '#0c0d12'; sag.fillRect(0, 0, 1024, 576);
    sag.strokeStyle = 'rgba(235, 200, 150, 0.55)'; sag.lineWidth = 2.2;
    for (let w = 0; w < 12; w++) {
      sag.beginPath();
      for (let x = 0; x <= 1024; x += 16) {
        const y = 288 + Math.sin(x * 0.008 + w * 0.45) * (24 + w * 6);
        x === 0 ? sag.moveTo(x, y) : sag.lineTo(x, y);
      }
      sag.stroke();
    }
    const shopArtFallbackTex = new THREE.CanvasTexture(shopArtCvs);

    const shopArtMat = new THREE.MeshBasicMaterial({ map: shopArtFallbackTex, fog: false, side: THREE.DoubleSide });
    const shopVisualScreen = new THREE.Mesh(new THREE.PlaneGeometry(artW, artH), shopArtMat);
    shopVisualScreen.rotation.y = Math.PI / 2;
    shopVisualScreen.position.set(endWallX + 0.145, artY, centerZ);
    shopGroup.add(shopVisualScreen);

    const shopVisualTextCvs = document.createElement('canvas');
    shopVisualTextCvs.width = 1024; shopVisualTextCvs.height = 1024;
    const shopVisualTextCtx = shopVisualTextCvs.getContext('2d');
    const shopVisualTextTexture = new THREE.CanvasTexture(shopVisualTextCvs);
    function drawShopSign() {
      shopVisualTextCtx.clearRect(0, 0, 1024, 1024);
      const panelX = 332, panelY = 480, panelWidth = 360, panelHeight = 544, radius = 28;
      shopVisualTextCtx.beginPath();
      shopVisualTextCtx.moveTo(panelX, panelY + panelHeight);
      shopVisualTextCtx.lineTo(panelX, panelY + radius);
      shopVisualTextCtx.quadraticCurveTo(panelX, panelY, panelX + radius, panelY);
      shopVisualTextCtx.lineTo(panelX + panelWidth - radius, panelY);
      shopVisualTextCtx.quadraticCurveTo(panelX + panelWidth, panelY, panelX + panelWidth, panelY + radius);
      shopVisualTextCtx.lineTo(panelX + panelWidth, panelY + panelHeight);
      shopVisualTextCtx.closePath();
      const glassGradient = shopVisualTextCtx.createLinearGradient(0, panelY, 0, panelY + panelHeight);
      glassGradient.addColorStop(0, 'rgba(255,255,255,0.14)');
      glassGradient.addColorStop(1, 'rgba(240,236,228,0.04)');
      shopVisualTextCtx.fillStyle = glassGradient;
      shopVisualTextCtx.shadowColor = 'rgba(0,0,0,0.35)';
      shopVisualTextCtx.shadowBlur = 18;
      shopVisualTextCtx.fill();
      shopVisualTextCtx.shadowColor = 'transparent';
      shopVisualTextCtx.shadowBlur = 0;
      shopVisualTextCtx.lineWidth = 1.2;
      shopVisualTextCtx.strokeStyle = 'rgba(255,255,255,0.35)';
      shopVisualTextCtx.stroke();

      shopVisualTextCtx.textAlign = 'center';
      shopVisualTextCtx.font = '500 34px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
      shopVisualTextCtx.fillStyle = 'rgba(246,242,234,0.92)';
      shopVisualTextCtx.fillText('Sound of Tokyo', 512, 535);
      shopVisualTextCtx.beginPath();
      shopVisualTextCtx.moveTo(372, 568);
      shopVisualTextCtx.lineTo(652, 568);
      shopVisualTextCtx.lineWidth = 1;
      shopVisualTextCtx.strokeStyle = 'rgba(255,255,255,0.22)';
      shopVisualTextCtx.stroke();
      shopVisualTextCtx.font = '400 20px -apple-system, sans-serif';
      shopVisualTextCtx.fillStyle = 'rgba(246,242,234,0.88)';
      shopVisualTextCtx.textBaseline = 'top';
      (localStorage.getItem('molip_shop_sign_text') || 'Curated Objects & Sound\nfrom Tokyo Archive')
        .split('\n')
        .forEach((line, index) => shopVisualTextCtx.fillText(line, 512, 605 + index * 30));
      shopVisualTextTexture.needsUpdate = true;
    }
    drawShopSign();
    const shopVisualTextHeight = artY + artH / 2 - 0.018;
    const shopVisualText = new THREE.Mesh(
      new THREE.PlaneGeometry(artW, shopVisualTextHeight),
      new THREE.MeshBasicMaterial({
        map: shopVisualTextTexture,
        transparent: true,
        depthWrite: false,
        fog: false,
        side: THREE.DoubleSide
      })
    );
    shopVisualText.rotation.y = Math.PI / 2;
    shopVisualText.renderOrder = 3;
    shopGroup.add(shopVisualText);
    window.updateShopSignText = function(newText) {
      localStorage.setItem('molip_shop_sign_text', newText);
      drawShopSign();
      shopVisualTextTexture.needsUpdate = true;
    };

    function createShopVideoTexture(video) {
      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      return texture;
    }

    const shopVideoEl = document.getElementById('shop-v');
    shopVideoEl.loop = true;
    shopVideoEl.muted = true;
    shopVideoEl.playsInline = true;
    shopVideoEl.preload = 'auto';
    shopVideoEl.crossOrigin = 'anonymous';
    shopVideoEl.setAttribute('loop', '');
    shopVideoEl.setAttribute('muted', '');
    shopVideoEl.setAttribute('playsinline', '');
    shopVideoEl.setAttribute('webkit-playsinline', '');
    shopVideoEl.setAttribute('preload', 'auto');
    shopArtMat.map = createShopVideoTexture(shopVideoEl);
    shopArtMat.needsUpdate = true;
    shopVideoEl.addEventListener('error', () => {
      console.error('Archive shop video load failed:', shopVideoEl.src);
    });
        // 무거운 50만 픽셀 연산을 제거하고 가벼운 기본 캔버스 + 실사 모래 사진(./media/sand.jpeg) 자동 로드로 대체
    const sandCvs = document.createElement('canvas');
    sandCvs.width = 64; sandCvs.height = 64;
    const sg = sandCvs.getContext('2d');
    sg.fillStyle = '#cfc9bd'; sg.fillRect(0, 0, 64, 64);
    const defaultSandTex = new THREE.CanvasTexture(sandCvs);

    const sandMat = new THREE.MeshStandardMaterial({
      map: defaultSandTex,
      roughness: 0.98,
      bumpScale: 0.052,
      metalness: 0.0
    });

    const zenGroup = new THREE.Group();
    const zenX = endWallX + 0.72;
    const zenW = 1.65, zenD = 6.44;
    const zenFrame = new THREE.Mesh(
      new THREE.BoxGeometry(zenW + 0.14, 0.14, zenD + 0.16),
      darkBeamMat
    );
    zenFrame.position.set(zenX, 0.07, centerZ);
    zenFrame.receiveShadow = true;
    zenGroup.add(zenFrame);

    // ./media/sand.jpeg 또는 ./media/sand.jpg 파일이 있으면 즉시 실사 모래 텍스처로 교체
    const sandPaths = ['./media/sand.jpeg', './media/sand.jpg', './sand.jpeg', './sand.jpg'];
    function tryLoadSand(idx) {
      if (idx >= sandPaths.length) return;
      const img = new Image();
      img.onload = () => {
        const loadedSand = new THREE.Texture(img);
        loadedSand.center.set(0.5, 0.5);
        loadedSand.rotation = Math.PI / 2;
        loadedSand.anisotropy = 16;
        loadedSand.needsUpdate = true;
        sandMat.map = loadedSand;
        sandMat.bumpMap = loadedSand;
        sandMat.needsUpdate = true;
      };
      img.onerror = () => tryLoadSand(idx + 1);
      img.src = sandPaths.at(idx);
    }
    tryLoadSand(0);

    const sandBed = new THREE.Mesh(new THREE.PlaneGeometry(zenW, zenD), sandMat);
    sandBed.rotation.x = -Math.PI / 2;
    sandBed.position.set(zenX, 0.165, centerZ);
    sandBed.receiveShadow = true;
    zenGroup.add(sandBed);


    const rockCvs = document.createElement('canvas');
    rockCvs.width = 256; rockCvs.height = 256;
    const rg = rockCvs.getContext('2d');
    rg.fillStyle = '#5c5852'; rg.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1800; i++) {
      rg.fillStyle = gRand() > 0.5 ? 'rgba(128, 122, 112, 0.25)' : 'rgba(36, 34, 31, 0.32)';
      rg.fillRect(gRand() * 256, gRand() * 256, 1 + gRand() * 3, 4 + gRand() * 16);
    }
    const rockMossGrad = rg.createLinearGradient(0, 145, 0, 256);
    rockMossGrad.addColorStop(0, 'rgba(62, 88, 34, 0)');
    rockMossGrad.addColorStop(0.65, 'rgba(58, 84, 30, 0.45)');
    rockMossGrad.addColorStop(1, 'rgba(46, 70, 24, 0.85)');
    rg.fillStyle = rockMossGrad; rg.fillRect(0, 145, 256, 111);
    const naturalRockTex = new THREE.CanvasTexture(rockCvs);

    const naturalRockMat = new THREE.MeshStandardMaterial({ map: naturalRockTex, bumpMap: naturalRockTex, bumpScale: 0.025, roughness: 0.90 });

    const mossCvs = document.createElement('canvas');
    mossCvs.width = 256; mossCvs.height = 256;
    const mg = mossCvs.getContext('2d');
    mg.fillStyle = '#435e24'; mg.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 3200; i++) {
      mg.fillStyle = gRand() > 0.48 ? 'rgba(94, 126, 46, 0.42)' : 'rgba(34, 52, 18, 0.45)';
      mg.fillRect(gRand() * 256, gRand() * 256, 2.5, 2.5);
    }
    const mossIslandMat = new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(mossCvs), roughness: 0.96 });

    function createNaturalStone(rx, ry, rz, seedOffset) {
      const geo = new THREE.IcosahedronGeometry(1.0, 3);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let vx = pos.getX(i), vy = pos.getY(i), vz = pos.getZ(i);
        const taper = vy > 0 ? (1.0 - vy * 0.34) : 1.05;
        if (vy < -0.35) vy = -0.35 + (vy + 0.35) * 0.25;
        const disp = 1.0 + Math.sin(vx * 3.8 + seedOffset) * Math.cos(vz * 3.5 - seedOffset) * 0.16 + Math.sin(vy * 5.2 + vx * 4.1 + seedOffset * 1.7) * 0.09 - Math.abs(Math.sin((vx + vz) * 6.0 + seedOffset)) * 0.07;
        pos.setXYZ(i, vx * rx * taper * disp, vy * ry * disp, vz * rz * taper * disp);
      }
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, naturalRockMat);
      staticShadowCasters.push(mesh);
      return mesh;
    }

    function createMossIsland(rx, rz, height) {
      const geo = new THREE.CylinderGeometry(rx * 0.72, rx, height, 28, 3);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i), vy = pos.getY(i), vz = pos.getZ(i);
        const angle = Math.atan2(vz, vx);
        const organic = 1.0 + Math.sin(angle * 3.0) * 0.08 + Math.cos(angle * 5.0) * 0.05;
        pos.setXYZ(i, vx * organic, vy, vz * (rz / rx) * organic);
      }
      geo.computeVertexNormals();
      return new THREE.Mesh(geo, mossIslandMat);
    }

    const islAX = zenX - 0.22, islAZ = centerZ - 1.85;
    const islAMesh = createMossIsland(0.32, 0.40, 0.055); islAMesh.position.set(islAX, 0.185, islAZ); zenGroup.add(islAMesh);
    addRoundContactShadow(zenGroup, islAX, 0.168, islAZ, 0.92, 1.04);
    const tallStone = createNaturalStone(0.18, 0.46, 0.16, 1.3); tallStone.position.set(islAX - 0.04, 0.34, islAZ - 0.08); tallStone.rotation.y = 0.4; zenGroup.add(tallStone);
    addRoundContactShadow(zenGroup, tallStone.position.x, 0.168, tallStone.position.z, 0.58, 0.54);
    const subStoneA = createNaturalStone(0.13, 0.21, 0.12, 4.7); subStoneA.position.set(islAX + 0.06, 0.24, islAZ + 0.16); subStoneA.rotation.y = -0.6; zenGroup.add(subStoneA);
    addRoundContactShadow(zenGroup, subStoneA.position.x, 0.168, subStoneA.position.z, 0.42, 0.40);

    const islBX = zenX + 0.22, islBZ = centerZ + 1.80;
    const islBMesh = createMossIsland(0.30, 0.36, 0.05); islBMesh.position.set(islBX, 0.182, islBZ); zenGroup.add(islBMesh);
    addRoundContactShadow(zenGroup, islBX, 0.168, islBZ, 0.86, 0.96);
    const midStoneB = createNaturalStone(0.17, 0.24, 0.15, 8.2); midStoneB.position.set(islBX + 0.02, 0.25, islBZ - 0.08); midStoneB.rotation.y = 1.1; zenGroup.add(midStoneB);
    addRoundContactShadow(zenGroup, midStoneB.position.x, 0.168, midStoneB.position.z, 0.54, 0.50);
    const smallStoneB = createNaturalStone(0.10, 0.11, 0.09, 12.5); smallStoneB.position.set(islBX - 0.08, 0.21, islBZ + 0.16); zenGroup.add(smallStoneB);
    addRoundContactShadow(zenGroup, smallStoneB.position.x, 0.168, smallStoneB.position.z, 0.34, 0.32);

    const soloStone = createNaturalStone(0.11, 0.14, 0.10, 16.9); soloStone.position.set(zenX - 0.28, 0.20, centerZ + 0.15); soloStone.rotation.y = 0.8; zenGroup.add(soloStone);
    addRoundContactShadow(zenGroup, soloStone.position.x, 0.168, soloStone.position.z, 0.38, 0.36);

    const centerStoneX = soloStone.position.x, centerStoneZ = soloStone.position.z;
    const rightStoneX = islBX, rightStoneZ = islBZ;
    const intermediateStoneX = centerStoneX + (rightStoneX - centerStoneX) * 0.5 + 0.08;
    const intermediateStoneZ = centerStoneZ + (rightStoneZ - centerStoneZ) * 0.55;
    const intermediateMoss = createMossIsland(0.19, 0.23, 0.025);
    intermediateMoss.position.set(intermediateStoneX, islBMesh.position.y, intermediateStoneZ);
    zenGroup.add(intermediateMoss);
    addRoundContactShadow(zenGroup, intermediateStoneX, 0.168, intermediateStoneZ, 0.48, 0.54);
    const horizontalStone = createNaturalStone(0.12, 0.055, 0.075, 21.3);
    horizontalStone.position.set(intermediateStoneX, soloStone.position.y, intermediateStoneZ);
    horizontalStone.rotation.y = 0.28;
    zenGroup.add(horizontalStone);
    addRoundContactShadow(zenGroup, intermediateStoneX, 0.168, intermediateStoneZ, 0.34, 0.28);
    const smallRestingStone = createNaturalStone(0.06, 0.0275, 0.0375, 26.1);
    smallRestingStone.position.set(intermediateStoneX + 0.11, soloStone.position.y, intermediateStoneZ + 0.035);
    smallRestingStone.rotation.y = -0.42;
    zenGroup.add(smallRestingStone);
    addRoundContactShadow(zenGroup, smallRestingStone.position.x, 0.168, smallRestingStone.position.z, 0.20, 0.16);

    shopGroup.add(zenGroup);
    shopVisualText.position.set(zenX + zenW / 2, 0.018 + shopVisualTextHeight / 2, centerZ);
    // 우측 벽면: 책장 삭제 후 원목 레일 선반 위 앞쪽 절반은 음반(LP), 뒤쪽 절반은 다국어 도서 진열
    const rightWallZ = entryZ - shopD / 2;
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(shopW, shopH, 0.18), plasterWallMat);
    rightWall.position.set(centerX, shopH / 2, rightWallZ);
    rightWall.receiveShadow = true;
    shopGroup.add(rightWall);

    const edgePebbleCount = 850;
    const boundaryPebblesPerWall = 180;
    const floorPebblesPerLane = 240;
    const edgePebbleMesh = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1, 1),
      edgePebbleMat,
      edgePebbleCount
    );
    const shadedPebbleColors = [0xd6cec2, 0xcbc2b5, 0xc2b9ac].map(color => new THREE.Color(color));
    const sunlitPebbleColors = [0xf5efe6, 0xebe2d3, 0xe3ddd3].map(color => new THREE.Color(color));
    const pebbleTransform = new THREE.Object3D();
    const pebbleStartX = entryX - 0.28;
    const pebbleEndX = entryX - shopW + 0.4;
    const pebbleMinX = Math.min(pebbleStartX, pebbleEndX);
    const pebbleMaxX = Math.max(pebbleStartX, pebbleEndX);
    let pebbleRandomSeed = 0x4d595df4;
    const pebbleRandom = () => {
      pebbleRandomSeed = (pebbleRandomSeed * 1664525 + 1013904223) >>> 0;
      return pebbleRandomSeed / 4294967296;
    };
    let pebbleIndex = 0;

    function placeEdgePebble(x, z, isEntrance = false) {
      const rx = 0.065 + pebbleRandom() * 0.030;
      const rz = 0.065 + pebbleRandom() * 0.030;
      const ry = rx * (0.38 + pebbleRandom() * 0.14);
      const y = ry * 0.35;

      pebbleTransform.position.set(isEntrance ? x : Math.min(x, entryX - 0.28), y, z);
      pebbleTransform.rotation.set(
        (pebbleRandom() - 0.5) * 0.24,
        pebbleRandom() * Math.PI * 2,
        (pebbleRandom() - 0.5) * 0.24
      );
      pebbleTransform.scale.set(rx, ry, rz);
      pebbleTransform.updateMatrix();
      edgePebbleMesh.setMatrixAt(pebbleIndex, pebbleTransform.matrix);
      let palette = sunlitPebbleColors;
      if (z < entryZ - 1.8) palette = shadedPebbleColors;
      else if (z > entryZ + 1.8) palette = sunlitPebbleColors;
      edgePebbleMesh.setColorAt(pebbleIndex, palette[Math.floor(pebbleRandom() * palette.length)]);
      pebbleIndex++;
    }

    [
      { z: rightWallZ, side: 1 },
      { z: leftWallZ, side: -1 }
    ].forEach(wallEdge => {
      for (let i = 0; i < boundaryPebblesPerWall; i++) {
        const xProgress = (i + pebbleRandom()) / boundaryPebblesPerWall;
        const x = pebbleStartX + (pebbleEndX - pebbleStartX) * xProgress;
        const z = wallEdge.z + wallEdge.side * (0.12 + pebbleRandom() * 0.24);
        placeEdgePebble(x, z);
      }
    });

    const walkwayClearance = 0.11;
    const floorPebbleLanes = [
      { minZ: entryZ + 1.82 + walkwayClearance, maxZ: leftWallZ - 0.15 },
      { minZ: rightWallZ + 0.15, maxZ: entryZ - 1.82 - walkwayClearance }
    ];
    const floorPebbleColumns = 48;
    const floorPebbleRows = floorPebblesPerLane / floorPebbleColumns;
    floorPebbleLanes.forEach(lane => {
      for (let row = 0; row < floorPebbleRows; row++) {
        for (let column = 0; column < floorPebbleColumns; column++) {
          const xProgress = (column + 0.1 + pebbleRandom() * 0.8) / floorPebbleColumns;
          const zProgress = (row + 0.1 + pebbleRandom() * 0.8) / floorPebbleRows;
          const x = pebbleMinX + xProgress * (pebbleMaxX - pebbleMinX);
          const z = lane.minZ + zProgress * (lane.maxZ - lane.minZ);
          placeEdgePebble(x, z);
        }
      }
    });

    const entrancePebbleCount = 10;
    const entrancePebbleCenters = [];
    const pebbleCheckMatrix = new THREE.Matrix4();
    const deckMinX = woodWalkway.position.x - (shopW - 1.6) / 2;
    const deckMaxX = woodWalkway.position.x + (shopW - 1.6) / 2;
    const deckMinZ = woodWalkway.position.z - 3.6 / 2;
    const deckMaxZ = woodWalkway.position.z + 3.6 / 2;
    const pebbleFootprint = 0.11;
    const entranceClearance = 0.02;
    const entranceMinX = deckMaxX + pebbleFootprint + entranceClearance;
    const entranceMaxX = entryX - pebbleFootprint - entranceClearance;
    const entranceMinZ = entryZ - 1.65 + pebbleFootprint;
    const entranceMaxZ = entryZ + 1.65 - pebbleFootprint;
    let entranceLayoutFound = false;
    for (let attempt = 0; attempt < 10000 && !entranceLayoutFound; attempt++) {
      const candidates = [];
      let isClear = true;
      for (let i = 0; i < entrancePebbleCount; i++) {
        const x = entranceMinX + pebbleRandom() * (entranceMaxX - entranceMinX);
        const z = entranceMinZ + pebbleRandom() * (entranceMaxZ - entranceMinZ);
        const overlapsDeck =
          x + pebbleFootprint >= deckMinX && x - pebbleFootprint <= deckMaxX &&
          z + pebbleFootprint >= deckMinZ && z - pebbleFootprint <= deckMaxZ;
        if (x < entranceMinX || x > entranceMaxX || z < entranceMinZ || z > entranceMaxZ || overlapsDeck) {
          isClear = false;
          break;
        }
        for (let j = 0; j < pebbleIndex; j++) {
          edgePebbleMesh.getMatrixAt(j, pebbleCheckMatrix);
          const elements = pebbleCheckMatrix.elements;
          if (Math.hypot(x - elements[12], z - elements[14]) < 0.24) { isClear = false; break; }
        }
        for (let j = 0; isClear && j < candidates.length; j++) {
          if (Math.hypot(x - candidates[j].x, z - candidates[j].z) < 0.24) isClear = false;
        }
        if (!isClear) break;
        candidates.push({ x, z });
      }
      if (isClear && candidates.length === entrancePebbleCount) {
        entrancePebbleCenters.push(...candidates);
        entranceLayoutFound = true;
      }
    }
    if (!entranceLayoutFound) console.error('Unable to place all entrance pebbles within the safe walkway bounds.');
    entrancePebbleCenters.forEach(({ x, z }) => placeEdgePebble(x, z, true));

    edgePebbleMesh.instanceMatrix.needsUpdate = true;
    edgePebbleMesh.instanceColor.needsUpdate = true;
    edgePebbleMesh.castShadow = false;
    shopGroup.add(edgePebbleMesh);

    const railLightMat = new THREE.MeshBasicMaterial({ color: 0xffb36b });
    const railShelves = [
      { offset: 3.26, width: 3.54, y: 1.82 },
      { offset: 6.9, width: 3.36, y: 1.82 },
      { offset: 3.26, width: 3.54, y: 1.15 },
      { offset: 6.45, width: 2.55, y: 1.15 }
    ];
    railShelves.forEach(({ offset, width, y }) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(width, 0.038, 0.09), cedarWoodMat);
      rail.position.set(entryX - offset, y, rightWallZ + 0.13);
      staticShadowCasters.push(rail);
      shopGroup.add(rail);
      addRectContactShadow(shopGroup, entryX - offset, y - 0.09, rightWallZ + 0.093, width, 0.22);
    });

    railShelves.forEach(({ offset, width, y: railY }) => {
      const railLightBar = new THREE.Mesh(new THREE.BoxGeometry(width, 0.008, 0.025), railLightMat);
      railLightBar.position.set(entryX - offset, railY - 0.022, rightWallZ + 0.14);
      shopGroup.add(railLightBar);
    });

    const railLight = new THREE.PointLight(0xffb066, 1.55, 9.5, 1.4);
    railLight.position.set(entryX - 5.4, 2.35, rightWallZ + 1.8);
    railLight.castShadow = false;
    shopGroup.add(railLight);

    function createDisplayCoverTex(title, sub, bgHex, accentHex, isBook) {
      const c = document.createElement('canvas'); c.width = 256; c.height = 256;
      const g = c.getContext('2d');
      g.fillStyle = bgHex; g.fillRect(0, 0, 256, 256);

      if (isBook) {
        g.strokeStyle = accentHex; g.lineWidth = 2.5;
        g.strokeRect(22, 22, 212, 212);
        g.fillStyle = accentHex;
        g.fillRect(22, 165, 90, 2.5);
        g.fillStyle = '#f5f2eb'; g.font = '700 19px sans-serif';
        g.fillText(title.slice(0, 14), 32, 82);
        if (title.length > 14) g.fillText(title.slice(14, 28), 32, 110);
        g.font = '400 13px sans-serif'; g.fillStyle = 'rgba(245,242,235,0.75)';
        g.fillText(sub.slice(0, 24), 32, 195);
      } else {
        g.strokeStyle = accentHex; g.lineWidth = 3;
        g.beginPath(); g.arc(128, 138, 64, 0, Math.PI * 2); g.stroke();
        g.fillStyle = accentHex;
        g.beginPath(); g.arc(128, 138, 16, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#f5f2eb'; g.font = '700 20px sans-serif'; g.fillText(title, 22, 38);
        g.font = '400 13px sans-serif'; g.fillStyle = 'rgba(245,242,235,0.72)'; g.fillText(sub, 22, 58);
      }
      return new THREE.CanvasTexture(c);
    }

    // 이미지 파일을 텍스처로 안전하게 불러와 재질에 입히는 공통 헬퍼
    function applyCoverImage(material, baseName) {
      const paths = [
        `./media/${baseName}.jpeg`, `./media/${baseName}.jpg`, `./media/${baseName}.png`,
        `./${baseName}.jpeg`, `./${baseName}.jpg`, `./${baseName}.png`
      ];
      function tryIdx(i) {
        if (i >= paths.length) return;
        const img = new Image();
        img.onload = () => {
          const loadedTex = new THREE.Texture(img);
          loadedTex.needsUpdate = true;
          material.map = loadedTex;
          material.needsUpdate = true;
        };
        img.onerror = () => tryIdx(i + 1);
        img.src = paths.at(i);
      }
      tryIdx(0);
    }

    // 선반 앞쪽 절반: 음반(LP) 상단 진열 (./media/lp1.jpeg ~ lp4.jpeg 순환 적용)
    const vinylItems = [
      { itemId: 'sanctuary-vol-01', img: 'lp1', cover: 'media/lp1.jpg', title: 'SANCTUARY VOL.01', sub: 'Ambient & Field Recordings (LP)', artist: '', bg: '#1c1d21', accent: '#d97736', desc: '리스닝룸의 밤과 공간 잔향을 담은 바이닐 에디션입니다.', links: [{ label: 'Bandcamp 음반 듣기 / 구매', url: 'https://bandcamp.com' }, { label: 'Spotify 스트리밍', url: 'https://spotify.com' }] },
      { itemId: 'stillness-in-wood', img: 'lp2', cover: 'media/lp2.jpg', title: 'STILLNESS IN WOOD', sub: 'Electro-Acoustic Sessions (LP)', artist: '', bg: '#2b1810', accent: '#e0a96d', desc: '진공관 앰프와 원목 디퓨저의 울림을 녹음한 180g LP입니다.', links: [{ label: 'Bandcamp 음반 듣기 / 구매', url: 'https://bandcamp.com' }, { label: 'Apple Music 스트리밍', url: 'https://apple.com' }] },
      { itemId: 'kyoto-rain-tape', img: 'lp3', cover: 'media/lp3.jpg', title: 'KYOTO RAIN TAPE', sub: 'Analog Cassette & Digital', artist: '', bg: '#1a2421', accent: '#65c938', desc: '비 내리는 정원의 소리와 신시사이저를 결합한 앨범입니다.', links: [{ label: 'Bandcamp 음반 듣기 / 구매', url: 'https://bandcamp.com' }] },
      { itemId: 'nocturne-study', img: 'lp4', cover: '', title: 'NOCTURNE STUDY', sub: 'Minimal Piano & Modular (LP)', artist: '', bg: '#231f20', accent: '#93c5fd', desc: '깊은 새벽 사색과 독서를 위해 작곡된 미니멀 피아노 음반입니다.', links: [{ label: 'Bandcamp 음반 듣기 / 구매', url: 'https://bandcamp.com' }] }
    ];
    const displayXOffsets = [1.9, 2.6, 3.3, 4.0, 4.7];
    [2.02].forEach(y => displayXOffsets.forEach((offset, index) => {
      const item = { ...vinylItems[index % vinylItems.length], x: entryX - offset, y };
      const lpGroup = new THREE.Group();
      const sleeveMat = new THREE.MeshStandardMaterial({
        map: createDisplayCoverTex(item.title, item.sub, item.bg, item.accent, false),
        roughness: 0.42
      });
      applyCoverImage(sleeveMat, item.img);

      const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.014), sleeveMat);
      staticShadowCasters.push(sleeve);
      lpGroup.add(sleeve);

      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.17, 0.17, 0.004, 32),
        new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.2, metalness: 0.6 })
      );
      disc.rotation.x = Math.PI / 2;
      disc.position.set(0.09, 0, -0.004);
      lpGroup.add(disc);

      lpGroup.position.set(item.x, item.y, rightWallZ + 0.14);
      lpGroup.rotation.x = -0.08;
      addRectContactShadow(shopGroup, item.x + 0.035, item.y - 0.035, rightWallZ + 0.094, 0.44, 0.42);
      const coverImage = sleeveMat.map && sleeveMat.map.image instanceof HTMLCanvasElement
        ? sleeveMat.map.image.toDataURL('image/png')
        : '';
      const shopItem = {
        itemId: item.itemId,
        itemType: 'album',
        titleEn: item.sub,
        subtitleKo: item.title,
        artist: item.artist,
        cover: item.cover || coverImage,
        category: 'VINYL & SOUND ARCHIVE',
        title: item.title,
        subtitle: item.sub,
        description: item.desc,
        links: item.links
      };
      sleeve.userData.shopItem = shopItem;
      disc.userData.shopItem = shopItem;
      clickables.push(sleeve, disc);
      shopGroup.add(lpGroup);
    }));

    // 선반 뒤쪽 절반: 다국어 큐레이션 도서 2개 층 진열
    const paperPageMat = new THREE.MeshStandardMaterial({ color: 0xebe5d8, roughness: 0.90 });
    const bookItems = [
      { id: 'creativeAct', itemId: 'creativeAct', itemType: 'book', cover: 'media/book1.jpg', titleEn: 'The Creative Act: A Way of Being', subtitleKo: '창조적 행위: 존재의 방식', author: '릭 루빈 · Rick Rubin', img: 'book1', title: 'The Creative Act: A Way of Being', sub: 'Rick Rubin · 창작과 예술', bg: '#d6d5ca', accent: '#202020', desc: '창작의 태도와 예술적 영감을 다룬 릭 루빈의 에세이입니다.', links: [{ label: '🇰🇷 한국어 전자책 (교보문고)', url: 'https://kyobobook.co.kr' }, { label: '🇺🇸 English eBook (Amazon Kindle)', url: 'https://amazon.com' }] },
      { itemId: 'pillow-book', itemType: 'book', cover: 'media/book2.jpg', titleEn: 'The Pillow Book', subtitleKo: '마쿠라노소시 (枕草子)', author: '세이 쇼나곤 · 고전 일본 문학', img: 'book2', title: '마쿠라노소시 (枕草子)', sub: '세이 쇼나곤 · 고전 일본 문학', bg: '#e6d58f', accent: '#161616', desc: '헤이안 시대 궁중 생활과 사색을 담은 일본 고전 수필입니다.', links: [{ label: '🇰🇷 한국어 전자책 (교보문고)', url: 'https://kyobobook.co.kr' }, { label: '🇺🇸 English eBook (Amazon Kindle)', url: 'https://amazon.com' }, { label: '🇯🇵 日本語 電子書籍 (Kindle JP)', url: 'https://amazon.co.jp' }] },
      { itemId: 'against-interpretation', itemType: 'book', cover: 'media/book3.png', titleEn: 'Against Interpretation', subtitleKo: '해석에 반하여', author: '수전 손택 · 비평 에세이', img: 'book3', title: '해석에 반하여 (Against Interpretation)', sub: '수전 손택 · 비평 에세이', bg: '#171717', accent: '#d1d5db', desc: '예술과 감상의 관습을 새롭게 바라보는 수전 손택의 대표 에세이집입니다.', links: [{ label: '🇰🇷 한국어 전자책 (교보문고)', url: 'https://kyobobook.co.kr' }, { label: '🇺🇸 English eBook (Amazon Kindle)', url: 'https://amazon.com' }] },
      { itemId: 'on-photography', itemType: 'book', cover: 'media/book4.png', titleEn: 'On Photography', subtitleKo: '사진에 관하여', author: '수전 손택 · 사진과 비평', img: 'book4', title: '사진에 관하여 (On Photography)', sub: '수전 손택 · 사진과 비평', bg: '#eeeae3', accent: '#b83232', desc: '사진의 의미와 이미지가 사회에 미치는 영향을 탐구한 비평 에세이입니다.', links: [{ label: '🇰🇷 한국어 전자책 (교보문고)', url: 'https://kyobobook.co.kr' }, { label: '🇺🇸 English eBook (Amazon Kindle)', url: 'https://amazon.com' }] },
      { id: 'berlin-diary', itemId: 'berlin-diary', itemType: 'book', cover: 'media/book5.png', titleEn: 'Berlin Diary', subtitleKo: '베를린 일기', author: '최민석 · Choi Min-seok', img: 'book5', title: '베를린 일기', sub: '최민석 · 여행 에세이', bg: '#eaa6bb', accent: '#2d2930', desc: '베를린에서의 일상과 여행을 담은 최민석의 에세이입니다.', links: [{ label: '🇰🇷 한국어 전자책 (교보문고)', url: 'https://kyobobook.co.kr' }, { label: '🇺🇸 English eBook (Amazon Kindle)', url: 'https://amazon.com' }] }
    ];
    const bookXOffsets = [5.5, 6.2, 6.9, 7.6, 8.3];
    const coffeeXOffsets = [6.16, 6.58, 7.00, 7.42];
    const coffeeItems = [
      { color: 0xf2f0eb, title: 'MOLIP COFFEE — WHITE BLEND', subtitle: '스페셜티 원두 · 화이트 블렌드', description: '상품 준비중입니다.\nThis item is currently being prepared.', links: [] },
      { color: 0x18191c, title: 'MOLIP COFFEE — DARK ROAST', subtitle: '스페셜티 원두 · 다크 로스트', description: '상품 준비중입니다.\nThis item is currently being prepared.', links: [] },
      { color: 0x4d6b53, title: 'MOLIP COFFEE — KYOTO FOREST', subtitle: '스페셜티 원두 · 교토 포레스트', description: '상품 준비중입니다.\nThis item is currently being prepared.', links: [] },
      { color: 0xe8e2d5, title: 'MOLIP COFFEE — DECAF SANCTUARY', subtitle: '스페셜티 원두 · 디카페인', description: '상품 준비중입니다.\nThis item is currently being prepared.', links: [] }
    ];
    const coffeeLabelCanvas = document.createElement('canvas');
    coffeeLabelCanvas.width = 256;
    coffeeLabelCanvas.height = 280;
    const coffeeLabelContext = coffeeLabelCanvas.getContext('2d');
    coffeeLabelContext.fillStyle = '#e5cdb1';
    coffeeLabelContext.fillRect(0, 0, 256, 280);
    coffeeLabelContext.fillStyle = '#161514';
    coffeeLabelContext.font = '800 38px sans-serif';
    coffeeLabelContext.textAlign = 'center';
    coffeeLabelContext.textBaseline = 'middle';
    coffeeLabelContext.fillText('MOLIP', 128, 62);
    coffeeLabelContext.fillText('COFFEE', 128, 108);
    coffeeLabelContext.strokeStyle = '#8b6348';
    coffeeLabelContext.lineWidth = 2;
    coffeeLabelContext.beginPath();
    coffeeLabelContext.moveTo(38, 164);
    coffeeLabelContext.bezierCurveTo(72, 140, 96, 188, 128, 164);
    coffeeLabelContext.bezierCurveTo(160, 140, 184, 188, 218, 164);
    coffeeLabelContext.stroke();
    coffeeLabelContext.beginPath();
    coffeeLabelContext.moveTo(58, 178);
    coffeeLabelContext.bezierCurveTo(92, 158, 164, 198, 198, 178);
    coffeeLabelContext.stroke();
    coffeeLabelContext.fillStyle = '#51463c';
    coffeeLabelContext.font = '500 16px sans-serif';
    coffeeLabelContext.fillText('500g  Whole Bean', 128, 238);
    const coffeeLabelTex = new THREE.CanvasTexture(coffeeLabelCanvas);
    const coffeeLabelMat = new THREE.MeshStandardMaterial({
      map: coffeeLabelTex,
      roughness: 0.62,
      metalness: 0.04
    });

    function createCoffeeBag(item, x, y) {
      const bagGroup = new THREE.Group();
      const pouchMat = new THREE.MeshStandardMaterial({
        color: item.color,
        roughness: 0.62,
        metalness: 0.04
      });
      const pouchBody = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.26, 0.095), pouchMat);
      pouchBody.position.y = 0.13;
      bagGroup.add(pouchBody);
      const topSeal = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.065, 0.014), pouchMat);
      topSeal.position.y = 0.285;
      bagGroup.add(topSeal);
      const frontLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.155, 0.175), coffeeLabelMat);
      frontLabel.position.set(0, 0.13, 0.049);
      bagGroup.add(frontLabel);

      const shopItem = {
        category: 'SPECIALTY COFFEE ARCHIVE',
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        links: item.links
      };
      pouchBody.userData.shopItem = shopItem;
      clickables.push(pouchBody);
      bagGroup.rotation.x = 0;
      bagGroup.position.set(x, y, rightWallZ + 0.135);
      addRectContactShadow(shopGroup, x + 0.035, y + 0.14, rightWallZ + 0.094, 0.34, 0.42);
      shopGroup.add(bagGroup);
    }

    [2.02, 1.35].forEach(y => {
      const rowXOffsets = y < 1.7 ? coffeeXOffsets : bookXOffsets;
      rowXOffsets.forEach((offset, index) => {
        if (y < 1.7) {
          createCoffeeBag(coffeeItems[index], entryX - offset, 1.169);
          return;
        }
        const bk = { ...bookItems[index % bookItems.length], x: entryX - offset, y };
        const bookGroup = new THREE.Group();
        const frontCoverMat = new THREE.MeshStandardMaterial({
          map: createDisplayCoverTex(bk.title, bk.sub, bk.bg, bk.accent, true),
          roughness: 0.55
        });
        applyCoverImage(frontCoverMat, bk.img);

        const boardMat = new THREE.MeshStandardMaterial({ color: bk.bg, roughness: 0.72 });

        // 실제 양장본 책 구조: 앞표지(원본 이미지) + 뒷표지 + 책등 + 안쪽 크림색 종이 페이지 블록
        const frontBoard = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.36, 0.004), frontCoverMat);
        frontBoard.position.z = 0.014;
        staticShadowCasters.push(frontBoard);
        bookGroup.add(frontBoard);

        const backBoard = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.36, 0.004), boardMat);
        backBoard.position.z = -0.014;
        bookGroup.add(backBoard);

        const spineBoard = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.36, 0.032), boardMat);
        spineBoard.position.x = 0.13;
        bookGroup.add(spineBoard);

        const pagesBlock = new THREE.Mesh(new THREE.BoxGeometry(0.252, 0.348, 0.024), paperPageMat);
        pagesBlock.position.x = -0.002;
        bookGroup.add(pagesBlock);

        bookGroup.position.set(bk.x, bk.y, rightWallZ + 0.14);
        bookGroup.rotation.x = -0.08;
        addRectContactShadow(shopGroup, bk.x + 0.035, bk.y - 0.035, rightWallZ + 0.094, 0.34, 0.42);
        const shopItem = {
          itemId: bk.itemId || bk.id,
          bookId: bk.id || bk.itemId,
          itemType: bk.itemType || 'book',
          titleEn: bk.titleEn || bk.title,
          subtitleKo: bk.subtitleKo || bk.sub,
          author: bk.author || '',
          cover: bk.cover || '',
          category: 'MULTILINGUAL E-BOOK CURATION',
          title: bk.title,
          subtitle: bk.sub,
          description: bk.desc,
          links: bk.links
        };
        [frontBoard, backBoard, spineBoard, pagesBlock].forEach(mesh => {
          mesh.userData.shopItem = shopItem;
          clickables.push(mesh);
        });
        shopGroup.add(bookGroup);
      });
    });

    const book6CoverTexture = new THREE.TextureLoader().load('media/book_6.jpeg');
    if (THREE.SRGBColorSpace !== undefined) {
      book6CoverTexture.colorSpace = THREE.SRGBColorSpace;
    } else if (THREE.sRGBEncoding !== undefined) {
      book6CoverTexture.encoding = THREE.sRGBEncoding;
    }
    const book6CoverMat = new THREE.MeshStandardMaterial({
      map: book6CoverTexture,
      roughness: 0.55,
      metalness: 0.02
    });
    const book6PaperMat = new THREE.MeshStandardMaterial({ color: 0xede6d8, roughness: 0.90 });
    const book6Tilt = 0.08;
    const book6ShelfTopY = 1.17;
    const book6X = entryX - (4.7 + 6.16) / 2;
    const book6Mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.21, 0.30, 0.022),
      [
        book6PaperMat, book6PaperMat, book6PaperMat,
        book6PaperMat, book6CoverMat, book6PaperMat
      ]
    );
    book6Mesh.position.set(
      book6X,
      book6ShelfTopY + Math.cos(book6Tilt) * 0.15 + Math.sin(book6Tilt) * 0.011,
      rightWallZ + 0.14
    );
    book6Mesh.rotation.x = -book6Tilt;
    staticShadowCasters.push(book6Mesh);
    shopGroup.add(book6Mesh);
    book6Mesh.userData.shopItem = {
      itemId: 'sound-of-tokyo',
      itemType: 'book',
      titleEn: 'Sound of Tokyo',
      subtitleKo: 'Tokyo Guidebook',
      author: '',
      cover: 'media/book_6.jpeg',
      category: 'MULTILINGUAL E-BOOK CURATION',
      title: 'Sound of Tokyo',
      subtitle: 'Tokyo Guidebook',
      description: 'A guidebook to the sound and atmosphere of Tokyo.',
      links: []
    };
    clickables.push(book6Mesh);

    // 선반 뒤쪽 미니멀 티셔츠 행거 2조 배치
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x16171a, roughness: 0.35, metalness: 0.8 });
    function applyTeePrintImage(material, baseName) {
      const paths = [`./media/${baseName}.jpeg`, `./media/${baseName}.png`, `./media/${baseName}.jpg`];
      function tryIdx(i) {
        if (i >= paths.length) return;
        const img = new Image();
        img.onload = () => {
          const loadedTex = new THREE.Texture(img);
          loadedTex.needsUpdate = true;
          material.map = loadedTex;
          material.needsUpdate = true;
        };
        img.onerror = () => tryIdx(i + 1);
        img.src = paths.at(i);
      }
      tryIdx(0);
    }

    function createApparelRack(rxPos, teeList) {
      const rackGroup = new THREE.Group();
      const rackW = 1.05, rackH = 1.54;
      [-rackW / 2, rackW / 2].forEach(rx => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, rackH, 12), steelMat);
        post.position.set(rx, rackH / 2, 0); rackGroup.add(post);
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.022, 0.42), cedarWoodMat);
        foot.position.set(rx, 0.011, 0); rackGroup.add(foot);
      });
      const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, rackW + 0.04, 12), steelMat);
      topBar.rotation.z = Math.PI / 2; topBar.position.set(0, rackH, 0); rackGroup.add(topBar);

      teeList.forEach(ts => {
        const teeGroup = new THREE.Group();
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.60, 0.048), new THREE.MeshStandardMaterial({ color: ts.color, roughness: 0.92 }));
        torso.position.y = -0.36; teeGroup.add(torso);
        [-0.26, 0.26].forEach((sx, idx) => {
          const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.21, 0.044), new THREE.MeshStandardMaterial({ color: ts.color, roughness: 0.92 }));
          sleeve.position.set(sx, -0.16, 0); sleeve.rotation.z = idx === 0 ? 0.35 : -0.35; teeGroup.add(sleeve);
        });
        teeGroup.position.set(ts.x, rackH - 0.02, 0); teeGroup.rotation.y = Math.PI / 2;
        const shopItem = { category: 'ARCHIVE APPAREL & GOODS', title: ts.name, subtitle: '100% Organic Heavy Cotton · Limited Edition', description: '상품 준비중입니다.\nThis item is currently being prepared.', links: [] };
        torso.userData.shopItem = shopItem;
        clickables.push(torso);
        if (ts.printImg) {
          const printMat = new THREE.MeshStandardMaterial({ roughness: 0.88, transparent: true });
          applyTeePrintImage(printMat, ts.printImg);
          const printPatch = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.20), printMat);
          printPatch.position.set(0, -0.28, 0.0255);
          printPatch.userData.shopItem = shopItem;
          teeGroup.add(printPatch);
          clickables.push(printPatch);
        }
        if (ts.printText) {
          const textCanvas = document.createElement('canvas');
          textCanvas.width = 256;
          textCanvas.height = 200;
          const textContext = textCanvas.getContext('2d');
          const textLines = ts.printText.split('\n');
          const lineHeight = 56;
          const firstLineY = textLines.length === 2 ? 78 : 100 - ((textLines.length - 1) * lineHeight) / 2;
          textContext.clearRect(0, 0, 256, 200);
          textContext.fillStyle = ts.printColor || '#ffffff';
          textContext.font = textLines.length > 1 ? '700 34px sans-serif' : '700 54px sans-serif';
          textContext.textAlign = 'center';
          textContext.textBaseline = 'middle';
          textLines.forEach((line, index) => {
            textContext.fillText(line, 128, firstLineY + index * lineHeight);
          });
          const textTex = new THREE.CanvasTexture(textCanvas);
          const printTextMat = new THREE.MeshStandardMaterial({
            map: textTex,
            transparent: true,
            roughness: 0.88
          });
          const textPatch = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.20), printTextMat);
          textPatch.position.set(0, -0.28, 0.0255);
          textPatch.userData.shopItem = shopItem;
          teeGroup.add(textPatch);
          clickables.push(textPatch);
        }
        rackGroup.add(teeGroup);
      });
      addRoundContactShadow(rackGroup, 0, 0.012, 0, 1.55, 0.72);
      rackGroup.position.set(rxPos, 0, rightWallZ + 0.48);
      shopGroup.add(rackGroup);
    }

    createApparelRack(entryX - 10.2, [
      { x: -0.22, color: 0x16171a, name: 'SANCTUARY HEAVYWEIGHT TEE (CHARCOAL)', printText: 'What is TRUE\nfor me', printColor: '#f5c542' },
      { x: 0.22,  color: 0xd8d0c3, name: 'SANCTUARY ARCHIVE TEE (OATMEAL)', printImg: 'tee_logo' }
    ]);
    createApparelRack(entryX - 11.5, [
      { x: -0.22, color: 0xdcb038, name: 'SANCTUARY ARCHIVE TEE (YELLOW)', printText: 'FCL.MND', printColor: '#111111' },
      { x: 0.22,  color: 0x3b2418, name: 'ACOUSTIC WAVE TOTE & TEE (WALNUT)', printText: 'Techno' }
    ]);

    // 통창 정원과 Zen 정원 측면 조명
    function enableStaticLightShadow(light) {
      light.castShadow = true;
      light.shadow.mapSize.set(1024, 1024);
      light.shadow.bias = -0.001;
    }
    const gardenLight = new THREE.PointLight(0xffebd2, 1.35, 9.0, 1.4);
    gardenLight.position.set(centerX, 2.8, leftWallZ - 0.5);
    shopGroup.add(gardenLight);

    const spLight = new THREE.PointLight(0xffdca8, 1.45, 8.5, 1.4);
    spLight.position.set(endWallX + 1.8, 2.6, centerZ + 1.2);
    enableStaticLightShadow(spLight);
    shopGroup.add(spLight);

    const entryGlowLight = new THREE.PointLight(0xffcf96, 1.1, 7.5, 1.5);
    entryGlowLight.position.set(entryX - 2.2, 3.1, entryZ);
    entryGlowLight.visible = true;
    shopGroup.add(entryGlowLight);

    const entryTriggerMesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3.4, 2.6), new THREE.MeshBasicMaterial({ visible: false }));
    entryTriggerMesh.position.set(entryX + 0.1, 1.7, entryZ);
    shopGroup.add(entryTriggerMesh);

    const shopFloorMesh = new THREE.Mesh(new THREE.PlaneGeometry(shopW + 1.2, shopD + 0.4), new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }));
    shopFloorMesh.rotation.x = -Math.PI / 2; shopFloorMesh.position.set(centerX + 0.4, 0.03, centerZ);
    shopGroup.add(shopFloorMesh);

    const count = 46;
    const louverGeometry = new THREE.BoxGeometry(0.036, 0.135, shopD - 0.08, 1, 1, 32);
    const louverMat = new THREE.MeshStandardMaterial({
      map: tex.mkWood('#180b04', '#070301'),
      roughness: 0.45,
      emissive: new THREE.Color(0x100703),
      emissiveIntensity: 0.16,
      fog: false
    });
    const louverGroup = new THREE.Group();
    shopGroup.add(louverGroup);
    const startX = entryX - 0.30;
    const endX = endWallX + 0.18;
    for (let i = 0; i < count; i++) {
      const slatX = startX + (endX - startX) * (i / 45);
      const slatGeometry = louverGeometry.clone();
      const slatPositions = slatGeometry.attributes.position;
      const slatRotationZ = Math.cos(i * 0.36) * 0.38;
      const depthScale = 0.65 + (i / 45) * 0.65;
      for (let vertexIndex = 0; vertexIndex < slatPositions.count; vertexIndex++) {
        const z = centerZ + slatPositions.getZ(vertexIndex);
        const wave = Math.sin(z * 1.7 + slatX * 0.9) * 0.085 * depthScale;
        const maxY = (0.19 - slatPositions.getX(vertexIndex) * Math.sin(slatRotationZ)) / Math.cos(slatRotationZ);
        slatPositions.setY(vertexIndex, Math.min(slatPositions.getY(vertexIndex) + wave, maxY));
      }
      slatPositions.needsUpdate = true;
      slatGeometry.computeVertexNormals();
      const slat = new THREE.Mesh(slatGeometry, louverMat);
      slat.position.set(
        slatX,
        shopH - 0.19,
        centerZ
      );
      slat.rotation.z = slatRotationZ;
      louverGroup.add(slat);
    }

    shopGroup.traverse(object => {
      if (object.isMesh) {
        object.castShadow = false;
        object.receiveShadow = false;
      }
    });
    staticShadowCasters.forEach(object => { object.castShadow = true; });
    [rightWall, shopFloor, woodWalkway, sandBed].forEach(object => { object.receiveShadow = true; });

    scene.add(shopGroup);

    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = 'position:fixed;inset:0;background:rgba(4,4,6,0.68);backdrop-filter:blur(8px);display:none;align-items:center;justify-content:center;z-index:100;';
    const modalCard = document.createElement('div');
    modalCard.style.cssText = 'width:min(440px,90vw);background:#121318;border:1px solid rgba(255,255,255,0.16);border-radius:18px;padding:24px;color:#f3f4f6;box-shadow:0 24px 60px rgba(0,0,0,0.65);font-family:-apple-system,BlinkMacSystemFont,sans-serif;';
    modalOverlay.appendChild(modalCard);
    document.body.appendChild(modalOverlay);
    modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) modalOverlay.style.display = 'none'; });

    function openItemModal(item) {
      const linksHtml = item.links.length
        ? item.links.map(lk => `<a href="${lk.url}" target="_blank" rel="noopener noreferrer" style="display:block;padding:11px 14px;margin-top:8px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.14);border-radius:10px;color:#fde68a;text-decoration:none;font-size:13.5px;font-weight:600;">${lk.label} ↗</a>`).join('')
        : '<span style="display:inline-block;margin-top:8px;padding:7px 10px;border:1px solid rgba(217,119,54,0.4);border-radius:999px;color:#d97736;font-size:10px;font-weight:700;letter-spacing:0.1em;">COMING SOON</span>';
      modalCard.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span style="font-size:11px;letter-spacing:0.12em;color:#d97736;font-weight:700;">${item.category}</span><button id="close-shop-modal" style="background:none;border:none;color:#9ca3af;font-size:18px;cursor:pointer;">✕</button></div><h3 style="margin:0 0 4px 0;font-size:19px;color:#ffffff;">${item.title}</h3><div style="font-size:13px;color:#9ca3af;margin-bottom:14px;">${item.subtitle}</div><p style="margin:0 0 16px 0;font-size:13.5px;line-height:1.55;color:#d1d5db;white-space:pre-line;">${item.description}</p><div>${linksHtml}</div>`;
      modalOverlay.style.display = 'flex';
      const closeBtn = document.getElementById('close-shop-modal');
      if (closeBtn) closeBtn.onclick = () => { modalOverlay.style.display = 'none'; };
    }

    return {
      group: shopGroup,
      clickables: clickables,
      entryTrigger: entryTriggerMesh,
      floorMesh: shopFloorMesh,
      openItemModal: openItemModal,
      shopVideoEl: shopVideoEl,
      shopArtMat: shopArtMat
    };
  }
};
