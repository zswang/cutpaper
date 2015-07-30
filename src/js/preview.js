/*<replace encoding="#uglify">*/
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

    var preview = jcuts.createRender({
        container: '.preview',
        stroke: 'none'
    });

    function updateHearts() {
        /*<remove>*/
        var networkData = JSON.parse('{"data":{"hearts":"0","shape":"{\\"edges\\":5,\\"base\\":{\\"center\\":[200,550],\\"radius\\":500},\\"fill\\":\\"fuchsia\\",\\"polygon\\":[[235.46,188.73],[226,200],[202,225],[176,253],[147,283],[122.15,310.42],[136.21,353.68],[163,310],[170,300],[167,314],[153,340],[139.14,362.71],[151.89,401.92],[161,390],[183,359],[195,347],[202,337],[211,327],[212,327],[206,339],[191,360],[173,384],[153.79,407.78],[168.78,453.92],[181,437],[193,419],[222,385],[226,384],[228,384],[228,417],[223,437],[211,473],[196,502],[188.2,513.69],[200,550],[238,433.05],[238,429],[240,423],[241,412],[246,398],[255,370],[258.17,364.81],[256,363],[245,353],[233,343],[225,332],[216,322],[211,310],[210,300],[210,279],[216,270],[223,264],[232,260],[238,259],[245,259],[251,260],[256,269],[261,280],[270,314],[273.33,324.32],[288.95,276.25],[287,273],[283,268],[281,263],[280,258],[278,253],[278,233],[283,223],[287,213],[296,199],[300,194],[303,189],[306,187],[307,185],[310,185],[311,190],[311,208.38],[335.82,132],[333,132],[333,119],[338,113],[343,108],[343.76,107.54],[354.51,74.47],[335.18,74.47],[332,84],[330,95],[327,97],[325,97],[322,95],[318,90],[316,83],[312.59,74.47],[267.4,74.47],[267,75],[263,83],[261,88],[255,88],[252,85],[247,83],[242,79],[237.47,74.47],[220.17,74.47],[220,75],[216,84],[215,88],[208,88],[203,85],[198,83],[188,77],[184.97,74.47],[121.18,74.47],[120,78],[115,85],[112,92],[108,93],[106,93],[103,92],[101,90],[98,88],[95,82],[88.98,74.47],[45.49,74.47],[57.69,112],[71,112],[91,114],[110,118],[119.53,120.65],[121,119],[130,112],[135,107],[140,103],[143,99],[146,99],[147,98],[150,98],[148,100],[145,105],[141,110],[136,118],[133.37,124.14],[161,130],[172,133],[182,134],[196,139],[200,140],[201,142],[202,142],[202,143],[187,143],[168,144],[143,150],[116,160],[81,174],[78.27,175.36],[85.37,197.21],[101,192],[118,185],[131,182],[145,178],[152,177],[160,177],[160,185],[146,203],[130,222],[112,242],[103,251.47],[114.58,287.1],[125,279],[143,263],[162,245],[181,225],[200,208],[235,173],[250,159],[278,137],[285,133],[286,133],[278,143],[276,145.31],[276,148],[275,150],[275,154],[273,159],[270,174],[268,179],[267,184],[263,193],[261,195],[260,197],[258,198],[255,198],[253,197],[251,197],[242,193],[238,190]]}"},"error":null}');
        successHandler(networkData);
        return;
        /*</remove>*/

        function successHandler(data) {
            if (data === null) {
                return;
            }
            if (data.error) {
                return;
            }
            if (lastHearts != data.data.hearts) {
                flashHearts();
            }
            var shape = data.data.shape;
            if (typeof shape === 'string') {
                shape = JSON.parse(shape);
            }
            if (typeof shape === 'object') {
                if (!shape.fill || shape.fill === 'none') {
                    shape.fill = 'red';
                }
                preview.render(shape);
            }
            lastHearts = +data.data.hearts;
            $('.heart-count').text(format('x #{hearts}', data.data));
            setTimeout(updateHearts, 5000);
        }
        $.ajax({
            type: 'GET',
            url: '/heart/',
            data: {
                md5: info.md5
            },
            dataType: 'json',
            success: successHandler
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

    new Hammer(document.querySelector('.cut')).on('tap', function(ev) {
        location = 'index.html';
    });

    new Hammer(document.querySelector('.ranking')).on('tap', function(e) {
        location = 'ranking.html';
    });

    new Hammer(document.querySelector('.hearts')).on('tap', function(ev) {

        var hearts = localStorage['cutpaper-hearts'];
        if (hearts) {
            try {
                hearts = JSON.parse(hearts);
                if (typeof hearts !== 'object') {
                    hearts = {};
                }
            }
            catch (ex) {
                hearts = {};
            }
        }
        else {
            hearts = {};
        }
        if (hearts[info.md5]) { // 已经投过票
            return;
        }
        hearts[info.md5] = lastHearts || 1;
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
                localStorage['cutpaper-hearts'] = JSON.stringify(hearts);
                flashHearts();
                $('.heart-count').text(format('x #{hearts}', {
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
/*</replace>*/
