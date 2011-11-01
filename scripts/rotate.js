$(document).ready(function() {
    image_rotator.init($('.rotate'));
});

var image_rotator = {
    urls : null,
    index : 0,
    outer_div : null,
    inner_div : null,
    left_overlay_div : null,
    right_overlay_div : null,
    timer : null,
    
    image_width: 625,
    image_height: 428,
    overlay_opacity: 0.8,
    overlay_opacity_hover: 1,
    next_slide_delay : 3,
    href_separator : '|',
    left_arrow_img : 'images/arrow-l-light.png',
    right_arrow_img : 'images/arrow-r-light.png',
    arrow_img_height : 46,
    
    // Initialize our object
    init : function(elems) {
        var t = this;
        elems.each(function() {
            image_rotator.outer_div = $(this);
            
            t._parse_url_list(image_rotator.outer_div.attr('rel'));
            t._preload(urls);
            
            image_rotator.inner_div = $('<div></div>').css('overflow', 'hidden');
            image_rotator.inner_div.after('<div style="clear: left"></div>');
            
            t._append_image(new Array(
                urls[t._image_at(-1)],
                urls[t._image_at(0)],
                urls[t._image_at(1)]));
                
        
            image_rotator.left_overlay_div = $('<div></div>')
                .css('position', 'absolute')
                .css('top', '0px')
                .css('left', '0px')
                .css('opacity', image_rotator.overlay_opacity)
                .css('background', '#000')
                .css('cursor', 'pointer')
                .click(function() {
                    image_rotator.previous();
                })
                .hover(function() {
                    $(this).css('opacity', image_rotator.overlay_opacity_hover);
                }, function() {
                    $(this).css('opacity', image_rotator.overlay_opacity);
                });
            
            image_rotator.right_overlay_div = $('<div></div>')
                .css('position', 'absolute')
                .css('top', '0px')
                .css('right', '0px')
                .css('opacity', image_rotator.overlay_opacity)
                .css('background', '#000')
                .css('cursor', 'pointer')
                .click(function() {
                    image_rotator.next();
                })
                .hover(function() {
                    $(this).css('opacity', image_rotator.overlay_opacity_hover);
                }, function() {
                    $(this).css('opacity', image_rotator.overlay_opacity);
                });
            
            var top_y = (image_rotator.image_height - image_rotator.arrow_img_height) / 2;
            var left_arrow = $('<img src="'+image_rotator.left_arrow_img+'">')
                .css('position', 'absolute')
                .css('left', '15px')
                .css('top', top_y + 'px')
                .css('cursor', 'pointer')
                .click(function() {
                    image_rotator.left_overlay_div.click();
                });
            var right_arrow = $('<img src="'+image_rotator.right_arrow_img+'">')
                .css('position', 'absolute')
                .css('right', '15px')
                .css('top', top_y + 'px')
                .css('cursor', 'pointer')
                .click(function() {
                    image_rotator.right_overlay_div.click();
                });
                
            image_rotator.outer_div
                .css('position', 'relative')
                .css('overflow', 'hidden')
                .append(image_rotator.inner_div)
                .append(image_rotator.left_overlay_div)
                .append(image_rotator.right_overlay_div)
                .append(left_arrow)
                .append(right_arrow);
            
            image_rotator._position_images();
            $(window).resize(function() {
                image_rotator._position_images();
            });
            
            // Set our interval
            image_rotator._reset_interval();
        });
    },
    
    // Select the next image in our list
    next : function() {
        image_rotator._reset_interval();
        var old_img = image_rotator.inner_div.find('img:first');
        image_rotator._append_image();
        old_img.slideLeft('slow', function() {
            old_img.remove();
            image_rotator.index = image_rotator._image_at(1);
            image_rotator._append_image(urls[image_rotator.index]);
        });
    },
    
    // Select the previous image in our list
    previous : function() {
        image_rotator._reset_interval();
        image_rotator.index = image_rotator._image_at(-1);
        var new_img = image_rotator._prepend_image(urls[image_rotator.index]);
        new_img.slideRight(function() {
            var old_img = image_rotator.inner_div.find('img:last');
            old_img.remove();
        });
    },
    
    // Sets the interval between automatic slide rotations
    _reset_interval : function() {
        if(image_rotator.timer) {
            clearInterval(image_rotator.timer);
        }
        image_rotator.timer = setInterval(function() {
            image_rotator.next();
        }, image_rotator.next_slide_delay * 1000);
    },
    
    // Calculate the image index, based on the current index,
    // given an optional positive or negative offset
    _image_at : function(offset) {
        var image_at = (image_rotator.index + offset) % urls.length;
        if(image_at < 0) {
            image_at = image_at + urls.length;
        }
        return image_at;
    },
    
    // Attach an image to the end of our slider
    _append_image : function(url) {
        return this._attach_image(url);
    },
    
    // Attach an image to the beginning of our slider
    _prepend_image : function(url) {
        return this._attach_image(url, true);
    },

    // Recursive image attacher.  Accepts a single URL
    // or an array of URLs.  Attaches image to beginning
    // or end of slider
    _attach_image : function(url, beginning) {
        if(url) {
            if($.isArray(url)) {
                var t = this;
                $.each(urls, function(index, url){
                    t._attach_image(url, beginning);
                });
            }
            else {
                var split_url = url.split(image_rotator.href_separator, 2);
                var img_url = split_url[0];
                var link_url = split_url[1];
                
                var img = $('<img src="'+img_url+'">')
                    .css('width', image_rotator.image_width + 'px')
                    .css('height', image_rotator.image_height + 'px')
                    .css('float', 'left');

                if(beginning) {
                    img.css('display', 'none');
                    image_rotator.inner_div.prepend(img);
                }
                else {
                    image_rotator.inner_div.append(img);
                }
                
                if(link_url) {
                    var link = $('<a></a>').attr('href', link_url);
                    img.wrap(link);
                }
                            
                return img;
            }
        }
    },
    
    // Parse a comma-separated string of URLs
    _parse_url_list : function(url_str) {
        urls = url_str.split(',');
        $.each(urls, function(index, element) {
            element = element.replace(/^\s+|\s+$/g,"");
        });
    },
    
    // Recursive image preloader.  Accepts a url
    // or array of urls (or array of arrays of...)
    _preload : function(urls) {
        if(urls) {
            if($.isArray(urls)) {
                var t = this;
                $.each(urls, function(index, url) {
                   t._preload(url); 
                });
            }
            else {
                var img = new Image;
                split_url = urls.split(image_rotator.href_separator, 2);
                img.src = split_url[0];
            }
        }
    },
    
    // Responsible for actually positioning all images, including
    // overlays.  Called on every window.resize event. Forces the
    // outer_div to be 100% of the width of its parent and calculates
    // resulting positioning accordingly
    _position_images : function() {
        image_rotator.outer_div.width('100%');
        var full_width = image_rotator.outer_div.width();

        var overlay_width = parseInt((full_width - image_rotator.image_width) / 2);
        var margin_left = parseInt(0 - (image_rotator.image_width - overlay_width));
        var min_width = image_rotator.image_width + 100;
        
        image_rotator.inner_div
            .css('width', '5000px')
            .css('height', image_rotator.image_height + 'px')
            .css('margin-left', margin_left + 'px');
        image_rotator.outer_div
            .css('min-width', min_width + 'px')
            .css('width', full_width + 'px');
        
        image_rotator.left_overlay_div
            .css('width', overlay_width + 'px')
            .css('height', image_rotator.image_height + 'px');
        image_rotator.right_overlay_div
            .css('width', overlay_width + 'px')
            .css('height', image_rotator.image_height + 'px');
    }
};


/* isArray jquery plugin */
// Copyright (c) <2009> <Nathan Agrin n8@n8agrin.com>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Adapted from:
// "JavaScript: The Good Parts" by Douglas Crockford. Copyright 2008 Yahoo! Inc., 978-0-596-51774-8

// Adds isArray functionality to jQuery if it is not already defined (safe for versions >= 1.3, but ultimately useless)
(function($) {
    if (!$.isArray) {
        $.isArray = function(val) {
            return val &&
                typeof(val) === 'object' &&
                typeof(val.length) === 'number' &&
                typeof(val.splice) === 'function' &&
                !(val.propertyIsEnumerable('length'));
        }
    }
})(jQuery);


// Adds slideLeft() and slideRight() functions to jQuery, similar to existing
// slideUp() and slideDown() functions.
(function($) {
    $.fn.slideLeft = function(speed, callback) {
        return this.animate({width: "hide"}, speed, callback);
    };
    $.fn.slideRight = function(speed, callback) {
        return this.animate({width: "show"}, speed, callback);
    };
})(jQuery);