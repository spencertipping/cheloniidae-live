// Cheloniidae Live | Spencer Tipping <spencer@spencertipping.com>
// Licensed under the terms of the MIT source code license

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
                                                                               else if         (a[2] <= 0) {var f = (1.0 - a[2]) / (b[2] - a[2]); return a.times_d_vn (1.0 - f).add_scaled (b, f)}
                                                                               else if         (b[2] <= 0) {var f = (1.0 - b[2]) / (a[2] - b[2]); return b.times_d_vn (1.0 - f).add_scaled (a, f)}
                                                                               else                        return true},
                                                      render: function (v) {var c = v.context, ta = v.transform (this.a), tb = v.transform (this.b);
                                                                            if (this.adjust_for_positive_z (ta, tb)) {
                                                                              c.save(); c.beginPath(); this.pen.install (c);
                                                                              var alpha = 1.0 - light_transmission (cylindrical_thickness (ta.minus_v (tb), v.transform (this.midpoint ())),
                                                                                                                    c.globalAlpha);
                                                                              c.globalAlpha = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
                                                                              c.lineWidth *= 2.0 * v.scale_factor() / (ta[2] + tb[2]);
                                                                              c.moveTo.apply (c, v.scale (v.project (ta)));
                                                                              c.lineTo.apply (c, v.scale (v.project (tb)));
                                                                              c.stroke(); c.restore()}
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
                    pen = '$0($_, $1 || {color: "#808080", opacity: 0.5, size: 0.5})'.fn(d.init).ctor (qw('color size opacity').map('$0.maps_to ($0.patching_constructor())').fold(d.init), {
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
                                                   render:  function   (sort) {sort && this.queue.sort_by ('$1.depth($0)'.fn (this.pov)); return this.intermediate_render (0)},
                                      intermediate_render:  function (offset) {for (var i = offset, l = this.queue.length < offset + this.batch ? this.queue.length : offset + this.batch;
                                                                                    i < l; ++i) this.queue[i].render (this);
                                                                               this.timeout = i < this.queue.length && setTimeout (this.intermediate_render.bind (this).fn (i), this.delay || 10);
                                                                               return this},
                                                    slide: '@pov.add_scaled (@up, $1).add_scaled (@forward.cross (@up), $0), $_'.fn(),
                                                     zoom: '@pov.add_scaled (@forward, $0)'.fn(),
                                                     turn: '@pov = @pov.about (@up, $0), @forward = @forward.about (@up, $0), $_'.fn(),
                                                    pitch:  function (angle) {var right = this.forward.cross (this.up);
                                                                              this.pov     = this.pov.about     (right, angle);
                                                                              this.forward = this.forward.about (right, angle).normalize ();
                                                                              this.up      = this.up.about      (right, angle).normalize ();
                                                                              return this}});