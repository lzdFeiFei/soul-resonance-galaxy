// 配置参数
const CONFIG = {
    mouseDistance: 180, // 略微增大响应范围
    colors: [
        { r: 180, g: 200, b: 190 }, 
        { r: 210, g: 190, b: 160 }, 
        { r: 140, g: 160, b: 150 }, 
        { r: 180, g: 170, b: 190 }, 
        { r: 235, g: 240, b: 238 }  
    ],
    bgGalaxyThreshold: 2 
};

const OTHER_GALAXIES_DATA = [
    { id: 'soul84921', content: "我在等风，也在等你。" },
    { id: 'soul33012', content: "孤独是上帝给天才的礼物。" },
    { id: 'soul10929', content: "月亮生锈了，像一枚古老的硬币。" },
    { id: 'soul77382', content: "我们都是星尘的遗民。" },
    { id: 'soul55102', content: "在裂缝中寻找光。" }
];

const canvas = document.getElementById('soul-canvas');
const ctx = canvas.getContext('2d');
const labelsLayer = document.getElementById('galaxy-labels-layer');
const tooltip = document.getElementById('soul-tooltip');
const echoPanel = document.getElementById('echo-panel');
const closeEchoBtn = document.getElementById('close-echo');
const echoText = document.getElementById('echo-text');
const echoAiContent = document.getElementById('echo-ai-content');
const otherGalaxyList = document.getElementById('other-galaxy-list');
const myGalaxyInfo = document.getElementById('my-galaxy-info');
const backToMyPlanetBtn = document.getElementById('back-to-my-planet-btn');
const galaxyLevelDisplay = document.querySelector('.galaxy-level');

/* --- 业务逻辑 DOM 元素 (提前声明以避免 ReferenceError) --- */
const inputStage = document.getElementById('input-stage');
const loadingStage = document.getElementById('loading-stage');
const resultStage = document.getElementById('result-stage');
const galaxyViewUI = document.getElementById('galaxy-view-ui');
const resonateBtn = document.getElementById('resonate-btn');
const userInput = document.getElementById('user-input');
const dialogueOutput = document.getElementById('dialogue-output');
const saveBtn = document.getElementById('save-soul-btn');
const retryBtn = document.getElementById('retry-btn');
const backToInputBtn = document.getElementById('back-to-input-btn');

// Echo Canvas
const echoCanvas = document.getElementById('echo-canvas');
const echoCtx = echoCanvas.getContext('2d');
let echoParticles = [];
let echoW, echoH;
let echoAnimationId = null;

// Header Wave Canvas
const headerWaveCanvas = document.getElementById('header-wave-canvas');
const headerWaveCtx = headerWaveCanvas.getContext('2d');
let headerWaveW, headerWaveH;
initHeaderWave();

let width, height;
let mouse = { x: null, y: null };
let hoveredParticle = null;

let state = 'input'; 
let viewingTarget = 'me'; 
let galaxies = [];
let userGalaxy = null;
let cameraOffset = { x: 0, y: 0 }; 

// Global to store last generation
let currentAIResponse = null; 
let currentAIType = null;
let currentVisualType = 'flow'; // Default to flow field

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });

// 修复点击逻辑：确保能点击到他人星系的粒子和星团
window.addEventListener('click', (e) => {
    if (state !== 'galaxy_view') return;

    // 1. 优先：点击了具体的粒子
    if (hoveredParticle) {
        // 如果是用户自己的粒子 -> 打开回声
        if (hoveredParticle.isUser && hoveredParticle.text) {
            openEchoPanel(hoveredParticle);
            e.stopPropagation();
            return;
        }
        
        // 如果是他人的粒子
        if (!hoveredParticle.isUser) {
            // 如果已经聚焦在这个星系，点击粒子显示回声
            if (viewingTarget === hoveredParticle.galaxy.id) {
                 if (hoveredParticle.text) openEchoPanel(hoveredParticle);
            } else {
                // 否则，先飞过去
                focusOnGalaxy(hoveredParticle.galaxy);
            }
            e.stopPropagation();
            return;
        }
    }

    // 2. 兜底：点击了星系团（模糊判定）
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    for (let g of galaxies) {
        if (g.isUser || !g.visible) continue; // 跳过用户星系或未解锁的

        // 计算星系中心在屏幕上的位置
        const screenX = g.x + cameraOffset.x;
        const screenY = g.y + cameraOffset.y;
        const dist = Math.sqrt(Math.pow(clickX - screenX, 2) + Math.pow(clickY - screenY, 2));
        
        // 如果点击在星系中心 150px 范围内，且当前未聚焦该星系
        if (dist < 150) {
            if (viewingTarget !== g.id) {
                focusOnGalaxy(g);
            }
            return;
        }
    }
});

function openEchoPanel(particle) {
    echoText.innerText = particle.text || "";
    echoPanel.classList.add('active');
    
    // Render AI content
    echoAiContent.innerHTML = '';
    if (particle.aiContent && particle.aiType) {
        // Reuse render logic but statically (no typewriter for review)
        if (particle.aiType === 'dialogue') {
            particle.aiContent.forEach(line => {
                const item = document.createElement('div');
                item.className = 'dialogue-item';
                item.innerHTML = `<span class="${line.role.includes('A')?'role-a':(line.role.includes('B')?'role-b':'role-chorus')}">${line.role}</span>
                                  <span class="${line.role.includes('chorus')?'text-chorus':''}">${line.text}</span>`;
                echoAiContent.appendChild(item);
            });
        } else {
            particle.aiContent.forEach(line => {
                const lineEl = document.createElement('span');
                lineEl.className = 'poem-line';
                lineEl.innerText = line;
                echoAiContent.appendChild(lineEl);
            });
        }
    } else {
        // For others or particles without AI content
        echoAiContent.innerText = "The echo is silent...";
    }

    // Start Echo Video Animation
    initEchoVideo(particle.visualType || 'flow');
}

closeEchoBtn.addEventListener('click', () => {
    echoPanel.classList.remove('active');
    if (echoAnimationId) cancelAnimationFrame(echoAnimationId);
});

// --- Echo Video Logic (Reuse Flow Particle) ---
function initEchoVideo(visualType = 'flow') {
    if (!echoCanvas.parentElement) return;
    const rect = echoCanvas.parentElement.getBoundingClientRect();
    echoW = echoCanvas.width = rect.width;
    echoH = echoCanvas.height = rect.height;
    
    echoParticles = [];
    const count = 200;
    for(let i=0; i<count; i++) {
        const p = new FlowParticle(echoW, echoH, i, count); // Reuse class with new dimensions
        if (visualType !== 'flow') {
            p.setMode('shape', visualType);
        }
        echoParticles.push(p);
    }
    animateEchoVideo();
}

