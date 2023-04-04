import p5 from 'p5'

import { getRandomArbitrary } from './utilities'
import React, { PureComponent } from 'react'
import DevControlPanel from './DevControlPanel'

const laserSensorsData = [0, 0, 0, 0, 0, 0, 0]

const canvasSize = {
  width: 0,
  height: 0
}

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

console.log('TEST')

export default class ArtRoom extends PureComponent {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    canvasSize = { width: window.innerWidth, height: window.innerHeight }

    let sketch = (p) => {
      p.setup = () => {
        let canvas = p.createCanvas(canvasSize.width, canvasSize.height)
        canvas.parent('ArtRoom')
        p.frameRate(30)
        p.background(0)
      }

      p.draw = () => {
        w = getRandomArbitrary(20, 80)
        h = getRandomArbitrary(20, 80)

        x = getRandomArbitrary(0, canvasSize.width - w)
        y = getRandomArbitrary(0, canvasSize.height - h)

        if (clearCanvas) {
          // p.clear()
          p.background(0)
          clearCanvas = false
        }

        if (colorSwitch) {
          r = getRandomArbitrary(0, 255)
          g = getRandomArbitrary(0, 255)
          b = getRandomArbitrary(0, 255)

          p.fill(r, g, b)
        } else {
          c = getRandomArbitrary(0, 255)
          p.fill(c)
        }

        p.rect(x, y, w, h)
      }
    }
  }

  render() {
    return (
      <div className="ArtRoom" id="ArtRoom">
        <DevControlPanel
          handleMouseMove={this.handleMouseMove}
          handleMouseLeave={this.handleMouseLeave}
        />
      </div>
    )
  }
}
