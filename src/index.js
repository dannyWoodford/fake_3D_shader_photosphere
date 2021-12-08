import './style/main.css'
import * as THREE from 'three'
const twgl = window.twgl
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// import fragment from './shaders/fragment.glsl'
// import vertex from './shaders/vertex.glsl'


function main() {
	// Get A WebGL context
	const canvas = document.getElementById('canvas')
	const gl = canvas.getContext('webgl')


	/**
	 * Sizes
	 */
	const sizes = {}
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	window.addEventListener('resize', () => {
		// Save sizes
		sizes.width = window.innerWidth
		sizes.height = window.innerHeight

		// Update camera
		camera.aspect = sizes.width / sizes.height
		camera.updateProjectionMatrix()

		// Update renderer
		renderer.setSize(sizes.width, sizes.height)
	})

	/**
	 * Environnements
	 */

	// Scene
	const scene = new THREE.Scene()

	// Camera
	const camera = new THREE.PerspectiveCamera(
		75,
		sizes.width / sizes.height,
		0.1,
		10000
	)
	scene.add(camera)

	// Renderer
	const renderer = new THREE.WebGLRenderer({
		canvas: document.querySelector('.webgl'),
	})
	renderer.setPixelRatio(window.devicePixelRatio)
	renderer.setSize(sizes.width, sizes.height)
	renderer.setClearColor('red', 1)

	// Controls
	const controls = new OrbitControls(camera, renderer.domElement)

	// camera.position.set(0, 0.1, -1)
	camera.position.set(0, 15, 15)

	let originalImage = { width: 1, height: 1 } // replaced after loading
	const originalTexture = twgl.createTexture(
		gl,
		{
			src: 'assets/images/mount.jpg',
			crossOrigin: '',
		},
		(err, texture, source) => {
			originalImage = source
		}
	)

	const mapTexture = twgl.createTexture(gl, {
		src: 'assets/images/mount-map.jpg',
		crossOrigin: '',
	})

	// compile shaders, link program, lookup location
	const programInfo = twgl.createProgramInfo(gl, ['vs', 'fs'])

	// calls gl.createBuffer, gl.bindBuffer, gl.bufferData for a quad
	const bufferInfo = twgl.primitives.createXYQuadBufferInfo(gl)

	const mouse = [0, 0]
	document.addEventListener('mousemove', (event) => {
		mouse[0] = ((event.clientX / window.innerWidth) * 2 - 1) * -0.02
		mouse[1] = ((event.clientY / window.innerHeight) * 2 - 1) * -0.02
	})

	document.addEventListener('touchmove', (event) => {
		mouse[0] =
			((event.touches[0].clientX / window.innerWidth) * 2 - 1) * -0.02
		mouse[1] =
			((event.touches[0].clientY / window.innerHeight) * 2 - 1) *
			-0.02
	})

	document.addEventListener('touchend', (event) => {
		mouse[0] = 0
		mouse[1] = 0
	})

	let nMouse = [0, 0]
	
	// Photosphere
	let geometry = new THREE.SphereGeometry(10, 32, 32)
	// let geometry = new THREE.PlaneGeometry( 10, 10 )

	let canvasTex = new THREE.CanvasTexture(gl.canvas)

    let material = new THREE.MeshBasicMaterial({
		map: new THREE.TextureLoader().load('assets/images/outdoors.jpg'),
		// map: canvasTex,
		side: THREE.DoubleSide,
	})

	const sphere = new THREE.Mesh(geometry, material)
	
	// material.polygonOffset = true
	// material.polygonOffsetFactor = -1
	// material.polygonOffsetUnits = -1
	// material.transparent = true

	material.needsUpdate = true
	console.log('material', material)

	sphere.scale.x = -1

	scene.add(sphere)

	/**
	 * animate
	 */
	const animate = () => {
		twgl.resizeCanvasToDisplaySize(gl.canvas)

		gl.viewport(0, 0, window.innerWidth, window.innerHeight)

		gl.clearColor(0, 0, 0, 0)
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.useProgram(programInfo.program)
		
		// calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
		twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
		
		const canvasAspect = window.innerWidth / window.innerHeight
		const imageAspect = originalImage.width / originalImage.height
		const mat = m3.scaling(imageAspect / canvasAspect, -1)
		
		nMouse[0] += (mouse[0] - nMouse[0]) * 0.05
		nMouse[1] += (mouse[1] - nMouse[1]) * 0.05
		
		// calls gl.activeTexture, gl.bindTexture, gl.uniformXXX
		twgl.setUniforms(programInfo, {
			u_matrix: mat,
			u_originalImage: originalTexture,
			u_mapImage: mapTexture,
			u_mouse: nMouse,
		})
		// calls gl.drawArrays or gl.drawElements
		twgl.drawBufferInfo(gl, bufferInfo)

		requestAnimationFrame(animate)
	}

	const render = () => {
		// Render
		renderer.render(scene, camera)
		
		controls.update()
		
		// Keep animating
		requestAnimationFrame(render)
	}
	
	animate()
	render()
}

main()