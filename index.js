let canvasSize

let sketchData = {
  accelerometer: {
    x: 0,
    y: 0,
    z: 0
  },
  gyroscope: {
    x: 0,
    y: 0,
    z: 0
  },
  temperature: 0
}

let radius = 100

// From https://habr.com/ru/post/516334/
export const wsConnection = new WebSocket('ws://localhost:3000/websocket')

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
  // console.log('received: %s', event.data)
  // console.log(JSON.parse(event.data))
  // radius = parseInt(event.data)
  sketchData = JSON.parse(event.data)
  // console.log(sketchData)
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

import p5 from 'p5'

document.addEventListener('DOMContentLoaded', () => {
  const container = document.body
  const frame = document.createElement('div')
  frame.classList.add('frame')
  frame.id = 'frame'
  container.appendChild(frame)

  let sketch = (p) => {
    p.setup = () => {
      canvasSize = { width: window.innerWidth, height: window.innerHeight }

      let canvas = p.createCanvas(canvasSize.width, canvasSize.height)
      canvas.parent('frame')
      p.frameRate(60)
    }

    p.draw = () => {
      // const offset = canvasSize / 2 + radius / 2;
      const offset = {
        x: canvasSize.width / 2 + Math.abs(sketchData.gyroscope.x) / 100,
        y: canvasSize.height / 2 + Math.abs(sketchData.gyroscope.y) / 100
        // x: canvasSize.width / 2 + Math.abs(sketchData.accelerometer.x) / 100,
        // y: canvasSize.height / 2 + Math.abs(sketchData.accelerometer.y) / 100
        // x: sketchData.gyroscope.x,
        // y: sketchData.gyroscope.y
      }

      p.background(100)
      p.noStroke()

      p.colorMode(p.RGB)
      p.fill(255, 100, 150)
      p.ellipse(offset.x, offset.y, radius, radius)
      // console.log(offset.x, offset.y)
    }
  }

  let myp5 = new p5(sketch)
})
