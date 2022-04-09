import resize from 'Lib/resize/v0.2/resize'
import GameObjectsFactory from 'Lib/factory/v0.2/factory'
import {onCtaActionExported, setDimensions, setPosition} from 'Lib/utils'
import getPolygon from './polygons'

export default class GameState extends Phaser.State {
  constructor(settings, level, t) {
    super()
    this.settings = settings
    this.level = level
    this.t = t
    //
    this.goal = 3
    this.bmds = []
    this.ropes = []
    //
    this.wrong = false
    this.rect = null
    this.animationsToDestroy = []
    this.polygons = []
    this.lines = []
    this.edges = new Map()
    this.sequence = new Set()
    this.chipSequence = new Set()
    this.lastXY = {
      x   : null,
      y   : null,
      rx  : null,
      ry  : null,
      line: [],
    }
    this.canvas = {}
    //
    this.startChip = null
    this.currentChip = null
    this.targetChip = null
    //
    this.hintTimeout = null
    this.hintAnimations = []
  }

  create() {
    this.factory = new GameObjectsFactory(this, this.t)
    this.factory.createGameObjects(this.level)
    this.objects = this.factory.objects

    this.objects.events.ctaClick.add(onCtaActionExported)

    this.chips = Object.values(this.objects.sprites).filter((sprite) => sprite.data && Object.prototype.hasOwnProperty.call(sprite.data, 'hover') && sprite)

    for (const [id, chip] of this.chips.entries()) {
      chip.data = {...chip.data, over: false, id}
      chip.inputEnabled = true
      chip.input.pixelPerfectClick = true
      chip.input.pixelPerfectOver = true
    }

    this.game.input.onDown.add(({x, y}) => {
      if (this.gameStarted) {
        if (this.chips.some((chip) => chip.input.pointerOver())) {
          const {hand} = this.objects.sprites
          hand.alpha = 1
          hand.position.set(x, y)

          this.startChip = this.chips.find((chip) => chip.input.pointerOver())
          this.game.add.tween(this.objects.sprites[this.startChip.data.hover])
            .to({alpha: 1}, Phaser.Timer.QUARTER, Phaser.Easing.Linear.None, true)

          if (this.chipSequence.size > 0 && this.startChip.frameName !== [...this.chipSequence][0].frameName) {
            for (const chip of this.chipSequence) {
              this.game.add.tween(this.objects.sprites[chip.data.hover])
                .to({alpha: 0}, Phaser.Timer.QUARTER, Phaser.Easing.Linear.None, true)
            }
            this.clearPersistentRopes()
            this.chipSequence.clear()
          }

          this.hintStop()
          this.draw = true
        }
      }
    })

    this.game.input.onUp.add(() => {
      if (this.gameStarted) {
        if (this.draw && !this.wrong && this.sequence.size > 0 && this.currentChip.input.pointerOver()) {
          this.chipSequence.add(this.startChip)
          this.chipSequence.add(this.currentChip)

          this.lines[this.chipSequence.size - 2] = [...this.lastXY.line]
          this.drawPersistentRopes()

          if (this.chipSequence.size === this.goal) {
            for (const chip of this.chipSequence) {
              chip.alive = false
              chip.input.stop()
            }
            this.polygons.length = 0
            this.edges.clear()
            this.chipSequence.clear()
            this.objects.sprites.hand.alpha = 0

            this.clearPersistentRopes()
            this.resetDrawing()
            this.checkWin()
          }
        } else if (this.wrong) {
          this.redScreenFlash()
        }

        this.resetDrawing()
        this.objects.sprites.hand.alpha = 0
      }
    })

    this.resize()

    // this.prepareRopes()
    this.gameStart()
    // this.enableGameMechanics()
  }