function animateEchoVideo() {
    if (!echoPanel.classList.contains('active')) return;
    
    echoCtx.fillStyle = 'rgba(0, 0, 0, 0.1)'; 
    echoCtx.fillRect(0, 0, echoW, echoH);
    
    echoParticles.forEach(p => {
        p.update();
        p.draw(echoCtx);
    });
    
    echoAnimationId = requestAnimationFrame(animateEchoVideo);
}


// --- 粒子系统 ---
class Particle {
    constructor(galaxy, isUser = false, text = null, index = 0, total = 1, aiContent = null, aiType = null, visualType = 'flow') {
        this.galaxy = galaxy;
        this.isUser = isUser;
        this.text = text;
        this.aiContent = aiContent;
        this.aiType = aiType;
        this.visualType = visualType; // Store visual type
        this.targetRelX = 0; this.targetRelY = 0;
        this.recalculateTarget(index, total);
        this.relX = (Math.random() - 0.5) * 200;
        this.relY = (Math.random() - 0.5) * 200;
        const colorSet = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
        this.colorRGB = colorSet;
        this.size = Math.random() * 1.2 + 0.5; 
        if (isUser) this.size += 1.0; 
        this.vx = (Math.random() - 0.5) * 0.15; 
        this.vy = (Math.random() - 0.5) * 0.15;
        this.flashPhase = Math.random() * Math.PI * 2;
    }

