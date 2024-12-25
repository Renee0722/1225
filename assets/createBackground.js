// 儲存背景元素的位置
let mountains = [];
let clouds = [];
let trees = [];
let grass = [];
let flowers = [];
let buildings = [];

// 修改所有與地面高度相關的常數
const GROUND_Y = 600;  // 將地面提高到離頂部600像素的位置

function setupBackground(p) {
  // 生成遠景山脈
  for(let x = -100; x < p.width + 100; x += 200) {
    mountains.push({
      x: x,
      height: p.random(200, 400),
      shade: p.random(50, 90)  // 不同山的明暗度
    });
  }
  
  // 生成雲朵
  for(let i = 0; i < 10; i++) {
    clouds.push({
      x: p.random(p.width),
      y: p.random(50, 150),
      size: p.random(50, 150),
      opacity: p.random(150, 200)
    });
  }
  
  // 生成樹木（多層）
  for(let layer = 0; layer < 3; layer++) {
    let treeLayer = [];
    let baseSize = 100 - layer * 20;  // 越遠的樹越小
    
    for(let x = 50; x < p.width; x += p.random(100, 200)) {
      treeLayer.push({
        x: x,
        size: p.random(baseSize * 0.8, baseSize * 1.2),
        type: p.floor(p.random(3))  // 不同類型的樹
      });
    }
    trees.push(treeLayer);
  }
  
  // 生成草地細節
  for(let x = 0; x < p.width; x += 3) {
    grass.push({
      x: x,
      height: p.random(5, 20),
      lean: p.random(-0.2, 0.2)  // 草的傾斜度
    });
  }
  
  // 生成花朵
  for(let i = 0; i < 50; i++) {
    flowers.push({
      x: p.random(p.width),
      y: p.random(p.height - 220, p.height - 180),
      size: p.random(5, 15),
      type: p.floor(p.random(3)),  // 不同類型的花
      color: p.random([
        p.color(255, 255, 0),  // 黃色
        p.color(255, 192, 203),  // 粉紅
        p.color(255, 0, 0),  // 紅色
        p.color(255, 255, 255)  // 白色
      ])
    });
  }
  
  // 初始化建築物
  buildings = [
    {
      x: p.width / 2 - 300,  // 建築物位置
      width: 600,            // 建築物寬度
      height: 400,           // 建築物高度
      color: p.color(220, 220, 220)  // 建築物顏色
    }
  ];
}

function drawBackground(p) {
  // 漸層天空
  let skyGradient = p.drawingContext.createLinearGradient(0, 0, 0, GROUND_Y);
  skyGradient.addColorStop(0, '#87CEEB');
  skyGradient.addColorStop(1, '#E6F3FF');
  p.drawingContext.fillStyle = skyGradient;
  p.rect(0, 0, p.width, GROUND_Y);
  
  // 繪製雲朵
  drawClouds(p);
  
  // 繪製遠景山脈
  drawMountains(p);
  
  // 繪製建築物
  drawBuildings(p);
  
  // 繪製多層樹木
  trees.forEach((layer, index) => {
    drawTreeLayer(p, layer, index);
  });
  
  // 繪製地面
  drawGround(p);
  
  // 繪製草地和花朵
  drawGrassAndFlowers(p);
}

function drawClouds(p) {
  p.noStroke();
  clouds.forEach(cloud => {
    p.push();
    p.fill(255, cloud.opacity);
    for(let i = 0; i < 5; i++) {
      p.ellipse(
        cloud.x + i * cloud.size/3,
        cloud.y,
        cloud.size,
        cloud.size * 0.6
      );
    }
    p.pop();
  });
}

function drawMountains(p) {
  mountains.forEach(mountain => {
    // 山的主體
    p.fill(70 + mountain.shade, 90 + mountain.shade, 110 + mountain.shade);
    p.noStroke();
    p.beginShape();
    p.vertex(mountain.x, GROUND_Y);
    
    // 使用固定的山形，不使用隨機控制點
    let peakX = mountain.x + 400;
    let peakY = GROUND_Y - mountain.height;
    
    // 使用簡單的三角形山形
    p.vertex(mountain.x + 200, GROUND_Y - mountain.height * 0.3);
    p.vertex(peakX, peakY);
    p.vertex(mountain.x + 600, GROUND_Y - mountain.height * 0.3);
    p.vertex(mountain.x + 800, GROUND_Y);
    
    p.endShape(p.CLOSE);
    
    // 添加雪頂
    if(mountain.height > 300) {
      p.fill(255, 250, 250, 200);
      p.triangle(
        peakX - 100, peakY + 50,
        peakX, peakY,
        peakX + 100, peakY + 50
      );
    }
  });
}

function drawTreeLayer(p, layer, layerIndex) {
  let opacity = 255 - layerIndex * 40;  // 越遠的樹越淡
  layer.forEach(tree => {
    drawDetailedTree(p, tree.x, GROUND_Y - 20 - layerIndex * 20, tree.size, tree.type, opacity);
  });
}

function drawDetailedTree(p, x, y, size, type, opacity) {
  p.push();
  switch(type) {
    case 0:  // 松樹型
      drawPineTree(p, x, y, size, opacity);
      break;
    case 1:  // 圓形樹冠
      drawRoundTree(p, x, y, size, opacity);
      break;
    case 2:  // 橢圓形樹冠
      drawOvalTree(p, x, y, size, opacity);
      break;
  }
  p.pop();
}

function drawGround(p) {
  // 地面漸層
  let groundGradient = p.drawingContext.createLinearGradient(0, GROUND_Y, 0, p.height);
  groundGradient.addColorStop(0, '#4CAF50');  // 草地綠
  groundGradient.addColorStop(1, '#3E2723');  // 深褐色土壤
  p.drawingContext.fillStyle = groundGradient;
  p.rect(0, GROUND_Y, p.width, p.height - GROUND_Y);
}

