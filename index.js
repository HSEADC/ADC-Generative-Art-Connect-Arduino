import p5 from 'p5'
export const wsConnection = new WebSocket('ws://localhost:3000/websocket')

const laserSensorsData = [0, 10, 50, 50, 50, 10, 10]

let canvasSize = {}
let cellSize

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
  // console.log("received: %s", event.data);
  const json = JSON.parse(event.data)
  const index = json.i - 1
  const value = json.v

  if (json.e === 'l') {
    // console.log('laserTrigger', index, value)
    const element = document.getElementById(`laser${index}`)

    if (element) {
      element.innerText = value
    }

    if (value != 8190 && value != 65535 && index != 0) {
      // console.log('changed', value)
      laserSensorsData[index] = value
    }
  } else if (json.e === 't') {
    const element = document.getElementById(`laser7`)

    const volt = (5 / 1023) * value

    if (element) {
      element.innerText = volt
    }

    laserSensorsData[0] = volt
    console.log(volt)

    // console.log('trigger', value, (5 / 1023) * value)
    // if (volt >= 4.0) {
    // laserSensorsData[0] = 255
    // } else {
    // laserSensorsData[0] = 0
    // }
  }
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

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.body
  container.style.margin = 0

  const frame = document.createElement('div')
  frame.classList.add('frame')
  frame.id = 'frame'
  container.appendChild(frame)

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
  const debugLaser7 = document.createElement('div')
  const debugPhotoCell = document.createElement('div')

  const debugLasers = [
    debugLaser1,
    debugLaser2,
    debugLaser3,
    debugLaser4,
    debugLaser5,
    debugLaser6,
    debugLaser7,
    debugPhotoCell
  ]

  debugLasers.forEach((element, i) => {
    element.style.color = 'white'
    element.id = `laser${i}`
    debugPanel.appendChild(element)
  })

  document.body.appendChild(debugPanel)

  canvasSize = { width: window.innerWidth, height: window.innerHeight }

  let sketch = (p) => {
    p.setup = () => {
      let canvas = p.createCanvas(canvasSize.width, canvasSize.height)
      canvas.parent('frame')
      p.frameRate(24)
    }

    p.draw = () => {
      const background = laserSensorsData[0]
      const weight = laserSensorsData[1] / 3

      const red = laserSensorsData[2]
      const green = laserSensorsData[3]
      const blue = laserSensorsData[4]

      const gridSize = parseInt(laserSensorsData[5] / 3)

      const cellSize = {
        width: canvasSize.width / gridSize,
        height: canvasSize.height / gridSize
      }

      const amplitude = laserSensorsData[6] / 10
      const curvature = laserSensorsData[7] / 10

      p.background(background)
      p.noFill()
      p.strokeWeight(weight)

      p.stroke(red, green, blue)

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

      // p.colorMode(p.RGB)
      // p.noStroke()
      // p.fill(red, green, blue)
      // p.ellipse(offset.x + 200, offset.y + 200, size, size)
    }
  }

  let myp5 = new p5(sketch)
})