    recalculateTarget(index, total) {
        if (!this.isUser) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 50;
            this.targetRelX = Math.cos(angle) * r * 1.5; 
            this.targetRelY = Math.sin(angle) * r;
            return;
        }
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const radiusStep = 16; 
        const noise = (Math.random() - 0.5) * 10; 
        const r = radiusStep * Math.sqrt(index + 1) + noise;
        const theta = (index + 1) * goldenAngle;
        this.targetRelX = r * Math.cos(theta);
        this.targetRelY = r * Math.sin(theta);
    }

    update() {
        this.relX += this.vx;
        this.relY += this.vy;
        const dx = this.targetRelX - this.relX;
        const dy = this.targetRelY - this.relY;
        this.relX += dx * 0.015; 
        this.relY += dy * 0.015;

        this.worldX = this.galaxy.x + this.relX + cameraOffset.x;
        this.worldY = this.galaxy.y + this.relY + cameraOffset.y;

        // 扩大鼠标响应范围
        if (mouse.x != null && state === 'galaxy_view') {
            let distToMouseX = mouse.x - this.worldX;
            let distToMouseY = mouse.y - this.worldY;
            let distance = Math.sqrt(distToMouseX * distToMouseX + distToMouseY * distToMouseY);
            
            if (distance < 150) { // 范围扩大
                this.relX += (distToMouseX / distance) * 0.5;
                this.relY += (distToMouseY / distance) * 0.5;
                if (distance < 50) return this; // 更容易选中
            }
        }
        return null;
    }

    draw(isHovered) {
        const screenX = this.worldX;
        const screenY = this.worldY;
        
        const flash = Math.sin(Date.now() * 0.003 + this.flashPhase) * 0.2;
        let sizeBase = isHovered ? this.size * 2.5 : this.size * 1.2;
        
        // 绘制同色光晕 (Halo)
        ctx.beginPath();
        const haloGradient = ctx.createRadialGradient(screenX, screenY, sizeBase * 0.5, screenX, screenY, sizeBase * 4);
        haloGradient.addColorStop(0, `rgba(${this.colorRGB.r}, ${this.colorRGB.g}, ${this.colorRGB.b}, ${isHovered ? 0.4 : 0.15})`);
        haloGradient.addColorStop(1, `rgba(${this.colorRGB.r}, ${this.colorRGB.g}, ${this.colorRGB.b}, 0)`);
        ctx.fillStyle = haloGradient;
        ctx.arc(screenX, screenY, sizeBase * 4, 0, Math.PI * 2);
        ctx.fill();

        // 绘制立体光球 (Core)
        ctx.beginPath();
        const coreGradient = ctx.createRadialGradient(screenX - sizeBase * 0.2, screenY - sizeBase * 0.2, 0, screenX, screenY, sizeBase);
        coreGradient.addColorStop(0, `rgba(255, 255, 255, 0.95)`); // 高光
        coreGradient.addColorStop(0.2, `rgba(${this.colorRGB.r}, ${this.colorRGB.g}, ${this.colorRGB.b}, 0.9)`); // 核心色
        coreGradient.addColorStop(0.6, `rgba(${this.colorRGB.r}, ${this.colorRGB.g}, ${this.colorRGB.b}, 0.4)`);
        coreGradient.addColorStop(1, `rgba(${this.colorRGB.r}, ${this.colorRGB.g}, ${this.colorRGB.b}, 0)`);
        
        ctx.fillStyle = coreGradient;
        ctx.arc(screenX, screenY, sizeBase, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Galaxy {
    constructor(id, isUser = false, mockContent = null) {
        this.id = id;
        this.isUser = isUser;
        this.particles = [];
        this.visible = isUser; 
        this.mockContent = mockContent; 
        
        if (isUser) {
            this.x = width / 2;
            this.y = height * 0.75;
        } else {
            // 改进的随机分布逻辑：将屏幕分为几个区域，避免扎堆
            // 简单的分区逻辑：左右两侧，或者九宫格
            // 这里采用简单的"避让中心 + 全屏随机"策略
            
            // 1. 随机全屏坐标
            let rx = Math.random() * 0.8 + 0.1; // 10% - 90%
            let ry = Math.random() * 0.6 + 0.1; // 10% - 70%
            
            // 2. 简单的中心避让 (避免和主星系重叠太近)
            // 主星系大约在 (0.5, 0.75)
            const distToCenter = Math.sqrt(Math.pow(rx - 0.5, 2) + Math.pow(ry - 0.75, 2));
            if (distToCenter < 0.3) {
                // 如果太近，就强制移到上面或两侧
                if (Math.random() > 0.5) rx = rx < 0.5 ? rx * 0.5 : 0.6 + (rx - 0.5);
                else ry = ry * 0.5; 
            }

            // 3. 尝试均匀化 X 轴分布 (避开下方 UI 区域)
            let safe = false;
            let attempts = 0;
            while(!safe && attempts < 100) {
                 attempts++;
                 let rx = Math.random() * 0.8 + 0.1;
                 let ry = Math.random() * 0.6 + 0.1;
                 
                 // 避开中心
                 const distToCenter = Math.sqrt(Math.pow(rx - 0.5, 2) + Math.pow(ry - 0.75, 2));
                 if (distToCenter < 0.3) continue;
                 
                 // 避开下方 UI 区域 (假设 UI 在 40%-60% 宽度，60%-100% 高度)
                 if (rx > 0.35 && rx < 0.65 && ry > 0.55) continue;
                 
                 this.x = rx * width;
                 this.y = ry * height;
                 safe = true;
            }

            const count = Math.floor(Math.random() * 8) + 4;
            for(let i=0; i<count; i++) {
                this.addParticle(this.mockContent); 
            }
            this.createLabel();
        }
    }

    addParticle(text, aiContent = null, aiType = null, visualType = 'flow') {
        const index = this.particles.length;
        const total = this.particles.length + 1;
        const p = new Particle(this, this.isUser, text, index, total, aiContent, aiType, visualType);
        this.particles.push(p);
        if (this.isUser) {
            this.particles.forEach((pt, idx) => pt.recalculateTarget(idx, total));
        }
    }

    createLabel() {
        const label = document.createElement('div');
        label.className = 'galaxy-label';
        label.innerText = this.id;
        this.labelEl = label;
        label.addEventListener('click', () => {
            focusOnGalaxy(this);
        });
        labelsLayer.appendChild(label);
    }

    update() {
        if (!this.visible) return null;

        // 坍缩动画状态
        if (this.isCollapsing) {
             const centerX = width / 2;
             const centerY = height / 2;
             
             // 1. 星系中心强制归位
             this.x += (centerX - this.x) * 0.1;
             this.y += (centerY - this.y) * 0.1;
             
             // 2. 粒子向心旋转坍缩
             this.particles.forEach(p => {
                 // 缩小目标半径 (缓慢增加引力)
                 p.targetRelX *= 0.9;
                 p.targetRelY *= 0.9;
                 
                 // 强制当前位置向中心靠拢
                 p.relX *= 0.88;
                 p.relY *= 0.88;
                 
                 // 旋转效果 (Swirl)
                 const angle = Math.atan2(p.relY, p.relX);
                 const dist = Math.sqrt(p.relX*p.relX + p.relY*p.relY);
                 
                 // 距离中心越近转得越快，增加最大速度限制防止穿模
                 let speed = 0.15 + (150 / (dist + 10)) * 0.1; 
                 speed = Math.min(speed, 0.8); // 限制最大旋转速度

                 const newAngle = angle + speed;
                 
                 p.relX = Math.cos(newAngle) * dist;
                 p.relY = Math.sin(newAngle) * dist;
             });
             
        } else if (this.isUser && state === 'input') {
            const targetX = width / 2;
            const targetY = height / 2 - 50;
            // 幅度加大
            const floatX = Math.sin(Date.now() * 0.0015) * 80; // 40 -> 80
            const floatY = Math.cos(Date.now() * 0.002) * 50;  // 25 -> 50
            let finalX = targetX + floatX;
            let finalY = targetY + floatY;

            if (mouse.x != null) {
                const dx = mouse.x - finalX;
                const dy = mouse.y - finalY;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 300) { // 避让范围加大
                    finalX -= (dx/dist) * 80;
                    finalY -= (dy/dist) * 80;
                }
            }
            this.x += (finalX - this.x) * 0.05; // 响应速度加快
            this.y += (finalY - this.y) * 0.05;

        } else if (this.isUser && state === 'galaxy_view') {
            const targetY = height * 0.75;
            this.x += (width/2 - this.x) * 0.05;
            this.y += (targetY - this.y) * 0.05;
        } else {
            // 背景星系漂浮幅度也略微加大
            this.x += Math.sin(Date.now() * 0.0005 + this.x * 0.01) * 0.1;
            this.y += Math.cos(Date.now() * 0.0006 + this.y * 0.01) * 0.1;
        }

        let hovered = null;
        this.particles.forEach(p => {
            const h = p.update();
            if (h) hovered = h;
        });

        if (this.labelEl) {
            const screenX = this.x + cameraOffset.x;
            const screenY = this.y + cameraOffset.y;
            this.labelEl.style.left = screenX + 'px';
            this.labelEl.style.top = screenY + 'px';
            if (state === 'galaxy_view' && viewingTarget === 'me') {
                this.labelEl.classList.add('visible');
            } else {
                this.labelEl.classList.remove('visible');
            }
        }
        return hovered;
    }

    draw(hoveredParticle) {
        if (!this.visible) return;
        
        if (this.isUser && this.particles.length > 1) {
             for(let i=0; i<this.particles.length; i++) {
                 if (i < this.particles.length - 1) {
                     const p1 = this.particles[i];
                     const p2 = this.particles[i+1];
                     const dist = Math.sqrt(Math.pow(p1.worldX-p2.worldX, 2) + Math.pow(p1.worldY-p2.worldY, 2));
                     if (dist < 150) {
                         ctx.beginPath();
                         ctx.strokeStyle = `rgba(210, 190, 160, 0.08)`; // 连线大幅弱化
                         ctx.lineWidth = 0.5;
                         ctx.moveTo(p1.worldX, p1.worldY);
                         ctx.lineTo(p2.worldX, p2.worldY);
                         ctx.stroke();
                     }
                 }
             }
        }
        this.particles.forEach(p => p.draw(p === hoveredParticle));
    }
}

function init() {
    galaxies = [];
    labelsLayer.innerHTML = '';
    otherGalaxyList.innerHTML = '';

    userGalaxy = new Galaxy('MY_SOUL', true);
    galaxies.push(userGalaxy);

    const bgCount = 5;
    for(let i=0; i<bgCount; i++) {
        const data = OTHER_GALAXIES_DATA[i % OTHER_GALAXIES_DATA.length];
        const g = new Galaxy(data.id, false, data.content);
        g.visible = false;

        // 覆盖随机位置，使用分区分布策略 + 避让逻辑
        let safe = false;
        let attempts = 0;
        while (!safe && attempts < 50) {
            attempts++;
            const sectorWidth = width / bgCount;
            const sectorX = i * sectorWidth + (Math.random() * 0.6 + 0.2) * sectorWidth; 
            let sectorY = (Math.random() * 0.6 + 0.1) * height;
            
            // 简单避让下方 UI (避开底部按钮区域)
            if (sectorY > height * 0.6 && sectorX > width * 0.25 && sectorX < width * 0.75) {
                continue;
            }
            
            g.x = sectorX;
            g.y = sectorY;
            safe = true;
        }

        galaxies.push(g);
        // List items are now added dynamically in updateGalaxyList()
    }
    updateGalaxyList();
    
    // Fix: Add listener for back button
    backToInputBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // 防止穿透点击到背后的星系
        switchStage('input');
        // Reset camera
        viewingTarget = 'me';
        targetCameraOffset = { x: 0, y: 0 };
        backToMyPlanetBtn.classList.remove('visible');
        myGalaxyInfo.style.opacity = '1';
        myGalaxyInfo.style.pointerEvents = 'auto';
        otherGalaxyWelcome.style.opacity = '0'; // Ensure welcome hidden
        echoPanel.classList.remove('active'); // Ensure echo is closed
    });
}

