
$(document).ready(function () {

    if ($('#sn_main').length == 1) {

        var html = '' +
        '<div id="sn_info">' +
        '   <div id="sn_options">' +
        '       <input id="sn_width" type="number" class="sn_input" placeholder="width" title="width (min: 250)" min="250" step="10" value="250" />' +
        '       <input id="sn_height" type="number" class="sn_input" placeholder="height" title="height (min: 250)" min="250" step="10" value="250" />' +
        '       <select id="sn_speed" type="number" title="speed">' +
        '           <option>slow</option>' +
        '           <option>medium</option>' +
        '           <option selected>fast</option>' +
        '           <option>faster</option>' +
        '           <option>speed of light</option>' +
        '       </select>' +
        '       <label for="sn_auto" >Auto Play:</label> <input id="sn_auto" type="checkbox" />' +
        '       <button id="sn_startBtn" type="button" onclick="sn_start()">Start!</button>' +
        '   </div>' +
        '   <br>' +
        '   <span class="hideOnStart">Score:</span> <span id="sn_score"></span><span class="hideOnStart" style="float:right">wasd</span>' +
        '</div>' +
        '<div id="p1" class="sn_point hideOnStart" style="top:20px;left:0px;z-index: 1;"></div>' +
        '<div id="p2" class="sn_point hideOnStart" style="top:10px;left:0px;"></div>' +
        '<div id="p3" class="sn_point hideOnStart" style="top:0px;left:0px;"></div>';
        $('#sn_main').prepend(html);

        $('.hideOnStart').hide();
    }
});

function sn_start() {

    var speed = $('#sn_speed').val();
    if (speed == 'slow')
        speed = 1;
    else if (speed == 'medium')
        speed = 3;
    else if (speed == 'fast')
        speed = 6;
    else if (speed == 'faster')
        speed = 12;
    else if (speed == 'speed of light')
        speed = 50;

    new Snake({ width: $('#sn_width').val(), height: $('#sn_height').val(), speed: speed, auto: $('#sn_auto').is(':checked') }).start();
}

