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

// Divergence Rebase module | Spencer Tipping <spencer@spencertipping.com>
// Licensed under the terms of the MIT source code license

// Rebase is a Divergence module that takes operator invocations inside functions and rewrites them to be method invocations. Naturally, new meaning can be associated with these constructs; this
// is done by writing methods for them. For example, invocation of the '+' operator is translated into a call to the 'plus' method. Operator precedence is respected and follows the normal
// JavaScript rules.

// Certain constructs cannot be changed. These include assignment variants such as '+='; such variants are always expanded to their full forms (e.g. a += b becomes a = a + b, which becomes a =
// a['+'](b)). Others include the behavior of 'new', dot-lookups, indexed lookups, function calls, and statement-mode constructs such as 'if', 'for', etc. You can write macros that transform
// these things, but they will have strange limitations and might not behave as expected.

// Since JavaScript is dynamically typed, it isn't possible to know in advance whether an operator overloading replacement will impact a primitive value. This is one reason for the limitations
// described above. The other thing to realize is that those operators need to get replaced for standard things too -- so Number.prototype, String.prototype, and anything else that depends on
// standard operators will have a bunch of replacement functions that delegate to those operators.

// One more thing of importance. Some identifiers are treated specially and sandwiched between operators to form longer operators. They're defined in d.rebase.sandwiches. If an identifier appears
// as a key there (e.g. 'foo'), then it will be sandwiched between binary operators, resulting in the translation of things like 'a + foo + b' as 'a['+foo+'](b)'. This means that you can't use
// 'foo' normally anymore, so use this feature carefully.

