pv.Panel = function() {
  pv.Mark.call(this);
  this.marks = [];
  this.root = this;
};

pv.Panel.toString = function() "panel";

pv.Panel.prototype = pv.Mark.extend();
pv.Panel.prototype.type = pv.Panel;
pv.Panel.prototype.renderIndex = -1;
pv.Panel.prototype.renderData = null;
pv.Panel.prototype.defineProperty("width");
pv.Panel.prototype.defineProperty("height");
pv.Panel.prototype.defineProperty("canvas");

pv.Panel.defaults = pv.Mark.defaults.extend(pv.Panel)
    .left(0)
    .right(0)
    .top(0)
    .bottom(0);

pv.Panel.prototype.add = function(type) {
  var mark = new type();
  mark.panel = this;
  mark.root = this.root;
  mark.markIndex = this.marks.length;
  this.marks.push(mark);
  return mark;
};

pv.Panel.prototype.clear = function(g) {
  this.renderData = [];
  var data = this.get("data");
  this.renderData.unshift(null);
  for each (let d in data) {
    this.renderData[0] = d;
    this.index++;
    let g = this.context(g);
    g.clearRect(0, 0, g.canvas.width, g.canvas.height);
  }
  delete this.renderData;
  delete this.index;
};

pv.Panel.prototype.createCanvas = function() {
  if (!this.canvases) {
    this.canvases = [];
  }
  var c = this.canvases[this.index];
  if (!c) {
    function lastChild(node) {
      while (node.lastChild && node.lastChild.tagName) {
        node = node.lastChild;
      }
      return (node == document.body) ? node : node.parentNode;
    }
    c = this.canvases[this.index] = document.createElement("canvas");
    c.width = this.get("width");
    c.height = this.get("height");
    lastChild(document.body).appendChild(c);
  }
  return c;
};

pv.Panel.prototype.context = function(g) {
  var c = this.get("canvas");
  if (c == null) {
    return (g == null) ? this.createCanvas().getContext("2d") : g;
  }
  if (typeof c == "string") {
    c = document.getElementById(c);
  }
  return c.getContext("2d");
};

pv.Panel.prototype.render = function() {
  if (!this.panel) {
    pv.Panel.prototype.clear.apply(this, arguments);
    this.renderData = [];
  }
  pv.Mark.prototype.render.apply(this, arguments);
  if (!this.panel) {
    this.dispose();
  }
};

pv.Panel.prototype.renderInstance = function(g, d) {
  g = this.context(g);

  var l = this.get("left");
  var r = this.get("right");
  var t = this.get("top");
  var b = this.get("bottom");
  var w = this.get("width");
  var h = this.get("height");

  var width = g.canvas.width - this.offset("right") - this.offset("left");
  if (l == null) {
    l = width - w - r;
  } else if (r == null) {
    r = width - w - l;
  } else if (w == null) {
    w = width - r - l;
  }

  var height = g.canvas.height - this.offset("bottom") - this.offset("top");
  if (t == null) {
    t = height - h - b;
  } else if (b == null) {
    b = height - h - t;
  } else if (h == null) {
    h = height - t - b;
  }

  var x = l + this.offset("left");
  var y = t + this.offset("top");

  this.renderState[this.index] = {
      data : d,
      visible : true,
      top : t,
      left : l,
      bottom : b,
      right : r,
      width : w,
      height : h,
    };

  for each (let m in this.marks) {
    m.render(g);
  }
};

pv.Panel.prototype.dispose = function() {
  pv.Mark.prototype.dispose.call(this);
  for each (var mark in this.marks) {
    mark.dispose();
  }
};