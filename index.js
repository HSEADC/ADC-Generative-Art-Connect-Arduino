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
  // console.log("received: %s", event.data);
  // console.log(event.data);
  radius = parseInt(event.data)
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
      p.noStroke()

      p.colorMode(p.RGB)
      p.fill(255, 100, 150)
      p.ellipse(offset, offset, radius, radius)
    }
  }

  let myp5 = new p5(sketch)
})