function updateGalaxyList() {
    otherGalaxyList.innerHTML = '';
    galaxies.forEach(g => {
        if (!g.isUser && g.visible) {
            const li = document.createElement('li');
            li.innerText = g.id;
            li.style.animation = 'fadeIn 0.5s ease';
            li.onclick = () => focusOnGalaxy(g);
            otherGalaxyList.appendChild(li);
        }
    });
}

const otherGalaxyWelcome = document.getElementById('other-galaxy-welcome');
const welcomeSoulId = document.getElementById('welcome-soul-id');
const welcomeGalaxyCoords = document.getElementById('welcome-galaxy-coords');

// ...

function focusOnGalaxy(targetGalaxy) {
    viewingTarget = targetGalaxy.id;
    const targetOffsetX = width/2 - targetGalaxy.x;
    const targetOffsetY = height/2 - targetGalaxy.y;
    targetCameraOffset = { x: targetOffsetX, y: targetOffsetY };
    myGalaxyInfo.style.opacity = '0';
    myGalaxyInfo.style.pointerEvents = 'none';
    
    // Show welcome message for other galaxies
    if (!targetGalaxy.isUser) {
        welcomeSoulId.innerText = targetGalaxy.id.toUpperCase();
        // 设置随机坐标或使用存储的坐标
        if (!targetGalaxy.coords) {
            // 生成随机经纬度
            const lat = Math.floor(Math.random() * 90) + "°" + Math.floor(Math.random() * 60) + "'" + (Math.random() * 60).toFixed(1) + "\"N";
            const lng = Math.floor(Math.random() * 180) + "°" + Math.floor(Math.random() * 60) + "'" + (Math.random() * 60).toFixed(1) + "\"E";
            targetGalaxy.coords = `${lat} ${lng}`;
        }
        welcomeGalaxyCoords.innerText = targetGalaxy.coords;
        
        otherGalaxyWelcome.style.opacity = '1';
    }

    backToMyPlanetBtn.classList.add('visible');
}

function backToMyPlanet() {
    viewingTarget = 'me';
    targetCameraOffset = { x: 0, y: 0 };
    myGalaxyInfo.style.opacity = '1';
    myGalaxyInfo.style.pointerEvents = 'auto';
    
    // Hide welcome message
    otherGalaxyWelcome.style.opacity = '0';

    backToMyPlanetBtn.classList.remove('visible');
    echoPanel.classList.remove('active');
}
backToMyPlanetBtn.addEventListener('click', backToMyPlanet);

let targetCameraOffset = { x: 0, y: 0 };

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    cameraOffset.x += (targetCameraOffset.x - cameraOffset.x) * 0.05;
    cameraOffset.y += (targetCameraOffset.y - cameraOffset.y) * 0.05;

    let currentHover = null;
    let isHoveringGalaxy = false; // 检测是否悬浮在星系上

    // 1. 粒子检测
    galaxies.forEach(g => {
        const h = g.update();
        if (h) currentHover = h;
        g.draw(currentHover);
    });
    
    // 2. 额外检测：鼠标是否悬浮在任何背景星系团附近
    if (!currentHover && state === 'galaxy_view') {
        const rect = canvas.getBoundingClientRect();
        const mouseX = mouse.x;
        const mouseY = mouse.y;
        
        if (mouseX != null) {
            for (let g of galaxies) {
                 if (g.isUser || !g.visible) continue;
                 const screenX = g.x + cameraOffset.x;
                 const screenY = g.y + cameraOffset.y;
                 const dist = Math.sqrt(Math.pow(mouseX - screenX, 2) + Math.pow(mouseY - screenY, 2));
                 if (dist < 150) {
                     isHoveringGalaxy = true;
                     break;
                 }
            }
        }
    }

    hoveredParticle = currentHover;

    if ((hoveredParticle && hoveredParticle.text) || isHoveringGalaxy) {
        document.body.style.cursor = 'pointer';
        // 显示 Tooltip (气泡)
        if (hoveredParticle && hoveredParticle.text) {
            const screenX = hoveredParticle.worldX;
            const screenY = hoveredParticle.worldY;
            tooltip.innerHTML = hoveredParticle.text;
            tooltip.style.left = (screenX + 20) + 'px';
            tooltip.style.top = (screenY - 20) + 'px';
            tooltip.classList.add('visible');
        } else {
            tooltip.classList.remove('visible');
        }
    } else {
        document.body.style.cursor = 'default';
        tooltip.classList.remove('visible');
    }

    requestAnimationFrame(animate);
}

init();
animate();


/* --- 业务逻辑 --- */
// DOM Elements moved to top of file to fix hoisting issues

let soulCount = 0;
let currentSoulText = "";

const MOCK_RESPONSE_TEMPLATE = (input) => [
    { role: 'A ', text: `"${input}"... 就像是雪落在屋顶的声音，太轻了没人听见。` },
    { role: 'B ', text: '但屋顶知道，春天也知道。' },
    { role: 'Together ', text: '每一次消融，都是为了更好的重逢。' }
];

function switchStage(toStageName) {
    inputStage.classList.remove('active');
    loadingStage.classList.remove('active');
    resultStage.classList.remove('active');
    galaxyViewUI.classList.remove('active');
    state = toStageName;
    setTimeout(() => {
        if (toStageName === 'input') inputStage.classList.add('active');
        if (toStageName === 'loading') loadingStage.classList.add('active');
        if (toStageName === 'result') resultStage.classList.add('active');
        if (toStageName === 'galaxy_view') galaxyViewUI.classList.add('active');
    }, 500);
}

resonateBtn.addEventListener('click', () => {
    if (!userInput.value.trim()) return;
    currentSoulText = userInput.value.trim();
    startResonanceProcess();
});

function startResonanceProcess() {
    switchStage('loading');
    setTimeout(() => {
        generateSoulContent(currentSoulText); // Switch to new AI generation function
        switchStage('result');
    }, 2500);
}

// --- AI Content Generation (Mock / API Ready) ---
// If you have an API key, replace the mock logic below with a fetch call.

