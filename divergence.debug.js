// Divergence debug module | Spencer Tipping <spencer@spencertipping.com>
// Licensed under the terms of the MIT source code license

// This debug module enables expression-level debugging and tracing for functions. It records history (controlled by history-recording commands) and lets you replay sequences of events or
// systematically search through them. Note that this can be arbitrarily memory-intensive; recording every single expression that goes through a system is an expensive way to debug things. To
// compensate, there are calls you can make to start and stop tracing as your program is running. You can also set triggers depending on program values and use a sliding window.

// The idea here is that a program evaluates expressions to achieve things. If we have a record of those evaluations, we can mostly reconstruct what the program was doing.

d.rebase (function () {
  var t = d.debug = _ >$> d.debug.init (this, arguments), global = this, syn = x >$> new d.rebase.syntax(null, x),
    set = xs >$> xs * '$0.maps_to(true)'.fn() / d.init, qw = s >$> s.split(/\s+/), qs = set.compose(qw);

  d.functions ({traced: function (options) {var f = this.fn(), options = options || {}, tracer = options.tracer || d.trace, name = options.name || 'anonymous', count = 0;
                                            return d.init (function () {var c = ++count;
                                                                        tracer ('#{name} (#{c}) called on #{this} with [#{Array.prototype.slice.call (arguments).join (", ")}]');
                                                                        try       {var result = f.apply (this, arguments); tracer ('#{name} (#{c}) returned #{result}'); return result}
                                                                        catch (e) {tracer ('#{name} (#{c}) threw #{e}'); throw e}},
                                                           {original: f})}});

  d.init (t, {ring_buffer: '@size = $0, @elements = $1 || [], @position = -1'.fn().ctor ({'<<': '@elements[@position = @position + 1 % @size] = $0, $_'.fn(),
                                                                                    'to_array': '@elements.slice(@position + 1).concat (@elements.slice(0, @position + 1))'.fn()}),
                 reserved:  qs('break continue default'),   first_only: qs('.'),
                     stop:  qs('++ -- u++ u-- new'),       second_only: qs('function catch = : += -= *= /= %= ^= |= &= <<= >>= >>>= in'),
                     skip:  qs('{ ( [ , ; ?: case var if while for do switch return throw delete export import try catch finally void with else'),
        protected_resolve:  qs('[! .'),

                    event: '@node = $0, @value = $1, @time = new Date()'.ctor ({toString: _ >$> '(#{this.node}) = (#{this.value}) at #{this.time.getTime()}'}),

                  watcher: '@name = d.gensym("hook"), @events = new $0.ring_buffer($1 && $1.log_size || 10000), @predicate = $1 && $1.predicate || (0).fn()'.fn(t).ctor ({
                                   use_logging: _ >$> (global[this.name] = this.hook_function (this.log.bind   (this))),
                                   use_tracing: p >$> (this.predicate = p || this.predicate, global[this.name] = this.hook_function (this.trace.bind (this))),
                            remove_global_hook: function () {delete global[this.name]; this.installed_hook = null; return this},

                                 hook_function: destination >$> ((index, value) >$> (destination (new t.event (this.trace_points[index], value)), value)).bind (this),

                                 annotate_tree: function (v) {global[this.name] || (this.installed_hook = this.use_logging());
                                                              var $_ = this,  trace_points = this.trace_points = this.trace_points || [],
                                                                             annotate_node = (s, v) >$> syn('(!') << $_.name << (syn('(') << (syn(',') << (trace_points.push(s) - 1) << v)),
                                                                         annotate_children =     v  >$> (v.xs ? (v.xs * annotate_tree).fold ((x, y) >$> x << y, syn(v.op)) : v),
                                                                             annotate_tree =     v  >$> (! v || t.reserved[v] ? v :
                                                                                                                 t.stop[v.op] ? annotate_node(v, v) :
                                                                                                                 t.skip[v.op] ? annotate_children(v) :
                                                                                                           t.first_only[v.op] ? syn(v.op) << annotate_tree(v.xs[0]) << v.xs[1] :
                                                                                                          t.second_only[v.op] ? syn(v.op) << v.xs[0] << annotate_tree(v.xs[1]) :
                                                                   v.op == '(!' && v.xs[0] && t.protected_resolve[v.xs[0].op] ? annotate_node (v,
                                                                                                                                  syn(v.op) << (syn(v.xs[0].op) << annotate_tree(v.xs[0].xs[0]) <<
                                                                                                                                                                   v.xs[0].xs[1]) <<
                                                                                                                                               annotate_tree (v.xs[1])) :
                                                                                                                       ! v.xs ? /^@?[A-Za-z_$][A-Za-z0-9_$]*$/.test(v) ? annotate_node(v, v) : v :
                                                                                                                                annotate_node (v, annotate_children (v)));
                                                              return annotate_tree (v)},

                                      annotate: f >$> d.rebase.deparse (this.annotate_local (f)),
                                annotate_local: f >$> this.annotate_tree (d.rebase.parse (f)).toString(),

                                         trace: e >$> (this.predicate(e) && d.trace(e)),
                                           log: e >$> (e ? this.events << e : this.events.to_array())})})}) ();