function Snake(ops) {

    var snake = this;

    this.init = function (ops) {

        $('.hideOnStart').show();

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
        snake.setOptionsStr();
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

    this.setOptionsStr = function () {

        if (snake.options.speed == 1)
            snake.options.speed = 'slow';
        else if (snake.options.speed == 3)
            snake.options.speed = 'medium';
        else if (snake.options.speed == 6)
            snake.options.speed = 'fast';
        else if (snake.options.speed == 12)
            snake.options.speed = 'faster';
        else if (snake.options.speed == 50)
            snake.options.speed = 'speed of light';

        $('#sn_options').html('options: ' + JSON.stringify(snake.options));

        if (snake.options.speed == 'slow')
            snake.options.speed = 1;
        else if (snake.options.speed == 'medium')
            snake.options.speed = 3;
        else if (snake.options.speed == 'fast')
            snake.options.speed = 6;
        else if (snake.options.speed == 'faster')
            snake.options.speed = 12;
        else if (snake.options.speed == 'speed of light')
            snake.options.speed = 50;
    }

    this.options = { speed: 2, auto: false };
    this.emptyArray = [];
    this.bodyArray = [];
    this.reasonsOfDeath = { LIMITS: 0, COLLISION: 1 };
    this.directions = { UP: 0, DOWN: 1, RIGHT: 2, LEFT: 3 };

    snake.init(ops);

    this.dir = snake.directions.DOWN;
    this.p_index = $('.sn_point').length;
    this.head = $('#p1');
    this.limit = { left: 0, top: 0, right: snake.options.width - 10, bottom: snake.options.height - 10 };

    this.start = function () {

        $(document).keydown(snake.keyDown);
        snake.feed();
        snake.move();
    };

    this.move = function () {

        if (snake.options.auto)
            snake.autoTurn();

        if (snake.control()) {

            var prevTop = snake.head.position().top;
            var prevLeft = snake.head.position().left;

            if (snake.dir == snake.directions.RIGHT)
                snake.head.css('left', prevLeft + 10);
            else if (snake.dir == snake.directions.LEFT)
                snake.head.css('left', prevLeft - 10);
            else if (snake.dir == snake.directions.UP)
                snake.head.css('top', prevTop - 10);
            else if (snake.dir == snake.directions.DOWN)
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

            console.log(Object.keys(snake.reasonsOfDeath)[snake.reasonOfDeath]);
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

    this.reasonOfDeath = '';
    this.control = function () {

        var pos = snake.head.position();
        var result = true;

        if (snake.dir == snake.directions.UP) {

            if (pos.top == snake.limit.top)
                result = false;
        }
        else if (snake.dir == snake.directions.DOWN) {

            if (pos.top == snake.limit.bottom)
                result = false;
        }
        else if (snake.dir == snake.directions.RIGHT) {

            if (pos.left == snake.limit.right)
                result = false;
        }
        else if (snake.dir == snake.directions.LEFT) {

            if (pos.left == snake.limit.left)
                result = false;
        }

        if (result == false) {

            snake.reasonOfDeath = snake.reasonsOfDeath.LIMITS;
            return false;
        }
        else {

            for (var i = 0; i < snake.bodyArray.length - 1; i++) {

                if (snake.dir == snake.directions.UP) {

                    if (pos.left == snake.bodyArray[i][0] && pos.top == snake.bodyArray[i][1] + 10) {
                        result = false;
                        break;
                    }
                }
                else if (snake.dir == snake.directions.DOWN) {

                    if (pos.left == snake.bodyArray[i][0] && pos.top == snake.bodyArray[i][1] - 10) {
                        result = false;
                        break;
                    }
                }
                else if (snake.dir == snake.directions.RIGHT) {

                    if (pos.top == snake.bodyArray[i][1] && pos.left == snake.bodyArray[i][0] - 10) {
                        result = false;
                        break;
                    }
                }
                else if (snake.dir == snake.directions.LEFT) {

                    if (pos.top == snake.bodyArray[i][1] && pos.left == snake.bodyArray[i][0] + 10) {
                        result = false;
                        break;
                    }
                }
            }

            if (result == false) {

                snake.reasonOfDeath = snake.reasonsOfDeath.COLLISION;
                return false;
            }
            else return true;
        }
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
                snake.dir = snake.directions.UP;
        }
        else if (e.which == 83) { //s pressed

            if (headPos.top == p2Pos.top)
                snake.dir = snake.directions.DOWN;
        }
        else if (e.which == 68) { //d pressed

            if (headPos.left == p2Pos.left)
                snake.dir = snake.directions.RIGHT;
        }
        else if (e.which == 65) { //a pressed

            if (headPos.left == p2Pos.left)
                snake.dir = snake.directions.LEFT;
        }
    };

    this.autoTurn = function () {

        snake.saveTheSnake();

        if (++snake.counterForAuto >= snake.p_index) {

            var foodPos = $('.sn_food').position();
            var pos = snake.head.position();

            var leftDiff = foodPos.left - pos.left;
            var topDiff = foodPos.top - pos.top;

            if (leftDiff != 0 || topDiff != 0) { // snake is eating right now. we'll wait for next food.

                if (leftDiff == 0) {

                    if (topDiff > 0)
                        $.event.trigger({ type: 'keydown', which: 83 }); // down
                    else
                        $.event.trigger({ type: 'keydown', which: 87 }); // up

                    snake.counterForAuto = 0;
                }
                else if (topDiff == 0) {

                    if (leftDiff > 0)
                        $.event.trigger({ type: 'keydown', which: 68 }); // right
                    else
                        $.event.trigger({ type: 'keydown', which: 65 }); // left

                    snake.counterForAuto = 0;
                }
            }
        }
    };

    this.counterForAuto = 0;

    this.saveTheSnake = function () {

        if (!snake.control()) { // game will be over. turn somewhere.

            var pos = snake.head.position();
            if (/*snake.reasonOfDeath == snake.reasonsOfDeath.LIMITS*/true) { //todo

                if (snake.dir == snake.directions.UP || snake.dir == snake.directions.DOWN) {

                    if (Math.abs(snake.limit.left - pos.left) > Math.abs(snake.limit.right - pos.left))
                        snake.dir = snake.directions.LEFT;
                    else
                        snake.dir = snake.directions.RIGHT;
                }
                else if (snake.dir == snake.directions.RIGHT || snake.dir == snake.directions.LEFT) {

                    if (Math.abs(snake.limit.top - pos.top) > Math.abs(snake.limit.bottom - pos.top))
                        snake.dir = snake.directions.UP;
                    else
                        snake.dir = snake.directions.DOWN;
                }
            }
            else if (snake.reasonOfDeath == snake.reasonsOfDeath.COLLISION) {


            }
        }
    };
}
