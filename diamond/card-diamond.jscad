//
// producer: OpenJSCAD.org 0.5.2 (2016/10/01) SVG Importer
// date: Wed May 10 2017 10:35:09 GMT+0800 (+08)
// source: template.svg
//
function main(params) {
  var cag0 = new CAG();
    var cag1 = new CAG();
    var cag10 = new CAG();
    var cag101 = new CSG.Path2D([[27.4235943917728,-21.0167296584726]],false);
    cag101 = cag101.appendPoint([28.318392859093997,-22.4289012495002]);
    cag101 = cag101.appendPoint([27.4235943917728,-23.8389516584726]);
    cag101 = cag101.appendPoint([26.528795077785,-22.4289012495002]);
    cag101 = cag101.close();
    cag101 = cag101.innerToCAG();
    cag10 = cag10.union(cag101);
    cag1 = cag1.union(cag10);
  var cag00 = cag1;
  cag00 = cag00.scale([5.6, 5.6]);
  cag0 = cag0.union(cag00);
  return cag0.center().extrude({offset: [0, 0, 10]});
}
