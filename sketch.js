// 遊戲主要變數
let player1, player2;          // 兩位玩家的物件
let projectiles = [];          // 儲存所有發射物的陣列
const GRAVITY = 0.4;           // 重力常數，影響跳躍和下落速度

// 精靈圖（角色動畫）變數
let player1Sprites = {};       // 玩家1的所有動畫圖片
let player2Sprites = {};       // 玩家2的所有動畫圖片

// 遊戲狀態變數
let gameOver = false;          // 遊戲是否結束
let loser = '';               // 記錄輸家是誰
let player1Score = 0;         // 玩家1的分數
let player2Score = 0;         // 玩家2的分數

// 預載入所有需要的圖片資源
function preload() {
  // 載入玩家1的動畫圖片（走路、跳躍、攻擊）
  player1Sprites.walk = loadImage('assets/player1/walk.png');
  player1Sprites.jump = loadImage('assets/player1/jump.png');
  player1Sprites.attack = loadImage('assets/player1/attack.png');

  // 載入玩家2的動畫圖片
  player2Sprites.walk = loadImage('assets/player2/walk.png');
  player2Sprites.jump = loadImage('assets/player2/jump.png');
  player2Sprites.attack = loadImage('assets/player2/attack.png');
}

// 玩家類別：定義玩家的所有屬性和行為
class Player {
  constructor(x, y, controls, color, sprites, animConfig, scale = 1, name) {
    // 位置和移動相關
    this.pos = createVector(x, y);           // 玩家位置
    this.vel = createVector(0, 0);           // 玩家速度
    this.controls = controls;                 // 控制按鍵設定
    
    // 外觀和狀態相關
    this.color = color;                      // 玩家顏色
    this.health = 100;                       // 生命值
    this.isJumping = false;                  // 是否在跳躍中
    this.isDead = false;                     // 是否已死亡
    
    // 動畫相關
    this.sprites = sprites;                  // 精靈圖
    this.currentSprite = 'walk';             // 當前動畫狀態
    this.direction = 1;                      // 面向方向(1右/-1左)
    this.frame = 0;                          // 當前動畫幀
    this.frameDelay = 5;                     // 動畫更新延遲
    
    // 其他設定
    this.scale = scale;                      // 縮放比例
    this.animConfig = animConfig;            // 動畫配置
    this.name = name;                        // 玩家名稱
  }

  // 更新玩家狀態（位置、動畫等）
  update() {
    this.vel.y += GRAVITY;
    this.pos.add(this.vel);

    if (this.pos.y + this.getCurrentSize().y > GROUND_Y) {
      this.pos.y = GROUND_Y - this.getCurrentSize().y;
      this.vel.y = 0;
      this.isJumping = false;
    }

    this.pos.x = constrain(this.pos.x, 0, width - this.getCurrentSize().x);

    // 更新精靈圖狀態
    if (this.isAttacking) {
      this.currentSprite = 'attack';
      // 當攻擊動畫播放完畢
      if (this.frame >= this.animConfig.attack.frames - 1) {
        this.isAttacking = false;
        this.frame = 0;
      }
    } else if (this.isJumping) {
      this.currentSprite = 'jump';
    } else if (this.vel.x !== 0) {
      this.currentSprite = 'walk';
      this.direction = this.vel.x > 0 ? 1 : -1;
    } else {
      this.currentSprite = 'walk';
    }

    // 更新動畫幀
    if (frameCount % this.frameDelay === 0) {
      this.frame = (this.frame + 1) % this.animConfig[this.currentSprite].frames;
    }
  }

  // 處理玩家移動
  move(keyCode) {
    // 左右移動
    if (keyCode === this.controls.left) {
      this.vel.x = -5;
    } else if (keyCode === this.controls.right) {
      this.vel.x = 5;
    }
    
    // 跳躍
    if (keyCode === this.controls.jump && !this.isJumping) {
      this.vel.y = -20;
      this.isJumping = true;
    }

    // 發射
    if (keyCode === this.controls.shoot) {
      this.shoot();
    }
  }