(function () {
  var set            = '.fold({< $0[$1] = true, $0 >}, {})'.fn(),            last = '$0[$0.length - 1]'.fn(),  qw = '.split(/\\s+/)'.fn(),
        r = d.rebase =   function () {return r.init.apply (this, arguments)},   $ = null,                       s = '$0 === undefined ? "" : $0.toString()'.fn();

  d.functions (d.map (d.operators.binary.operators, function (k, v) {return v.maps_to (d.aliases[k + '_'])}));

  d.init (r, {precedence: {'function':1, '[!':1, '.':1, '(!':1, 'new':2, 'u++':3, 'u--':3, 'typeof':3, 'u~':3, 'u!':3, 'u+':3, 'u-':3, '*':4, '/':4, '%':4, '+':5, '-':5, '<<':6,
                           '>>':6, '>>>':6, '<':7, '>':7, '<=':7, '>=':7, 'instanceof':7, 'in':7, '==':8, '!=':8, '===':8, '!==':8, '&':9, '^':10, '|':11, '&&':12, '||':13, '?':14, '=':15,
                           '+=':15, '-=':15, '*=':15, '/=':15, '%=':15, '&=':15, '|=':15, '^=':15, '<<=':15, '>>=':15, '>>>=':15, 'case':16, ':':17, ',':18, 'var':19, 'if':19, 'while':19,
                           'for':19, 'do':19, 'switch':19, 'return':19, 'throw':19, 'delete':19, 'export':19, 'import':19, 'try':19, 'catch':19, 'finally':19, 'void':19, 'with':19, 'else':19,
                           '?:':20, ';':21, '{':22, '(':22, '[':22},

                   unary: set(qw('u++ u-- u+ u- u! u~ new typeof var case try finally throw return case else delete void import export ( [ { ?:')),
                   ident: set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$_'.split ('')),                  punct: set('+-*/%&|^!~=<>?:;.,'.split ('')),
                   right: set(qw('= += -= *= /= %= &= ^= |= <<= >>= >>>= u~ u! new typeof u+ u- u++ u--')),                  openers: {'(':')', '[':']', '{':'}', '?':':'},
              sandwiches: set(qw('$ $$ $$$ _ __ ___ _$ _$$ __$')),                                                      sandwich_ops: set(qw('+ - * / % ^ | & << >> >>> < >')),
           prefix_binary: set(qw('if function catch for switch with')),                                                      closers: {')':'(', ']':'[', '}':'{', ':':'?:'},
            translations: {'u+':'+', 'u-':'-', 'u~':'~', 'u!':'!', 'u--':'--', 'u++':'++'},                                 arity_of: '$0.unary[$1] ? 1 : $1 === "?" ? 3 : 2'.fn(r),
           lvalue_assign: set(qw('+= -= *= /= %= ^= |= &= <<= >>= >>>=')),                                                   literal: set(qw('u-- u++ = (! [! . , ? ( [ === !== ; : && ||')),
          should_convert: '! ($0.literal[$1] || $0.unary[$1] || $0.prefix_binary[$1])'.fn(r),
                  macros: ['$1 && $0.lvalue_assign[$1.op] ? $0.syntax(null, "=", [$1.xs[0], $0.syntax(null, $1.op.substring(0, $1.op.length - 1), $1.xs)]) : $1'.fn(r),
                            function (e) {return r.sandwich_ops[e.op] ?
                              e.xs[1] && e.xs[1].op && r.sandwich_ops[e.xs[1].op] && r.sandwiches[e.xs[1].xs[0]] ? r.syntax(e.parent, e.op + e.xs[1].xs[0] + e.xs[1].op, [e.xs[0], e.xs[1].xs[1]]) :
                              e.xs[0] && e.xs[0].op && r.sandwich_ops[e.xs[0].op] && r.sandwiches[e.xs[0].xs[1]] ? r.syntax(e.parent, e.xs[0].op + e.xs[0].xs[1] + e.op, [e.xs[0].xs[0], e.xs[1]]) :
                              e : e},
                            function (e) {return e.op === '>$>' ?
                              r.syntax(e.parent, 'function').with_node (e.xs[0].op === '(' ? e.xs[0] : r.syntax (null, '(', [e.xs[0]])).
                                                             with_node (r.syntax (null, '{').with_node (r.syntax (null, 'return').with_node (e.xs[1]))) :                              
                              e},
                            function (e) {return r.should_convert (e.op) ?
                              r.syntax(e.parent, "(!").with_node(r.syntax(null, "[!", [e.xs[0], '["' + e.op + '"]'])).with_node(r.syntax(null, '(', [e.xs[1]])) :
                              e}],
                    init: '$0.deparse($0.transform($0.parse($1.toString())))'.fn(r),

//   Deparsing.
//   This is certainly the easiest part. All we have to do is follow some straightforward rules about how operators and such get serialized. Luckily this is all encapsulated into the toString
//   logic of the syntax tree.

                 deparse: 'eval($0.toString())'.fn(),

//   Tree transformation.
//   The goal here is to transform the tree in logical form before serializing it to a final function. The way I've chosen to go about this is to use a macro table and deep-map over the syntax
//   tree. Each node gets inspected, and mapping functions can modify nodes by returning alternative values. To save space and time, I'm having macros replace structures destructively rather than
//   using a functional approach.

               transform: function (t) {var mapped = r.macros.fold ('$1($0)', t); mapped && mapped.xs && (mapped.xs = mapped.xs.map ('$1 && $1.op ? $0($1) : $1'.fn (r.transform))); return mapped},

//   Incremental parsing.
//   As tokens are read from the lexer they are written into a parse tree. Unlike a traditional grammar with productions, this parse tree works in terms of operators and values. Each element in
//   the text is considered to have a certain precedence and to comprise part of an expression. This leads to a weird model and a much more general grammar than JavaScript's, but this is
//   acceptable because we know that by the time we see the code it will be valid. The only problem is when we have nonlocal precedence alteration; one example of this is the 'in' keyword --
//   consider these two for loops:

//     | for (var i in foo = bar) {...}
//     | for (var i = 'some-key' in some_hash; ...) {...}

//   Despite being a pathological example, it demonstrates the nonlocality of the JavaScript grammar. We can't disambiguate these forms until we hit either '=' or 'in'. Once we do hit those
//   operators, the leftmost one has a precedence nearly as low as ';', since otherwise we would risk violating the lvalue. Unfortunately, cases like these require some context to parse
//   efficiently. However, rather than backtracking we can reflect the incremental refinement that we see when reading through the code; that is, upon looking at the 'for' we don't know which
//   type of for loop it is; but as we read more code we will find out. As long as we start with a general case and lazily refine, the parsing algorithm can remain O(n).

//   However, all this being said, my only goal here is to build an accurate operator-precedence structure. So we can ignore any nuances of the structure that make things difficult; in this case,
//   the minimal-effort solution is to replace the first 'in' in a for-loop with a sentinel that takes very low precedence. ('=' isn't a problem, since its precedence is already suitably low and
//   we don't override it in any case.)

//   The mechanics of this parser are fairly simple. We build a tree incrementally and include explicit nodes for parentheses (the role of these nodes will become apparent). Starting with the
//   root node, which has no particular identity, we add expressions and operators to this tree. The rules for this are:

//     | 1. When we add an expression to a tree, it is just added to the operand list. This will throw an error if there are too many operands.
//     | 2. When we add an operator to a tree, we check the precedence. If the new operator binds first, then it is added as a child, given a value, and returned. Otherwise we add it to the
//          parent.

                  syntax: '@parent = $0, @op = $1, @xs = $2 || [], $_'.type ({
                           is_value: '@xs.length >= $0.arity_of(@op)'.fn(r),
                         push_value: '! @is_value() ? (@xs.push($0), $0) : ("The token " + $0 + " is one too many for the tree " + @toString() + ".").fail()'.fn(),
                          with_node: '$0 && ($0.parent = $_), @push_value($0), $_'.fn(),
                            push_op: '$0.precedence[$1] - !! $0.right[$1] < $0.precedence[@op] ? @graft($1) : @hand_to_parent($1)'.fn(r),
                              graft: '@push_value(@is_value() ? $0.syntax($_, $1).with_node(@xs.pop()) : $0.syntax($_, $1))'.fn(r),
                     hand_to_parent: '@parent ? @parent.push_op($0) : "Syntax trees should have a minimal-precedence container".fail()'.fn(),
                                top: '@parent ? @parent.top() : $_'.fn(),
                           toString:  function () {return '([{'.indexOf(this.op) > -1 ? this.op + s(this.xs[0]) + r.openers[this.op] :
                                                                      this.op === '?' ? s(this.xs[0]) + ' ? ' + s(this.xs[1].xs[0]) + ' : ' + s(this.xs[2]) :
                                                 this.op === '(!' || this.op === '[!' ? s(this.xs[0]) + s(this.xs[1]) :
                                                                     r.unary[this.op] ? (r.translations[this.op] || this.op) + ' ' + s(this.xs[0]) :
                                                             r.prefix_binary[this.op] ? this.op + ' ' + s(this.xs[0]) + ' ' + s(this.xs[1]) :
                                                                                        s(this.xs[0]) + ' ' + this.op + ' ' + s(this.xs[1])}}),

//   Lexing.
//   The lexer is for the most part straightforward. The only tricky bit is regular expression parsing, which requires the lexer to contextualize operators and operands. I've implemented this
//   logic with a expect_re flag that indicates whether the last token processed was an operator (if so, then we're expecting an operand and the next / delineates a regular expression).

                   parse: function (s) {var i = 0, $_, l = s.length, token = '', expect_re = true, escaped = false, t = r.syntax(null, '('), c = s.charAt.bind (s), openers = [];
                          while (i < l && ($_ = c(i))) {
          escaped = token = '';
               if                                (/\s/.test ($_))                                                                        ++i;
          else if                  ('([{?:}])'.indexOf ($_) > -1)                                                                        expect_re = '([{?:'.indexOf (token = $_) > -1, ++i;
          else if    ($_ === '/' && c(i + 1) === '*' && (i += 2))  while                  (c(++i) !== '/' || c(i - 1) !== '*' || ! ++i);
          else if                ($_ === '/' && c(i + 1) === '/')  while                        (($_ = c(++i)) !== '\n' && $_ !== '\r');
          else if ($_ === '/' &&    expect_re &&  (token = '/'))  {while          (($_ = c(++i)) !== '/' || escaped || ! (token += $_))  expect_re = ! (token += $_), escaped = ! escaped && $_ === '\\';
                                                                   while                                         (r.ident[$_ = c(++i)])  token += $_}
          else if ($_ === '"' && ! (expect_re = ! (token = '"')))  while (($_ = c(++i)) !== '"' || escaped || ! ++i || ! (token += $_))  token += $_, escaped = ! escaped && $_ === '\\';
          else if ($_ === "'" && ! (expect_re = ! (token = "'")))  while (($_ = c(++i)) !== "'" || escaped || ! ++i || ! (token += $_))  token += $_, escaped = ! escaped && $_ === '\\';
          else if     (expect_re && r.punct[$_] && (token = 'u'))  while               (r.punct[$_ = c(i)] && r.precedence[token + $_])  token += $_, ++i;
          else if                                   (r.punct[$_])  while               (r.punct[$_ = c(i)] && r.precedence[token + $_])  expect_re = !! (token += $_), ++i;
          else                                                     while                                           (r.ident[$_ = c(i)])  expect_re = !! r.precedence[token += $_], ++i;

          if (! token) continue;

               if       (t.is_value() && '[('.indexOf (token) > -1)                       t = t.push_op (token + '!').graft (token), openers.push (token);
          else if (($_ = r.closers[token]) && last(openers) === $_) {while (t.op !== $_)  t = t.parent; openers.pop(), t = t.parent}
          else if                                   (token === '?')                       t = t.push_op (token).graft ('?:'), openers.push ('?:');
          else if                                (r.openers[token])                       t = t.graft (token), openers.push (token);
          else if                             (r.precedence[token])                       t = t.push_op (token);
          else                                                                            t.push_value (token);
                          }
                          return t.top()}})}) ();

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