  prepareRopes() {
    this.bmd = this.game.add.bitmapData(this.game.width, this.game.height)

    this.rope = this.game.make.image(0, 0)
    this.objects.containers.uiLayer.add(this.rope)

    this.ropeImage = this.game.make.image(100, 200, 'main', 'rope.png')
    this.ropeImage.width *= this.factor
    this.ropeImage.height *= this.factor

    this.tintedRopeImage = this.game.make.image(100, 200, 'main', 'rope.png')
    this.tintedRopeImage.tint = 0xff0000
    this.tintedRopeImage.width *= this.factor
    this.tintedRopeImage.height *= this.factor

    this.fakebmd = this.game.add.bitmapData(this.ropeImage.width, this.ropeImage.height)
    this.fakebmd.draw(this.ropeImage, 0, 0)
    this.fakebmd.getImage('image/png', 1, ({target}) => {
      this.realRope = target
    })

    this.tintedFakebmd = this.game.add.bitmapData(this.tintedRopeImage.width, this.tintedRopeImage.height)
    this.tintedFakebmd.draw(this.tintedRopeImage, 0, 0)
    this.tintedFakebmd.getImage('image/png', 1, ({target}) => {
      this.tintedRealRope = target
    })

    const alphas = this.ropes.map(({alpha}) => alpha)
    for (const rope of this.ropes) {
      rope.destroy()
    }
    this.ropes.length = 0
    this.bmds.length = 0
    for (let i = 0; i < 2; i += 1) {
      const rope = this.game.make.image(0, 0)
      rope.alpha = alphas[i]
      this.objects.containers.uiLayer.add(rope)
      this.ropes.push(rope)
      this.bmds.push(this.game.add.bitmapData(this.game.width, this.game.height))
    }
  }

  gameStart() {
    this.game.time.events.add(Phaser.Timer.SECOND, () => {
      this.game.add.tween(this.objects.texts.ready.scale)
        .to({x: 1, y: 1}, Phaser.Timer.QUARTER, Phaser.Easing.Linear.None, true)
        .onComplete
        .addOnce(() => {
          this.game.time.events.add(Phaser.Timer.SECOND, () => {
            this.game.add.tween(this.objects.texts.ready)
              .to({alpha: 0}, Phaser.Timer.QUARTER, Phaser.Easing.Linear.None, true)
              .onComplete
              .addOnce(() => {
                this.objects.texts.ready.scale.set(0)
                this.objects.texts.ready.alpha = 1
                this.objects.texts.ready.setText(this.t('go', {locale: __LOCALE__}))
                this.game.add.tween(this.objects.texts.ready.scale)
                  .to({x: 1, y: 1}, Phaser.Timer.QUARTER, Phaser.Easing.Linear.None, true)
                  .onComplete
                  .addOnce(() => {
                    this.game.time.events.add(Phaser.Timer.SECOND, () => {
                      this.game.add.tween(this.objects.texts.ready)
                        .to({alpha: 0}, Phaser.Timer.QUARTER, Phaser.Easing.Linear.None, true)
                      this.game.add.tween(this.objects.containers.scroll)
                        .to({alpha: 0}, Phaser.Timer.QUARTER, Phaser.Easing.Linear.None, true)
                      if (!this.isLandscape) {
                        this.game.add.tween(this.objects.containers.canvas.position)
                          .to({y: 410 * this.factor}, Phaser.Timer.HALF, Phaser.Easing.Linear.None, true)
                          .onComplete
                          .addOnce(() => {
                            this.game.add.tween(this.objects.containers.draw)
                              .to({alpha: 1}, Phaser.Timer.QUARTER, Phaser.Easing.Linear.None, true)
                            this.resize()
                            this.enableGameMechanics()
                          })
                      } else {
                        this.game.add.tween(this.objects.containers.draw)
                          .to({alpha: 1}, Phaser.Timer.QUARTER, Phaser.Easing.Linear.None, true)
                          .onComplete
                          .addOnce(this.enableGameMechanics.bind(this))
                      }
                      this.objects.containers.canvas.data.offset.portrait.top = 410
                    })
                  })
              })
          })
        })
    }, this)
  }

  enableGameMechanics() {
    this.gameStarted = true
    this.game.input.addMoveCallback(this.paint, this)
    this.hintSet()
  }

  resetDrawing() {
    if (this.draw) {
      this.hintSet()
    }
    this.wrong = false
    this.draw = false
    this.lastXY = {x: null, y: null, rx: null, ry: null, line: null}
    this.startChip = null
    this.currentChip = null
    this.targetChip = null
    this.sequence.clear()
    this.objects.graphics.canvasBack.clear()
    this.bmd?.clear()
    for (const chip of this.chips) {
      chip.data.over = false
      if (chip.alive) {
        chip.input.reset()
        chip.input.start()
      } else {
        this.game.add.tween(chip)
          .to({alpha: 0}, Phaser.Timer.QUARTER, Phaser.Easing.Linear.None, true)
      }
    }
    this.clearHover()
  }

