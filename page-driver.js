d.rebase (function () {
  var e = document.getElementById ('examples');
  var examples = {square: 'r4i {m100 t90}', circle: 'r360i {m1 t1}', spiral: 'r120i {\nmove(i);t60}', dome: 'p60 r120i {\nmove(i);t60 p-2}',
                   torus: 'r40i {p90 j100 r30j {m12 p12} j-100 p-90 t90 j5 t-90 b9}', squares: 'r100i {m100 t89 p2}', sphere: 'p60 r20i {p4.5 r40j {m10 p9} p-4.5 t9}',
               corkscrew: 'p-30 r50i {b5 r2j {m10 t90 m100 t90} j10}', original: 'j-80 r100i {m160 t161 p1}'};

  d.keys (examples) * (k >$> (
    (document.createElement ('li'), document.createElement ('a'), document.createTextNode (k)) |$> ((li, a, t) >$> (
      e.appendChild (li), li.appendChild (a), a.appendChild (t), a.href = '#', a.onclick = (_ >$> (
        document.getElementById ('commands').value = examples[k].replace (/r(\d+)(\w+)/g, (_, n, i) >$> '\nfor (var #{i} = 0; #{i} < #{n}; ++#{i})').
                                                                 replace (/m([\d-\.]+)/g, (_, n)    >$> '\nmove(#{n});').
                                                                 replace (/j([\d-\.]+)/g, (_, n)    >$> '\njump(#{n});').
                                                                 replace (/t([\d-\.]+)/g, (_, n)    >$> '\nturn(#{n});').
                                                                 replace (/b([\d-\.]+)/g, (_, n)    >$> '\nbank(#{n});').
                                                                 replace (/p([\d-\.]+)/g, (_, n)    >$> '\npitch(#{n});').
                                                                 replace (/}/g, '\n}'), false))))))}) ();

var run_script = d.rebase (function (s) {
  var c = document.getElementById ('screen');
  var t = cheloniidae.turtle ({pen: new cheloniidae.pen ({color: '#444', opacity: 0.6, size: 1})});
  var v = new cheloniidae.viewport ({pov: cheloniidae.vector(0, 0, -350), context: c.getContext ('2d'), forward: cheloniidae.vector(0, 0, 1), up: cheloniidae.vector (0, 1, 0),
                                     width: 600, height: 350, batch: 10, delay: 0});
  var commands = [];

  var move = d >$> commands << (t >$> t.move (d)),
      jump = d >$> commands << (t >$> t.jump (d)),
      turn = a >$> commands << (t >$> t.turn (a.degrees())),
      bank = a >$> commands << (t >$> t.bank (a.degrees())),
     pitch = a >$> commands << (t >$> t.pitch(a.degrees()));

  document.getElementById ('error-area').innerHTML = '';

  try       {eval ('(function() {' + s.toString() + '})') ();
             t = commands.fold ('$1($0)', t);
             v.context.clearRect (0, 0, v.width, v.height),
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
