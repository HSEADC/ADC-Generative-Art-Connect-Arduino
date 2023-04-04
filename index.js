import p5 from 'p5'
import { getRandomArbitrary } from './src/utilities.js'

import * as Tone from 'tone'
import * as lead from './src/lead.js'
import * as bass from './src/bass.js'
import * as solo from './src/solo.js'
import { log } from 'tone/build/esm/core/util/Debug.js'
// import * as sampler from './src/sampler.js'

export const wsConnection = new WebSocket('ws://localhost:3000/websocket')

const laserSensorsData = [0, 10, 50, 50, 50, 10, 10]

let buttonEventListener

let canvasSize = {}
let cellSize

let colorSwitch = false
let clearCanvas = false

let x = 0
let y = 0
let w = 0
let h = 0
let c = 0
let r = 0
let g = 0
let b = 0

let canvas
let p5instance

let webAudioStarted = false

wsConnection.onopen = function () {
  console.log('Соединение установлено.')
}

wsConnection.onclose = function (event) {
  if (event.wasClean) {
    console.log('Соединение закрыто чисто')
  } else {
    console.log('Обрыв соединения') // например, "убит" процесс сервера
  }
  console.log('Код: ' + event.code + ' причина: ' + event.reason)
}

wsConnection.onerror = function (error) {
  console.log('Ошибка ' + error.message)
}

wsConnection.onmessage = function message(event) {
  // console.log(event.data)
  updateData(event.data)

  // console.log('message')
}

// export const wsSend = function (data) {
//   // readyState - true, если есть подключение
//   if (!wsConnection.readyState) {
//     setTimeout(function () {
//       wsSend(data);
//     }, 100);
//   } else {
//     wsConnection.send(data);
//   }
// };

function addStartButton() {
  const startButton = document.createElement('div')
  startButton.id = 'startButton'
  startButton.style.position = 'fixed'
  startButton.style.top = '10px'
  startButton.style.right = '10px'
  startButton.innerText = 'Start'

  buttonEventListener = startButton.addEventListener('click', () => {
    init()
  })

  document.body.appendChild(startButton)
}

function removeStartButton() {
  const button = document.getElementById('startButton')

  button.removeEventListener('click', () => {
    init()
  })

  button.remove()
}

function addCanvasContainer() {
  const container = document.body
  container.style.margin = 0

  const frame = document.createElement('div')
  frame.classList.add('frame')
  frame.id = 'frame'
  container.appendChild(frame)
}

function addDebugPanel() {
  const debugPanel = document.createElement('div')
  debugPanel.style.position = 'fixed'
  debugPanel.style.top = '10px'
  debugPanel.style.left = '10px'

  const debugLaser1 = document.createElement('div')
  const debugLaser2 = document.createElement('div')
  const debugLaser3 = document.createElement('div')
  const debugLaser4 = document.createElement('div')
  const debugLaser5 = document.createElement('div')
  const debugLaser6 = document.createElement('div')
  // const debugLaser7 = document.createElement('div')
  // const debugPhotoCell = document.createElement('div')

  const debugLasers = [
    debugLaser1,
    debugLaser2,
    debugLaser3,
    debugLaser4,
    debugLaser5,
    debugLaser6
    // debugLaser7,
    // debugPhotoCell
  ]

  debugLasers.forEach((element, i) => {
    element.style.color = '#6BF15C'
    element.id = `laser${i}`
    debugPanel.appendChild(element)
  })

  document.body.appendChild(debugPanel)
}

const divider = 1.3

