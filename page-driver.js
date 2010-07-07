d.rebase (function () {
  var e = document.getElementById ('examples');
  var examples = {square: 'r4i {m100 t90}', circle: 'r360i {m1 t1}', spiral: 'r120i {\nmove(i);t60}', dome: 'p60 r120i {\nmove(i);t60 p-2}',
                   torus: 'r40i {p90 j100 r30j {m12 p12} j-100 p-90 t90 j5 t-90 b9}', squares: 'r100i {m100 t89 p2}', sphere: 'p60 r20i {p4.5 r40j {m10 p9} p-4.5 t9}',
               corkscrew: 'p-30 r50i {b5 r2j {m10 t90 m100 t90} j10}', original: 'j-80 r100i {m160 t161 p1}',
               
                   'Ultimate Corkscrew (contributed by mastermind)': 'j-200 p-45 r1300i {b2 r4j {m-30 t90 m100 t90} j1}',
                           'Circular Braid (contributed by JamesM)': 'p60 r15i {p4.5 r35j {m10 p9} p-4.5 t9}',
                   'Five-pointed Spiral Vortex (contributed by JP)': 'j-170 p-30 r500i {b3 r2j {m3 t48 m50 t97} j1}',
                                   'Donut (contributed by niko TM)': 'p30 r45j {r360i {m1 t1} t8 j2}',
                                   
                'Odd-looking Tree (power-user mode)': '// Power-user mode\n' +
                                                      'var tree = function (t, distance, recursion_level) {\n' +
                                                      '  if (recursion_level > 0)\n' +
                                                      '    for (var i = 0; i < 3; ++i)\n' +
                                                      '      tree (t.pitch (Math.random() * 60 - 30).bank (Math.random() * 180).\n' +
                                                      '              move (distance * (Math.random() * 0.2 + 0.8)),\n' +
                                                      '            distance * (Math.random() * 0.5 + 0.4),\n' +
                                                      '            recursion_level - 1);\n' +
                                                      '  else t.move (distance * Math.random());\n' +
                                                      '};\n' +
                                                      'tree (t.with_pen (t.pen.with_color (\'#797\')).turn(180).jump(-100), 100, 6);',
                                                      
                'Weird Spiral Ladder Thing (power-user mode, contributed by Invisible Bob)': '// Power-user mode\n' +
                                                                                             'for (var i = 0; i < 1000; i++) {\n' +
                                                                                             '  t = t.move (10);\n' +
                                                                                             '  t = t.pitch (i);\n' +
                                                                                             '  t = t.turn (i);\n' +
                                                                                             '}',
                                                                                             
                    'Star (power-user mode, contributed by Ümit Coşkun Aydınoğlu': '// Power-user mode\n' +
                                                                                   'for (var i = 0; i < 300; i++) {\n' +
                                                                                   '  t = t.move (i);\n\n' +
                                                                                   '  t = t.turn (100);\n' +
                                                                                   '}'};

  d.keys (examples) * (k >$> (
    (document.createElement ('li'), document.createElement ('a'), document.createTextNode (k)) |$> ((li, a, t) >$> (
      e.appendChild (li), li.appendChild (a), a.appendChild (t), a.href = '#', a.onclick = (_ >$> (
        run_script (document.getElementById ('commands').value = examples[k].indexOf ('// Power-user mode') === 0 ? examples[k] :
                                                                 examples[k].replace (/r(\d+)(\w+)/g,     (_, n, i) >$> '\nfor (var #{i} = 0; #{i} < #{n}; ++#{i})').
                                                                             replace (/m(-?\d[\d-\.]*)/g, (_, n)    >$> '\nmove(#{n});').
                                                                             replace (/j(-?\d[\d-\.]*)/g, (_, n)    >$> '\njump(#{n});').
                                                                             replace (/t(-?\d[\d-\.]*)/g, (_, n)    >$> '\nturn(#{n});').
                                                                             replace (/b(-?\d[\d-\.]*)/g, (_, n)    >$> '\nbank(#{n});').
                                                                             replace (/p(-?\d[\d-\.]*)/g, (_, n)    >$> '\npitch(#{n});').
                                                                             replace (/}/g, '\n}')),
        false))))))}) ();

var run_script = d.rebase (function (s) {
  var c = document.getElementById ('screen');
  var t = cheloniidae.turtle ({pen: new cheloniidae.pen ({color: '#444', opacity: 0.6, size: 1})});
  var v = new cheloniidae.viewport ({pov: cheloniidae.vector(0, 0, -350), context: c.getContext ('2d'), forward: cheloniidae.vector(0, 0, 1), up: cheloniidae.vector (0, 1, 0),
                                     width: 600, height: 350, batch: 10, delay: 0});

  var move = d >$> (t = t.move (d)),
      jump = d >$> (t = t.jump (d)),
      turn = a >$> (t = t.turn (a)),
      bank = a >$> (t = t.bank (a)),
     pitch = a >$> (t = t.pitch(a));

  document.getElementById ('error-area').innerHTML = '';

  try       {eval ('(function() {' + s.toString() + '})') ();
             v.cancel().context.clearRect (0, 0, v.width, v.height),
             v.queue = t.queue;
             v.render()}
  catch (e) {document.getElementById ('error-area').innerHTML = e.toString()}

         c.onmousedown = '@x_down = $0.clientX, @y_down = $0.clientY'.bind (c);
  document.onmousemove = e >$> ((c.x_down || c.y_down) && (e.shiftKey ? v.turn ((c.x_down - (c.x_down = e.clientX)).degrees()).pitch (-(c.y_down - (c.y_down = e.clientY)).degrees()) :
                                                            e.ctrlKey ? v.zoom  (c.y_down - (c.y_down = e.clientY)) :
                                                                        v.slide (c.x_down - (c.x_down = e.clientX), c.y_down - (c.y_down = e.clientY)),
                                                           v.context.clearRect (0, 0, v.width, v.height),
                                                           v.cancel ().render (false)));
  document.onmouseup   = e >$> ((c.x_down || c.y_down) && (v.context.clearRect (0, 0, v.width, v.height), v.cancel().render(true)), c.x_down = c.y_down = null);
});
