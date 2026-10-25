import Phaser from 'phaser';

const TILE_WIDTH = 96;
const TILE_HEIGHT = 48;
const MAP_SIZE = 13;
const CENTER = (MAP_SIZE - 1) / 2;
const INNER_RADIUS = 2.55;
const OUTER_RADIUS = 5.35;
const MOVE_SPEED = 2.25;

const CELL_BLOCKS = [
  [6, 0],
  [9, 1],
  [11, 3],
  [12, 6],
  [11, 9],
  [9, 11],
  [6, 12],
  [3, 11],
  [1, 9],
  [0, 6],
  [1, 3],
  [3, 1],
];

export class PanopticonScene extends Phaser.Scene {
  constructor() {
    super('PanopticonScene');
  }

  create() {
    this.origin = { x: this.scale.width / 2, y: 48 };
    this.playerGrid = { x: CENTER, y: CENTER + 4.4 };

    this.drawBackdrop();
    this.drawRingFloor();
    this.drawCellBlocks();
    this.drawTower();
    this.createPlayer();
    this.createInterface();
    this.createControls();
    this.updatePlayerPosition();
  }

  update(_time, delta) {
    const horizontal = Number(this.keys.right.isDown || this.keys.d.isDown)
      - Number(this.keys.left.isDown || this.keys.a.isDown);
    const vertical = Number(this.keys.down.isDown || this.keys.s.isDown)
      - Number(this.keys.up.isDown || this.keys.w.isDown);

    if (horizontal === 0 && vertical === 0) {
      return;
    }

    const length = Math.hypot(horizontal, vertical) || 1;
    const distance = MOVE_SPEED * (delta / 1000) / length;

    // Inverse isometric projection: screen-right moves (+x, -y), while
    // screen-down moves (+x, +y).
    const dx = (vertical + horizontal) * distance;
    const dy = (vertical - horizontal) * distance;

    this.tryMove(dx, dy);
    this.updatePlayerPosition();
  }

  project(gridX, gridY, elevation = 0) {
    return {
      x: this.origin.x + (gridX - gridY) * (TILE_WIDTH / 2),
      y: this.origin.y + (gridX + gridY) * (TILE_HEIGHT / 2) - elevation,
    };
  }

  drawBackdrop() {
    const backdrop = this.add.graphics();
    backdrop.fillGradientStyle(0x17232b, 0x17232b, 0x0a1015, 0x0a1015, 1);
    backdrop.fillRect(0, 0, this.scale.width, this.scale.height);

    const glow = this.add.graphics();
    glow.fillStyle(0xd6bc7b, 0.035);
    glow.fillCircle(this.scale.width / 2, 330, 420);
  }

  drawRingFloor() {
    const floor = this.add.graphics();
    floor.lineStyle(1, 0x576168, 0.45);

    for (let y = 0; y < MAP_SIZE; y += 1) {
      for (let x = 0; x < MAP_SIZE; x += 1) {
        const radius = Math.hypot(x - CENTER, y - CENTER);

        if (radius < INNER_RADIUS - 0.7 || radius > OUTER_RADIUS + 0.8) {
          continue;
        }

        const point = this.project(x, y);
        const diamond = this.diamond(point.x, point.y, TILE_WIDTH / 2, TILE_HEIGHT / 2);
        const isWalkway = radius >= INNER_RADIUS && radius <= OUTER_RADIUS;
        const checker = (x + y) % 2 === 0;

        floor.fillStyle(
          isWalkway ? (checker ? 0x53605f : 0x485553) : 0x303b3e,
          isWalkway ? 1 : 0.8,
        );
        floor.fillPoints(diamond, true);
        floor.strokePoints(diamond, true);
      }
    }
  }

  drawCellBlocks() {
    CELL_BLOCKS.forEach(([x, y], index) => {
      const color = index % 2 === 0 ? 0x667077 : 0x5b666d;
      this.drawPrism(x, y, 56, color);
    });
  }

  drawPrism(gridX, gridY, height, topColor) {
    const graphics = this.add.graphics();
    const base = this.project(gridX, gridY);
    const top = this.project(gridX, gridY, height);
    const halfWidth = TILE_WIDTH * 0.43;
    const halfHeight = TILE_HEIGHT * 0.43;
    const topDiamond = this.diamond(top.x, top.y, halfWidth, halfHeight);
    const baseDiamond = this.diamond(base.x, base.y, halfWidth, halfHeight);

    graphics.fillStyle(0x354147, 1);
    graphics.fillPoints([topDiamond[1], topDiamond[2], baseDiamond[2], baseDiamond[1]], true);
    graphics.fillStyle(0x252f35, 1);
    graphics.fillPoints([topDiamond[2], topDiamond[3], baseDiamond[3], baseDiamond[2]], true);
    graphics.fillStyle(topColor, 1);
    graphics.fillPoints(topDiamond, true);
    graphics.lineStyle(2, 0x1b242a, 0.85);
    graphics.strokePoints(topDiamond, true);

    const door = this.project(gridX, gridY, 22);
    graphics.fillStyle(0x141c21, 0.9);
    graphics.fillRect(door.x - 9, door.y, 18, 27);
    graphics.setDepth((gridX + gridY) * 100);
  }

