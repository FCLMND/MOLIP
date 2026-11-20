window.DJAvatarSystem = {
  create: function(arg1, arg2, arg3) {
    var tex = (arg1 && typeof arg1 === 'object') ? arg1 : window.RoomTextures;
    var initialText = (typeof arg1 === 'string') ? arg1 : (arg2 || 'FCLMND');
    var flagCode = (typeof arg1 === 'string') ? (arg2 || 'KR') : (arg3 || 'KR');
    const HEAD_RADIUS = 0.089;
    const HEAD_HALF_HEIGHT = 0.114;
    const HEAD_Y = 0.576;
    const NECK_BASE_RADIUS = 0.040;
    const NECK_TOP_RADIUS = 0.033;
    const NECK_TOP_Y = 0.472;
    const BASE_LOWER_LEG_LENGTH = 0.32;
    const LOWER_LEG_LENGTH = BASE_LOWER_LEG_LENGTH * 1.11;
    const LOWER_LEG_GROUND_OFFSET = LOWER_LEG_LENGTH - BASE_LOWER_LEG_LENGTH;

    var crimsonBodyMat = new THREE.MeshPhysicalMaterial({
      color: 0xf4efe6,
      emissive: new THREE.Color(0xdfd7c8),
      emissiveIntensity: 0.14,
      roughness: 0.42,
      metalness: 0.04,
      clearcoat: 0.90,
      clearcoatRoughness: 0.12,
      transparent: true,
      opacity: 0.72,
      depthTest: true,
      depthWrite: true
    });

    var crimsonHeadMat = new THREE.MeshPhysicalMaterial({
      color: 0xf4efe6,
      emissive: new THREE.Color(0xdfd7c8),
      emissiveIntensity: 0.14,
      roughness: 0.42,
      metalness: 0.04,
      clearcoat: 0.92,
      clearcoatRoughness: 0.12,
      transparent: true,
      opacity: 0.72,
      depthTest: true,
      depthWrite: true
    });

    function createSmoothCapsuleGeo(topR, botR, length) {
      var pts = new Array();
      for (var i = 0; i <= 28; i++) {
        var u = i / 28;
        var y = -length + u * length;
        var r = 0.001;
        if (u < 0.16) r = botR * Math.sin((u / 0.16) * Math.PI * 0.5);
        else if (u > 0.84) r = topR * Math.sin(((1 - u) / 0.16) * Math.PI * 0.5);
        else r = botR + (topR - botR) * ((u - 0.16) / 0.68);
        pts.push(new THREE.Vector2(Math.max(0.001, r), y));
      }
      return new THREE.LatheGeometry(pts, 24);
    }

    var eggPts = new Array();
    for (var i = 0; i <= 24; i++) {
      var t = (i / 24) * Math.PI;
      var y = -Math.cos(t) * HEAD_HALF_HEIGHT;
      var r = Math.max(0.001, Math.sin(t) * HEAD_RADIUS * (1.0 - 0.16 * Math.cos(t)));
      eggPts.push(new THREE.Vector2(r, y));
    }
    var eggHeadGeo = new THREE.LatheGeometry(eggPts, 32);
    eggHeadGeo.scale(0.95, 1.0, 1.04);

    var torsoProfile = new THREE.SplineCurve([
      new THREE.Vector2(0.001, -0.025), new THREE.Vector2(0.090, 0.035),
      new THREE.Vector2(0.125, 0.095), new THREE.Vector2(0.128, 0.155),
      new THREE.Vector2(0.138, 0.215), new THREE.Vector2(0.146, 0.275),
      new THREE.Vector2(0.150, 0.315), new THREE.Vector2(0.152, 0.355),
      new THREE.Vector2(0.145, 0.370), new THREE.Vector2(0.122, 0.382),
      new THREE.Vector2(0.085, 0.395),
      new THREE.Vector2(NECK_BASE_RADIUS, 0.415),
      new THREE.Vector2(0.0375, 0.435),
      new THREE.Vector2(0.0345, 0.454),
      new THREE.Vector2(NECK_TOP_RADIUS, NECK_TOP_Y)
    ]).getPoints(24).map(function(point) {
      return new THREE.Vector2(Math.max(0.001, point.x), point.y);
    });
    var sculptTorsoGeo = new THREE.LatheGeometry(torsoProfile, 24);
    sculptTorsoGeo.scale(1.02, 1.0, 0.63);

    var thighGeo = createSmoothCapsuleGeo(0.052, 0.044, 0.35);
    var calfGeo = createSmoothCapsuleGeo(0.044, 0.034, LOWER_LEG_LENGTH);
    var upperArmGeo = createSmoothCapsuleGeo(0.041, 0.034, 0.28);
    var forearmGeo = createSmoothCapsuleGeo(0.034, 0.025, 0.25);
    var jointBlendGeo = new THREE.SphereGeometry(1, 12, 8);

    function addJointBlend(pivot, radius) {
      var blend = new THREE.Mesh(jointBlendGeo, crimsonBodyMat);
      blend.scale.setScalar(radius);
      blend.castShadow = true;
      pivot.add(blend);
    }

    var root = new THREE.Group();
    root.position.set(0, 0.05 + LOWER_LEG_GROUND_OFFSET, -1.16);
    root.rotation.y = Math.PI;

    var pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.132, 24, 18), crimsonBodyMat);
    pelvis.scale.set(1.08, 0.68, 0.72);
    pelvis.position.set(0, 0.08, 0.02);
    root.add(pelvis);

    var sides = new Array(-1, 1);
    for (var s = 0; s < sides.length; s++) {
      var side = sides.at(s);
      var thighPivot = new THREE.Group();
      thighPivot.position.set(side * 0.082, 0.08, 0.0);
      thighPivot.rotation.x = 1.48;
      thighPivot.rotation.z = side * -0.58;
      var thigh = new THREE.Mesh(thighGeo, crimsonBodyMat);
      thigh.castShadow = true;
      thighPivot.add(thigh);

      var calfPivot = new THREE.Group();
      calfPivot.position.set(0, -0.29, 0);
      calfPivot.rotation.x = -0.18;
      calfPivot.rotation.z = side * 1.38;
      var calf = new THREE.Mesh(calfGeo, crimsonBodyMat);
      calf.castShadow = true;
      calfPivot.add(calf);
      addJointBlend(calfPivot, 0.036);

      thighPivot.add(calfPivot);
      root.add(thighPivot);
    }

    var torsoPivot = new THREE.Group();
    torsoPivot.position.set(0, 0.145, 0.03);
    torsoPivot.rotation.x = 0.06;
    var torsoMesh = new THREE.Mesh(sculptTorsoGeo, crimsonBodyMat);
    torsoMesh.castShadow = true;
    torsoMesh.renderOrder = 2;
    torsoPivot.add(torsoMesh);

    var head = new THREE.Mesh(eggHeadGeo, crimsonHeadMat);
    head.position.set(0, HEAD_Y, 0.012);
    head.castShadow = true;
    head.renderOrder = 2;
    torsoPivot.add(head);

    var flagTex = (tex && typeof tex.mkSoftFlagTex === 'function') ? tex.mkSoftFlagTex(flagCode) : null;
    var flagCoreMat = new THREE.MeshBasicMaterial({
      map: flagTex,
      color: flagTex ? 0xffffff : 0xff6b7a,
      transparent: true,
      opacity: 0.90,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: false
    });
    var flagCore = new THREE.Mesh(new THREE.PlaneGeometry(0.148, (flagCode || 'KR') === 'KR' ? 0.148 * 2 / 3 : 0.148), flagCoreMat);
    flagCore.position.set(0, 0, 0);
    flagCore.renderOrder = 1;
    head.add(flagCore);
    var iniCanvas = document.createElement('canvas');
    iniCanvas.width = 512;
    iniCanvas.height = 224;
    var iniCtx = iniCanvas.getContext('2d');
    var iniTex = new THREE.CanvasTexture(iniCanvas);

    var iniMat = new THREE.MeshBasicMaterial({
      map: iniTex,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    var chestCurveGeo = new THREE.CylinderGeometry(0.184, 0.170, 0.13, 24, 1, true, Math.PI - 0.72, 1.44);
    chestCurveGeo.scale(1.05, 1.0, 0.68);
    var iniChestMesh = new THREE.Mesh(chestCurveGeo, iniMat);
    iniChestMesh.position.set(0, 0.34, 0.0);
    iniChestMesh.renderOrder = 3;
    torsoPivot.add(iniChestMesh);

    function drawRoundedBox(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function drawInitialText(txt) {
      var clean = (typeof txt === 'string' && txt.trim().length > 0) ? txt.trim().slice(0, 8) : 'FCLMND';
      iniCtx.clearRect(0, 0, 512, 224);
      iniCtx.save();

      iniCtx.fillStyle = 'rgba(20, 6, 10, 0.58)';
      drawRoundedBox(iniCtx, 36, 36, 440, 152, 76);
      iniCtx.fill();
      iniCtx.lineWidth = 3;
      iniCtx.strokeStyle = 'rgba(255, 110, 130, 0.65)';
      iniCtx.stroke();

      var fontSize = clean.length <= 2 ? 116 : (clean.length <= 4 ? 96 : (clean.length <= 6 ? 76 : 62));
      iniCtx.font = '800 ' + fontSize + 'px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      iniCtx.textAlign = 'center';
      iniCtx.textBaseline = 'middle';

      iniCtx.shadowColor = 'rgba(255, 65, 90, 1.0)';
      iniCtx.shadowBlur = 26;
      iniCtx.fillStyle = '#ffffff';
      iniCtx.fillText(clean, 256, 114);

      iniCtx.shadowColor = 'rgba(255, 190, 200, 0.9)';
      iniCtx.shadowBlur = 8;
      iniCtx.fillText(clean, 256, 114);

      iniCtx.restore();
      iniTex.needsUpdate = true;
    }
    drawInitialText(initialText);

    var armPivots = new Array();
    for (var a = 0; a < sides.length; a++) {
      var armSide = sides.at(a);
      var shoulderPivot = new THREE.Group();
      shoulderPivot.position.set(armSide * 0.156, 0.34, 0.0);

      var upperArm = new THREE.Mesh(upperArmGeo, crimsonBodyMat);
      upperArm.castShadow = true;
      shoulderPivot.add(upperArm);
      addJointBlend(shoulderPivot, 0.039);

      var forearmPivot = new THREE.Group();
      forearmPivot.position.set(0, -0.225, 0);

      var forearm = new THREE.Mesh(forearmGeo, crimsonBodyMat);
      forearm.castShadow = true;
      forearmPivot.add(forearm);
      addJointBlend(forearmPivot, 0.031);

      shoulderPivot.add(forearmPivot);
      torsoPivot.add(shoulderPivot);
      armPivots.push({ shoulder: shoulderPivot, forearm: forearmPivot, side: armSide });
    }

    root.add(torsoPivot);

    var redAuraLight = new THREE.PointLight(0xff3b52, 0.95, 3.2, 1.8);
    redAuraLight.position.set(0, 0.78, -0.15);
    root.add(redAuraLight);

    return {
      root: root,
      setInitial: drawInitialText,
      update: function(time, isPlaying) {
        var beat = isPlaying ? Math.sin(time * 3.2) : Math.sin(time * 1.4) * 0.3;
        torsoPivot.rotation.x = 0.06 + beat * 0.025;
        torsoPivot.rotation.y = Math.sin(time * 0.7) * 0.04;

        for (var i = 0; i < armPivots.length; i++) {
          var arm = armPivots.at(i);
          if (arm.side === -1) {
            arm.shoulder.rotation.x = 0.68 + Math.sin(time * 1.1) * 0.02;
            arm.shoulder.rotation.z = -0.16;
            arm.forearm.rotation.x = 0.95;
            arm.forearm.rotation.z = -0.22;
          } else {
            var touchWave = isPlaying ? Math.sin(time * 2.1) : Math.sin(time * 0.9) * 0.4;
            arm.shoulder.rotation.x = 0.76 + touchWave * 0.07;
            arm.shoulder.rotation.z = 0.14 + Math.cos(time * 1.5) * 0.05;
            arm.forearm.rotation.x = 0.88 - touchWave * 0.08;
            arm.forearm.rotation.z = 0.18 + Math.sin(time * 2.6) * 0.06;
          }
        }

        var djCycle = (time * 0.1) % 1.0;
        var djBreath = djCycle < 0.4
          ? Math.sin((djCycle / 0.4) * (Math.PI / 2))
          : Math.cos(((djCycle - 0.4) / 0.6) * (Math.PI / 2));

        flagCoreMat.opacity = 0.38 + Math.pow(djBreath, 1.3) * 0.62;
        var djScale = 0.96 + djBreath * 0.07;
        flagCore.scale.set(djScale, djScale, 1);
      }
    };
  }
};
