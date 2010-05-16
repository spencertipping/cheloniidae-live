// Cheloniidae Live | Spencer Tipping <spencer@spencertipping.com>
// Licensed under the terms of the MIT source code license

// Divergence core library | Spencer Tipping <spencer@spencertipping.com>
// Licensed under the terms of the MIT source code license

var d = (function () {
  var d = function () {return d[d.default_action].apply (this, arguments)};
  d.init = function (o) {for (var i = 1, l = arguments.length, $_; $_ = arguments[i], i < l; ++i) if ($_.call && $_.call.apply) $_.call (o);
                                                                                                  else                          for (var k in $_) o[k] = $_[k]; return o};
  d.init (d, {inline_macros:  [],            id: function    (x) {return x},
                functionals:  [],           arr: function    (o) {return Array.prototype.slice.call (o)},
                    aliases:  {},           map: function (o, f) {var x = {}; d.keys (o).each (function (k) {d.init (x, f (k, o[k]) || {})}); return x},
             default_action: 'init',       keys: function    (o) {var xs = []; for (var k in o) o.hasOwnProperty (k) && xs.push (k); return xs},
      functional_extensions:  {},     functions: function     () {var as = d.arr (arguments); return d.functionals.each (function (p) {d.init.apply (this, [p].concat (as))}), d},
                                   macro_expand: function    (s) {return d.inline_macros.fold (function (s, m) {return m(s)}, s)},
                                          alias: function (s, f) {d.aliases[s] = f.fn(); return d},
                                          macro: function (r, f) {d.inline_macros.push (r.maps_to (f)); return d},
                                          trace: function    (x) {d.tracer && d.tracer (x); return x}});

  d (String.prototype, (function (c) {return {maps_to: function (v) {var result = {}; result[this] = v; return result},
                                               lookup: function  () {return '$0.split(".").fold("$0[$1]", $1)'.fn(this)},
                                                alias: function (f) {return d.alias (this, f)},
                                                 fail: function  () {throw new Error (this.toString())},
                                                   fn: function  () {var s = d.macro_expand (this), f = d.aliases[s] || c[s] || (c[s] = eval ('(function(){return ' + s + '})'));
                                                                     return f.fn.apply (f, arguments)}}}) ({}));

  d (RegExp.prototype, {maps_to: function (f) {var s = this; return function (x) {return x.replace (s, f)}},
                          macro: function (f) {return d.macro (this, f)},
                             fn: function  () {var f = this.exec.bind (this); return f.fn.apply (f, arguments)}});

  d (Array.prototype, {flat_map: function (f) {var xs = [], f = f.fn(); this.each (function (x) {xs.push.apply (xs, f(x))}); return xs},
                        sort_by: function (f) {return this.sort ('$0($1) < $0($2)'.fn (f.fn()))},
                           each: function (f) {f = f.fn(); for (var i = 0, l = this.length; i < l; ++i) f (this[i]); return this},
                           grep: function (f) {var xs = [], f = f.fn(); for (var i = 0, l = this.length; i < l; ++i) f (this[i]) && xs.push (this[i]); return xs},
                           fold: function (f) {var xs = d.arr (arguments), f = xs.shift().fn(), x = xs.length ? xs[0] : this[0];
                                               for (var i = 1, l = xs.length + this.length; i < l; ++i) x = f (x, i < xs.length ? xs[i] : this[i - xs.length]); return x},
                            map: function (f) {var xs = [], f = f.fn(); for (var i = 0, l = this.length; i < l; ++i) xs.push (f (this[i])); return xs},
                             fn: function  () {var xs = this, f = function () {return xs.map ('$1.fn().apply($_,$0)'.fn (arguments))}; return f.fn.apply (f, arguments)}});

  d (Function.prototype, {fn: function () {var f = this, xs = d.arr (arguments); return xs.length ? function () {return f.apply (this, xs.concat (d.arr (arguments)))} : f}});
  d  (Boolean.prototype, {fn: function () {return this.valueOf () ? d.id.fn.apply (d.fn, arguments) : (1).fn ()}});
  d   (Number.prototype, {fn: function () {var x = this, f = function () {return arguments[x]}; return f.fn.apply (f, arguments)}});

               /^\./ .macro ('(arguments[0] || this).');
                /@_/g.macro ('Array.prototype.slice.call(arguments)');
               /\$_/g.macro ('this');
           /\$(\d+)/g.macro ('"arguments[" + arguments[1] + "]"'.fn());
            /@(\w+)/g.macro ('"this." + $1'.fn());

  /\{\|([\w,\s]+)\|/g.macro ('"(function(" + $1 + "){return "'.fn()); /\|\}/g.macro ('}).fn(arguments)');
              /\{\</g.macro ('(function(){return ');                  /\>\}/g.macro ('})');

  (d.functionals = [Array, Number, Boolean, Function, String, RegExp].map ('.prototype')).push (d.functional_extensions);

  d (d.operators = {},
       {create_aliases: function () {d.map (d.operators, function (_, v) {d.map (v.transforms, function (name, value) {d.map (v.operators, '$0($2).alias($1($3))'.fn (name.fn(), value.fn()))})})},
                binary: {transforms: {'$0':       '"$0" + $0 + "$1"', '$0 + "$"': '"{|xs| xs[0].fn().apply($_,@_)" + $0 + "xs[1].fn().apply($_,@_)|}"',
                                      '$0 + "_"': '"$_" + $0 + "$0"', '$0 + "_$"': '"{|xs, t| t.fn().apply($_,@_)" + $0 + "xs[0].fn().apply($_,@_)|}.fn($_)"'},
                          operators: {plus:'+', minus:'-', times:'*', over:'/', modulo:'%', lt:'<', gt:'>', le:'<=', ge:'>=', eq:'==', ne:'!=', req:'===', rne:'!==', and:'&&', or:'||', xor:'^',
                                      bitand:'&', bitor:'|', then:',', lshift: '<<', rshift: '>>', rushift: '>>>'}},
                 unary: {transforms: {'$0':       '$0 + "$0"', '$0 + "$"': '"{|xs| " + $0 + "xs[0].fn().apply($_,@_)|}"',
                                      '$0 + "_"': '$0 + "$_"', '$0 + "_$"': '"{|xs, t| " + $0 + "t.fn().apply($_,@_)|}"'},
                          operators: {not:'!', notnot:'!!', complement:'~', negative:'-', positive:'+'}},
            assignment: {transforms: {'$0': '"$0" + $0 + "$1"'},
                          operators: {plus_d:'+=', minus_d:'-=', times_d:'*=', over_d:'/=', bitand_d:'&=', bitor_d:'|=', bitxor_d:'^=', lshift_d:'<<=', rshift_d:'>>=', rushift_d:'>>>='}},
           applicative: {transforms: {'$0': '$0'},
                          operators: {'()': '$0($1)', '[]': '$0[$1]'}}}).create_aliases ();
  d.functions ({
      compose:  function (g) {var f = this.fn(); g = g.fn(); return function () {return f (g.apply (this, arguments))}},
 flat_compose:  function (g) {var f = this.fn(); g = g.fn(); return function () {return f.apply (this, g.apply (this, arguments))}},
       plural:  function  () {return '$1.map ($0)'.fn(this)},
        curry:  function (n) {var f = this.fn(); return n > 1 ? function () {var as = d.arr(arguments); return function () {return f.curry (n - 1).apply (this, as.concat (d.arr (arguments)))}} : f},
        proxy:  function (g) {var f = this.fn(); return g ? function () {return f.apply.apply (f, g.fn() (this, arguments))} : function () {return f.apply (this, arguments)}},
         bind:  function (x) {var f = this.fn(); return d.init (function () {return f.apply (x, arguments)}, {binding: x, original: f})},
         type:  function  () {var f = function () {}; f = f.ctor.apply (f, arguments); return function () {return c.apply (new f(), arguments)}},
         ctor:  function  () {var f = this.fn(), g = function () {f.apply (this, arguments)}; d.init.apply (this, [g.prototype].concat (d.arr (arguments))); return g},
         tail: '[$_, @_]'.fn(),
          cps:  function (c) {var cc = [this.fn(), [c = (c || d.id).fn().proxy()]]; while (cc[0] !== c) cc = cc[0].fn().apply (this, cc[1]); return c.apply (this, cc[1])}});

  return d}) ();