  clearHover() {
    for (const chip of this.chips) {
      if (chip !== this.startChip && ![...this.chipSequence].includes(chip)) {
        this.game.add.tween(this.objects.sprites[chip.data.hover])
          .to({alpha: 0}, Phaser.Timer.QUARTER, Phaser.Easing.Linear.None, true)
      }
    }
  }

  redScreenFlash() {
    this.game.add.tween(this.objects.graphics.wall)
      .to({alpha: 1}, Phaser.Timer.QUARTER, Phaser.Easing.Cubic.Out, true)
      .yoyo(true)
  }

  paint(pointer, x, y) {
    if (pointer.isDown && this.draw) {
      if (!this.rect.contains(x, y)) {
        this.objects.sprites.hand.alpha = 0
        this.redScreenFlash()
        this.resetDrawing()

        return
      }

      this.chips.some((chip) => {
        const event1 = chip.input.pointerOver() && !chip.data.over
        const event2 = chip.input.pointerOut() && chip.data.over

        if (event1) {
          this.onPointerOverChip(chip)
        } else if (event2) {
          this.onPointerOutChip(chip)
        }

        return event1 || event2
      })

      this.drawRope(x, y, this.factor)
    }
  }

  drawRope(newX, newY, factor) {
    const {x: lx, y: ly, rx, ry} = this.lastXY
    const {x: cx, y: cy} = this.objects.containers.canvas.position
    const {x: dx, y: dy} = this.objects.graphics.canvasBack.position
    const [x, y] = [
      (newX - cx - (dx * factor)) / factor / this.canvasScaleFactor,
      (newY - cy - (dy * factor)) / factor / this.canvasScaleFactor,
    ]

    this.bmd.clear()
    this.bmd.textureLine(new Phaser.Line(rx ?? newX, ry ?? newY, newX, newY), this.wrong ? this.tintedRealRope : this.realRope)
    this.rope.loadTexture(this.bmd)

    this.objects.graphics.canvasBack.clear()
    this.drawPoly()
    // this.objects.graphics.canvasBack.lineStyle(7, '0xff00ff', 1)
    // this.objects.graphics.canvasBack.moveTo(lx ?? x, ly ?? y)
    // this.objects.graphics.canvasBack.lineTo(x, y)

    this.lastXY.x ??= x
    this.lastXY.y ??= y
    this.lastXY.rx ??= newX
    this.lastXY.ry ??= newY
    this.lastXY.line = [rx ?? newX, ry ?? newY, newX, newY]
    this.canvas = {x: this.objects.containers.canvas.position.x, y: this.objects.containers.canvas.position.y}

    this.checkCollision(lx ?? x, ly ?? y, x, y)

    this.objects.sprites.hand.position.set(newX, newY)
  }

  drawPersistentRopes() {
    for (const [i, line] of this.lines.entries()) {
      const [x1, y1, x2, y2] = line
      const bmd = this.bmds[i]
      const rope = this.ropes[i]

      bmd.clear()
      bmd.textureLine(new Phaser.Line(x1, y1, x2, y2), this.realRope)
      rope.loadTexture(bmd)
      rope.alpha = 1
    }
  }

  clearPersistentRopes() {
    for (const rope of this.ropes) {
      this.game.add.tween(rope)
        .to({alpha: 0}, Phaser.Timer.QUARTER, Phaser.Easing.Linear.None, true)
    }
    this.lines.length = 0
  }

