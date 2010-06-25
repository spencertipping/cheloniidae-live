// A debugging configuration that annotates Cheloniidae live

d.tracer = console.log.bind (console);
var watcher    = new d.debug.watcher ();
var preprocess = watcher.annotate.bind (watcher);

// Cheloniidae Live is designed to render onto the HTML5 <canvas> element in much the same way that the current Java version uses the AWT to render shapes. Because JavaScript supports nearly
// uniform abstraction, there are far fewer layers of abstraction here than there are in the original. Most of the code originally represented by interfaces is now just encapsulated into
// functions. This impacts turtle commands, predicates, transforms, render actions, and a host of other things that are really just functions.

d.rebase.enable_inline_macro();
var cheloniidae = preprocess (d.rebase (function () {
  var   qw = s >$> s.split(/\s+/), merging_constructor = attributes >$> (attributes * (a >$> '@#{a} = ($1 || {}).#{a} || ($0 || {}).#{a}')).join (',').fn(),
                                  patching_constructor =          k >$> 'new @constructor ($_, {#{k}: $0})'.fn(),
      clip = x >$> (x < 0 ? 0 : x > 1 ? 1 : x),
        v3 = d.vector[3].create;

  d.init (Number.prototype, {degrees: '$_ / 180.0 * Math.PI'.fn()});
  d.init  (Array.prototype,  {repeat: function (n) {var xs = []; for (var i = 0; i < n; ++i) xs.push.apply (xs, this); return xs}});

  return {

// Vector geometry.
//   A basic setup with lines and points based on arrays. Arrays are given destructive and non-destructive componentwise arithmetic operators whose names are the same as the aliased functions
//   defined by Divergence. The vector geometry operators from the original Cheloniidae library are also implemented here.

       vector:  v3,
         line: '@a = $0, @b = $1, @pen = $2'.ctor ({midpoint:     _  >$> (this.a + this.b) * 0.5,
                                                       depth:     v  >$> (v - this.midpoint()).distance(),
                                       adjust_for_positive_z: (a, b) >$> (a[2] <= 0 && b[2] <= 0 ? null : a[2] <= 0 ? [a.towards (b, (1.0 - a[2]) / (b[2] - a[2])), b] :
                                                                                                          b[2] <= 0 ? [a, b.towards (a, (1.0 - b[2]) / (a[2] - b[2]))] : [a, b]),
                                          initialize_context: c >$> (c.save(), c.beginPath(), this.pen.install(c), this),
                                            finalize_context: c >$> (c.stroke(), c.restore(), this),
                                                      render: v >$> ((this, v.context, this.adjust_for_positive_z (v.transform (this.a), v.transform (this.b))) |$>
                                                                     ((t, c, aps) >$> (aps && (aps[0] - aps[1]).distance() > 0.1 &&
                                                                       (c |$> t.initialize_context,
                                                                        c.globalAlpha = 1.0 - clip ((cheloniidae.cylindrical_thickness(aps[0] - aps[1], v.transform (t.midpoint())), c.globalAlpha) |$>
                                                                                                    cheloniidae.light_transmission),
                                                                        c.lineWidth  *= v.scale_factor() / (aps[0][2] + aps[1][2]),
                                                                        v.scale (v.project (aps[0])) |$> (p >$> c.moveTo (p[0], p[1])),
                                                                        v.scale (v.project (aps[1])) |$> (p >$> c.lineTo (p[0], p[1])),
                                                                        c |$> t.finalize_context),
                                                                       this)))}),

// Incidence angle computation and attenuation.
//   The original Cheloniidae source code covers this in more detail, but the idea is that we're using some elementary differential equations to figure out how much light gets attenuated when
//   traveling through a tinted medium at an angle.

      light_transmission: (thickness, opacity) >$> literal (((1.0 - opacity) / Math.exp (-opacity)) * Math.exp (-thickness * opacity)),
        planar_thickness:          (normal, v) >$> normal.distance() * v.distance() / Math.abs (normal % v),
   cylindrical_thickness:            (axis, v) >$> (axis % v |$> (d >$> 1.0 / Math.sqrt (1.0 - d * d / ((axis % axis) * (v % v))))),

// Turtles.
//   A turtle manages a collection of lines. You can also create a bunch of lines and render those, but a turtle maintains state in between. Turtles are immutable, but the lines they draw are
//   stateful. It's perhaps an odd model, but it means that you can grab a turtle state from some time before without losing what you've drawn since. In other words, a turtle represents a
//   position, direction, etc. all at a moment; you get a new turtle after a line is drawn.

       rotational_turtle: merging_constructor(qw('position direction complement pen queue')).ctor ({
                        with_pen: patching_constructor ('pen'),
                       draw_line: distance >$> (this.queue.push (new cheloniidae.line (this.position, this.position + (this.direction * distance), this.pen)), this),
                            move: distance >$> this.draw_line (distance).jump (distance),
                            jump: distance >$> new this.constructor (this, {position:   this.position + (this.direction * distance)}),
                            turn:    angle >$> new this.constructor (this, {direction:  this.direction.about (this.complement, angle.degrees())}),
                            bank:    angle >$> new this.constructor (this, {complement: this.complement.about (this.direction, angle.degrees())}),
                           pitch:    angle >$> ((this, this.direction ^ this.complement) |$>
                                                ((t, axis) >$> new t.constructor (t, {complement: t.complement.about (axis, angle.degrees()),
                                                                                       direction: t.direction.about  (axis, angle.degrees())})))}),

                     pen: qw('color size opacity') |$> (ps >$> merging_constructor(ps).ctor (ps * (p >$> 'with_#{p}'.maps_to (patching_constructor (p))) / d.init, {
                                                                                             install: c >$> (c.globalAlpha = this.opacity, c.strokeStyle = this.color, c.lineWidth = this.size)})),

                  turtle: state >$> new cheloniidae.rotational_turtle ({position: v3(0, 0, 0), direction: v3(0, 1, 0), complement: v3(0, 0, -1),
                                                                        pen: new cheloniidae.pen({opacity: 0.5, color: '#444', size: 0.5}), queue: []}, state || {}),

// Line rendering.
//   We can render lines onto a canvas by transforming them into the viewspace, depth-sorting, projecting their endpoints (since projection preserves straight edges), and rendering them to the
//   screen. Because Cheloniidae is a high-capacity turtle system, we allow the user to interrupt the rendering process; in JavaScript, this means using continuations separated by timeouts.
//   Delimited continuations won't quite work here because they will be contained (and a timeout or interval requires escape and re-entry). Better is to do explicit queueing.

       viewport: '$0($_, $1)'.fn(d.init).ctor ({transform: '($0 - @pov).into (@forward ^ @up, @up, @forward)'.fn(),
                                                  project:  v >$> v / v[2],
                                                    scale:  v >$> v * this.scale_factor() + (v3 (this.width / 2, this.height / 2, 0)),
                                             scale_factor: '@height'.fn(),
                                                   cancel: '@timeout && clearTimeout (@timeout), @timeout = null, $_'.fn(),
                                                   render:  sort >$> (sort && this.queue.sort_by ('$1.depth($0)'.fn (this.pov)), this.intermediate_render (0)),
                                      intermediate_render:  offset >$> (this.queue.slice (offset, offset + this.batch).each ('$1.render($0)'.fn(this)),
                                                                        this.timeout = offset + this.batch < this.queue.length &&
                                                                                       setTimeout (this.intermediate_render.bind (this).fn (offset + this.batch), + this.delay), this),
                                                    slide:  (x, y) >$> (this.pov += (this.forward ^ this.up) * x + this.up * y, this),
                                                     zoom:      z  >$> (this.pov += this.forward * z, this),
                                                     turn:  angle  >$> (this.pov  = this.pov.about (this.up, angle), this.forward = this.forward.about (this.up, angle), this),
                                                    pitch:  angle  >$> ((this.forward ^ this.up) |$> (right >$> (this.pov     = this.pov.about     (right, angle),
                                                                                                                 this.forward = this.forward.about (right, angle).unit(),
                                                                                                                 this.up      = this.up.about      (right, angle).unit(), this)).bind (this))})}})) ();
