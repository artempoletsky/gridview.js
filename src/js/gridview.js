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


            console.log(i1, i2, index);
            
            var children = _.toArray(el.children);
            
            for (var i = i1; i < i2; i++) {
                if (index >= collectionLength) {
                    break;
                }

                $fastJq[0] = children[i];

                $fastJq.remove();
                var $view = getView(index, collection, template, $fastJq);
                $el[method]($view);

                /*
                 $view.css({
                 "left": viewWidth * col,
                 "top": (rowsPass + row) * viewHeight
                 });*/

                index++;
                col++;

                if (col >= cols) {
                    col = 0;
                    row++;
                }
            }
        }


        //console.log()
        el.scrollTop = -rowsPass * viewHeight - y;
        //$el.scrollTop(-y);




    };




    ViewModel.binds.gridView = function($el, value, context, addArgs) {
        var numItems = 20;
        var width = $el.width();
        var height = $el.height();


        var collection = [];
        collection.length = numItems;
        var viewWidth = 2000;
        var viewHeight = $el.children().height();
        var cols = Math.ceil(width / viewWidth);
        viewWidth = width / cols;
        //console.log(width, viewWidth, cols)
        var rows = Math.ceil(height / viewHeight) + 1;

        var totalRows = Math.ceil(numItems / cols);

        var maxY = (totalRows) * viewHeight - height;
        if (maxY < 0)
            maxY = 0;

        var visibleItems = Math.min(rows * cols, numItems);

        var template = $el.html();

        $el.empty();



        var row = 0, col = 0;
        for (var i = 0; i < visibleItems; i++) {

            var $view = getView(i, collection, template, null);
            $el.append($view);

            col++;
            if (col >= cols) {
                col = 0;
                row++;
            }

            $view.css({
                width: viewWidth
            });

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
                    newY = minMax(newY, -maxY, 0);

                    //console.log(newY, -maxY);
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

        var top = 0, lastTop = 0, step = -1020;


        (function draw() {
            top += step;

            setXY($el,
                    0, top, 0, lastTop,
                    viewWidth, viewHeight,
                    rows, cols,
                    collection, null);
            lastTop = top;
            window.requestAnimationFrame(draw);
        });

    };

}());