// This is for more generic utilities that are likely to be factored out into a separate library later. Most bottom-up projects will end up having such code.

// Cheloniidae Live is designed to render onto the HTML5 <canvas> element in much the same way that the current Java version uses the AWT to render shapes. Because JavaScript supports nearly
// uniform abstraction, there are far fewer layers of abstraction here than there are in the original. Most of the code originally represented by interfaces is now just encapsulated into
// functions. This impacts turtle commands, predicates, transforms, render actions, and a host of other things that are really just functions.

// The line model is different. Rather than having a bucket of lines, we instead use a Git-style model of line management: each line represents a diff of the image and state. Because each state
// supports a full set of operations, we don't need parent management. (In this respect, managing lines is different from managing commits; commits form a category, whereas lines form a monoid.)

  var qw = '$0.split(/\\s+/)'.fn();

// Vector geometry.
//   A basic setup with lines and points based on arrays. Arrays are given destructive and non-destructive componentwise arithmetic operators whose names are the same as the aliased functions
//   defined by Divergence. The vector geometry operators from the original Cheloniidae library are also implemented here.

  var vector = '@_.length ? @_.length === 1 ? $0 : @_ : [0,0,0]'.fn(),
        line = '@a = $0, @b = $1, @pen = $2'.ctor ({midpoint: '@a.times_vn(0.5).add_scaled (@b, 0.5)'.fn(),
                                                       depth: '$0.minus_v(@midpoint()).distance()'.fn(),
                                       adjust_for_positive_z: function (a, b) {if (a[2] <= 0 && b[2] <= 0) return false;
                                                                               else if         (a[2] <= 0) {var f = (1.0 - a[2]) / (b[2] - a[2]); return a.times_vnd (1.0 - f).add_scaled (b, f)}
                                                                               else if         (b[2] <= 0) {var f = (1.0 - b[2]) / (a[2] - b[2]); return b.times_vnd (1.0 - f).add_scaled (a, f)}
                                                                               else                        return true},
                                                      render: function (v) {var c = v.context, ta = v.transform (this.a), tb = v.transform (this.b);
                                                                            if (this.adjust_for_positive_z (ta, tb)) {
                                                                              c.save(); c.beginPath(); this.pen.install (c);
                                                                              var alpha = light_transmission (cylindrical_thickness (ta.minus_v (tb), v.transform (this.midpoint ())), c.globalAlpha);
                                                                              c.globalAlpha = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
                                                                              c.lineWidth *= 2.0 * v.scale_factor() / (ta[2] + tb[2]);
                                                                              c.moveTo.apply (c, v.scale (v.project (ta)));
                                                                              c.lineTo.apply (c, v.scale (v.project (tb)));
                                                                              c.closePath(); c.stroke(); c.restore()}
                                                                            return this}});

      d (d.operators.binary.transforms,     {'$0 + "_v"': '"[$_[0]"+$0+"$0[0],$_[1]"+$0+"$0[1],$_[2]"+$0+"$0[2]]"',   '$0 + "_vn"': '"[$_[0]"+$0+"$0,$_[1]"+$0+"$0,$_[2]"+$0+"$0]"'});
      d (d.operators.assignment.transforms, {'$0 + "_v"':  '"$_[0]"+$0+"$0[0],$_[1]"+$0+"$0[1],$_[2]"+$0+"$0[2],$_"', '$0 + "_vn"':  '"$_[0]"+$0+"$0,$_[1]"+$0+"$0,$_[2]"+$0+"$0,$_"'});
      d.operators.create_aliases ();

      d.keys (d.aliases).grep (/_v/).each ('Array.prototype[$1] = $0[$1].fn()'.fn (d.aliases));

      d (Number.prototype, {vector: '[+$_, +$_, +$_]'.fn(), x: '[+$_, 0, 0]'.fn(), y: '[0, +$_, 0]'.fn(), z: '[0, 0, +$_]'.fn(),
                           degrees: '$_ / 180.0 * Math.PI'.fn()});

      d (Array.prototype, {distance: 'Math.sqrt(@dot($_))'.fn(),                 dot: '$_[0]*$0[0] + $_[1]*$0[1] + $_[2]*$0[2]'.fn(),
                               proj: '$0.times_vn(@dot($0) / $0.dot($0))'.fn(), orth: '@minus_v(@proj($0))'.fn(),
                              clone: '[$_[0], $_[1], $_[2]]'.fn(),              line: 'new $0($_, $1)'.fn (line),

                           toString: '"<" + @join(", ") + ">"'.fn(),
                              cross: '[$_[1]*$0[2] - $_[2]*$0[1], $_[2]*$0[0] - $_[0]*$0[2], $_[0]*$0[1] - $_[1]*$0[0]]'.fn(),
                         add_scaled: '$_[0] += $0[0]*$1, $_[1] += $0[1]*$1, $_[2] += $0[2]*$1, $_'.fn(),
                          normalize: '@over_d_vn (@distance())'.fn(),
                               into: '[@dot($0)/$0.distance(), @dot($1)/$1.distance(), @dot($2)/$2.distance()]'.fn(),
                               from: '$0.times_vn($_[0]).add_scaled($1, $_[1]).add_scaled($2, $_[2])'.fn(),
                              about:  function (v, angle) {var b1 = v.clone().normalize(), b2 = this.orth(b1).normalize(), b3 = b1.cross (b2), l = this.orth (b1).distance ();
                                                           return this.proj (b1).add_scaled (b2, Math.cos (angle) * l).add_scaled (b3, Math.sin (angle) * l)}});

      d (Array.prototype, {repeat: function (n) {var xs = []; for (var i = 0; i < n; ++i) xs.push.apply (xs, this); return xs}});