  drawPoly() {
    const drawing = this.objects.graphics.canvasBack
    const offset = {
      x: drawing.position.x,
      y: drawing.position.y,
    }
    const positions = {
      x: [161, 277, 509, 277, 393, 161, 509, 277, 277, 393, 509, 277, 393, 509, 393, 161, 161, 393],
      y: [110, 176, 237, 64, 64, 237, 110, 288, 400, 288, 491, 512, 176, 364, 400, 364, 491, 512],
    }

    if (this.polygons.length === 0) {
      for (const [index, chip] of this.chips.entries()) {
        if (chip.alive) {
          const {frameName} = chip
          const x = positions.x[index]
          const y = positions.y[index]
          const polygon = getPolygon(x - offset.x, y - offset.y, frameName)
          polygon.data = {frameName}
          this.polygons.push(polygon)
        }
      }

      for (const [i, polygon] of this.polygons.entries()) {
        const {points, data: {frameName}} = polygon

        for (let j = 0; j < points.length; j += 1) {
          const {x: x1, y: y1} = points[j]
          const {x: x2, y: y2} = points[j + 1] ?? points[0]

          const key = `poly-${i}-line-${j}`
          if (!this.edges.has(key)) {
            const line = new Phaser.Line(x1, y1, x2, y2)
            line.data = {frameName}
            this.edges.set(key, line)
          }
        }
      }
    }
  }

  checkCollision(x1, y1, x2, y2) {
    const line = new Phaser.Line(x1, y1, x2, y2)

    for (const [, edge] of this.edges) {
      const {x, y} = line.intersects(edge) ?? {}
      this.wrong = !!(x && y && edge.data.frameName !== this.targetChip)

      if (this.wrong) {
        break
      }
    }
  }

  onPointerOverChip(chip) {
    chip.data.over = true

    this.currentChip = chip
    this.targetChip = this.targetChip ?? chip.frameName

    const name = `${chip.frameName}-${chip.data.id}`
    if (!this.sequence.has(name) && chip !== this.startChip) {
      this.sequence.add(name)

      this.game.add.tween(this.objects.sprites[chip.data.hover])
        .to({alpha: 1}, Phaser.Timer.QUARTER, Phaser.Easing.Linear.None, true)
    }
  }

  onPointerOutChip(chip) {
    chip.data.over = false

    const name = `${chip.frameName}-${chip.data.id}`
    if (this.sequence.has(name) && ![...this.chipSequence].includes(chip)) {
      this.sequence.delete(name)

      this.game.add.tween(this.objects.sprites[chip.data.hover])
        .to({alpha: 0}, Phaser.Timer.QUARTER, Phaser.Easing.Linear.None, true)
    }
  }

  hintSet() {
    this.hintTimeout = this.game.time.events.add(Phaser.Timer.SECOND * 3, this.hintPlay.bind(this))
    this.hintTimeout.timer.start()
  }

  hintStop() {
    this.hintTimeout.timer.stop()
    for (const animation of this.hintAnimations) {
      animation.stop()
    }
    this.clearHover()
    this.hintAnimations.length = 0
  }

  hintPlay() {
    const animations = []
    const aliveChips = this.chips.filter(({alive}) => alive)
    const index = this.game.rnd.integerInRange(0, aliveChips.length - 1)
    const hintChipName = this.chipSequence.size > 0 ? [...this.chipSequence][0].frameName : aliveChips[index]?.frameName

    if (aliveChips.length === 0) {
      this.hintStop()
      return
    }

    for (const chip of this.chips.filter(({frameName}) => frameName === hintChipName)) {
      animations.push(
        new Promise((resolve) => {
          const animation = this.game.add.tween(this.objects.sprites[chip.data.hover])
            .to({alpha: 1}, Phaser.Timer.QUARTER, Phaser.Easing.Linear.None, true)
            .yoyo(true)
            .repeat(2)
          animation
            .onComplete
            .addOnce(resolve)
          this.hintAnimations.push(animation)
        }),
      )
    }

    Promise.all(animations).then(() => {
      this.hintAnimations.length = 0
      this.hintSet()
    })
  }