const NEW_MOCK_SCENARIOS = [
    {
        input: "今天面真好吃",
        keywords: ["面", "吃", "饿", "食物"],
        visual: "steam",
        content: [
            "是你真的饿了吗？",
            "还是这味道有了灵魂？",
            " ",
            "在挑剔的美食家眼里，",
            "这不过是面粉与水的相逢。",
            "但在疲惫了一天的你看来，",
            "这是深夜里最滚烫的慰藉。",
            " ",
            "这就是为什么我觉得，",
            "不要只盯着调料的贵重，",
            "那升腾的热气、满足的叹息，",
            "才是食物真正的奥义。",
            " ",
            "这只是，",
            "味蕾的视角。"
        ]
    },
    {
        input: "雪融化了",
        keywords: ["雪", "融化", "春天", "冬"],
        visual: "snow",
        content: [
            "是白色的消逝？",
            "还是新生的开始？",
            " ",
            "对于那个堆好的雪人来说，",
            "这是一场漫长的告别。",
            "但对于泥土下的种子，",
            "那是春天的敲门声。",
            " ",
            "所以与其哀叹美好的短暂，",
            "不如去拥抱变化的必然。",
            "雪融化后不是水，",
            "是春天。",
            " ",
            "这只是，",
            "时间的视角。"
        ]
    },
    {
        input: "这个软件好牛逼",
        keywords: ["软件", "牛逼", "好用", "厉害", "代码"],
        visual: "matrix",
        content: [
            "是代码的堆砌？",
            "还是思维的魔法？",
            " ",
            "对于不知情的人来说，",
            "它只是冰冷的程序。",
            "但对于此刻被它连接的你，",
            "这是一座跨越障碍的桥梁。",
            " ",
            "我们总是惊叹于工具的强大，",
            "却忘了背后那颗试图理解世界的心。",
            "逻辑、效率、与无限的可能，",
            "才是它真正的性感。",
            " ",
            "这只是，",
            "智慧的视角。"
        ]
    },
    {
        input: "越长大越找不到一个同频的人",
        keywords: ["长大", "同频", "孤独", "朋友"],
        visual: "island",
        content: [
            "是世界变得嘈杂？",
            "还是你变得独特？",
            " ",
            "在随波逐流的人群中，",
            "你像一座沉默的孤岛。",
            "但在那个懂你的人眼里，",
            "你是一本读不厌的书。",
            " ",
            "如果你觉得孤独，",
            "那是因为你的灵魂进化出了更繁复的纹理。",
            "与其强求共鸣，",
            "不如享受这独一无二的频率。",
            " ",
            "这只是，",
            "成长的视角。"
        ]
    },
    {
        input: "不能被现实的焦虑打败",
        keywords: ["焦虑", "现实", "打败", "压力"],
        visual: "wave",
        content: [
            "是巨浪将你吞没？",
            "还是你在浪尖起舞？",
            " ",
            "对于昨天的你，",
            "焦虑是无法逾越的高墙。",
            "但对于未来的你，",
            "这只是成长路上的注脚。",
            " ",
            "焦虑证明你在乎，",
            "证明你不想止步于此。",
            "那些韧性、坚持、和破局的勇气，",
            "才是焦虑送给你的礼物。",
            " ",
            "这只是，",
            "心态的视角。"
        ]
    },
    {
        input: "湖面很平静，治愈了所有的不开心",
        keywords: ["湖", "平静", "治愈", "开心", "水"],
        visual: "mirror",
        content: [
            "是湖水止住了波澜？",
            "还是你的心放下了喧嚣？",
            " ",
            "对于扔石子的人，",
            "湖面是破碎的。",
            "但对于此刻凝视的你，",
            "世界是一面温柔的镜子。",
            " ",
            "它没有说话，",
            "却替你回答了所有的纷扰。",
            "真正治愈你的不是水，",
            "是你终于允许自己，停下来。",
            " ",
            "这只是，",
            "静谧的视角。"
        ]
    },
    {
        input: "今天天好蓝啊",
        keywords: ["天", "蓝", "云", "空"],
        visual: "cloud",
        content: [
            "是天空原本就蓝？",
            "还是因为它足够深邃？",
            " ",
            "对于外太空的旅人，",
            "那里是无尽的黑暗。",
            "但对于在大地上行走的我们，",
            "那是头顶最辽阔的拥抱。",
            " ",
            "即便它是空的，",
            "也能装下我们所有的梦。",
            "清澈、远大、无边无际，",
            "那是我们向往的自由。",
            " ",
            "这只是，",
            "距离的视角。"
        ]
    },
    {
        input: "远方的航迹云",
        keywords: ["航迹云", "飞机", "云", "远方"],
        visual: "trail",
        content: [
            "是天空的一道伤痕？",
            "还是一封写给云的情书？",
            " ",
            "对于送别的人，",
            "那是离去的背影。",
            "但对于等待的人，",
            "那是回家的路标。",
            " ",
            "每一道轨迹，",
            "都承载着某人的悲欢离合。",
            "只要还在前行，",
            "痕迹本身就是意义。",
            " ",
            "这只是，",
            "方向的视角。"
        ]
    },
    {
        input: "想回到童年",
        keywords: ["童年", "小时候", "长大", "过去"],
        visual: "balloon",
        content: [
            "是时光已经流逝？",
            "还是那份纯真被你藏起？",
            " ",
            "对于日历来说，",
            "回不去的是岁月。",
            "但对于那个在雨天踩水坑的你，",
            "童年从未离开。",
            " ",
            "只要你还愿意为一只蝴蝶驻足，",
            "还愿意相信童话。",
            "只要心不老，",
            "你就永远不用长大。",
            " ",
            "这只是，",
            "记忆的视角。"
        ]
    },
    {
        input: "如果大象会说话",
        keywords: ["大象", "动物", "说话"],
        visual: "ripple",
        content: [
            "是它们太沉默？",
            "还是我们太聒噪？",
            " ",
            "也许它们一直在诉说，",
            "关于雨林，关于古老的记忆。",
            "但对于匆忙的人类，",
            "那只是一声无意义的长鸣。",
            " ",
            "并不是所有的沟通都需要语言，",
            "那些厚重、温柔、和深情的注视，",
            "才是万物通用的诗句。",
            " ",
            "这只是，",
            "倾听的视角。"
        ]
    },
    {
        input: "小孩羡慕大人，想快快长大。大人羡慕小孩，想回到童年",
        keywords: ["小孩", "大人", "羡慕", "长大", "童年"],
        visual: "hourglass",
        content: [
            "是自由更珍贵？",
            "还是无忧更难得？",
            " ",
            "孩子看着大人的高跟鞋，",
            "看到了独立的世界。",
            "大人看着孩子的泥巴手，",
            "看到了逝去的乐园。",
            " ",
            "如果在彼此的眼里，",
            "对方都是最好的模样，",
            "或许每一个当下，都是黄金时代。",
            " ",
            "这就是为什么我觉得，",
            "与其羡慕围墙的另一边，",
            "不如拥抱此刻的自己。",
            " ",
            "这只是，",
            "人生的视角。"
        ]
    }
];

async function generateSoulContent(inputText) {
    // For now, we simulate AI generation with templates.
    // In a real app, you would call: const response = await fetch('/api/generate', ...);
    
    // Always use poem type for the new content style
    const type = 'poem'; 
    const responseData = mockAIResponse(inputText, type);
    
    // Store globally
    currentAIResponse = responseData.content;
    currentAIType = type;
    currentVisualType = responseData.visual; // Store visual type
    
    renderContent(responseData.content, type);

    // Update Visuals
    initParticleVideo(currentVisualType);
}

