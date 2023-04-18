import p5 from 'p5'
import { getRandomArbitrary } from './src/utilities.js'

export const wsConnection = new WebSocket('ws://localhost:3000/websocket')

const laserSensorsData = [0, 10, 50, 50, 50, 10, 10]
const colorMin = 30
const colorDefault = 200
const colorLimit = 255 * 4
const weightLimit = 60
const amplitudeLimit = 200
const gridSizeLimit = 60
const background = 0

function amplitudeCalc() {
  return parseInt(laserSensorsData[4] / 8)
}

let buttonEventListener

let canvasSize = {}
let cellSize

// let webAudioStarted = false
let started = false

let red, green, blue, weight, amplitude, gridSize

wsConnection.onopen = function () {
  console.log('Соединение установлено.')
}

wsConnection.onclose = function (event) {
  if (event.wasClean) {
    console.log('Соединение закрыто чисто')
  } else {
    console.log('Обрыв соединения')
  }
  console.log('Код: ' + event.code + ' причина: ' + event.reason)
}

wsConnection.onerror = function (error) {
  console.log('Ошибка ' + error.message)
}

wsConnection.onmessage = function message(event) {
  // console.log(event.data)
  updateData(event.data)
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

function handleKeyPress(e) {
  // console.log(e.keyCode)

  //  1  2  3  4  5  6  7  8  9  0
  // 49 50 51 52 53 54 55 56 57 48

  //   q   w   e   r   t   y   u   i   o   p  [  ]  \
  // 113 119 101 114 116 121 117 105 111 112 91 93 92

  switch (e.keyCode) {
    case 49:
      if (!started) {
        started = true
        init()
      }

      break
  }
}

// function addStartButton() {
//   const startButton = document.createElement('div')
//   startButton.id = 'startButton'
//   startButton.style.position = 'fixed'
//   startButton.style.top = '10px'
//   startButton.style.right = '10px'
//   startButton.innerText = 'Start'

//   buttonEventListener = startButton.addEventListener('click', () => {
//     init()
//   })

//   document.body.appendChild(startButton)
// }

// function removeStartButton() {
//   const button = document.getElementById('startButton')

//   button.removeEventListener('click', () => {
//     init()
//   })

//   button.remove()
// }

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

async function init() {
  // removeStartButton()

  started = true
  canvasSize = { width: window.innerWidth, height: window.innerHeight }

  let sketch = (p) => {
    p.setup = () => {
      let canvas = p.createCanvas(canvasSize.width, canvasSize.height)
      canvas.parent('frame')
      p.frameRate(24)
    }

    p.draw = () => {
      red =
        laserSensorsData[4] < colorLimit
          ? parseInt(laserSensorsData[4] / 4)
          : red

      green =
        laserSensorsData[5] < colorLimit
          ? parseInt(laserSensorsData[5] / 4)
          : green

      blue =
        laserSensorsData[1] < colorLimit
          ? parseInt(laserSensorsData[1] / 4)
          : blue

      weight =
        laserSensorsData[5] / 10 < weightLimit
          ? parseInt(laserSensorsData[5] / 10)
          : weight

      amplitude = amplitudeCalc() < amplitudeLimit ? amplitudeCalc() : amplitude

      gridSize =
        laserSensorsData[1] / 3 < gridSizeLimit
          ? parseInt(laserSensorsData[1] / 3)
          : gridSize

      // console.log(red, green, blue, weight, amplitude, gridSize)

      const cellSize = {
        width: canvasSize.width / gridSize,
        height: canvasSize.height / gridSize
      }

      p.background(background)
      p.noFill()
      p.strokeWeight(weight)

      p.stroke(
        red < colorMin ? colorDefault : red,
        green < colorMin ? colorDefault : green,
        blue < colorMin ? colorDefault : blue
      )

      for (var row = 0; row < gridSize; row++) {
        const top = row * cellSize.height
        for (var column = 0; column < gridSize + 1; column++) {
          // const left = (column + 1) * cellSize.width
          const left = column * cellSize.width

          if (column === 0) {
            p.beginShape()
            p.vertex(left, top)
          } else {
            // const entropy = getRandomArbitrary()
            // const shift = getRandomArbitrary(-entropy, entropy)
            const shift = getRandomArbitrary(-amplitude, amplitude)

            p.bezierVertex(
              left,
              top + shift,
              left,
              top + shift,
              left,
              top + shift
            )
            // console.log(
            //   left,
            //   top + shift,
            //   left,
            //   top + shift,
            //   left,
            //   top + shift
            // )
          }

          if (column === gridSize) {
            p.endShape()
          }
        }
      }
      const offset = {
        x: canvasSize.width / 2,
        y: canvasSize.height / 2
      }
    }
  }

  let myp5 = new p5(sketch)
}

function updateData(data) {
  if (started) {
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

      laserSensorsData[index] = value

      // if (value < 8190 && value >= 0) {
      //   if (index === 3) {
      //     laserSensorsData[index] = value > 180 ? 180 : parseInt(value / 4)
      //   } else if (index === 4) {
      //     // laserSensorsData[index] = value > 300 ? 300 : value
      //     laserSensorsData[index] = parseInt(value / 3)
      //   } else if (index === 5) {
      //     laserSensorsData[index] = parseInt(value / 3)
      //   } else {
      //     laserSensorsData[index] = value
      //   }
      // } else {
      //   if (laserSensorsData[index] != 8190) {
      //     laserSensorsData[index] = value
      //   }
      // }
    }
  }
}

document.addEventListener('keypress', (e) => {
  handleKeyPress(e)
})

document.addEventListener('DOMContentLoaded', () => {
  document.body.style.backgroundColor = 'black'

  addCanvasContainer()
  // addStartButton()
  // addDebugPanel()
})