function drawGrassAndFlowers(p) {
  // 繪製草
  grass.forEach(g => {
    p.push();
    p.stroke(50, 160, 50, 230);
    p.strokeWeight(1);
    p.line(
      g.x,
      GROUND_Y,
      g.x + g.lean * GROUND_Y,
      GROUND_Y - g.height
    );
    p.pop();
  });
  
  // 繪製花朵
  flowers.forEach(flower => {
    drawFlower(p, flower);
  });
}

// 輔助函數：繪製不同類型的樹
function drawPineTree(p, x, y, size, opacity) {
  // 樹幹
  p.fill(101, 67, 33, opacity);
  p.rect(x - size/8, y - size/2, size/4, size/2);
  
  // 樹冠（三角形）
  p.fill(34, 139, 34, opacity);
  for(let i = 0; i < 3; i++) {
    p.triangle(
      x - size/2, y - size/2 + i * size/4,
      x, y - size + i * size/4,
      x + size/2, y - size/2 + i * size/4
    );
  }
}

function drawRoundTree(p, x, y, size, opacity) {
  // 樹幹
  p.fill(101, 67, 33, opacity);
  p.rect(x - size/8, y - size/2, size/4, size/2);
  
  // 圓形樹冠
  p.fill(34, 139, 34, opacity);
  p.ellipse(x, y - size/2, size, size);
}

function drawOvalTree(p, x, y, size, opacity) {
  // 樹幹
  p.fill(101, 67, 33, opacity);
  p.rect(x - size/8, y - size/2, size/4, size/2);
  
  // 橢圓形樹冠
  p.fill(34, 139, 34, opacity);
  p.ellipse(x, y - size/2, size, size * 1.5);
}

function drawFlower(p, flower) {
  p.push();
  p.translate(flower.x, flower.y);
  p.fill(flower.color);
  p.noStroke();
  
  switch(flower.type) {
    case 0:  // 簡單的圓形花朵
      for(let i = 0; i < 5; i++) {
        p.rotate(p.TWO_PI / 5);
        p.ellipse(flower.size/2, 0, flower.size, flower.size/2);
      }
      p.fill(255, 255, 0);
      p.ellipse(0, 0, flower.size/2, flower.size/2);
      break;
      
    case 1:  // 心形花瓣
      for(let i = 0; i < 4; i++) {
        p.rotate(p.TWO_PI / 4);
        p.beginShape();
        p.vertex(0, 0);
        p.bezierVertex(
          flower.size/2, -flower.size/2,
          flower.size, 0,
          0, flower.size
        );
        p.bezierVertex(
          -flower.size, 0,
          -flower.size/2, -flower.size/2,
          0, 0
        );
        p.endShape();
      }
      break;
      
    case 2:  // 星形花朵
      p.beginShape();
      for(let i = 0; i < 5; i++) {
        let angle = p.TWO_PI * i / 5 - p.PI/2;
        p.vertex(p.cos(angle) * flower.size, p.sin(angle) * flower.size);
        angle += p.TWO_PI/10;
        p.vertex(p.cos(angle) * flower.size/2, p.sin(angle) * flower.size/2);
      }
      p.endShape(p.CLOSE);
      break;
  }
  p.pop();
}

// 新增繪製建築物的函數
function drawBuildings(p) {
  buildings.forEach(building => {
    p.push();
    
    // 主建築
    p.fill(building.color);
    p.stroke(150);
    p.strokeWeight(2);
    p.rect(building.x, GROUND_Y - building.height, building.width, building.height);
    
    // 窗戶
    p.fill(200, 230, 255);
    for(let y = GROUND_Y - building.height + 120; y < GROUND_Y - 50; y += 60) {
      for(let x = building.x + 50; x < building.x + building.width - 50; x += 80) {
        p.rect(x, y, 60, 40);
      }
    }
    
    // 標誌（移到最上方）
    p.fill(0);
    p.noStroke();
    p.textSize(40);
    p.textAlign(p.CENTER, p.CENTER);
    p.text("淡江大學", building.x + building.width/2, GROUND_Y - building.height + 40);
    p.textSize(32);
    p.text("教育科技", building.x + building.width/2, GROUND_Y - building.height + 90);
    
    // 遊戲說明
    p.push();
    p.textSize(24);
    p.textAlign(p.LEFT, p.CENTER);
    
    // Player 1 說明
    p.fill(255, 0, 0);  // 紅色，對應 Player 1 顏色
    p.text("Player 1:", building.x + 50, GROUND_Y - building.height - 160);
    p.fill(0);
    p.text("W(跳) A(左) D(右) F(發射)", building.x + 160, GROUND_Y - building.height - 160);
    
    // Player 2 說明
    p.fill(0, 0, 255);  // 藍色，對應 Player 2 顏色
    p.text("Player 2:", building.x + 50, GROUND_Y - building.height - 120);
    p.fill(0);
    p.text("↑(跳) ←(左) →(右) Space(發射)", building.x + 160, GROUND_Y - building.height - 120);
    p.pop();
    
    // 門
    p.fill(100);
    p.rect(building.x + building.width/2 - 40, GROUND_Y - 80, 80, 80);
    
    // 屋頂
    p.fill(180);
    p.stroke(150);
    p.beginShape();
    p.vertex(building.x - 20, GROUND_Y - building.height);
    p.vertex(building.x + building.width/2, GROUND_Y - building.height - 100);
    p.vertex(building.x + building.width + 20, GROUND_Y - building.height);
    p.endShape(p.CLOSE);
    
    p.pop();
  });
}