  drawTower() {
    const tower = this.add.graphics();
    const base = this.project(CENTER, CENTER);
    const shaftTop = this.project(CENTER, CENTER, 128);
    const shaftTopDiamond = this.diamond(shaftTop.x, shaftTop.y, 42, 21);
    const shaftBaseDiamond = this.diamond(base.x, base.y, 42, 21);

    tower.fillStyle(0x5a666b, 1);
    tower.fillPoints(
      [shaftTopDiamond[1], shaftTopDiamond[2], shaftBaseDiamond[2], shaftBaseDiamond[1]],
      true,
    );
    tower.fillStyle(0x3c484e, 1);
    tower.fillPoints(
      [shaftTopDiamond[2], shaftTopDiamond[3], shaftBaseDiamond[3], shaftBaseDiamond[2]],
      true,
    );

    const roomBase = this.project(CENTER, CENTER, 108);
    const roomTop = this.project(CENTER, CENTER, 164);
    const roomBottomDiamond = this.diamond(roomBase.x, roomBase.y, 82, 39);
    const roomTopDiamond = this.diamond(roomTop.x, roomTop.y, 82, 39);

    tower.fillStyle(0x8b744d, 1);
    tower.fillPoints(
      [roomTopDiamond[1], roomTopDiamond[2], roomBottomDiamond[2], roomBottomDiamond[1]],
      true,
    );
    tower.fillStyle(0x67543c, 1);
    tower.fillPoints(
      [roomTopDiamond[2], roomTopDiamond[3], roomBottomDiamond[3], roomBottomDiamond[2]],
      true,
    );

    tower.lineStyle(8, 0xc8e4df, 0.78);
    tower.beginPath();
    tower.moveTo(roomTop.x - 62, roomTop.y + 14);
    tower.lineTo(roomTop.x, roomTop.y + 45);
    tower.lineTo(roomTop.x + 62, roomTop.y + 14);
    tower.strokePath();

    const roof = this.project(CENTER, CENTER, 174);
    const roofDiamond = this.diamond(roof.x, roof.y, 94, 45);
    tower.fillStyle(0x222d33, 1);
    tower.fillPoints(roofDiamond, true);
    tower.lineStyle(3, 0xb89b62, 0.8);
    tower.strokePoints(roofDiamond, true);

    tower.fillStyle(0xe1c575, 1);
    tower.fillCircle(roof.x, roof.y - 3, 6);
    tower.setDepth((CENTER + CENTER) * 100);
  }

  createPlayer() {
    const shadow = this.add.ellipse(0, 1, 31, 15, 0x081015, 0.5);
    const body = this.add.ellipse(0, -18, 23, 34, 0xd56b4b, 1);
    const head = this.add.circle(0, -39, 9, 0xf0c6a2, 1);
    const facing = this.add.triangle(0, -18, 0, 0, 9, 4, 0, 8, 0xffdd77, 1);

    this.player = this.add.container(0, 0, [shadow, body, head, facing]);
  }

  createInterface() {
    const panel = this.add.graphics();
    panel.fillStyle(0x071015, 0.82);
    panel.fillRoundedRect(24, 22, 420, 88, 10);
    panel.lineStyle(1, 0x9f8c62, 0.65);
    panel.strokeRoundedRect(24, 22, 420, 88, 10);
    panel.setDepth(100000);

    this.add.text(44, 38, 'PANOPTICON / BLOCK 01', {
      color: '#e2c680',
      fontFamily: 'monospace',
      fontSize: '22px',
      fontStyle: 'bold',
      letterSpacing: 2,
    }).setDepth(100001);

    this.add.text(44, 73, 'WASD or arrow keys to patrol the ring', {
      color: '#cbd3cf',
      fontFamily: 'monospace',
      fontSize: '15px',
    }).setDepth(100001);
  }

  createControls() {
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  tryMove(dx, dy) {
    const candidates = [
      { x: this.playerGrid.x + dx, y: this.playerGrid.y + dy },
      { x: this.playerGrid.x + dx, y: this.playerGrid.y },
      { x: this.playerGrid.x, y: this.playerGrid.y + dy },
    ];

    const next = candidates.find(({ x, y }) => {
      const radius = Math.hypot(x - CENTER, y - CENTER);
      return radius >= INNER_RADIUS && radius <= OUTER_RADIUS;
    });

    if (next) {
      this.playerGrid = next;
    }
  }

  updatePlayerPosition() {
    const point = this.project(this.playerGrid.x, this.playerGrid.y);
    this.player.setPosition(point.x, point.y);
    this.player.setDepth((this.playerGrid.x + this.playerGrid.y) * 100 + 10);
  }

  diamond(x, y, halfWidth, halfHeight) {
    return [
      { x, y: y - halfHeight },
      { x: x + halfWidth, y },
      { x, y: y + halfHeight },
      { x: x - halfWidth, y },
    ];
  }
}

