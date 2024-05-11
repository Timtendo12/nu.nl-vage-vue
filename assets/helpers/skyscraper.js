if (!window.NU) {
  window.NU = {};
}

var m = 'VerticalShiftSkyScraper';
NU[m] =
  NU[m] ||
  function (a) {
    if (!a) return;
    var d = document,
      q = 'querySelector',
      v1 = d[q]('#v1'),
      c = d[q]('main'),
      h = 'clientHeight';
    if (v1 && c && a + v1[h] < c[h]) {
      v1.style.marginTop = a + 'px';
    } else {
      v1.style.display = 'none';
    }
  };
