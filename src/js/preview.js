(function() {

    function format(template, json) {
        return template.replace(/#\{(.*?)\}/g, function(all, key) {
            return json && (key in json) ? json[key] : "";
        });
    }

    function search2Json(search) {
        return search.substring(1).split("&").reduce(function(result, value) {
            var parts = value.split('=');
            if (parts[0]) {
                result[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
            }
            return result;
        }, {});
    }

    var info = search2Json(location.search);
    if (info.md5) {
        document.querySelector('.share-icon').src =
            format('http://bj.bcebos.com/paper/#{md5}.png', info);
    }
    else {
        document.querySelector('.share-icon').style.display = 'none';
    }

    var lastHearts = 0;

    function updateHearts() {
        $.ajax({
            type: 'GET',
            url: '/heart/',
            data: {
                md5: info.md5
            },
            dataType: 'json',
            success: function(data) {
                if (data === null) {
                    return;
                }
                if (data.error) {
                    return;
                }
                if (lastHearts != data.data.hearts) {
                    flashHearts();
                }
                lastHearts = +data.data.hearts;
                $('.heart-count').text(format('×#{hearts}', data.data));
                setTimeout(updateHearts, 5000);
            }
        });
    }
    updateHearts();

    var timer;
    function flashHearts() {
        $('.hearts').addClass('bounce');
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function() {
            timer = null;
            $('.hearts').removeClass('bounce');
        }, 3000);
    }

    new Hammer(document.querySelector('.back')).on('tap', function(ev) {
        location = 'index.html';
    });

    new Hammer(document.querySelector('.logo')).on('tap', function(ev) {
        location = 'index.html';
    });

    new Hammer(document.querySelector('.hearts')).on('tap', function(ev) {

        var hearts = localStorage['cutpaper-hearts'];
        if (hearts) {
            try {
                hearts = JSON.parse(hearts);
                if (typeof hearts !== 'object') {
                    hearts = {};
                }
            } catch(ex) {
                hearts = {};
            }
        } else {
            hearts = {};
        }
        if (hearts[info.md5]) { // 已经投过票
            return;
        }
        hearts[info.md5] = lastHearts || 1;
        localStorage['cutpaper-hearts'] = JSON.stringify(hearts);

        $('.mask').show();

        $.ajax({
            type: 'POST',
            url: '/heart/',
            data: {
                md5: info.md5
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
                }, 500);
                lastHearts++;
                flashHearts();
                $('.heart-count').text(format('×#{hearts}', {
                    hearts: lastHearts
                }));
            },
            error: function() {
                alert('network error.');
                $('.mask').hide();
            }
        });
    });
})();
