// Utilities
//   Helpful utilities for javascript development.
//
// Joyce Tipping
// Date: 12 Jul 2010
// Version: 0.0.1

var c = {};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Useful Functions
//

// Trim
//   Useful functions for trimming whitespace.

String.prototype.trim  = function () { return this.replace (/^\s+|\s+$/g, '').valueOf (); };
String.prototype.ltrim = function () { return this.replace (/^\s+/g, '').valueOf (); };
String.prototype.rtrim = function () { return this.replace (/\s+$/g, '').valueOf (); };

Array.prototype.trim  = function () { var trimmed = []; 
                                      for (var i = 0, len = this.length; i < len; i++) 
                                        trimmed[i] = this[i] && this[i].constructor === String ? this[i].trim () : this[i];
                                      return trimmed; };
Array.prototype.ltrim = function () { var trimmed = []; 
                                      for (var i = 0, len = this.length; i < len; i++) 
                                        trimmed[i] = this[i] && this[i].constructor === String ? this[i].ltrim () : this[i];
                                      return trimmed; };
Array.prototype.rtrim = function () { var trimmed = []; 
                                      for (var i = 0, len = this.length; i < len; i++) 
                                        trimmed[i] = this[i] instanceof String ? this[i].rtrim () : this[i];
                                      return trimmed; };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// DOM Maniuplation
//

// New (nw)
//   A shortcut for document.createElement:
// c.nw = function (type) { return document.createElement (type); };
c.nw = function (type) { var result = document.createElement (type);
                         result.fancy = function () { return c.cr (result); };
                         return result; };


// Get
//   A shortcut for document.getElementById, with the option to promote into a 'fancy' :
// c.get = function (id) { var resreturn document.getElementById (id); };
c.get = function (id) { var result = document.getElementById (id);
                        result.fancy = function () { return c.cr (result); };
                        return result; };


// Create (cr)
//   The first argument is either 
//     a string specifying a type (in which case it creates a new DOM element) or
//     an existing dom element    (in which case it simply uses the existing element).
//
//   It also takes any number of the following: 
//     object containing attributes:        { name:'name', type:'text' }
//     string:                              'Hello World'
//     array specifying a child element     ['div', { id:'foo', class:'bar' }, 'Hello World']
//     DOM node to be appended              my_div
//     initializer functions:               function () { this.add_text ('Hello World');
//                                                        var my_div = this.cr ('div');
//                                                        this.append (my_div);         }
//  
//   It adds several useful methods:
//     attributes                           add_attr
//     classes                              add_class, set_class
//     css                                  clear_css, add_css, set_css
//     text                                 add_text
//     adding children                      append, prepend, cr
//     misc                                 empty, html

c.cr = function (arg) {
  // If it's an existing dom element, make it "fancy". If not, create it as usual.
  var result = arg instanceof HTMLElement ? arg : c.nw (arg);
  if (! result) { throw new Error ('Error!!'); };

  // METHODS:
  //
  // Attributes
  result.add_attr  = function (arg) {      if (arg.constructor === Object) for (var k in arg) result[k] = arg[k];
                                      else if (arg.constructor === String) result.setAttribute (arg, arguments[1]);
                                      return result; };

  // Classes
  result.set_class = function () { result.className = Array.prototype.slice.call (arguments).join (' '); return result; };
  result.add_class = function () { result.className += ' ' + Array.prototype.slice.call (arguments).join (' '); return result; };

  // CSS
  result.clear_css = function ()    { result.setAttribute ('style', ''); return result; };
  result.add_css   = function (arg) {      if (arg.constructor === Object) for (var k in arg) result.style[k] = arg[k];
                                      else if (arg.constructor === String) result.setAttribute ('style', result.getAttribute ('style') + ';' + arg);
                                      return result; };
  result.set_css   = function (arg) { result.clear_css (); 
                                           if (arg.constructor === Object) result.add_css (arg);
                                      else if (arg.constructor === String) result.setAttribute ('style', arg);
                                      return result; };

  // Text
  result.add_text  = function (str) { result.append (document.createTextNode (str)); return result; };

  // Adding children
  result.cr        = function () { return result.append (c.cr.apply (result, arguments)); };
  result.append    = function () { for (var i = 0, len = arguments.length; i < len; i++) {
                                          if (arguments[i].constructor === Array) result.append.apply (result, arguments[i])
                                     else if (arguments[i] instanceof Node)       result.appendChild (arguments[i]); }
                                   return result; };
  result.prepend   = function () { for (var i = 0, len = arguments.length; i < len; i++) {
                                          if (arguments[i].constructor === Array) result.prepend.apply (result, arguments[i])
                                     else if (arguments[i] instanceof Node)       result.insertBefore (arguments[i], result.firstChild); }
                                   return result; };

  // Miscellaneous
  result.empty     = function ()    { result.innerHTML = ''; return result; };
  result.html      = function (str) { result.innerHTML = str; return result; };


  // Process command line arguments.
  for (var i = 1, len = arguments.length; i < len; i++) {
    var arg = arguments[i];
         if (arg.constructor === Object)   result.add_attr (arg);
    else if (arg.constructor === String)   result.add_text (arg);
    else if (arg.constructor === Array)    result.cr.apply (result, arg);
    else if (arg instanceof Node)          result.append (arg);
    else if (arg.constructor === Function) arg.call (result);
  }

  return result;
};



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Ajax
//   A library for dealing with ajax requests.

c.ajax = function (type, url, handler) {

  // Try to initialize the XHR, first with XMLHttpRequest, and then with various versions of ActiveXObject.
  var request = window.XMLHttpRequest ? new XMLHttpRequest ()
                                      : new ActiveXObject ('Msxml2.XMLHTTP') || new ActiveXObject ('Microsoft.XMLHTTP');

  // If it's still not initialized, there's nothing more we can do for you! Have a nice day.
  if (! request) { throw new Error ("Your browser doesn't support the full use of this application's features."); }

  // If we're still around, it must be initialized. :D
  request.onreadystatechange = function () { if (request.readyState == 4 && request.status == 200) handler.call (request); };
  request.open (type, url, true);
  request.send (type.toLowerCase () == 'post' ? (request.setRequestHeader ('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'),
                                                 arguments [4])
                                              : null);

  return request;
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
