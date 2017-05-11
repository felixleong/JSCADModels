/* global include, CAG, CSG, cylinder, difference, union */
include('./denom.jscad')

var RESOLUTION = 100
var DENOMINATIONS = {
  1: denom1,
  5: denom5,
  10: denom10,
  25: denom25,
  100: denom100
}

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

function getParameterDefinitions () {
  return [
    {
      name: 'chipRadius',
      type: 'float',
      initial: 12.5,
      caption: 'Chip radius'},
    {
      name: 'chipHeight',
      type: 'float',
      initial: 2.5,
      caption: 'Chip height'},
    {
      name: 'ridgeHeight',
      type: 'float',
      initial: 0.8,
      caption: 'Ridge height'},
    {
      name: 'ridgeBorder',
      type: 'float',
      initial: 3.5,
      caption: 'Ridge border width'},
    {
      name: 'ridgeSegments',
      type: 'int',
      initial: 14,
      caption: 'Number of segment on the ridge'},
    {
      name: 'tolerance',
      type: 'float',
      initial: 0.15,
      caption: 'Tolerannce'},
    {
      name: 'denom',
      type: 'int',
      initial: 1,
      caption: 'Denomination'}
  ]
}

function main (params) {
  let textTemplate = DENOMINATIONS[params.denom]
  let text = textTemplate().scale([2.2, 2.2]).extrude({offset: [0, 0, 0.45]})

  return [
    ridge(
      params.ridgeSegments, params.chipRadius, params.ridgeBorder,
      params.ridgeHeight, params.tolerance),
    difference(
      cylinder({
        r: params.chipRadius - params.ridgeBorder - 0.7,
        h: params.ridgeHeight,
        fn: RESOLUTION}),
      text.mirroredX()
    ),
    difference(
      cylinder({
        r: params.chipRadius,
        h: params.chipHeight - 2 * params.ridgeHeight,
        fn: RESOLUTION})
        .translate([0, 0, params.ridgeHeight]),
      cylinder({
        r: params.chipRadius - params.ridgeBorder - params.tolerance,
        h: params.ridgeHeight,
        fn: RESOLUTION})
        .translate([
          0,
          0,
          params.chipHeight - params.ridgeHeight - params.tolerance - 0.15]),
        text.translate([
          0,
          0,
          params.chipHeight - params.ridgeHeight - params.tolerance - 0.6])
    ),
    ridge(
      params.ridgeSegments, params.chipRadius, params.ridgeBorder,
      params.ridgeHeight, params.tolerance)
      .mirroredZ()
      .rotateZ(360 / params.ridgeSegments)
      .translate([0, 0, params.chipHeight])
  ]
}
