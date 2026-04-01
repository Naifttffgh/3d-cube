// script.js
import * as THREE from 'three';

// --- الإعدادات الأساسية ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- تعريف الألوان الحقيقية لمكعب روبيك ---
const colors = {
    green:  0x009b48, // الأمامي
    blue:   0x0046ad, // الخلفي
    white:  0xffffff, // العلوي
    yellow: 0xffd500, // السفلي
    red:    0xb71234, // الأيسر
    orange: 0xff5800, // الأيمن
    inside: 0x000000  // الأوجه الداخلية (سوداء)
};

// إنشاء المواد لكل وجه (Order: R, L, U, D, F, B)
const materials = [
    new THREE.MeshBasicMaterial({ color: colors.orange }), // Right
    new THREE.MeshBasicMaterial({ color: colors.red }),    // Left
    new THREE.MeshBasicMaterial({ color: colors.white }),  // Up
    new THREE.MeshBasicMaterial({ color: colors.yellow }), // Down
    new THREE.MeshBasicMaterial({ color: colors.green }),  // Front
    new THREE.MeshBasicMaterial({ color: colors.blue })    // Back
];

// --- إنشاء مكعب روبيك الملون ---
const rubiksCube = new THREE.Group();
const smallCubes = []; // مصفوفة لتخزين المكعبات الصغيرة للوصول إليها لاحقاً
scene.add(rubiksCube);

function createSmallCube(x, y, z) {
    const geometry = new THREE.BoxGeometry(0.97, 0.97, 0.97);
    const cube = new THREE.Mesh(geometry, materials);
    cube.position.set(x, y, z);

    // إضافة حدود سوداء دقيقة
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 }));
    cube.add(line);
    
    // إضافة بيانات إضافية للمكعب الصغير لتعريف موقعه الأصلي
    cube.userData = { originalPosition: new THREE.Vector3(x, y, z) };
    
    return cube;
}

// بناء الهيكل 3x3x3
for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
            const sc = createSmallCube(x, y, z);
            rubiksCube.add(sc);
            smallCubes.push(sc); // تخزين المرجع
        }
    }
}

// وضع الكاميرا في زاوية رؤية جيدة
camera.position.set(4, 4, 6);
camera.lookAt(0, 0, 0);

// --- وظيفة تدوير الطبقات (The Core Magic) ---
// axis: 'x', 'y', or 'z'
// layerIndex: -1, 0, or 1 (e.g., y=1 is Top layer)
function rotateLayer(axis, layerIndex) {
    // 1. إنشاء مجموعة مؤقتة للتدوير
    const tempGroup = new THREE.Group();
    scene.add(tempGroup);

    // 2. البحث عن المكعبات الصغيرة التي تنتمي لهذه الطبقة
    const cubesToRotate = [];
    const remainingCubes = [];

    // نحن بحاجة للتحقق من الموقف العالمي (World Position) الحالي للمكعبات
    const worldPos = new THREE.Vector3();

    smallCubes.forEach(cube => {
        cube.getWorldPosition(worldPos);
        
        // تقريب القيمة لتجنب أخطاء الفاصلة العائمة
        const currentPosOnAxis = Math.round(worldPos[axis]);
        
        if (currentPosOnAxis === layerIndex) {
            cubesToRotate.push(cube);
        }
    });

    // 3. نقل المكعبات المختارة إلى المجموعة المؤقتة
    cubesToRotate.forEach(cube => {
        // الحفاظ على الموقف العالمي للمكعب عند نقله
        tempGroup.attach(cube);
    });

    // 4. تدوير المجموعة المؤقتة بمقدار 90 درجة (Math.PI / 2)
    // ملاحظة: هذا دوران فوري. لعمل حركة سلسة، ستحتاج إلى أنيميشن معقد.
    tempGroup.rotation[axis] += Math.PI / 2;
    
    // تحديث المصفوفة العالمية للمجموعة لضمان دقة العمليات التالية
    tempGroup.updateMatrixWorld();

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
