// Divergence vector geometry module | Spencer Tipping <spencer@spencertipping.com>
// Licensed under the terms of the MIT source code license

d.rebase (function () {
  var range = n >$> (n > 0 ? range(n - 1) << n - 1 : []);

  var     reduction = (left, right, join, op, n) >$> (left + (range(n) * (i >$> '@xs[#{i}] #{op} $0.xs[#{i}]')).join(join) + right).fn(),
      componentwise = reduction.fn ('new @constructor ([', '])', ','),
           distance = _ >$> Math.sqrt (this % this),
                dot = reduction.fn ('', '', '+', '*'),
            initial = n >$> '[' + (range(n) * (_ >$> 0)).join (',') + ']',
               four = n >$> '+-*/'.split('') * (op >$> op.maps_to (componentwise (op, n))) / d.init;

  d.vector = range(6) * (n >$> d.init ('@xs = $0 || #{initial(n)}'.ctor (four (n), {'%': dot (n), distance: distance, toString: _ >$> '<#{this.xs.join(", ")}>'}),
                                       {create: 'new d.vector[#{n}] (@_)'.fn()}))}) ();