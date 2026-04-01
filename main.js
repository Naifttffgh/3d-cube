import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- إعداد المشهد ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// --- التحكم باللمس والماوس ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- إضاءة خفيفة ليعطي شكل واقعي ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// --- مواد المكعب (الألوان الرسمية) ---
const materials = [
    new THREE.MeshStandardMaterial({ color: 0xff5800 }), // Right
    new THREE.MeshStandardMaterial({ color: 0xb71234 }), // Left
    new THREE.MeshStandardMaterial({ color: 0xffffff }), // Up
    new THREE.MeshStandardMaterial({ color: 0xffd500 }), // Down
    new THREE.MeshStandardMaterial({ color: 0x009b48 }), // Front
    new THREE.MeshStandardMaterial({ color: 0x0046ad })  // Back
];

const rubiksCube = new THREE.Group();
scene.add(rubiksCube);
const cubes = [];

// إنشاء المكعبات الصغيرة
for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
            const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);
            const cube = new THREE.Mesh(geometry, materials);
            cube.position.set(x, y, z);
            
            // حواف سوداء فخمة
            const edges = new THREE.EdgesGeometry(geometry);
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
            cube.add(line);

            rubiksCube.add(cube);
            cubes.push(cube);
        }
    }
}

camera.position.set(4, 4, 6);

// --- وظيفة تدوير الطبقات (Global لكي يراها الـ HTML) ---
window.rotateLayer = (axis, index) => {
    const tempGroup = new THREE.Group();
    scene.add(tempGroup);

    const worldPos = new THREE.Vector3();
    const toRotate = cubes.filter(c => {
        c.getWorldPosition(worldPos);
        return Math.round(worldPos[axis]) === index;
    });

    toRotate.forEach(c => tempGroup.attach(c));
    tempGroup.rotation[axis] += Math.PI / 2;
    tempGroup.updateMatrixWorld();
    toRotate.forEach(c => rubiksCube.attach(c));
    scene.remove(tempGroup);
};

// --- حلقة التحريك ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

// تدوير الطبقات (الميزة الجديدة)
document.getElementById('btnU').addEventListener('click', () => {
    rotateLayer('y', 1); // الطبقة العلوية هي حيث y = 1
});
document.getElementById('btnL').addEventListener('click', () => {
    rotateLayer('x', -1); // الطبقة اليسرى هي حيث x = -1
});

// إعادة ضبط
document.getElementById('btnReset').addEventListener('click', () => {
    // إعادة تعيين دوران المجموعة الرئيسية
    rubiksCube.rotation.set(0, 0, 0);
    
    // لإعادة تعيين موضع كل مكعب صغير بدقة، ستحتاج لإعادة بنائه
    // كحل سريع، سنقوم فقط بإعادة تدوير المجموعة الأم.
    // لإعادة ضبط كاملة، الأفضل هو عمل سكرامبل عكسي أو إعادة تحميل الصفحة.
    location.reload(); 
});

// --- حلقة التحريك ---
function animate() {
    requestAnimationFrame(animate);
    // تدوير تلقائي بطيء جداً للعرض فقط
    // rubiksCube.rotation.y += 0.001;
    renderer.render(scene, camera);
}

// تحديث الحجم
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
