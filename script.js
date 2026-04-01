import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- إعداد المشهد ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- إضافة التحكم باللمس والماوس (OrbitControls) ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // جعل الحركة ناعمة

// --- تعريف الألوان الرسمية (روبيك) ---
const materials = [
    new THREE.MeshBasicMaterial({ color: 0xff5800 }), // Right (برتقالي)
    new THREE.MeshBasicMaterial({ color: 0xb71234 }), // Left (أحمر)
    new THREE.MeshBasicMaterial({ color: 0xffffff }), // Up (أبيض)
    new THREE.MeshBasicMaterial({ color: 0xffd500 }), // Down (أصفر)
    new THREE.MeshBasicMaterial({ color: 0x009b48 }), // Front (أخضر)
    new THREE.MeshBasicMaterial({ color: 0x0046ad })  // Back (أزرق)
];

const rubiksCube = new THREE.Group();
scene.add(rubiksCube);
const allSmallCubes = [];

// إنشاء المكعبات الصغيرة
for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
            const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);
            const cube = new THREE.Mesh(geometry, materials);
            cube.position.set(x, y, z);

            // إضافة حواف سوداء لإظهار التقسيم
            const edges = new THREE.EdgesGeometry(geometry);
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
            cube.add(line);

            rubiksCube.add(cube);
            allSmallCubes.push(cube);
        }
    }
}

camera.position.set(4, 4, 6);
controls.update();

// --- وظيفة تدوير طبقة محددة ---
function rotateLayer(axis, index) {
    const tempGroup = new THREE.Group();
    scene.add(tempGroup);

    const worldPos = new THREE.Vector3();
    const toRotate = allSmallCubes.filter(c => {
        c.getWorldPosition(worldPos);
        return Math.round(worldPos[axis]) === index;
    });

    toRotate.forEach(c => tempGroup.attach(c));
    tempGroup.rotation[axis] += Math.PI / 2;
    tempGroup.updateMatrixWorld();
    toRotate.forEach(c => rubiksCube.attach(c));
    scene.remove(tempGroup);
}

// --- ربط الأزرار ---
document.getElementById('btnU').onclick = () => rotateLayer('y', 1);
document.getElementById('btnL').onclick = () => rotateLayer('x', -1);
document.getElementById('btnReset').onclick = () => location.reload();

// --- حلقة التحريك ---
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // ضروري لعمل الـ Damping (النعومة)
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
    // 5. إعادة المكعبات إلى المجموعة الرئيسية
    cubesToRotate.forEach(cube => {
        rubiksCube.attach(cube);
    });

    // 6. حذف المجموعة المؤقتة
    scene.remove(tempGroup);
}


// --- التحكم بالأزرار المحدثة ---

// تدوير الكاميرا (العرض)
document.getElementById('btnX').addEventListener('click', () => {
    rubiksCube.rotation.x += Math.PI / 4;
});
document.getElementById('btnY').addEventListener('click', () => {
    rubiksCube.rotation.y += Math.PI / 4;
});

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