function mockAIResponse(input, type) {
    const cleanInput = input.trim().toLowerCase();
    
    // 1. Try exact match or match included in scenario input
    let match = NEW_MOCK_SCENARIOS.find(s => s.input === cleanInput || cleanInput.includes(s.input) || s.input.includes(cleanInput));
    
    // 2. Try keyword match
    if (!match) {
        match = NEW_MOCK_SCENARIOS.find(s => s.keywords.some(k => cleanInput.includes(k)));
    }
    
    if (match) {
        return { content: match.content, visual: match.visual };
    }

    // Default Fallback
    return {
        content: [
            `世人只读懂了气温的升降，`,
            `指着地上的泥泞说是水。`,
            `"${input}"`,
            `那是书本里唯一的注解。`,
            `但我却读懂了风的柔软，`,
            `那是寒冬松手的信号，`,
            `是万物在枝头结蕾的序章。`,
            `如果你也愿意相信，`,
            `这并非一场消亡，而是一次新生。`,
            `那你一定也会看见——`,
            `雪融化后，不是水，`,
            `是春天啊。`
        ],
        visual: 'flow' // Default visual
    };
}

/* 
// Deprecated old Mock Functions
function generateMockDialogue(input, mood) { ... }
function generateMockPoem(input, mood) { ... }
*/

function renderContent(content, type) {
    dialogueOutput.innerHTML = ''; 
    
    if (type === 'dialogue') {
        // Dialogue Mode: Render items one by one, but text inside types out
        let totalDelay = 0;
        content.forEach((line, index) => {
            // Create container
            const item = document.createElement('div');
            item.className = 'dialogue-item';
            item.style.opacity = '0'; // Start hidden
            dialogueOutput.appendChild(item);

            // Calculate delay based on previous line length
            setTimeout(() => {
                item.style.opacity = '1';
                item.innerHTML = `<span class="${line.role.includes('A')?'role-a':(line.role.includes('B')?'role-b':'role-chorus')}">${line.role}</span>
                                  <span class="${line.role.includes('chorus')?'text-chorus':''}"></span>`;
                
                const textSpan = item.lastElementChild;
                typeWriterEffect(textSpan, line.text, 30); // 30ms per char
            }, totalDelay);

            totalDelay += 600 + line.text.length * 30; // Wait for prev line to finish + buffer
        });
    } else {
        // Poem Mode
        const container = document.createElement('div');
        container.className = 'poem-container';
        dialogueOutput.appendChild(container);

        let totalDelay = 0;
        content.forEach((line) => {
            const lineEl = document.createElement('span');
            lineEl.className = 'poem-line';
            lineEl.style.opacity = '1'; // Make visible immediately for typing
            lineEl.innerText = '';      // Start empty
            container.appendChild(lineEl);

            setTimeout(() => {
                typeWriterEffect(lineEl, line, 50); // Slower for poems
            }, totalDelay);

            totalDelay += 800 + line.length * 50;
        });
    }
}

function typeWriterEffect(element, text, speed) {
    let i = 0;
    element.innerHTML = '<span class="typewriter-cursor"></span>';
    const cursor = element.querySelector('.typewriter-cursor');
    
    function type() {
        if (i < text.length) {
            // Insert text before cursor
            cursor.insertAdjacentText('beforebegin', text.charAt(i));
            i++;
            setTimeout(type, speed);
        } else {
            // Typing finished, remove cursor after a moment
            setTimeout(() => cursor.remove(), 1000);
        }
    }
    type();
}

// Add global CSS for generic fade in if not exists
if (!document.getElementById('dynamic-styles')) {
    const style = document.createElement('style');
    style.id = 'dynamic-styles';
    style.innerHTML = `@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`;
    document.head.appendChild(style);
}

/* 
function generateContent(text) {
    const lines = MOCK_RESPONSE_TEMPLATE(text);
    dialogueOutput.innerHTML = ''; 
    lines.forEach((line, index) => {
        setTimeout(() => {
            dialogueOutput.innerHTML += `
                <div class="dialogue-item" style="opacity:1">
                    <span class="${line.role.includes('A')?'role-a':(line.role.includes('B')?'role-b':'role-chorus')}">${line.role}</span>
                    <span class="${line.role.includes('chorus')?'text-chorus':''}">${line.text}</span>
                </div>`;
        }, index * 800);
    });
}
*/

// --- Galaxy Generation & List Logic ---
function generateRandomGalaxyID() {
    return 'soul' + Math.floor(10000 + Math.random() * 90000);
}

function addNewGalaxy() {
    const id = generateRandomGalaxyID();
    // 随机生成一些诗意的短句作为内容
    const mockContents = [
        "星辰的碎片终将重逢。",
        "在时间的尽头等你。",
        "每一个原子都曾属于一颗恒星。",
        "回声是宇宙的记忆。",
        "光年之外，有人在听。",
        "沉默是最大的喧嚣。"
    ];
    const content = mockContents[Math.floor(Math.random() * mockContents.length)];
    
    const g = new Galaxy(id, false, content);
    g.visible = true; // 新生成的直接可见
    
    // 随机位置，但尽量避开中心和UI区域
    let safe = false;
    let attempts = 0;
    while(!safe && attempts < 100) {
        attempts++;
        const angle = Math.random() * Math.PI * 2;
        const r = Math.min(width, height) * (0.3 + Math.random() * 0.4);
        const tx = width/2 + Math.cos(angle) * r;
        const ty = height/2 + Math.sin(angle) * r;
        
        // UI Avoidance (Center Bottom for Buttons)
        // Reject if in bottom 40% of screen AND in middle 50% width
        if (ty > height * 0.6 && tx > width * 0.25 && tx < width * 0.75) continue;
        
        g.x = tx;
        g.y = ty;
        safe = true;
    }
    
    galaxies.push(g);
    updateGalaxyList();
    
    // 视觉反馈：聚焦到新星系（可选，或者只是添加到列表）
    // 这里为了强调"出现"，我们可以在列表中高亮它
    setTimeout(() => {
        const list = document.getElementById('other-galaxy-list');
        if (list.lastElementChild) {
            list.lastElementChild.style.color = 'var(--soul-gold)';
            list.lastElementChild.style.textShadow = '0 0 10px var(--soul-gold)';
        }
    }, 100);
}

retryBtn.addEventListener('click', () => {
    // 直接重新开始共鸣流程，使用上一次的文本
    if (currentSoulText) {
        startResonanceProcess();
    } else {
        // 如果没有文本（异常情况），回退到输入
        switchStage('input');
    }
});

