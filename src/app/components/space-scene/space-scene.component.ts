import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  NgZone,
  AfterViewInit,
  OnDestroy,
  NgModule,
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-space-scene',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './space-scene.component.html',
  styleUrl: './space-scene.component.scss',
})
export class SpaceSceneComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sceneContainer', { static: true }) containerRef!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private stars!: THREE.Points;

  private sun!: THREE.Mesh;
  private planets: {
    mesh: THREE.Mesh;
    orbitRadius: number;
    speed: number;
    angle: number;
    name: string;
    fact: string;
  }[] = [];

  private moons: {
    mesh: THREE.Mesh;
    orbitRadius: number;
    speed: number;
    angle: number;
  }[] = [];

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  public selectedBody: { name: string; fact: string } | null = null;

  private animationId: number = 0;

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    this.initScene();
    this.addSun();
    this.addStars();
    this.addPlanets();
  }

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      this.animate();
      this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
      this.renderer.domElement.addEventListener('click', this.onMouseClick.bind(this));
      window.addEventListener('resize', this.onWindowResize.bind(this));
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }

  private initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );
    this.camera.position.set(0, 50, 300);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.containerRef.nativeElement.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private onMouseMove(event: MouseEvent) {
    const bounds = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    this.mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
  }

  private onMouseClick() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.planets.map((p) => p.mesh)
    );

    if (intersects.length > 0) {
      const selected = this.planets.find((p) => p.mesh === intersects[0].object);
      if (selected) {
        this.selectedBody = { name: selected.name, fact: selected.fact };
      }
    } else {
      this.selectedBody = null;
    }
  }

  private addStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starVertices: number[] = [];

    for (let i = 0; i < 1000; i++) {
      starVertices.push(
        (Math.random() - 0.5) * 5000,
        (Math.random() - 0.5) * 5000,
        (Math.random() - 0.5) * 5000
      );
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
    this.stars = new THREE.Points(starGeometry, starMaterial);

    this.scene.add(this.stars);
  }

  private addSun() {
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load('assets/texturas/sun.jpg', (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;

      const sunGeometry = new THREE.SphereGeometry(40, 64, 64);
      const sunMaterial = new THREE.MeshBasicMaterial({ map: texture });

      this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
      this.scene.add(this.sun);
    });

    const light = new THREE.PointLight(0xffaa00, 5, 2000);
    light.position.set(0, 0, 0);
    this.scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x333333, 2);
    this.scene.add(ambientLight);
  }

  private addPlanets() {
    const textureLoader = new THREE.TextureLoader();

    const inclinationAngles: Record<string, number> = {
      'Mercúrio': 7,
      'Vênus': 3.2,
      'Terra': 0,
      'Marte': 1.8,
      'Júpiter': 1.3,
      'Saturno': 2.5,
      'Urano': 0.8,
      'Netuno': 1.8,
    };

    const planetData = [
      {
        name: 'Mercúrio',
        fact: 'Um ano dura apenas 88 dias terrestres. Extremamente quente de dia (430°C) e congelante à noite (-180°C).',
        size: 4,
        distance: 60,
        texture: 'assets/texturas/mercury.jpg',
        speed: 0.02,
      },
      {
        name: 'Vênus',
        fact: 'Um dia em Vênus é mais longo que um ano! A atmosfera densa gera temperaturas de até 470°C.',
        size: 7,
        distance: 90,
        texture: 'assets/texturas/venus.jpg',
        speed: 0.015,
      },
      {
        name: 'Terra',
        fact: 'Nosso lar azul. Um ano tem 365,25 dias, e é o único planeta conhecido com vida.',
        size: 8,
        distance: 120,
        texture: 'assets/texturas/earth.jpg',
        speed: 0.01,
      },
      {
        name: 'Marte',
        fact: 'Um ano marciano tem 687 dias. Já teve água líquida e é o planeta mais explorado por robôs.',
        size: 6,
        distance: 160,
        texture: 'assets/texturas/mars.jpg',
        speed: 0.008,
      },
      {
        name: 'Júpiter',
        fact: 'Maior planeta do sistema solar. Um ano dura 12 anos terrestres. Tem uma tempestade gigante chamada Grande Mancha Vermelha.',
        size: 20,
        distance: 220,
        texture: 'assets/texturas/jupiter.jpg',
        speed: 0.005,
      },
      {
        name: 'Saturno',
        fact: 'Famoso por seus anéis espetaculares. Um ano lá dura cerca de 29 anos terrestres.',
        size: 18,
        distance: 280,
        texture: 'assets/texturas/saturn.jpg',
        speed: 0.004,
        hasRings: true,
      },
      {
        name: 'Urano',
        fact: 'Gira praticamente de lado! Um ano dura 84 anos terrestres. Tem um tom azul-esverdeado por causa do metano.',
        size: 12,
        distance: 340,
        texture: 'assets/texturas/uranus.jpg',
        speed: 0.003,
      },
      {
        name: 'Netuno',
        fact: 'Ventos podem ultrapassar 2.000 km/h! Um ano dura 165 anos terrestres.',
        size: 12,
        distance: 400,
        texture: 'assets/texturas/neptune.jpg',
        speed: 0.002,
      },
    ];
    

    planetData.forEach((planet) => {
      const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
      const texture = textureLoader.load(planet.texture);
      const material = new THREE.MeshBasicMaterial({ map: texture });

      const planetMesh = new THREE.Mesh(geometry, material);

      const angleRad = THREE.MathUtils.degToRad(inclinationAngles[planet.name] || 0);
      const y = planet.distance * Math.tan(angleRad);
      planetMesh.position.set(planet.distance, y, 0);

      this.scene.add(planetMesh);

      if (planet.name === 'Terra') {
        const moonGeometry = new THREE.SphereGeometry(2, 32, 32);
        const moonTexture = textureLoader.load('assets/texturas/moon.jpg');
        const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });
        const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);

        moonMesh.position.set(15, 0, 0);
        planetMesh.add(moonMesh);

        this.moons.push({
          mesh: moonMesh,
          orbitRadius: 15,
          speed: 0.03,
          angle: Math.random() * Math.PI * 2,
        });
      }

      if (planet.hasRings) {
        const ringGeometry = new THREE.RingGeometry(planet.size * 1.5, planet.size * 2.5, 128);
        const ringTexture = textureLoader.load('assets/texturas/rings.png');
        const ringMaterial = new THREE.MeshBasicMaterial({
          map: ringTexture,
          side: THREE.DoubleSide,
          transparent: true,
        });

        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringMesh.rotation.x = -Math.PI / 3;
        planetMesh.add(ringMesh);
      }

      this.planets.push({
        mesh: planetMesh,
        orbitRadius: planet.distance,
        speed: planet.speed,
        angle: Math.random() * Math.PI * 2,
        name: planet.name,
        fact: planet.fact,
      });
    });
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    this.planets.forEach((planet) => {
      planet.angle += planet.speed;
      planet.mesh.position.x = Math.cos(planet.angle) * planet.orbitRadius;
      planet.mesh.position.z = Math.sin(planet.angle) * planet.orbitRadius;
    });

    this.moons.forEach((moon) => {
      moon.angle += moon.speed;
      moon.mesh.position.x = Math.cos(moon.angle) * moon.orbitRadius;
      moon.mesh.position.z = Math.sin(moon.angle) * moon.orbitRadius;
    });

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
