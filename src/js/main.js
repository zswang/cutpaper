(function() {
    function format(template, json) {
        return template.replace(/#\{(.*?)\}/g, function(all, key) {
            return json && (key in json) ? json[key] : "";
        });
    }

    var colors = [
        '#E82C4B', '#2C97E8', '#20AF74', '#F39D1C', '#F95E1A', 'black'
    ];
    var currentColor = colors[parseInt(Math.random() * colors.length)];

    var edgesList = [
        5, 6, 7, 8
    ];
    var currentEdges = edgesList[parseInt(Math.random() * edgesList.length)];

    var currentColor = colors[parseInt(Math.random() * colors.length)];

    var history = [];
    var updating;

    var game = jcuts.createGame({
        center: [200, 550],
        radius: 500,
        edges: currentEdges,
        fill: currentColor,
        stroke: 'none',
        container: '.game',
        onchange: function() {
            if (!updating) {
                history.unshift(game.getData());
            }
            previewChange();
        }
    });
    var originShape;

    function rebuild() {
        originShape = game.getShape();
        originShape = JSON.stringify({
            base: originShape.base,
            edges: originShape.edges,
            polygon: originShape.polygon
        });
    }

    var preview = jcuts.createRender({
        container: '.preview',
        stroke: 'none'
    });

    var storage = localStorage['cutpaper-data'];
    if (storage) {
        try {
            var data = JSON.parse(storage);

            if (data.fill !== 'none') {
                currentColor = data.fill || currentColor;
            }
            currentEdges = data.edges || currentEdges;

            game.setAttributes({
                edges: currentEdges
            });
            rebuild();

            game.setData(data);
        }
        catch (ex) {
            alert(ex.message);
        }
    } else {
        rebuild();
    }

    $('.colors').html(colors.map(function(color) {
        return format('<li data-color="#{color}" #{className} style="background: #{color}"></li>', {
            color: color,
            className: color === currentColor ? 'class = "active"' : ''
        });
    }).join('\n'));

    $('.edges').html(edgesList.map(function(edges) {
        return format('<li data-edges="#{edges}" #{className}">#{edges}</li>', {
            edges: edges,
            className: edges === currentEdges ? 'class = "active"' : ''
        });
    }).join('\n'));

    var shape;
    var touchTimer;

    function previewChange() {
        var data = game.getData();
        shape = game.getShape();
        preview.setAttributes({
            fill: data.fill
        });
        preview.render(shape);
        localStorage['cutpaper-data'] = JSON.stringify(data);
        if (history.length > 1) {
            $('.undo, .undo-hint').show();
        }
        else {
            $('.undo, .undo-hint').hide();
        }
        if (originShape === JSON.stringify({
            base: shape.base,
            edges: shape.edges,
            polygon: shape.polygon
        })) {
            if (touchTimer) {
                clearTimeout(touchTimer);
            }
            touchTimer = setTimeout(function() {
                touchTimer = null;
                $('.touch').show()
            }, 3000);
            $('.save, .save-hint').hide();
            $('.delete, .delete-hint').hide();
        }
        else {
            if (touchTimer) {
                clearTimeout(touchTimer);
                touchTimer = null;
            }
            $('.touch').hide();
            $('.save, .save-hint').show();
            $('.delete, .delete-hint').show();
        }
    }

    previewChange();

    function deleteHandler() {
        history = [];
        game.replay();
    }
    new Hammer(document.querySelector('.delete')).on('tap', deleteHandler);
    new Hammer(document.querySelector('.delete-hint')).on('tap', deleteHandler);

    function kata() {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.height = 300;
        canvas.width = 300;

        var shareIcon = jcuts.createRender({
            container: canvas,
            fill: currentColor,
            backgrund: 'white',
            stroke: 'none'
        });
        shape.fill = currentColor;
        shape.polygon = shape.polygon.map(function(item) {
            return [+item[0].toFixed(2), +item[1].toFixed(2)];
        });
        shareIcon.render(shape);
        return canvas.toDataURL();
    }

    new Hammer(document.querySelector('.colors')).on('tap', function(e) {
        if (!e.srcEvent) {
            return;
        }
        if (!e.srcEvent.target) {
            return;
        }
        var color = e.srcEvent.target.getAttribute('data-color');
        if (!color) {
            return;
        }
        currentColor = color;
        $('.colors li').removeClass('active');
        $(e.srcEvent.target).addClass('active');
        game.setAttributes({
            fill: currentColor
        });
        preview.setAttributes({
            fill: currentColor
        });
        previewChange();
    });

    new Hammer(document.querySelector('.edges')).on('tap', function(e) {
        if (!e.srcEvent) {
            return;
        }
        if (!e.srcEvent.target) {
            return;
        }
        var edges = e.srcEvent.target.getAttribute('data-edges');
        if (!edges) {
            return;
        }
        currentEdges = parseInt(edges);
        $('.edges li').removeClass('active');
        $(e.srcEvent.target).addClass('active');
        history = [];
        game.setAttributes({
            edges: currentEdges
        });
        rebuild();
        previewChange();
    });

    new Hammer(document.querySelector('.ranking')).on('tap', function(e) {
        location = 'ranking.html';
    });
    new Hammer(document.querySelector('.ranking-hint')).on('tap', function(e) {
        location = 'ranking.html';
    });

    function undoHandler(e) {
        if (history.length > 1) {
            history.shift();
            updating = true;
            game.setData(history[0]);
            game.setAttributes({
                fill: currentColor
            });
            updating = false;
        }
    }

    new Hammer(document.querySelector('.undo')).on('tap', undoHandler);
    new Hammer(document.querySelector('.undo-hint')).on('tap', undoHandler);


    function saveHandler(e) {
        $('.mask').show();

        var dataURL = kata();
        var md5 = jmd5s.encode(dataURL);

        /*<remove>*/
        location = 'preview.html?md5=' + md5;
        $('.mask').hide();
        return;
        /*</remove>*/

        $.ajax({
            type: 'POST',
            url: '/kata/',
            data: {
                dataURL: dataURL,
                shape: JSON.stringify(shape),
                md5: md5
            },
            dataType: 'json',
            success: function(data) {
                if (data === null) {
                    alert('post error.');
                    $('.mask').hide();
                    return;
                }
                if (data.error) {
                    alert(data.error);
                    $('.mask').hide();
                    return;
                }
                setTimeout(function() {
                    $('.mask').hide();
                    location = 'preview.html?md5=' + md5;
                }, 1500);
            },
            error: function() {
                alert('network error.');
                $('.mask').hide();
            }
        });
    }
    new Hammer(document.querySelector('.save')).on('tap', saveHandler);
    new Hammer(document.querySelector('.save-hint')).on('tap', saveHandler);
})();
