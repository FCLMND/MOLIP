function createAvatarFlagTexture(countryCode) {
  var flagCanvas = document.createElement('canvas');
  flagCanvas.width = countryCode === 'KR' ? 768 : 512;
  flagCanvas.height = 512;
  var flagCtx = flagCanvas.getContext('2d');
  var flagWidth = flagCanvas.width;
  var flagHeight = flagCanvas.height;
  var flagCenterX = flagWidth / 2;
  var flagCenterY = flagHeight / 2;

  if (countryCode === 'KR') {
    var angle = Math.atan2(2, 3);
    var D = flagHeight / 2;
    var R = D / 2;

    flagCtx.fillStyle = '#ffffff';
    flagCtx.fillRect(0, 0, flagWidth, flagHeight);
    flagCtx.save();
    flagCtx.translate(flagCenterX, flagCenterY);
    flagCtx.rotate(angle);

    flagCtx.beginPath();
    flagCtx.moveTo(-R, 0);
    flagCtx.arc(0, 0, R, Math.PI, 0, false);
    flagCtx.closePath();
    flagCtx.fillStyle = '#cd2e3a';
    flagCtx.fill();
    flagCtx.beginPath();
    flagCtx.moveTo(R, 0);
    flagCtx.arc(0, 0, R, 0, Math.PI, false);
    flagCtx.closePath();
    flagCtx.fillStyle = '#0047a0';
    flagCtx.fill();
    flagCtx.beginPath();
    flagCtx.arc(-R / 2, 0, R / 2, 0, Math.PI * 2);
    flagCtx.fillStyle = '#cd2e3a';
    flagCtx.fill();
    flagCtx.beginPath();
    flagCtx.arc(R / 2, 0, R / 2, 0, Math.PI * 2);
    flagCtx.fillStyle = '#0047a0';
    flagCtx.fill();
    flagCtx.restore();

    function drawTrigram(radialAngle, brokenRows) {
      var trigramWidth = D / 2;
      var trigramHeight = D / 3;
      var barThickness = trigramHeight / 4;
      var barGap = trigramHeight / 8;
      var centerRadius = R + D / 4 + trigramHeight / 2;
      var trigramX = flagCenterX + Math.cos(radialAngle) * centerRadius;
      var trigramY = flagCenterY + Math.sin(radialAngle) * centerRadius;

      flagCtx.save();
      flagCtx.translate(trigramX, trigramY);
      flagCtx.rotate(radialAngle + Math.PI / 2);
      flagCtx.fillStyle = '#111111';
      for (var row = 0; row < 3; row++) {
        var barY = -trigramHeight / 2 + barThickness / 2 + row * (barThickness + barGap);
        if (brokenRows[row]) {
          var segmentWidth = (trigramWidth - barGap) / 2;
          flagCtx.fillRect(-trigramWidth / 2, barY - barThickness / 2, segmentWidth, barThickness);
          flagCtx.fillRect(barGap / 2, barY - barThickness / 2, segmentWidth, barThickness);
        } else {
          flagCtx.fillRect(-trigramWidth / 2, barY - barThickness / 2, trigramWidth, barThickness);
        }
      }
      flagCtx.restore();
    }

    drawTrigram(Math.PI + angle, [false, false, false]);
    drawTrigram(angle, [true, true, true]);
    drawTrigram(-angle, [true, false, true]);
    drawTrigram(Math.PI - angle, [false, true, false]);

    flagCtx.save();
    flagCtx.globalCompositeOperation = 'destination-in';
    flagCtx.translate(flagCenterX, flagCenterY);
    flagCtx.scale(flagWidth / 2, flagHeight / 2);
    var edgeMask = flagCtx.createRadialGradient(0, 0, 0, 0, 0, 1);
    edgeMask.addColorStop(0, 'rgba(0, 0, 0, 1)');
    edgeMask.addColorStop(0.68, 'rgba(0, 0, 0, 1)');
    edgeMask.addColorStop(1, 'rgba(0, 0, 0, 0)');
    flagCtx.fillStyle = edgeMask;
    flagCtx.fillRect(-1, -1, 2, 2);
    flagCtx.restore();
  } else {
    var flagEmoji = String.fromCodePoint(...[...countryCode.toUpperCase()].map(c => 127397 + c.charCodeAt(0)));
    flagCtx.font = '360px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    flagCtx.textAlign = 'center';
    flagCtx.textBaseline = 'middle';
    flagCtx.fillText(flagEmoji, flagCenterX, flagCenterY);

    flagCtx.save();
    flagCtx.globalCompositeOperation = 'destination-in';
    flagCtx.translate(flagCenterX, flagCenterY);
    flagCtx.scale(flagWidth / 2, flagHeight / 2);
    var edgeMask = flagCtx.createRadialGradient(0, 0, 0, 0, 0, 1);
    edgeMask.addColorStop(0, 'rgba(0, 0, 0, 1)');
    edgeMask.addColorStop(0.68, 'rgba(0, 0, 0, 1)');
    edgeMask.addColorStop(1, 'rgba(0, 0, 0, 0)');
    flagCtx.fillStyle = edgeMask;
    flagCtx.fillRect(-1, -1, 2, 2);
    flagCtx.restore();
  }

  return new THREE.CanvasTexture(flagCanvas);
}