saveBtn.addEventListener('click', () => {
    // 1. 启动坍缩视觉
    document.body.classList.add('collapsing-mode');
    userGalaxy.isCollapsing = true; // 开启物理坍缩

    // 延迟执行切换，等待动画完成
    setTimeout(() => {
        // Pass AI content to particle
        userGalaxy.addParticle(currentSoulText, currentAIResponse, currentAIType, currentVisualType);
        soulCount++;
        const countStr = soulCount < 10 ? '0' + soulCount : '' + soulCount;
        galaxyLevelDisplay.innerText = countStr;
        
        // 逻辑修改：每次保存都生成一个新的"他者星系"
        // 模拟宇宙中因为你的回声而点亮了远处的某颗星
        addNewGalaxy();
        
        switchStage('galaxy_view');
        userInput.value = '';

        // 恢复状态
        document.body.classList.remove('collapsing-mode');
        userGalaxy.isCollapsing = false;
        
        // 重置粒子位置到中心，制造"爆发"感
        userGalaxy.particles.forEach(p => {
            // 稍微保留一点随机散布，避免过于完美的圆点
            p.relX = (Math.random() - 0.5) * 5; 
            p.relY = (Math.random() - 0.5) * 5;
        });

    }, 1500); // 对应 CSS transition 时间
});


// --- Waveform Visualizer (Green Box - Dynamic Lines) ---
const waveformCanvas = document.getElementById('waveform-canvas');
const waveCtx = waveformCanvas.getContext('2d');

function initWaveform() {
    // Set resolution
    waveformCanvas.width = 100;
    waveformCanvas.height = 30;
    animateWaveform();
}

function animateWaveform() {
    waveCtx.clearRect(0, 0, 100, 30);
    
    // 配置线条参数
    const lines = [
        { color: 'rgba(0, 240, 255, 0.8)', speed: 0.1, amp: 8, phase: 0 },
        { color: 'rgba(255, 255, 255, 0.5)', speed: 0.15, amp: 6, phase: 2 },
        { color: 'rgba(0, 240, 255, 0.3)', speed: 0.08, amp: 10, phase: 4 }
    ];
    
    const time = Date.now() * 0.005;
    const width = 100;
    const height = 30;
    const centerY = height / 2;

    lines.forEach(line => {
        waveCtx.beginPath();
        waveCtx.strokeStyle = line.color;
        waveCtx.lineWidth = 1.5;
        
        for (let x = 0; x <= width; x+=2) {
            // 模拟复杂的声波：基础正弦 + 噪声干扰 + 衰减
            // 衰减：两端振幅小，中间大
            const distFromCenter = Math.abs(x - width/2);
            const attenuation = Math.max(0, 1 - distFromCenter / (width/2));
            
            const y = centerY + Math.sin(x * 0.1 + time * line.speed + line.phase) * line.amp * attenuation * Math.sin(time * 0.5);
            
            if (x === 0) waveCtx.moveTo(x, y);
            else waveCtx.lineTo(x, y);
        }
        waveCtx.stroke();
    });

    requestAnimationFrame(animateWaveform);
}
initWaveform();

// --- Particle Video (Flow Field or Shape Formation) ---
const pvCanvas = document.getElementById('particle-video-canvas');
const pvCtx = pvCanvas.getContext('2d');
let pvParticles = [];
let pvW, pvH;

// Define specific shapes based on visual type
function getShapeTarget(type, w, h, i, total) {
    const cx = w / 2;
    const cy = h / 2;
    let x, y;

    switch (type) {
        case 'steam': // Rising steam
            const steamW = w * 0.3;
            const steamX = (Math.random() - 0.5) * steamW;
            const steamY = (Math.random() - 0.5) * h * 0.6;
            // S-curve bias
            x = cx + steamX + Math.sin(steamY * 0.05) * 20;
            y = cy + steamY - h * 0.1;
            break;
        case 'snow': // Snowflake (6 arms)
            const arm = i % 6;
            const dist = Math.random() * (h * 0.35);
            const angle = (arm * 60) * (Math.PI / 180);
            x = cx + Math.cos(angle) * dist + (Math.random()-0.5)*10;
            y = cy + Math.sin(angle) * dist + (Math.random()-0.5)*10;
            break;
        case 'matrix': // Grid
            const cols = 20;
            const col = i % cols;
            const row = Math.floor(i / cols);
            x = (w / cols) * col + (w/cols)/2;
            y = (h / (total/cols)) * row + 20;
            break;
        case 'island': // Central dense circle
            const r = Math.random() * (h * 0.15);
            const theta = Math.random() * Math.PI * 2;
            x = cx + Math.cos(theta) * r;
            y = cy + Math.sin(theta) * r;
            break;
        case 'wave': // Sine waves
            x = (i / total) * w;
            y = cy + Math.sin(x * 0.05) * (h * 0.2);
            // Add thickness
            y += (Math.random() - 0.5) * 40;
            break;
        case 'mirror': // Horizon line
            x = Math.random() * w;
            y = cy;
            // Reflection hint? just a line for now
            y += (Math.random() - 0.5) * 10;
            break;
        case 'cloud': // Clusters
            const cluster = i % 3;
            const clusX = cx + (cluster - 1) * (w * 0.25);
            const clusR = Math.random() * (h * 0.15);
            const clusAng = Math.random() * Math.PI * 2;
            x = clusX + Math.cos(clusAng) * clusR;
            y = cy - h*0.1 + Math.sin(clusAng) * clusR * 0.6;
            break;
        case 'trail': // Diagonal
            const t = i / total;
            x = w * 0.2 + t * w * 0.6;
            y = h * 0.8 - t * h * 0.6;
            x += (Math.random()-0.5) * 20;
            y += (Math.random()-0.5) * 20;
            break;
        case 'balloon': // Circle + Line
            if (i < total * 0.8) { // Balloon body
                const br = Math.random() * (h * 0.15);
                const ba = Math.random() * Math.PI * 2;
                x = cx + Math.cos(ba) * br;
                y = cy - h * 0.1 + Math.sin(ba) * br;
            } else { // String
                const st = (i - total*0.8) / (total*0.2);
                x = cx + Math.sin(st * 5) * 5;
                y = cy - h * 0.1 + h * 0.15 + st * (h * 0.3);
            }
            break;
        case 'ripple': // Concentric circles
            const ring = i % 3 + 1;
            const ripR = ring * (h * 0.1) + Math.random() * 10;
            const ripA = Math.random() * Math.PI * 2;
            x = cx + Math.cos(ripA) * ripR;
            y = cy + Math.sin(ripA) * ripR;
            break;
        case 'hourglass': // X shape
            const hgt = (i/total); // 0 to 1
            y = hgt * h * 0.6 + h * 0.2;
            // Width varies with y (wide at top/bottom, narrow center)
            const widthAtY = Math.abs(hgt - 0.5) * w * 0.8;
            x = cx + (Math.random() - 0.5) * widthAtY;
            break;
        default: // Flow / Random
             return null;
    }
    return {x, y};
}

// Simple Pseudo-Noise function for flow field
function pseudoNoise(x, y, z) {
    return Math.sin(x * 0.005 + z) * Math.cos(y * 0.005 + z) * Math.sin(x * 0.01 + y * 0.01);
}