// Incidence angle computation and attenuation.
//   The original Cheloniidae source code covers this in more detail, but the idea is that we're using some elementary differential equations to figure out how much light gets attenuated when
//   traveling through a tinted medium at an angle.

  var light_transmission = '((1.0 - $1) / Math.exp (-$1)) * Math.exp (-$0 * $1)'.fn (),                                 // thickness, opacity -> adjusted
        planar_thickness = '$0.distance() * $1.distance() / Math.abs ($0.dot ($1))'.fn (),                              // surface normal, v  -> sec (theta) = thickness
   cylindrical_thickness = '1.0 / Math.sqrt (1.0 - $0.dot($1) * $0.dot($1) / ($0.dot($0) * $1.dot($1)))'.fn ();         // axis, v            -> thickness

// Turtles.
//   A turtle manages a collection of lines. You can also create a bunch of lines and render those, but a turtle maintains state in between. Turtles are immutable, but the lines they draw are
//   stateful. It's perhaps an odd model, but it means that you can grab a turtle state from some time before without losing what you've drawn since. In other words, a turtle represents a
//   position, direction, etc. all at a moment; you get a new turtle after a line is drawn.

  d.init (String.prototype, {patching_constructor: '("new @constructor (d.init ({}, $_, {" + $_ + ": $0}))").fn()'.fn()});

  var rotational_turtle = '$0($_, $1)'.fn(d.init).ctor ({line: '@queue.push(new line(@position.clone(), @position.clone().add_scaled (@direction, $0), @pen)), $_'.fn(),
                                                         move: '@line($0).jump($0)'.fn(),
                                                         jump: 'new @constructor(d.init({}, $_, {position:   @position.clone().add_scaled (@direction, $0)}))'.fn(),
                                                         turn: 'new @constructor(d.init({}, $_, {direction:  @direction.about (@complement, $0)}))'.fn(),
                                                         bank: 'new @constructor(d.init({}, $_, {complement: @complement.about (@direction, $0)}))'.fn(),
                                                          pen: 'new @constructor(d.init({}, $_, {pen:        $0}))'.fn(),
                                                        pitch:  function (angle) {var axis = this.direction.cross (this.complement);
                                                                                  return new this.constructor (d.init ({}, this, {complement: this.complement.about (axis, angle),
                                                                                                                                   direction: this.direction. about (axis, angle)}))}}),
                    pen = '$0($_, $1 || {color: "#808080", opacity: 0.5, size: 0.1})'.fn(d.init).ctor (qw('color size opacity').map('$0.maps_to ($0.patching_constructor())').fold(d.init), {
                                                                                                       install: function (context) {context.globalAlpha = this.opacity;
                                                                                                                                    context.strokeStyle = this.color;
                                                                                                                                    context.lineWidth   = this.size}}),
                 turtle = 'new $0(d.init($2 || {}, {position: (0).vector(), direction: (1).y(), complement: (-1).z(), pen: new $1()}))'.fn (rotational_turtle, pen);

