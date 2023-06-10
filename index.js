let pot = 0
let dist = 0
let mic = 0

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
  // console.log("received: %s", event.data);

  console.log(event.data)

  let jsonData = JSON.parse(event.data)
  pot = parseInt(jsonData['p'])
  dist = parseInt(jsonData['d'])
  mic = parseInt(jsonData['m'])
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

  const canvasSize = 700

  let sketch = (p) => {
    p.setup = () => {
      let canvas = p.createCanvas(canvasSize, canvasSize)
      canvas.parent('frame')
      p.frameRate(60)
    }

    p.draw = () => {
      // const offset = canvasSize / 2 + radius / 2;
      const offset = canvasSize / 2

      p.background(100)
      // p.noStroke()

      p.colorMode(p.RGB)

      let r = 0

      if (mic > 520) {
        let range = mic - 520
        let coef = 10

        if (range > 25) {
          coef = 5
        }

        r = range * coef
      }

      if (pot == 0) {
        pot = 5
      }

      pot = pot + r

      console.log(dist)

      p.fill(r, 100, 150)
      p.strokeWeight(dist / 10)
      p.stroke(150, r, 100)
      p.ellipse(offset, offset, pot, pot)
    }
  }

  let myp5 = new p5(sketch)
})