class FlowParticle {
    constructor(w, h, index, total) {
        this.canvasW = w || pvW;
        this.canvasH = h || pvH;
        this.index = index || 0;
        this.total = total || 400;
        this.mode = 'flow'; // flow or shape
        this.targetX = null;
        this.targetY = null;
        
        this.reset();
        // Pre-warm
        for(let i=0; i<50; i++) this.update();
    }
    
    reset() {
        this.x = Math.random() * this.canvasW;
        this.y = Math.random() * this.canvasH;
        this.life = Math.random() * 200 + 100;
        this.maxLife = this.life;
        this.size = Math.random() * 1.5 + 0.5;
        // Color palette matching the "Universe" theme
        const r = Math.random() > 0.5 ? 0 : 255; // Cyan/Blueish
        const g = 200 + Math.random() * 55;
        const b = 255;
        this.baseColor = {r, g, b};
    }

    setMode(mode, visualType) {
        this.mode = mode;
        this.visualType = visualType;
        if (mode === 'shape') {
            const t = getShapeTarget(visualType, this.canvasW, this.canvasH, this.index, this.total);
            if (t) {
                this.targetX = t.x;
                this.targetY = t.y;
            } else {
                this.mode = 'flow'; // Fallback
            }
        }
    }

    update() {
        this.life--;
        // Reset Logic
        if (this.mode === 'flow') {
            if (this.life < 0 || this.x < 0 || this.x > this.canvasW || this.y < 0 || this.y > this.canvasH) {
                this.reset();
            }
        } else {
            // Shape mode: keep alive, just respawn at random place if died, but target remains
             if (this.life < 0) {
                 this.life = Math.random() * 200 + 100;
                 // Maybe drift a bit
             }
        }
        
        if (this.mode === 'flow') {
            // Use noise to determine angle
            const time = Date.now() * 0.0002;
            const n = pseudoNoise(this.x, this.y, time);
            const angle = n * Math.PI * 4; // More swirl
            
            const speed = 1.5;
            this.x += Math.cos(angle) * speed;
            this.y += Math.sin(angle) * speed;
        } else {
            // Seek Target
            if (this.targetX !== null) {
                const dx = this.targetX - this.x;
                const dy = this.targetY - this.y;
                
                // Spring force
                this.x += dx * 0.05;
                this.y += dy * 0.05;
                
                // Add noise/jitter to keep it alive
                const time = Date.now() * 0.002;
                this.x += Math.sin(time + this.index) * 0.5;
                this.y += Math.cos(time + this.index) * 0.5;
            }
        }
    }

    draw(context) {
        const ctxToUse = context || pvCtx;
        const opacity = (this.life / this.maxLife) * 0.6;
        ctxToUse.fillStyle = `rgba(${this.baseColor.r}, ${this.baseColor.g}, ${this.baseColor.b}, ${opacity})`;
        ctxToUse.beginPath();
        ctxToUse.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctxToUse.fill();
    }
}

function initParticleVideo(visualType = 'flow') {
    if (!pvCanvas.parentElement) return;
    const rect = pvCanvas.parentElement.getBoundingClientRect();
    pvW = pvCanvas.width = rect.width;
    pvH = pvCanvas.height = rect.height;
    
    pvParticles = [];
    const count = 400;
    // Increase count for dense field effect
    for(let i=0; i<count; i++) {
        const p = new FlowParticle(pvW, pvH, i, count);
        if (visualType !== 'flow') {
            p.setMode('shape', visualType);
        }
        pvParticles.push(p);
    }
    // Only start animation loop if not already running (or just let it run, we replace array)
    // We assume animateParticleVideo is already running or we start it
    if (!window.pvAnimationRunning) {
        window.pvAnimationRunning = true;
        animateParticleVideo();
    }
}

function animateParticleVideo() {
    // Trail effect: fade out slowly
    pvCtx.fillStyle = 'rgba(0, 0, 0, 0.08)'; 
    pvCtx.fillRect(0, 0, pvW, pvH);
    
    pvParticles.forEach(p => {
        p.update();
        p.draw(pvCtx);
    });
    requestAnimationFrame(animateParticleVideo);
}

// Initialize video particles once the placeholder is likely ready or on window load
// Also handle resize
window.addEventListener('resize', () => {
    if (pvCanvas.parentElement) {
        const rect = pvCanvas.parentElement.getBoundingClientRect();
        pvW = pvCanvas.width = rect.width;
        pvH = pvCanvas.height = rect.height;
    }
    if (headerWaveCanvas.parentElement) {
        const rect = headerWaveCanvas.parentElement.getBoundingClientRect();
        headerWaveW = headerWaveCanvas.width = rect.width;
        headerWaveH = headerWaveCanvas.height = rect.height;
    }
});
// Start it
setTimeout(() => {
    initParticleVideo();
    initHeaderWave(); // Re-init to be safe
}, 1000);

// --- Header Wave Logic (Vertical Bars) ---
function initHeaderWave() {
    if (!headerWaveCanvas.parentElement) return;
    const rect = headerWaveCanvas.parentElement.getBoundingClientRect();
    headerWaveW = headerWaveCanvas.width = rect.width;
    headerWaveH = headerWaveCanvas.height = rect.height;
    animateHeaderWave();
}

function animateHeaderWave() {
    headerWaveCtx.clearRect(0, 0, headerWaveW, headerWaveH);
    
    const barWidth = 1; // Ultra thin line
    const gap = 5;      // Wide spacing
    
    // Fixed count to ensure pattern match
    const barCount = Math.floor(headerWaveW / (barWidth + gap));
    const startX = (headerWaveW - (barCount * (barWidth + gap) - gap)) / 2;
    
    const time = Date.now() * 0.002;
    
    for (let i = 0; i < barCount; i++) {
        const x = startX + i * (barWidth + gap);
        
        // Reference Image Logic:
        // Alternating tall/active bars and tiny/static dots
        // Pattern: | . | . | . |
        const isMainBar = i % 2 === 0;
        
        let h;
        if (isMainBar) {
            // Dynamic height for main bars
            const noise = Math.sin(i * 0.8 + time) + Math.sin(time * 1.5 - i * 0.5);
            // Center focus
            const dist = Math.abs(i - barCount/2);
            const amp = Math.max(0.3, 1 - dist/(barCount*0.6));
            
            h = 8 + Math.abs(noise) * 18 * amp;
            headerWaveCtx.fillStyle = 'rgba(210, 190, 160, 0.9)'; // Gold
        } else {
            // Static dot/small line for separators
            h = 2;
            headerWaveCtx.fillStyle = 'rgba(143, 150, 147, 0.3)'; // Grey
        }
        
        // Draw rounded line (if height > 2)
        const y = (headerWaveH - h) / 2;
        headerWaveCtx.fillRect(x, y, barWidth, h);
    }
    
    requestAnimationFrame(animateHeaderWave);
}