// Line rendering.
//   We can render lines onto a canvas by transforming them into the viewspace, depth-sorting, projecting their endpoints (since projection preserves straight edges), and rendering them to the
//   screen. Because Cheloniidae is a high-capacity turtle system, we allow the user to interrupt the rendering process; in JavaScript, this means using continuations separated by timeouts.
//   Delimited continuations won't quite work here because they will be contained (and a timeout or interval requires escape and re-entry). Better is to do explicit queueing.

  var viewport = '$0($_, $1)'.fn(d.init).ctor ({transform: '$0.minus_v(@pov).into (@forward.cross (@up), @up, @forward)'.fn(),
                                                  project: '$0.over_vn($0[2])'.fn(),
                                                    scale: '$0.times_vn (@scale_factor()).plus_d_v ([@width >> 1, @height >> 1, 0])'.fn(),
                                             scale_factor: '@height'.fn(),
                                                   cancel: '@timeout && clearTimeout (@timeout), @timeout = null, $_'.fn(),
                                                   render:  function (offset) {offset || (offset = 0) || this.depth_sort && this.queue.sort_by ('$1.depth($0)'.fn (this.pov));
                                                                               for (var i = offset, l = this.queue.length < offset + this.batch ? this.queue.length : offset + this.batch;
                                                                                    i < l; ++i) this.queue[i].render (this);
                                                                               this.timeout = i < this.queue.length && setTimeout (this.render.bind (this).fn (i), this.delay || 10);
                                                                               return this},
                                                    slide: '@pov.add_scaled (@up, $1).add_scaled (@forward.cross (@up), $0), $_'.fn(),
                                                     zoom: '@pov.add_scaled (@forward, $0)'.fn(),
                                                     turn: '@pov = @pov.about (@up, $0), @forward = @forward.about (@up, $0), $_'.fn(),
                                                    pitch:  function (angle) {var right = this.forward.cross (this.up);
                                                                              this.pov     = this.pov.about     (right, angle);
                                                                              this.forward = this.forward.about (right, angle).normalize ();
                                                                              this.up      = this.up.about      (right, angle).normalize ();
                                                                              return this}});