  // 處理玩家受傷
  hit() {
    this.health -= 10;
    if (this.health <= 0 && !this.isDead) {
      this.health = 0;
      this.isDead = true;
      gameOver = true;
      loser = this.name;
      // 更新比數
      if (this.name === "Player 1") {
        player2Score++;
      } else {
        player1Score++;
      }
    }
  }

  // 在 Player 類別中添加 stop 方法
  stop(keyCode) {
    if (keyCode === this.controls.left && this.vel.x < 0) {
      this.vel.x = 0;
    } else if (keyCode === this.controls.right && this.vel.x > 0) {
      this.vel.x = 0;
    }
  }

  // 在 Player 類別中添加 getCurrentSize 方法
  getCurrentSize() {
    return {
      x: this.animConfig[this.currentSprite].width * this.scale,
      y: this.animConfig[this.currentSprite].height * this.scale
    };
  }

  // 在 Player 類別中添加 display 方法
  display() {
    push();
    // 繪製生命值條
    this.drawHealthBar();
    
    // 繪製精靈圖
    let sprite = this.sprites[this.currentSprite];
    if (sprite) {
      push();
      translate(this.pos.x, this.pos.y);
      if (this.direction === -1) {
        scale(-1, 1);
        translate(-this.getCurrentSize().x, 0);
      }
      
      let frameWidth = sprite.width / this.animConfig[this.currentSprite].frames;
      let frameHeight = sprite.height;
      
      image(
        sprite,
        0,
        0,
        this.getCurrentSize().x,
        this.getCurrentSize().y,
        this.frame * frameWidth,
        0,
        frameWidth,
        frameHeight
      );
      pop();
    }
    pop();
  }

  // 在 Player 類別中添加 drawHealthBar 方法
  drawHealthBar() {
    const barWidth = 60;
    const barHeight = 10;
    const x = this.pos.x;
    const y = this.pos.y - 20;

    push();
    // 背景條（紅色）
    noStroke();
    fill(255, 0, 0);
    rect(x, y, barWidth, barHeight);
    
    // 生命值條（綠色）
    fill(0, 255, 0);
    rect(x, y, (barWidth * this.health) / 100, barHeight);

    // 顯示生命值數字
    fill(255);
    textAlign(CENTER);
    textSize(12);
    text(this.health, x + barWidth/2, y + barHeight - 1);
    pop();
  }

  // 在 Player 類別中添加 shoot 方法
  shoot() {
    if (!this.isAttacking && !this.isDead) {
      this.isAttacking = true;
      this.frame = 0;
      let projectileX = this.direction === 1 ? 
        this.pos.x + this.getCurrentSize().x : 
        this.pos.x;
      let projectileY = this.pos.y + this.getCurrentSize().y / 2;
      projectiles.push(new Projectile(projectileX, projectileY, this.color, this.direction));
    }
  }
}

// 發射物類別：定義發射物的屬性和行為
class Projectile {
  constructor(x, y, color, direction) {
    this.pos = createVector(x, y);
    this.vel = createVector(direction * 8, 0);
    this.color = color;
    this.size = 30;
  }

  update() {
    this.pos.add(this.vel);
    return this.pos.x < 0 || this.pos.x > width;
  }

  display() {
    push();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.size * 1.5, this.size);
    pop();
  }

  hits(player) {
    let hitSize = this.size / 2;
    return this.pos.x + hitSize > player.pos.x && 
           this.pos.x - hitSize < player.pos.x + player.getCurrentSize().x &&
           this.pos.y + hitSize > player.pos.y && 
           this.pos.y - hitSize < player.pos.y + player.getCurrentSize().y;
  }
}