async function init() {
  console.log('init')

  removeStartButton()
  canvasSize = { width: window.innerWidth, height: window.innerHeight }

  console.log('before canvas')

  let sketch = (p) => {
    p.setup = () => {
      console.log('setup')
      let canvas = p.createCanvas(canvasSize.width, canvasSize.height)
      canvas.parent('frame')
      p.frameRate(30)
      p.background(0)
      console.log('setup ended')
    }

    p.star = (x, y, radius1, radius2, npoints) => {
      let angle = p.TWO_PI / npoints
      let halfAngle = angle / 2.0
      p.beginShape()
      for (let a = 0; a < p.TWO_PI; a += angle) {
        let sx = x + p.cos(a) * radius2
        let sy = y + p.sin(a) * radius2
        p.vertex(sx, sy)
        sx = x + p.cos(a + halfAngle) * radius1
        sy = y + p.sin(a + halfAngle) * radius1
        p.vertex(sx, sy)
      }
      p.endShape(p.CLOSE)
    }

    p.draw = () => {
      // console.log('draw')
      w = getRandomArbitrary(20, 80)
      h = getRandomArbitrary(20, 80)

      x = getRandomArbitrary(0, canvasSize.width - w)
      y = getRandomArbitrary(0, canvasSize.height - h)

      if (clearCanvas) {
        // p.clear()
        p.background(0)
        clearCanvas = false
      }

      p.frameRate(
        laserSensorsData[5] < 2500
          ? parseInt(laserSensorsData[1] / divider)
          : 255
      )

      // if (colorSwitch) {
      if (laserSensorsData[1] > 0) {
        r = getRandomArbitrary(
          0,
          laserSensorsData[1] < 2500
            ? parseInt(laserSensorsData[1] / divider)
            : 255
        )

        g = getRandomArbitrary(
          0,
          laserSensorsData[1] < 2500
            ? parseInt(laserSensorsData[4] / divider)
            : 255
        )

        b = getRandomArbitrary(
          0,
          laserSensorsData[1] < 2500
            ? parseInt(laserSensorsData[5] / divider)
            : 255
        )

        console.log(parseInt(r), parseInt(g), parseInt(b))

        p.fill(parseInt(r), parseInt(g), parseInt(b))
      } else {
        c = getRandomArbitrary(0, 255)
        p.fill(c)
      }

      if (laserSensorsData[1] > 50) {
        // p.push()
        // translate(width * 0.2, height * 0.5)
        // rotate(frameCount / 200.0)
        // p.star(0, 0, 5, 70, 3)
        // p.pop()
        p.star(x, y, w, h, 5)
        // } else if (laserSensorsData[1] > 50) {
      } else {
        p.rect(x, y, w, h)
      }
    }
  }

  let myp5 = new p5(sketch)

  // removeStartButton()
  // // const context = new Tone.Context()
  // // context.resume()
  // // await Tone.start()
  // Tone.Transport.bpm.value = 140
  // Tone.Transport.start()

  // webAudioStarted = true
  // //
  // // const instruments = [
  // //   bass.instrument,
  // //   lead.instrument,
  // //   solo.instrument
  // //   // sampler.instrument
  // // ]

  // // sampler.instrument[0].part.start(0)

  // canvasSize = { width: window.innerWidth, height: window.innerHeight }

  // let sketch = (p) => {
  //   p.setup = () => {
  //     let canvas = p.createCanvas(canvasSize.width, canvasSize.height)
  //     canvas.parent('frame')
  //     p.frameRate(24)
  //   }

  //   p.draw = () => {
  //     // const background = laserSensorsData[0]
  //     const background = 0

  //     const red = laserSensorsData[0]
  //     const green = laserSensorsData[1]
  //     const blue = laserSensorsData[2]

  //     const weight = laserSensorsData[3] / 3

  //     // console.log(laserSensorsData[4] / 3, parseInt(laserSensorsData[4] / 3))

  //     const gridSize = parseInt(laserSensorsData[4] / 3)
  //     // const gridSize = 10

  //     const cellSize = {
  //       width: canvasSize.width / gridSize,
  //       height: canvasSize.height / gridSize
  //     }

  //     // const amplitude = laserSensorsData[5] / 10
  //     const amplitude = laserSensorsData[5]
  //     // const curvature = laserSensorsData[6] / 10

  //     p.background(background)
  //     p.noFill()
  //     p.strokeWeight(weight)

  //     p.stroke(red, green, blue)

  //     for (var row = 0; row < gridSize; row++) {
  //       const top = row * cellSize.height

  //       for (var column = 0; column < gridSize + 1; column++) {
  //         // const left = (column + 1) * cellSize.width
  //         const left = column * cellSize.width

  //         if (column === 0) {
  //           p.beginShape()
  //           p.vertex(left, top)
  //         } else {
  //           // const entropy = getRandomArbitrary()
  //           // const shift = getRandomArbitrary(-entropy, entropy)
  //           const shift = getRandomArbitrary(-amplitude, amplitude)

  //           p.bezierVertex(
  //             left,
  //             top + shift,
  //             left,
  //             top + shift,
  //             left,
  //             top + shift
  //           )

  //           // console.log(
  //           //   left,
  //           //   top + shift,
  //           //   left,
  //           //   top + shift,
  //           //   left,
  //           //   top + shift
  //           // )
  //         }

  //         if (column === gridSize) {
  //           p.endShape()
  //         }
  //       }
  //     }

  //     const offset = {
  //       x: canvasSize.width / 2,
  //       y: canvasSize.height / 2
  //     }
  //   }
  // }

  // let myp5 = new p5(sketch)
}

