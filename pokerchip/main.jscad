/* global include, CAG, CSG, cylinder, difference, union */
include('./denom.jscad')

var RESOLUTION = 100

function radians (degree) {
  return degree / 180 * Math.PI
}

function isoscelesWidth (height, degree) {
  return 2 * height * Math.tan(0.5 * radians(degree))
}

function grooveObj (height, slopeDegree, tolerance, length) {
  let baseWidth = isoscelesWidth(height, slopeDegree)
  let shape = [
    [0, 0], [baseWidth / 2 + tolerance, 0], [tolerance, height], [0, height]
  ]

  return CAG
    .fromPoints(shape)
    .extrude({offset: [0, 0, length]})
    .rotateX(90)
    .rotateZ(90)
}

function pieSlice (segments, height, radius, tolerance) {
  let pie = new CSG.Path2D()
  pie = pie.concat(CSG.Path2D.arc({
    center: [0, 0, 0],
    radius: radius,
    startangle: 0,
    endangle: 360 / segments,
    resolution: RESOLUTION
  }))
  pie = pie.appendPoint([0, 0])
  pie = pie.close()
  let shape = pie.innerToCAG()

  return difference(
    shape.extrude({offset: [0, 0, height]}),
    grooveObj(height, 80, tolerance, radius),
    grooveObj(height, 80, tolerance, radius)
      .mirroredY()
      .rotateZ(360 / segments)
  )
}

function ridge (
    segments, chipRadius, ridgeBorderWidth, ridgeHeight, tolerance) {
  let segmentInterval = 360 / segments
  let slice = pieSlice(segments, ridgeHeight, chipRadius, tolerance)
  let slices = []
  for (let i = 0; i < segments; i += 2) {
    slices.push(slice.rotateZ(segmentInterval * i))
  }
  return difference(
    union(slices),
    cylinder({r: chipRadius - ridgeBorderWidth + tolerance,
      h: ridgeHeight,
      fn: RESOLUTION}))
}

function main () {
  let chipRadius = 12.5
  let chipHeight = 2.5
  let ridgeHeight = 0.8
  let ridgeBorderWidth = 3.5
  let segments = 14
  let tolerance = 0.15
  let textTemplate = denom1

  let text = textTemplate().scale([2.2, 2.2]).extrude({offset: [0, 0, 0.45]})

  return [
    ridge(segments, chipRadius, ridgeBorderWidth, ridgeHeight, tolerance),
    difference(
      cylinder({r: chipRadius - ridgeBorderWidth - 0.7, h: ridgeHeight, fn: RESOLUTION}),
      text.mirroredX()
    ),
    difference(
      cylinder({r: chipRadius, h: chipHeight - 2 * ridgeHeight, fn: RESOLUTION})
        .translate([0, 0, ridgeHeight]),
      cylinder({r: chipRadius - ridgeBorderWidth - tolerance, h: ridgeHeight, fn: RESOLUTION})
        .translate([0, 0, chipHeight - ridgeHeight - tolerance - 0.15]),
        text.translate([0, 0, chipHeight - ridgeHeight - tolerance - 0.6])
    ),
    ridge(segments, chipRadius, ridgeBorderWidth, ridgeHeight, tolerance)
    .mirroredZ()
    .rotateZ(360 / segments)
    .translate([0, 0, chipHeight])
  ]
}
