import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useAppStore } from '../../store';
import gsap from 'gsap';

// 粒子总数
const PARTICLE_COUNT = 8000;
// 字体大小
const FONT_SIZE = 172;
// 粒子大小
const PARTICLE_SIZE = 0.04;

// 工具：从 Canvas 获取文字粒子坐标
function getTextCoordinates(text: string, width: number, height: number): Float32Array {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Float32Array(0);

  canvas.width = width;
  canvas.height = height;

  // 绘制背景
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // 绘制文字
  ctx.font = `bold ${FONT_SIZE}px "ArkPixel-12px", system-ui, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const particles = [];

  // 采样步长，越小粒子越密
  const step = 3;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      // 只要红色通道大于阈值（因为是白字黑底，RGB都是一样的）
      // 提高阈值，减少边缘模糊粒子
      if (data[index] > 100) {
        // 坐标归一化并居中，Y轴反转
        // 调整缩放系数以适应全屏 (0.012 * 1.15 = 0.0138 -> 0.014)
        // 并添加偏移量，让文字显示在右侧 (4 * 1.15 = 4.6)
        // 增加随机抖动，让拼接不要太贴合 (jitter +/- 0.05)
        const jitter = 0.05;
        // 移除偏移量 +4.6，改为在组件层级移动位置，确保旋转中心在几何体中心
        const px = (x - width / 2) * 0.014 + (Math.random() - 0.5) * jitter; 
        const py = -(y - height / 2) * 0.014 + (Math.random() - 0.5) * jitter;
        const pz = (Math.random() - 0.5) * jitter; // Z轴也加一点抖动，增加立体感
        particles.push(px, py, pz);
      }
    }
  }

  return new Float32Array(particles);
}

// 工具：获取球体表面随机坐标
function getSphereCoordinates(count: number, radius: number): Float32Array {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    // 移除偏移量 +4.6，改为在组件层级移动位置
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    particles.push(x, y, z);
  }
  return new Float32Array(particles);
}

// 循环填充坐标（解决散落粒子问题，让文字更扎实，同时加入微小随机偏移增加颗粒感）
function fillWithClone(array: Float32Array, startIndex: number, count: number) {
  if (startIndex === 0) return;
  for (let i = startIndex; i < count; i++) {
    const sourceIndex = i % startIndex;
    // 增加微小的随机抖动，范围 +/- 0.08 (增加松散感)
    // 这会让重叠的粒子稍微错开，形成细腻的颗粒感，而不是死板的实心色块
    const jitter = 0.08;
    array[i * 3] = array[sourceIndex * 3] + (Math.random() - 0.5) * jitter;
    array[i * 3 + 1] = array[sourceIndex * 3 + 1] + (Math.random() - 0.5) * jitter;
    array[i * 3 + 2] = array[sourceIndex * 3 + 2] + (Math.random() - 0.5) * jitter;
  }
}

// 生成所有坐标数据
function generateAllCoordinates() {
  // 1. 球体坐标
  // 用户反馈球太大，从 4.0 缩小至 3.2
  const sphere = getSphereCoordinates(PARTICLE_COUNT, 3); 
  
  // 2. 文字坐标 "知识库"
  // 增大 Canvas 尺寸以获得更高精度的采样
  const text1Raw = getTextCoordinates('知识库', 1200, 600);
  const text1 = new Float32Array(PARTICLE_COUNT * 3);
  
  // 复制文字坐标 (防止溢出)
  const text1Count = Math.min(Math.floor(text1Raw.length / 3), PARTICLE_COUNT);
  text1.set(text1Raw.subarray(0, text1Count * 3));
  
  // 填充剩余部分（叠加）
  fillWithClone(text1, text1Count, PARTICLE_COUNT);

  // 3. 文字坐标 "小破站"
  const text2Raw = getTextCoordinates('小破站', 1200, 600);
  const text2 = new Float32Array(PARTICLE_COUNT * 3);
  
  const text2Count = Math.min(Math.floor(text2Raw.length / 3), PARTICLE_COUNT);
  text2.set(text2Raw.subarray(0, text2Count * 3));
  
  fillWithClone(text2, text2Count, PARTICLE_COUNT);

  return { sphere, text1, text2 };
}

// 粒子组件
const Particles = ({ color, blending }: { color: string; blending: THREE.Blending }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  
  // 鼠标交互
  const mouseRef = useRef({ x: 0, y: 0 });

  // 预计算坐标
  const coordinates = useMemo(() => generateAllCoordinates(), []);

  const initialPositions = useMemo(() => new Float32Array(coordinates.sphere), [coordinates]);

  // 动画状态引用
  const animState = useRef({
    currentPos: initialPositions, // 当前位置引用
    targetPos: coordinates.sphere, // 目标位置
    progress: 0, // 0 -> 1
    sourcePos: coordinates.sphere, // 起始位置
  });

  // 更新几何体属性
  const updateGeometry = () => {
    if (!geometryRef.current) return;
    const positions = geometryRef.current.attributes.position.array as Float32Array;
    const { sourcePos, targetPos, progress } = animState.current;
    
    for (let i = 0; i < positions.length; i++) {
      // 简单的线性插值
      positions[i] = sourcePos[i] + (targetPos[i] - sourcePos[i]) * progress;
    }
    geometryRef.current.attributes.position.needsUpdate = true;
  };

  useEffect(() => {
    // 动画序列
    const tl = gsap.timeline({ repeat: -1 });
    const state = animState.current;

    // 辅助函数：切换目标并缓动
    const toShape = (targetShape: Float32Array, duration: number, delay: number = 0) => {
      // 在时间轴中插入一个回调来更新 sourcePos 和 targetPos
      // 注意：这里不能直接用 .to(state, ...)，因为 targetShape 是动态的
      // 我们需要一种方式在动画开始时锁定 source 和 target
      
      // 方案：使用 call() 来切换状态，然后 to() 来驱动 progress
      tl.call(() => {
        state.sourcePos = new Float32Array(geometryRef.current?.attributes.position.array as Float32Array || state.currentPos);
        state.targetPos = targetShape;
        state.progress = 0;
      }, [], `+=${delay}`)
      .to(state, {
        progress: 1,
        duration: duration,
        ease: "power2.inOut",
        onUpdate: updateGeometry
      });
    };

    // 初始状态是 Sphere
    // 流程更新：Sphere -> (2s) -> Text1 -> (3s) -> Sphere -> (2s) -> Text2 -> (3s) -> Sphere
    
    // 1. Sphere -> Text1 (2s)
    toShape(coordinates.text1, 2, 0);
    // 2. Stay (3s) -> implicit via delay of next anim
    // 3. Text1 -> Sphere (2s)
    toShape(coordinates.sphere, 2, 3);
    // 4. Sphere -> Text2 (2s) - 紧接着球体完成后开始
    toShape(coordinates.text2, 2, 0); 
    // 5. Stay (3s)
    // 6. Text2 -> Sphere (2s)
    toShape(coordinates.sphere, 2, 3);
    // 7. Sphere -> Text1 (loop start)
    // 这里的 repeat -1 会回到开头

    return () => {
      tl.kill();
    };
  }, [coordinates]);

  // 鼠标移动监听
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 归一化鼠标坐标 -1 到 1
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    if (pointsRef.current) {
      // 移除之前的恒定旋转，以确保鼠标跟随效果更明显
      // pointsRef.current.rotation.y += 0.002;
      
      // 鼠标交互跟随：
      // 1. 显著增加旋转强度 (0.8 -> 1.2) 以增强视觉明显度
      // 2. 进一步提升响应速度 (0.1 -> 0.15) 使动效更跟手
      // 3. 保持 X 轴中心偏移量 (0.4)，使交互中心对齐物体
      const targetRotationX = -mouseRef.current.y * 1.2; 
      const targetRotationY = (mouseRef.current.x - 0.4) * 1.2;
      
      pointsRef.current.rotation.x += (targetRotationX - pointsRef.current.rotation.x) * 0.15;
      pointsRef.current.rotation.y += (targetRotationY - pointsRef.current.rotation.y) * 0.15;
    }
  });

  return (
    <points ref={pointsRef} position={[4, 0, 0]}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[initialPositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={PARTICLE_SIZE}
        color={color}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
        blending={blending}
        depthWrite={false}
      />
    </points>
  );
};

export default function ParticleBanner() {
  const { themeMode } = useAppStore();
  const [resolvedMode, setResolvedMode] = React.useState<'light' | 'dark'>('light');

  // 监听主题变化，解析 system 模式
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const updateMode = () => {
      if (themeMode === 'system') {
        setResolvedMode(media.matches ? 'dark' : 'light');
      } else {
        setResolvedMode(themeMode as 'light' | 'dark');
      }
    };

    updateMode();
    
    if (themeMode === 'system') {
        media.addEventListener('change', updateMode);
        return () => media.removeEventListener('change', updateMode);
    }
  }, [themeMode]);

  // 根据主题决定粒子颜色和混合模式
  // 暗色模式：白色粒子，叠加混合（发光感）
  // 亮色模式：黑色粒子，普通混合（实心感，因为黑色无法叠加发光）
  const particleColor = resolvedMode === 'dark' ? '#ffffff' : '#000000';
  const blendingMode = resolvedMode === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending;

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        dpr={[1, 2]} // 优化高分屏性能
        gl={{ antialias: true, alpha: true }}
      >
        <Particles color={particleColor} blending={blendingMode} />
      </Canvas>
    </div>
  );
}