function updateData(data) {
  // if (webAudioStarted) {
  // console.log('received: %s', event.data)
  const json = JSON.parse(data)
  const index = json.i - 1
  const value = json.v

  if (json.e === 'l') {
    // console.log('laserTrigger', index, value)
    const element = document.getElementById(`laser${index}`)

    if (element) {
      element.innerText = value
    }

    if (value < 8190 && value >= 0) {
      // console.log('changed', value)
      // if (index === 0) {
      //   console.log(value, laserSensorsData[0], value != laserSensorsData[0])
      // }
      if (index === 5 && value != laserSensorsData[0]) {
        // const now = Tone.now()
        // lead.instrument[0].node.triggerAttack(
        //   value >= 1300 ? 1300 : value,
        //   now
        // )
      } else if (index === 1 && value != laserSensorsData[1]) {
        // const now = Tone.now()
        // bass.instrument[0].node.triggerAttack(value, now)
      } else if (index === 4 && value != laserSensorsData[2]) {
        // const now = Tone.now()
        // solo.instrument[0].node.triggerAttack(value, now)
      }

      if (index === 3) {
        laserSensorsData[index] = value > 180 ? 180 : parseInt(value / 4)
      } else if (index === 4) {
        // laserSensorsData[index] = value > 300 ? 300 : value
        laserSensorsData[index] = parseInt(value / 3)
      } else if (index === 5) {
        laserSensorsData[index] = parseInt(value / 3)
      } else {
        laserSensorsData[index] = value
      }
    } else {
      // if (laserSensorsData[index] != 8190) {
      // laserSensorsData[index] = value
      if (index === 0) {
        // const now = Tone.now()
        // lead.instrument[0].node.triggerRelease(now + 1)
      } else if (index === 1) {
        // const now = Tone.now()
        // bass.instrument[0].node.triggerRelease(now + 1)
      } else if (index === 2) {
        // const now = Tone.now()
        // solo.instrument[0].node.triggerRelease(now + 1)
      }
      // }
    }

    // } else if (json.e === 't') {
    //   const element = document.getElementById(`laser7`)
    //
    //   const volt = (5 / 1023) * value
    //
    //   if (element) {
    //     element.innerText = volt
    //   }
    //
    //   laserSensorsData[0] = volt
    //   console.log(volt)
    // console.log('trigger', value, (5 / 1023) * value)
    // if (volt >= 4.0) {
    // laserSensorsData[0] = 255
    // } else {
    // laserSensorsData[0] = 0
    // }
  }
  // }
}

document.addEventListener('DOMContentLoaded', () => {
  addCanvasContainer()
  addStartButton()
  addDebugPanel()
})