  checkWin() {
    if (this.chips.filter(({alive}) => alive).length === 0) {
      this.game.add.tween(this.objects.containers.canvas)
        .to({alpha: 0}, Phaser.Timer.HALF, Phaser.Easing.Linear.None, true)
      this.game.add.tween(this.objects.containers.draw)
        .to({alpha: 0}, Phaser.Timer.HALF, Phaser.Easing.Linear.None, true)
      this.game.add.tween(this.objects.sprites.logo)
        .to({width: 456 * this.factor, height: 253 * this.factor}, Phaser.Timer.HALF, Phaser.Easing.Linear.None, true)
      if (!this.isLandscape) {
        this.animationsToDestroy.push(this.game.add.tween(this.objects.sprites.logo.position)
          .to({y: 301 * this.factor}, Phaser.Timer.SECOND, Phaser.Easing.Linear.None, true))
        this.animationsToDestroy.push(this.game.add.tween(this.objects.containers.cta.position)
          .to({y: 735 * this.factor}, Phaser.Timer.SECOND, Phaser.Easing.Linear.None, true))
      } else {
        this.animationsToDestroy.push(this.game.add.tween(this.objects.sprites.logo.position)
          .to({x: 683 * this.factor}, Phaser.Timer.SECOND, Phaser.Easing.Linear.None, true))
        this.animationsToDestroy.push(this.game.add.tween(this.objects.containers.cta.position)
          .to({x: 683 * this.factor}, Phaser.Timer.SECOND, Phaser.Easing.Linear.None, true))
      }
      this.objects.sprites.logo.data.dimensions.w = 456
      this.objects.sprites.logo.data.dimensions.h = 253
      this.objects.sprites.logo.data.offset.portrait.top = 301
      this.objects.sprites.logo.data.offset.landscape['center-x'] = 0
      this.objects.containers.cta.data.offset.portrait.top = 735
      this.objects.containers.cta.data.offset.landscape['center-x'] = 0
    }
  }

  adjustObject(setDim, setPos, object, data) {
    [object.width, object.height] = setDim(data ?? object)
    object.position.set(...setPos(data ?? object))
  }

  resize(w, h) {
    const [width, height, , factorUI, isLandscape] = resize(this, w, h, this.objects.cameraSettings)
    this.factor = factorUI
    this.isLandscape = isLandscape

    const setDim = setDimensions.bind(null, factorUI)
    const setPos = setPosition.bind(null, width, height, factorUI, isLandscape)
    const adjObj = this.adjustObject.bind(this, setDim, setPos)

    if (this.animationsToDestroy.length > 0) {
      for (const animation of this.animationsToDestroy) {
        animation.stop()
      }
    }

    const {logo, hand} = this.objects.sprites
    const {cta, scroll, canvas, readyGo, draw} = this.objects.containers
    const {wall} = this.objects.graphics

    for (const obj of [hand, logo, cta, scroll, readyGo, draw, wall]) {
      adjObj(obj)
    }

    if (isLandscape) {
      this.canvasScaleFactor = 0.95
      const canvasData = {
        data: {
          dimensions: {
            w: canvas.data.dimensions.w * this.canvasScaleFactor,
            h: canvas.data.dimensions.h * this.canvasScaleFactor,
          },
          offset: {
            landscape: {
              left      : canvas.data.offset.landscape.left,
              'center-y': -canvas.data.dimensions.h * (this.canvasScaleFactor / 2),
            },
          },
        },
      }
      adjObj(canvas, canvasData)
    } else {
      this.canvasScaleFactor = 1
      adjObj(canvas)
    }

    const rect = {
      x: canvas.position.x + this.objects.graphics.canvasBack.position.x * factorUI,
      y: canvas.position.y + this.objects.graphics.canvasBack.position.y * factorUI,
      w: this.objects.graphics.canvasBack.data.w * factorUI * this.canvasScaleFactor,
      h: this.objects.graphics.canvasBack.data.h * factorUI * this.canvasScaleFactor,
    }
    this.rect = new Phaser.Rectangle(rect.x, rect.y, rect.w, rect.h)

    this.resetDrawing()

    this.prepareRopes()

    if (this.lines.length > 0) {
      const [x1, y1, x2, y2] = this.lines[0]
      const {x, y} = this.canvas
      const [dx1, dy1, dx2, dy2] = [x1 - x, y1 - y, x2 - x, y2 - y]

      const {x: cx, y: cy} = this.objects.containers.canvas.position
      this.canvas = {x: this.objects.containers.canvas.position.x, y: this.objects.containers.canvas.position.y}
      this.lines[this.chipSequence.size - 2] = [
        cx + dx1 * (isLandscape ? 0.95 : 1.05),
        cy + dy1 * (isLandscape ? 0.95 : 1.05),
        cx + dx2 * (isLandscape ? 0.95 : 1.05),
        cy + dy2 * (isLandscape ? 0.95 : 1.05),
      ]
      this.drawPersistentRopes()
    }
  }
}