// 遊戲初始化設定
function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 初始化背景
  setupBackground(window);
  
  // 玩家1的動作設定
  let player1Config = {
    walk: { 
      width: 29,
      height: 40,
      frames: 6
    },
    jump: { 
      width: 29,
      height: 34,
      frames: 5
    },
    attack: { 
      width: 29,
      height: 37,
      frames: 3
    }
  };
  
  // 玩家2的動作設定
  let player2Config = {
    walk: { 
      width: 20,
      height: 20,
      frames: 4
    },
    jump: { 
      width: 18,
      height: 20,
      frames: 5
    },
    attack: { 
      width: 30,
      height: 20,
      frames: 3
    }
  };
  
  // 計算角色的初始位置
  const centerX = width / 2;
  const centerY = height / 2;  // 使用螢幕中心點
  const spacing = 300;  // 角色之間的間距
  
  // 創建玩家1（在中間偏左）
  player1 = new Player(
    centerX - spacing,  // 中心點向左偏移
    centerY, 
    {
      left: 65,    // a
      right: 68,   // d
      jump: 87,    // w
      shoot: 70    // f
    },
    color(255, 0, 0),
    player1Sprites,
    player1Config,
    3,
    "Player 1"
  );
  
  // 創建玩家2（在中間偏右）
  player2 = new Player(
    centerX + spacing,  // 中心點向右偏移
    centerY,
    {
      left: LEFT_ARROW,
      right: RIGHT_ARROW,
      jump: UP_ARROW,
      shoot: 32    // 空白鍵
    },
    color(0, 0, 255),
    player2Sprites,
    player2Config,
    4,
    "Player 2"
  );
}

// 遊戲主循環
function draw() {
  // 繪製背景
  drawBackground(window);
  
  // 顯示比數
  push();
  textSize(32);
  textAlign(CENTER);
  
  // Player 1 比數
  fill(255, 0, 0);
  text("Player 1", width/4, 50);
  text(`[${player1Score}]`, width/4, 90);
  
  // VS
  fill(0);
  text("VS", width/2, 70);
  
  // Player 2 比數
  fill(0, 0, 255);
  text("Player 2", width*3/4, 50);
  text(`[${player2Score}]`, width*3/4, 90);
  pop();
  
  // 更新和顯示玩家
  player1.update();
  player2.update();
  player1.display();
  player2.display();
  
  // 更新和顯示發射物
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let p = projectiles[i];
    if (p.update()) {
      projectiles.splice(i, 1);
      continue;
    }
    p.display();
    
    // 檢查碰撞
    if (p.color !== player1.color && p.hits(player1)) {
      player1.hit();
      projectiles.splice(i, 1);
    }
    if (p.color !== player2.color && p.hits(player2)) {
      player2.hit();
      projectiles.splice(i, 1);
    }
  }

  // 修改遊戲結束訊息，添加重新開始提示
  if (gameOver) {
    push();
    // 添加���透明黑色背景
    fill(0, 0, 0, 127);
    rect(0, 0, width, height); 
    
    // 顯示勝負
    fill(255);
    textSize(64);
    textAlign(CENTER, CENTER);
    text(`${loser} Lost!`, width/2, height/2 - 40);
    
    // 顯示重新開始提示
    textSize(32);
    text("按一下螢幕開始", width/2, height/2 + 40);
    pop();
  }
}

// 遊戲重置函數
function resetGame() {
  // 重置遊戲狀態
  gameOver = false;
  loser = '';
  
  // 重置玩家位置和狀態
  const centerX = width / 2;
  const centerY = height / 2;
  const spacing = 300;
  
  // 重置玩家1
  player1.pos = createVector(centerX - spacing, centerY);
  player1.vel = createVector(0, 0);
  player1.health = 100;
  player1.isJumping = false;
  player1.isAttacking = false;
  player1.frame = 0;
  player1.direction = 1;
  player1.isDead = false;
  
  // 重置玩家2
  player2.pos = createVector(centerX + spacing, centerY);
  player2.vel = createVector(0, 0);
  player2.health = 100;
  player2.isJumping = false;
  player2.isAttacking = false;
  player2.frame = 0;
  player2.direction = -1;
  player2.isDead = false;
  
  // 清空所有發射物
  projectiles = [];
}

// 事件處理函數
function keyPressed() {
  // 處理按鍵按下事件
  player1.move(keyCode);
  player2.move(keyCode);
}

function keyReleased() {
  // 處理按鍵放開事件
  player1.stop(keyCode);
  player2.stop(keyCode);
}

function mousePressed() {
  // 處理滑鼠點擊事件（重新開始遊戲）
  if (gameOver) {
    resetGame();
  }
}
