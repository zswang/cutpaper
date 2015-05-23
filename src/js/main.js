(function() {
    function format(template, json) {
        return template.replace(/#\{(.*?)\}/g, function(all, key) {
            return json && (key in json) ? json[key] : "";
        });
    }

    var colors = [
        'red', 'fuchsia', 'black'
    ];

    $('.colors').html(colors.map(function(color) {
        return format('<li data-color="#{color}" style="background: #{color}"></li>', {
            color: color
        });
    }).join('\n'));

    var fill = colors[0];
    var game = jcuts.createGame({
        center: [200, 550],
        radius: 500,
        edges: 5,
        fill: fill,
        stroke: 'none',
        container: '.game',
        onchange: function() {
            previewChange();
        }
    });
    var preview = jcuts.createRender({
        container: '.preview',
        stroke: 'none'
    });

    var storage = localStorage['cutpaper-data'];
    if (storage) {
        try {
            game.setData(JSON.parse(storage));
        }
        catch (ex) {
            alert(ex.message);
        }
    }

    var shape;

    function previewChange() {
        var data = game.getData();
        shape = game.getShape();
        preview.setAttributes({
            fill: data.fill
        });
        preview.render(shape);
        localStorage['cutpaper-data'] = JSON.stringify(data);
    }

    previewChange();

    new Hammer(document.querySelector('.delete')).on('tap', function() {
        game.replay();
    });

    function kata() {
        var canvas = document.createElement('canvas');
        canvas.height = 300;
        canvas.width = 300;

        var shareIcon = jcuts.createRender({
            container: canvas,
            fill: fill,
            stroke: 'none'
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
        game.setAttributes({
            fill: color
        });
        previewChange();
    });

    new Hammer(document.querySelector('.share')).on('tap', function(e) {
        $('.mask').show();

        var dataURL = kata();
        var md5 = jmd5s.encode(dataURL);
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
    });
})();
