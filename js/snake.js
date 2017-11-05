function Snake(ops) {

    var snake = this;

    this.init = function (ops) {

        var html = '' +
        '<div id="sn_info">' +
        '   <span id="sn_options"></span>' +
        '   <br>' +
        '   Score: <span id="sn_score"></span>' +
        '   <span style="float:right">wasd</span>' +
        '</div>' +
        '<div id="p1" class="sn_point" style="top:20px;left:0px;z-index: 1;"></div>' +
        '<div id="p2" class="sn_point" style="top:10px;left:0px;"></div>' +
        '<div id="p3" class="sn_point" style="top:0px;left:0px;"></div>';
        $('#sn_main').prepend(html);

        if (ops.speed && ops.speed > 10)
            ops.speed = 2;

        if (!ops.width) {

            var w = $(window).width() - 200;
            if (w < 250)
                w = 250;
            w = w - (w % 10);
            ops.width = w;
        }
        else if (ops.width < 250)
            ops.width = 250;

        if (!ops.height) {

            var h = $(window).height() - 200;
            if (h < 250)
                h = 250;
            h = h - (h % 10);
            ops.height = h;
        }
        else if (ops.height < 250)
            ops.height = 250;

        $.extend(snake.options, ops);
        if (snake.options.width % 10 > 0)
            snake.options.width = snake.options.width - (snake.options.width % 10);
        if (snake.options.height % 10 > 0)
            snake.options.height = snake.options.height - (snake.options.height % 10);
        $('#sn_main').width(snake.options.width).height(snake.options.height);
        $('#sn_options').html('options: '+JSON.stringify(snake.options));
        $('#sn_info').width(snake.options.width);

        for (var i = 0; i < snake.options.width; i = i + 10) {
            for (var j = 0; j < snake.options.height; j = j + 10) {
                if (i == 0 && j < 21)
                    snake.bodyArray.push([i, j]);
                else
                    snake.emptyArray.push([i, j]);
            }
        }
    };

    this.options = { speed: 2 };
    this.emptyArray = [];
    this.bodyArray = [];

    snake.init(ops);

    this.dir = 'd';
    this.p_index = $('.sn_point').length;
    this.head = $('#p1');
    this.limit = { left: 0, top: 0, right: snake.options.width - 10, bottom: snake.options.height - 10 };

    this.start = function () {

        $(document).keydown(snake.keyDown);
        snake.feed();
        snake.move();
    };

    this.move = function () {

        if (snake.control()) {

            var prevTop = snake.head.position().top;
            var prevLeft = snake.head.position().left;

            if (snake.dir == 'r')
                snake.head.css('left', prevLeft + 10);
            else if (snake.dir == 'l')
                snake.head.css('left', prevLeft - 10);
            else if (snake.dir == 'u')
                snake.head.css('top', prevTop - 10);
            else if (snake.dir == 'd')
                snake.head.css('top', prevTop + 10);

            var headPos = snake.head.position();

            snake.bodyArray.push([headPos.left, headPos.top]);
            snake.emptyArray = snake.removeArrayElement(snake.emptyArray, headPos.left, headPos.top);

            var foodPos = $('.sn_food').position();
            var hungry = true;
            if (headPos.top == foodPos.top && headPos.left == foodPos.left) {

                snake.eat();
                hungry = false;
            }

            $('#sn_score').text(snake.p_index);

            for (var i = snake.bodyArray.length - 3; i >= 0; i--) {

                $('#p' + (snake.bodyArray.length - i - 1)).css('left', prevLeft).css('top', prevTop);

                prevLeft = snake.bodyArray[i][0];
                prevTop = snake.bodyArray[i][1];
            }

            if (hungry) {

                snake.emptyArray.push([prevLeft, prevTop]);
                snake.bodyArray = snake.removeArrayElement(snake.bodyArray, prevLeft, prevTop);
            }

            setTimeout(function () { snake.move(); }, 100 / snake.options.speed);
        }
        else {

            snake.head.css('background-color', 'red');
        }
    };

    this.removeArrayElement = function (arr, left, top) {

        var i = 0;
        var found = false;
        for (; i < arr.length; i++) {

            if (arr[i][0] == left && arr[i][1] == top) {
                found = true;
                break;
            }
        }
        if (found)
            arr.splice(i, 1);

        return arr;
    };

    this.control = function () {

        var pos = snake.head.position();

        if (snake.dir == 'u') {

            if (pos.top == snake.limit.top)
                return false;
        }
        else if (snake.dir == 'd') {

            if (pos.top == snake.limit.bottom)
                return false;
        }
        else if (snake.dir == 'r') {

            if (pos.left == snake.limit.right)
                return false;
        }
        else if (snake.dir == 'l') {

            if (pos.left == snake.limit.left)
                return false;
        }

        var headPos = snake.head.position();

        for (var i = 0; i < snake.bodyArray.length - 1; i++) {

            if (headPos.left == snake.bodyArray[i][0] && headPos.top == snake.bodyArray[i][1])
                return false;
        }

        return true;
    };

    this.feed = function () {

        var rand = snake.emptyArray[Math.floor(Math.random() * snake.emptyArray.length)];
        $('#sn_main').append('<div class="sn_food" style="top:' + rand[1] + ';left:' + rand[0] + '"></div>');
    };

    this.eat = function () {

        var pos = $('#p' + snake.p_index).position();
        $('#p' + snake.p_index).after('<div style="top:' + pos.top + ';left:' + pos.left + '" id="p' + (++snake.p_index) + '" class="sn_point"></div>');
        $('.sn_food').remove();
        snake.feed();
    };

    this.keyDown = function (e) {

        var headPos = snake.head.position();
        var p2Pos = $('#p2').position();

        if (e.which == 87) { //w pressed

            if (headPos.top == p2Pos.top)
                snake.dir = 'u';
        }
        else if (e.which == 83) { //s pressed

            if (headPos.top == p2Pos.top)
                snake.dir = 'd';
        }
        else if (e.which == 68) { //d pressed

            if (headPos.left == p2Pos.left)
                snake.dir = 'r';
        }
        else if (e.which == 65) { //a pressed

            if (headPos.left == p2Pos.left)
                snake.dir = 'l';
        }
    };
}