var playerAvatarCountryUpdater = null;
window.updateAvatarCountry = function(countryCode) {
  var normalizedCountryCode = typeof countryCode === 'string' && /^[A-Z]{2}$/i.test(countryCode)
    ? countryCode.toUpperCase()
    : 'KR';
  if (playerAvatarCountryUpdater) playerAvatarCountryUpdater(normalizedCountryCode);
};

window.AvatarSystem = {
  create: function(tex, flagCode, isPlayer) {
    if (isPlayer === undefined) isPlayer = false;
    const HEAD_RADIUS = 0.089;
    const HEAD_HALF_HEIGHT = 0.114;
    const HEAD_Y = 0.576;
    const NECK_BASE_RADIUS = 0.040;
    const NECK_TOP_RADIUS = 0.033;
    const NECK_TOP_Y = 0.472;
    const BASE_LOWER_LEG_LENGTH = 0.32;
    const LOWER_LEG_LENGTH = BASE_LOWER_LEG_LENGTH * 1.11;
    const LOWER_LEG_GROUND_OFFSET = LOWER_LEG_LENGTH - BASE_LOWER_LEG_LENGTH;
    var baseBodyOpacity = 0.72;
    var baseHeadOpacity = 0.72;
    var breathPhaseOffset = Math.random();

    var bodyCeramicMat = new THREE.MeshPhysicalMaterial({
      color: 0xf4efe6, roughness: 0.42, metalness: 0.04,
      emissive: new THREE.Color(0xdfd7c8), emissiveIntensity: 0.14,
      clearcoat: 0.90, clearcoatRoughness: 0.12,
      transparent: true, opacity: baseBodyOpacity, depthTest: true, depthWrite: true
    });

    var translucentHeadMat = new THREE.MeshPhysicalMaterial({
      color: 0xf4efe6, roughness: 0.42, metalness: 0.04,
      emissive: new THREE.Color(0xdfd7c8), emissiveIntensity: 0.14,
      clearcoat: 0.92, clearcoatRoughness: 0.12,
      transparent: true, opacity: baseHeadOpacity, depthTest: true, depthWrite: true
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
      var blend = new THREE.Mesh(jointBlendGeo, bodyCeramicMat);
      blend.scale.setScalar(radius);
      blend.castShadow = true;
      pivot.add(blend);
    }

    var root = new THREE.Group();
    var bodyGroup = new THREE.Group();
    root.add(bodyGroup);

    var pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.132, 24, 18), bodyCeramicMat);
    pelvis.scale.set(1.08, 0.68, 0.72);
    pelvis.position.set(0, 0.265, 0.085);
    bodyGroup.add(pelvis);

    var legPivots = new Array();
    var legXList = new Array(-0.082, 0.082);
    for (var idx = 0; idx < legXList.length; idx++) {
      var lx = legXList.at(idx);
      var thighPivot = new THREE.Group();
      thighPivot.position.set(lx, 0.265, 0.065);
      var thigh = new THREE.Mesh(thighGeo, bodyCeramicMat);
      thigh.castShadow = true;
      thighPivot.add(thigh);

      var calfPivot = new THREE.Group();
      calfPivot.position.set(0, -0.29, 0);
      var calf = new THREE.Mesh(calfGeo, bodyCeramicMat);
      calf.castShadow = true;
      calfPivot.add(calf);
      addJointBlend(calfPivot, 0.036);

      thighPivot.add(calfPivot);
      bodyGroup.add(thighPivot);
      legPivots.push({ thigh: thighPivot, calf: calfPivot, side: idx === 0 ? -1 : 1 });
    }

    var torsoPivot = new THREE.Group();
    torsoPivot.position.set(0, 0.33, 0.095);
    var torsoMesh = new THREE.Mesh(sculptTorsoGeo, bodyCeramicMat);
    torsoMesh.castShadow = true;
    torsoMesh.renderOrder = 2;
    torsoPivot.add(torsoMesh);

    var head = new THREE.Mesh(eggHeadGeo, translucentHeadMat);
    head.position.set(0, HEAD_Y, 0.012);
    head.castShadow = true;
    head.renderOrder = 2;
    torsoPivot.add(head);

    var currentFlagCode = typeof flagCode === 'string' && /^[A-Z]{2}$/i.test(flagCode)
      ? flagCode.toUpperCase()
      : 'KR';
    var flagTex = createAvatarFlagTexture(currentFlagCode);
    var flagCoreMat = new THREE.MeshBasicMaterial({
      map: flagTex,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: false
    });
    var flagCore = new THREE.Mesh(new THREE.PlaneGeometry(0.148, currentFlagCode === 'KR' ? 0.148 * 2 / 3 : 0.148), flagCoreMat);
    flagCore.position.set(0, 0, 0);
    flagCore.renderOrder = 1;
    head.add(flagCore);

    var armPivots = new Array();
    var armSides = new Array(-1, 1);
    for (var s = 0; s < armSides.length; s++) {
      var side = armSides.at(s);
      var shoulderPivot = new THREE.Group();
      shoulderPivot.position.set(side * 0.156, 0.34, 0.0);
      var upperArm = new THREE.Mesh(upperArmGeo, bodyCeramicMat);
      upperArm.castShadow = true;
      shoulderPivot.add(upperArm);
      addJointBlend(shoulderPivot, 0.039);

      var forearmPivot = new THREE.Group();
      forearmPivot.position.set(0, -0.225, 0);
      var forearm = new THREE.Mesh(forearmGeo, bodyCeramicMat);
      forearm.castShadow = true;
      forearmPivot.add(forearm);
      addJointBlend(forearmPivot, 0.031);

      shoulderPivot.add(forearmPivot);
      torsoPivot.add(shoulderPivot);
      armPivots.push({ shoulder: shoulderPivot, forearm: forearmPivot, side: side });
    }

    bodyGroup.add(torsoPivot);
    var avatarObj = {
      root: root, bodyGroup: bodyGroup, torso: torsoPivot, arms: armPivots, legs: legPivots,
      flagCode: currentFlagCode, isPlayer: isPlayer, state: 'sitting',
      bedRef: null, targetPos: null, targetBed: null, shopDestination: null, shopRouteStage: null, lookTarget: null, arrivalRadius: 0.35, walkPhase: 0, sitProg: 1, visAlpha: 1.0, baseFlagVis: 1.0,
      currentOpacity: baseBodyOpacity, currentFlagOpacity: 0.65,

      setFilteredVisibility: function(shouldShow, isInArchiveShop) {
        var targetA = shouldShow ? 1.0 : 0.0;
        this.visAlpha += (targetA - this.visAlpha) * 0.10;
        if (this.visAlpha < 0.015) { this.root.visible = false; return; }
        this.root.visible = true;
        var targetOpacity = isInArchiveShop && !this.isPlayer ? 0.18 : baseBodyOpacity;
        var targetFlagOpacity = isInArchiveShop && !this.isPlayer ? 0.16 : 0.65;
        this.currentOpacity = THREE.MathUtils.lerp(this.currentOpacity, targetOpacity, 0.10);
        this.currentFlagOpacity = THREE.MathUtils.lerp(this.currentFlagOpacity, targetFlagOpacity, 0.10);
        var bodyOpacity = this.currentOpacity * this.visAlpha;
        var isShopOpacityTransitioning = isInArchiveShop || Math.abs(this.currentOpacity - baseBodyOpacity) > 0.001;
        bodyCeramicMat.opacity = bodyOpacity;
        bodyCeramicMat.depthWrite = isShopOpacityTransitioning ? bodyOpacity >= 0.3 : this.visAlpha > 0.65;
        translucentHeadMat.opacity = bodyOpacity;
        translucentHeadMat.depthWrite = bodyCeramicMat.depthWrite;
        this.baseFlagVis = this.visAlpha;
      },

      standInWaitingZone: function(x, z) {
        if (this.bedRef) {
          if (this.bedRef.blanket) { this.bedRef.blanket.scale.z = 0.24; this.bedRef.blanket.position.z = -0.58; }
          this.bedRef.occupied = false;
          this.bedRef = null;
        }
        this.state = 'waiting';
        this.targetPos = null;
        this.targetBed = null;
        this.shopDestination = null;
        this.shopRouteStage = null;
        this.lookTarget = null;
        this.sitProg = 0;
        this.root.position.set(x, 0, z);
        this.root.rotation.y = 0;
      },

      walkTo: function(x, z, targetBed) {
        if (targetBed === undefined) targetBed = null;
        if (this.bedRef) {
          if (this.bedRef.blanket) { this.bedRef.blanket.scale.z = 0.24; this.bedRef.blanket.position.z = -0.58; }
          this.bedRef.occupied = false;
          this.bedRef = null;
        }
        this.state = 'walking';
        this.lookTarget = null;
        var isEnteringShop = !this.isPlayer && x < -9.8 && this.root.position.x >= -9.8;
        var isExitingShop = !this.isPlayer && x >= -9.92 && this.root.position.x < -9.8;
        this.shopDestination = isEnteringShop || isExitingShop ? new THREE.Vector3(x, 0, z) : null;
        this.shopRouteStage = isEnteringShop ? 'enterEntry' : (isExitingShop ? 'exitDoor' : null);
        this.targetPos = isEnteringShop
          ? new THREE.Vector3(-9.5, 0, 18.8)
          : (isExitingShop ? new THREE.Vector3(-9.8, 0, 18.8) : new THREE.Vector3(x, 0, z));
        this.targetBed = targetBed;
      },

      sitOnBed: function(bed) {
        if (this.bedRef && this.bedRef !== bed) this.bedRef.occupied = false;
        this.bedRef = bed;
        bed.occupied = true;
        this.state = 'sitting';
        this.targetPos = null;
        this.targetBed = null;
        this.shopDestination = null;
        this.shopRouteStage = null;
        this.lookTarget = null;
        this.root.position.set(bed.x, 0, bed.z);
        this.root.rotation.y = bed.rotY;
      },

      update: function(dt, time, globalBlanketProg) {
        var isSitting = (this.state === 'sitting');
        this.sitProg += ((isSitting ? 1 : 0) - this.sitProg) * 0.12;
        var bProg = isSitting ? globalBlanketProg : 0;

                if (this.state === 'walking' && this.targetPos) {
          var dx = this.targetPos.x - this.root.position.x;
          var dz = this.targetPos.z - this.root.position.z;
          var dist = Math.hypot(dx, dz);

          if (dist > this.arrivalRadius) {
            var dirX = dx / dist, dirZ = dz / dist;
            var step = Math.min(dist, 2.45 * dt);
            var nextX = this.root.position.x + dirX * step;
            var nextZ = this.root.position.z + dirZ * step;

            if (this.isPlayer) {
              // 출입 통로(z: 16.5 ~ 21.1) 및 아카이브 숍 내부(x < -9.2)에서는 X축 -17.4까지 자유 이동 허용
              var allowShopArea = (nextZ >= 15.6 && nextZ <= 22.0) || (this.root.position.x < -9.2);
              var minXLimit = allowShopArea ? -22.8 : -8.6;
              this.root.position.x = Math.max(minXLimit, Math.min(8.6, nextX));

              if (this.root.position.x < -9.5) {
                this.root.position.z = Math.max(15.8, Math.min(21.8, nextZ));
              } else {
                this.root.position.z = Math.max(0.6, Math.min(20.8, nextZ));
              }
            } else {
              var isWithinShopEntryZ = nextZ >= 18.8 - 1.25 && nextZ <= 18.8 + 1.25;
              var isEnteringShop = this.targetPos.x < -9.92 && this.root.position.x > -10.2;
              var isExitingShop = this.targetPos.x >= -9.92 && this.root.position.x < -8.6;
              var isApproachingShopEntry = this.targetPos.x < -8.6 && this.targetPos.x >= -9.92 && this.root.position.x > -9.8;

              if (isWithinShopEntryZ && (isEnteringShop || isExitingShop || isApproachingShopEntry)) {
                this.root.position.x = Math.max(-16.2, Math.min(8.6, nextX));
                var entryZLimit = this.root.position.x < -9.8 ? 1.05 : 1.25;
                this.root.position.z = Math.max(18.8 - entryZLimit, Math.min(18.8 + entryZLimit, nextZ));
              } else if (this.root.position.x < -9.8) {
                this.root.position.x = Math.max(-16.2, Math.min(-10.2, nextX));
                this.root.position.z = Math.max(18.8 - 1.05, Math.min(18.8 + 1.05, nextZ));
              } else {
                this.root.position.x = Math.max(-8.6, Math.min(8.6, nextX));
                this.root.position.z = Math.max(0.6, Math.min(20.8, nextZ));
              }
            }


            // 진행 방향으로 부드럽게 몸 회전 + 팔다리 걷기 사이클(walkPhase) 복구
            var targetRot = Math.atan2(-dirX, -dirZ);
            var diff = targetRot - this.root.rotation.y;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            this.root.rotation.y += diff * 0.18;
            this.walkPhase += dt * 9.5;
          } else {
            if (this.shopRouteStage === 'enterEntry') {
              this.shopRouteStage = 'enterDoor';
              this.targetPos = new THREE.Vector3(-10.5, 0, 18.8);
              this.state = 'walking';
            } else if (this.shopRouteStage === 'enterDoor') {
              this.targetPos = this.shopDestination;
              this.shopDestination = null;
              this.shopRouteStage = null;
              this.state = 'walking';
            } else if (this.shopRouteStage === 'exitDoor') {
              this.shopRouteStage = 'exitEntry';
              this.targetPos = new THREE.Vector3(-9.2, 0, 18.8);
              this.state = 'walking';
            } else if (this.shopRouteStage === 'exitEntry') {
              this.targetPos = this.shopDestination;
              this.shopDestination = null;
              this.shopRouteStage = null;
              this.state = 'walking';
            } else if (this.targetBed && !this.targetBed.occupied) {
              this.sitOnBed(this.targetBed);
            } else {
              this.state = (this.root.position.z >= 17.5 || this.root.position.x < -9.5) ? 'waiting' : 'walking';
              this.targetPos = null;
            }
          }
        }


        if (!this.isPlayer && this.state === 'waiting' && this.lookTarget) {
          var lookDx = this.lookTarget.x - this.root.position.x;
          var lookDz = this.lookTarget.z - this.root.position.z;
          var targetLookRotation = Math.atan2(-lookDx, -lookDz);
          var lookRotationDiff = targetLookRotation - this.root.rotation.y;
          while (lookRotationDiff > Math.PI) lookRotationDiff -= Math.PI * 2;
          while (lookRotationDiff < -Math.PI) lookRotationDiff += Math.PI * 2;
          this.root.rotation.y += lookRotationDiff * Math.min(1, dt * 2.4);
        }

        var waitBreath = (this.state === 'waiting') ? Math.sin(time * 1.8 + (this.isPlayer ? 0 : 1.5)) * 0.015 : 0;
        var standHeight = (1 - this.sitProg) * (0.35 + LOWER_LEG_GROUND_OFFSET);
        var walkBob = (this.state === 'walking' && this.targetPos) ? Math.abs(Math.sin(this.walkPhase)) * 0.025 : 0;
        this.bodyGroup.position.y = standHeight + walkBob + waitBreath;

        this.torso.rotation.x = (-0.12 + bProg * 1.52) * this.sitProg;
                this.torso.rotation.x = (-0.12 + bProg * 1.54) * this.sitProg;
        this.torso.position.y = 0.33 + bProg * 0.065 * this.sitProg;
        this.torso.position.z = 0.095 - bProg * 0.14 * this.sitProg;
        var isLookingAround = !this.isPlayer && (this.state === 'waiting' || this.state === 'sitting');
        var targetHeadYaw = isLookingAround ? Math.sin(time * 0.42 + breathPhaseOffset * Math.PI * 2) * 0.075 : 0;
        head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, targetHeadYaw, Math.min(1, dt * 2));

        var isMoving = (this.state === 'walking' && this.targetPos !== null);
        for (var l = 0; l < this.legs.length; l++) {
          var leg = this.legs.at(l);
          var swing = isMoving ? Math.sin(this.walkPhase + (leg.side === 1 ? Math.PI : 0)) * 0.42 : 0;
          var kneeBend = isMoving ? Math.max(0, -Math.sin(this.walkPhase + (leg.side === 1 ? Math.PI : 0))) * 0.55 : 0;
          // 누웠을 때(bProg=1) 다리가 매트리스에 파묻히지 않고 데스크 아래로 반듯하게 뻗도록 각도(1.46) 및 높이 보정
          leg.thigh.position.y = 0.265 + bProg * 0.032 * this.sitProg;
          leg.thigh.rotation.x = swing * (1 - this.sitProg) + (2.35 - bProg * 0.89) * this.sitProg;
          leg.calf.rotation.x = (-kneeBend) * (1 - this.sitProg) + (-1.75 * (1 - bProg)) * this.sitProg;
        }


        for (var a = 0; a < this.arms.length; a++) {
          var arm = this.arms.at(a);
          var armSwing = isMoving ? Math.sin(this.walkPhase + (arm.side === -1 ? Math.PI : 0)) * 0.36 : 0;
          arm.shoulder.rotation.x = armSwing * (1 - this.sitProg) + (0.48 * (1 - bProg)) * this.sitProg;
          arm.shoulder.rotation.z = (arm.side * -0.08) * (1 - this.sitProg) + (arm.side * (-0.14 + bProg * 0.08)) * this.sitProg;
          arm.forearm.rotation.x = (isMoving ? Math.max(0, armSwing) * 0.45 + 0.15 : 0.12) * (1 - this.sitProg) + (1.25 * (1 - bProg)) * this.sitProg;
          arm.forearm.rotation.z = (arm.side * (-0.42 * (1 - bProg))) * this.sitProg;
        }

        if (isSitting && this.bedRef && this.bedRef.blanket) {
          this.bedRef.blanket.scale.z = 0.24 + bProg * 0.72;
          this.bedRef.blanket.position.z = -0.58 + bProg * 0.34;
        }

        var cycle = ((time * 0.1) + breathPhaseOffset) % 1.0;
        var breathWave = cycle < 0.4
          ? Math.sin((cycle / 0.4) * (Math.PI / 2))
          : Math.cos(((cycle - 0.4) / 0.6) * (Math.PI / 2));

        var moodIntensity = 0.32 + Math.pow(breathWave, 1.35) * 0.68;
        flagCoreMat.opacity = (Math.min(0.65, moodIntensity + 0.15) / 0.65) * this.currentFlagOpacity * this.baseFlagVis;
        var pulseScale = 0.96 + breathWave * 0.07;
        flagCore.scale.set(pulseScale, pulseScale, 1);
      }
    };
    if (isPlayer) {
      playerAvatarCountryUpdater = function(countryCode) {
        if (countryCode === currentFlagCode) return;
        var nextFlagTex = createAvatarFlagTexture(countryCode);
        if (flagCoreMat.map) flagCoreMat.map.dispose();
        flagCoreMat.map = nextFlagTex;
        flagCoreMat.needsUpdate = true;
        flagCore.geometry.dispose();
        flagCore.geometry = new THREE.PlaneGeometry(0.148, countryCode === 'KR' ? 0.148 * 2 / 3 : 0.148);
        currentFlagCode = countryCode;
        avatarObj.flagCode = countryCode;
      };
    }
    return avatarObj;
  }
};
