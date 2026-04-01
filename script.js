import * as THREE from 'three';

// --- الإعدادات الأساسية ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- إنشاء مكعب روبيك ---
const rubiksCube = new THREE.Group();
scene.add(rubiksCube);

function createSmallCube(x, y, z) {
    const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);
    const material = new THREE.MeshNormalMaterial();
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(x, y, z);

    // إضافة حدود سوداء
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
    cube.add(line);
    
    return cube;
}

for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
            rubiksCube.add(createSmallCube(x, y, z));
        }
    }
}

camera.position.z = 6;

// --- التحكم بالأزرار ---
document.getElementById('btnX').addEventListener('click', () => {
    rubiksCube.rotation.x += Math.PI / 4;
});

document.getElementById('btnY').addEventListener('click', () => {
    rubiksCube.rotation.y += Math.PI / 4;
});

document.getElementById('btnReset').addEventListener('click', () => {
    rubiksCube.rotation.set(0, 0, 0);
});

// --- حلقة التحريك ---
function animate() {
    requestAnimationFrame(animate);
    // تدوير تلقائي بطيء
    rubiksCube.rotation.y += 0.002;
    renderer.render(scene, camera);
}

// تحديث الحجم عند تكبير أو تصغير المتصفح
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

