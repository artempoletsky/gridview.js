(function() {

    window.requestAnimationFrame = window.requestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
        return setTimeout(callback, 1000 / 60);
    };

    var getView = function(index, collection, template, view) {
        if (!view) {
            view = $(template);
        }
        view.find("div").html(index);
        return view;
    };
    var $fastJq = $("<div/>");


    var minMax = function(val, min, max) {
        if (val < min) {
            return min;
        }
        if (val > max) {
            return max;
        }
        return val;
    };



    var setXY = function($el,
            x, y, lastX, lastY,
            viewWidth, viewHeight,
            rows, cols,
            collection, template) {

        var el = $el[0];
        //console.log(y, lastY);
        if (y === lastY) {
            return;
        }
        var rowsPass = Math.floor(-y / viewHeight);
        var lastRowsPass = Math.floor(-lastY / viewHeight);


        var chLength = rows * cols;

        var collectionLength = collection.length;



        if (rowsPass != lastRowsPass) {

            var row = 0, col = 0;
            var l, i1, i2, index, method = "append";
            if (rowsPass > lastRowsPass) {

                i1 = 0;
                row = rows - rowsPass + lastRowsPass;

                if (row < 0)
                    row = 0;
                if (i2 > chLength)
                    i2 = chLength;


                i2 = (rows - row) * cols;

            } else {
                method = "prepend";
                row = 0;
                i2 = chLength;
                i1 = chLength - cols * (lastRowsPass - rowsPass);


                if (i1 < 0)
                    i1 = 0;
            }
            index = (rowsPass + row) * cols;




            var children = _.toArray(el.children);
            for (var i = i1; i < i2; i++) {
                if (index >= collectionLength) {
                    break;
                }

                $fastJq[0] = children[i];

                $fastJq.remove();
                var $view = getView(index, collection, template, $fastJq);
                $el[method]($view);


                $view.css({
                    "left": viewWidth * col,
                    "top": (rowsPass + row) * viewHeight
                });

                index++;
                col++;

                if (col >= cols) {
                    col = 0;
                    row++;
                }
            }
        }



        el.scrollTop = -y;
        //$el.scrollTop(-y);




    };




    ViewModel.binds.gridView = function($el, value, context, addArgs) {
        var numItems = 1000;
        var width = $el.width();
        var height = $el.height();


        var collection = [];
        collection.length = 1000;
        var viewWidth = 200;
        var viewHeight = 200;
        var cols = Math.ceil(width / viewWidth);
        viewWidth = width / cols;
        //console.log(width, viewWidth, cols)
        var rows = Math.ceil(height / viewHeight) + 1;

        var visibleItems = rows * cols;
        var template = $el.html();

        $el.empty();

        

        var i = 0;
        for (var y = 0; y < rows; y++) {
            for (var x = 0; x < cols; x++) {


                var $view = getView(i, null, template, null);

                $el.append($view);
                $view.css({
                    width: viewWidth,
                    height: viewHeight,
                    left: x * viewWidth,
                    top: y * viewHeight
                });
                i++;
            }
        }

        $el.scrollTop(0);


        


        var drag = false;
        var dx, dy, x = 0, y = 0;
        $el.on({
            mousedown: function(e) {
                dx = e.screenX - x;
                dy = e.screenY - y;
                drag = true;
                return false;
            },
            mouseup: function() {
                drag = false;
                return false;
            },
            mousemove: function(e) {
                if (drag) {
                    var newX = e.screenX - dx, newY = e.screenY - dy;

                    newX = minMax(newX, -Infinity, 0);
                    newY = minMax(newY, -Infinity, 0);

                    setXY($el,
                            newX, newY, x, y,
                            viewWidth, viewHeight,
                            rows, cols, collection, null);
                    x = newX;
                    y = newY;
                }
                return false;
            }
        });

        var top = 0, lastTop = 0, step = -150;


        (function draw() {
            top += step;

            setXY($el,
                    0, top, 0, lastTop,
                    viewWidth, viewHeight,
                    rows, cols,
                    collection, null);
            lastTop = top;
            window.requestAnimationFrame(draw);
        }());

    };

}());
