// SCRIPT.JS
// Cheloniidae Live website
// Joyce Tipping

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ACTION
//

// Make the ajax call
c.ajax ('get', 'database/index.txt', function () { format_example_columns (this.responseText); });

// Set the canvas width and height.
// Note: The canvas width and height must be set as attributes (not css) for Cheloniidae Live to work.
var canvas_width = 700;
var canvas_height = 375;
var canvas = c.get ('canvas').fancy ().add_attr ({ width:canvas_width, height:canvas_height });



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCTION DEFINITIONS
//

// LOAD EXAMPLES:
// Formats our example columns
var format_example_columns = function (text) {
  var data    = text.split ('EOF').trim (),
      cat_map = eval ('(' + data[0] + ')'),    // Object mapping category name to category title
      strings = data.slice (1),                // Array of examples in string format
      tree    = {},                            // An object to hold our example tree
      links   = { standard:[], other:[] };     // An object to hold our example links (built later), split into two arrays -- standard and everything else

  for (var cat in cat_map) {
    // Grab the example strings belonging to this category
    var regex   = new RegExp ('^' + cat + '\/')
        matches = strings.grep (regex);

    // Create an object for our category subtree (to be populated with examples later)
    tree[cat] = {};

    // Push the category title onto the correct list of links (either 'standard' or 'other').
    (cat === 'standard' ? links.standard : links.other).push (c.cr ('h4', { id:cat }, cat_map[cat]));


    // For each example string:
    for (var i = 0, len = matches.length; i < len; i++) {

      // Extract data
      var lines        = matches[i].split (/\n/),
          title_author = lines[1].split (/\|/);

      var name   = lines[0].split (/\//)[1].trim (),
          title  = title_author[0].replace (/^\/\/\s*/, '').trim (),
          author = (title_author[1] ? title_author[1] : '').trim (),
          code   = lines.slice (1).join ('\n');

      // Create and build an example object
      var ex    = tree[cat][name] = {};
      ex.title  = title;
      ex.author = author;
      ex.code   = code;

      // Build a link in the following format:
      // 
      //   <div id='cat-name' onclick='run_script(code)'>
      //     <a href='javascript:void(0)' class='example-title'>title</a>
      //     <span class='example-author'>author</span>
      //   </div>
      //
      var l = c.cr ('div', { id:cat + '-' + name, className:'examples' },
                           ['a',    title,  { href      : '#canvas',
                                              className : 'example-title',
                                              onclick   : run.fn (code) }],
                           ['span', author, { className : 'example-author' }]);
      (cat === 'standard' ? links.standard : links.other).push (l);
    }
  }

  // Separate our links into columns
  //   Standard links go in the first column. All other links are spread evenly over n columns;
  //   Each column is a div with the following format:
  //
  //     <div class='example-columns'>
  //       <div id='cat-name' onclick='run_script(code)'>...</div>
  //       <div id='cat-name' onclick='run_script(code)'>...</div>
  //       <div id='cat-name' onclick='run_script(code)'>...</div>
  //       ...
  //     </div>
  //
  var columns = [];

  // Wrap standard links in a div and push it onto "columns"
  columns.push (c.cr ('div', { className:'example-columns', id:'example-columns-standard' }).append (links.standard));

  // Split other links into n columns, wrap each in a div, and push them onto "columns"
  var n = 3;                                  // Number of columns
      h = Math.ceil (links.other.length / n); // Height of each column
  for (var i = 0; i < n; i++) {
    var content = links.other.slice (i * h, (i + 1) * h);
    columns.push (c.cr ('div', { className:'example-columns' }).append (content));
  }
  var example_section = c.cr (document.getElementById ('example-section')).empty ().append (columns);

  // Preload the sphere example, which is our logo.
  run (tree.standard.sphere.code);
};

// RENDERS CANVAS
// Runs the script and renders the scene.
var run_script = d.rebase (function (s) {
  var c = document.getElementById ('canvas');
  var t = new cheloniidae.mutable_rotational_turtle (cheloniidae.turtle ({pen: new cheloniidae.pen ({color: '#444', opacity: 0.6, size: 1})}));
  var v = new cheloniidae.viewport ({     pov : cheloniidae.vector(0, 0, -canvas_height),
                                      context : c.getContext ('2d'),
                                      forward : cheloniidae.vector(0, 0, 1),
                                           up : cheloniidae.vector (0, 1, 0),
                                        width : canvas_width,
                                       height : canvas_height,
                                        batch : 10,
                                        delay : 0 });

  document.getElementById ('error-area').innerHTML = '';

  try       { eval ('(function() {' + s.toString() + '\n})') ();
              v.cancel().context.clearRect (0, 0, v.width, v.height),
              v.queue = t.queue;
              v.render() }
  catch (e) { document.getElementById ('error-area').innerHTML = e.toString() }

         c.onmousedown = '@x_down = $0.clientX, @y_down = $0.clientY'.bind (c);
  document.onmousemove = e >$> ((c.x_down || c.y_down) && (e.shiftKey ? v.turn ((c.x_down - (c.x_down = e.clientX)).degrees()).pitch (-(c.y_down - (c.y_down = e.clientY)).degrees()) :
                                                            e.ctrlKey ? v.zoom  (c.y_down - (c.y_down = e.clientY)) :
                                                                        v.slide (c.x_down - (c.x_down = e.clientX), c.y_down - (c.y_down = e.clientY)),
                                                           v.context.clearRect (0, 0, v.width, v.height),
                                                           v.cancel ().render (false)));
  document.onmouseup   = e >$> ((c.x_down || c.y_down) && (v.context.clearRect (0, 0, v.width, v.height), v.cancel().render(true)), c.x_down = c.y_down = null);
});


// Wraps run_script. Pastes the code into textarea before calling run_script on it.
var run = function (s) {
  c.get ('code').value = s;
  run_script (s);
};
