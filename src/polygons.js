export default (x, y, frame) => {
  const set = []

  if (frame === 'item-yellow.png' || frame === 'item-violet.png') {
    set.push({x: x + 0.5 + -11, y: y + 0.5 + -47})
    set.push({x: x + 0.5 + 11,  y: y + 0.5 + -47})
    set.push({x: x + 0.5 + 33,  y: y + 0.5 + -34})
    set.push({x: x + 0.5 + 45,  y: y + 0.5 + -14})
    set.push({x: x + 0.5 + 46,  y: y + 0.5 + 11})
    set.push({x: x + 0.5 + 37,  y: y + 0.5 + 28})
    set.push({x: x + 0.5 + 20,  y: y + 0.5 + 42})
    set.push({x: x + 0.5 + -1,  y: y + 0.5 + 47})
    set.push({x: x + 0.5 + -21, y: y + 0.5 + 42})
    set.push({x: x + 0.5 + -34, y: y + 0.5 + 32})
    set.push({x: x + 0.5 + -45, y: y + 0.5 + 17})
    set.push({x: x + 0.5 + -47, y: y + 0.5 + -4})
    set.push({x: x + 0.5 + -43, y: y + 0.5 + -23})
    set.push({x: x + 0.5 + -28, y: y + 0.5 + -39})
  } else if (frame === 'item-purse.png') {
    set.push({x: x + -35.5, y: y + 0.5 + -25.5})
    set.push({x: x + -14.5, y: y + 0.5 + -36.5})
    set.push({x: x + -10.5, y: y + 0.5 + -45.5})
    set.push({x: x + 10.5,  y: y + 0.5 + -48.5})
    set.push({x: x + 21.5,  y: y + 0.5 + -36.5})
    set.push({x: x + 37.5,  y: y + 0.5 + -25.5})
    set.push({x: x + 45.5,  y: y + 0.5 + -25.5})
    set.push({x: x + 46.5,  y: y + 0.5 + -17.5})
    set.push({x: x + 39.5,  y: y + 0.5 + -11.5})
    set.push({x: x + 50.5,  y: y + 0.5 + 28.5})
    set.push({x: x + 15.5,  y: y + 0.5 + 45.5})
    set.push({x: x + -15.5, y: y + 0.5 + 44.5})
    set.push({x: x + -49.5, y: y + 0.5 + 27.5})
    set.push({x: x + -38.5, y: y + 0.5 + -11.5})
    set.push({x: x + -44.5, y: y + 0.5 + -17.5})
    set.push({x: x + -44.5, y: y + 0.5 + -25.5})
  } else if (frame === 'item-hat.png') {
    set.push({x: x + -19.5, y: y + -35.5})
    set.push({x: x + -9.5,  y: y + -40.5})
    set.push({x: x + 8.5,   y: y + -40.5})
    set.push({x: x + 16.5,  y: y + -35.5})
    set.push({x: x + 31.5,  y: y + -35.5})
    set.push({x: x + 43.5,  y: y + -32.5})
    set.push({x: x + 50.5,  y: y + -11.5})
    set.push({x: x + 46.5,  y: y + 13.5})
    set.push({x: x + 30.5,  y: y + 31.5})
    set.push({x: x + 10.5,  y: y + 40.5})
    set.push({x: x + -10.5, y: y + 40.5})
    set.push({x: x + -26.5, y: y + 35.5})
    set.push({x: x + -43.5, y: y + 22.5})
    set.push({x: x + -51.5, y: y + 4.5})
    set.push({x: x + -51.5, y: y + -20.5})
    set.push({x: x + -44.5, y: y + -32.5})
    set.push({x: x + -34.5, y: y + -35.5})
  } else if (frame === 'item-green.png') {
    set.push({x: x + 15.5,  y: y + -47.5})
    set.push({x: x + 23.5,  y: y + -38.5})
    set.push({x: x + 23.5,  y: y + -25.5})
    set.push({x: x + 29.5,  y: y + -21.5})
    set.push({x: x + 38.5,  y: y + -9.5})
    set.push({x: x + 38.5,  y: y + 8.5})
    set.push({x: x + 29.5,  y: y + 40.5})
    set.push({x: x + 15.5,  y: y + 49.5})
    set.push({x: x + -13.5, y: y + 49.5})
    set.push({x: x + -26.5, y: y + 41.5})
    set.push({x: x + -37.5, y: y + 6.5})
    set.push({x: x + -35.5, y: y + -13.5})
    set.push({x: x + -23.5, y: y + -23.5})
    set.push({x: x + -22.5, y: y + -37.5})
    set.push({x: x + -14.5, y: y + -48.5})
    set.push({x: x + 2.5,   y: y + -51.5})
  } else if (frame === 'item-blue.png') {
    set.push({x: x + -18.5, y: y + -47.5})
    set.push({x: x + -9.5,  y: y + -41.5})
    set.push({x: x + -8.5,  y: y + -31.5})
    set.push({x: x + -19.5, y: y + -14.5})
    set.push({x: x + -18.5, y: y + -2.5})
    set.push({x: x + -9.5,  y: y + 6.5})
    set.push({x: x + 6.5,   y: y + 6.5})
    set.push({x: x + 16.5,  y: y + -1.5})
    set.push({x: x + 17.5,  y: y + -14.5})
    set.push({x: x + 6.5,   y: y + -31.5})
    set.push({x: x + 7.5,   y: y + -41.5})
    set.push({x: x + 16.5,  y: y + -47.5})
    set.push({x: x + 26.5,  y: y + -47.5})
    set.push({x: x + 36.5,  y: y + -38.5})
    set.push({x: x + 41.5,  y: y + -28.5})
    set.push({x: x + 40.5,  y: y + -21.5})
    set.push({x: x + 44.5,  y: y + -11.5})
    set.push({x: x + 45.5,  y: y + 3.5})
    set.push({x: x + 41.5,  y: y + 20.5})
    set.push({x: x + 27.5,  y: y + 37.5})
    set.push({x: x + 7.5,   y: y + 45.5})
    set.push({x: x + -15.5, y: y + 44.5})
    set.push({x: x + -31.5, y: y + 34.5})
    set.push({x: x + -41.5, y: y + 22.5})
    set.push({x: x + -46.5, y: y + 7.5})
    set.push({x: x + -46.5, y: y + -8.5})
    set.push({x: x + -41.5, y: y + -20.5})
    set.push({x: x + -43.5, y: y + -26.5})
    set.push({x: x + -40.5, y: y + -36.5})
    set.push({x: x + -28.5, y: y + -47.5})
  }

  return new Phaser.Polygon(set)
}
