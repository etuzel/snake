var p_index = $('.sn_point').length;
var head = $('#p1');
var limit = { left: 100, top: 100, right: 390, bottom: 390 };
var dir = 'd';

var emptyArray = [];
var bodyArray = [];

for (var i = 100; i < 400; i = i + 10) {
    for (var j = 100; j < 400; j = j + 10) {
        if (i == 100 & j > 99 && j < 141)
            bodyArray.push([i, j]);
        else
            emptyArray.push([i, j]);
    }
}

$(document).keydown(function (e) {

    var headPos = head.position();
    var p2Pos = $('#p2').position();

    if (e.which == 87) { //w pressed

        if (headPos.top == p2Pos.top)
            dir = 'u';
    }
    else if (e.which == 83) { //s pressed

        if (headPos.top == p2Pos.top)
            dir = 'd';
    }
    else if (e.which == 68) { //d pressed

        if (headPos.left == p2Pos.left)
            dir = 'r';
    }
    else if (e.which == 65) { //a pressed

        if (headPos.left == p2Pos.left)
            dir = 'l';
    }
});

function removeArrayElement(arr, left, top) {

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
}

function move() {

    if (control()) {

        var prevTop = head.position().top;
        var prevLeft = head.position().left;

        if (dir == 'r')
            head.css('left', prevLeft + 10);
        else if (dir == 'l')
            head.css('left', prevLeft - 10);
        else if (dir == 'u')
            head.css('top', prevTop - 10);
        else if (dir == 'd')
            head.css('top', prevTop + 10);

        var headPos = head.position();

        bodyArray.push([headPos.left, headPos.top]);
        emptyArray = removeArrayElement(emptyArray, headPos.left, headPos.top);

        var foodPos = $('.sn_food').position();
        var hungry = true;
        if (headPos.top == foodPos.top && headPos.left == foodPos.left) {

            eat();
            hungry = false;
        }

        $('#sn_score').text(p_index);

        for (var i = bodyArray.length - 3; i >= 0; i--) {

            $('#p' + (bodyArray.length - i - 1)).css('left', prevLeft).css('top', prevTop);

            prevLeft = bodyArray[i][0];
            prevTop = bodyArray[i][1];
        }

        if (hungry) {

            emptyArray.push([prevLeft, prevTop]);
            bodyArray = removeArrayElement(bodyArray, prevLeft, prevTop);
        }

        setTimeout(function () { move(); }, 50);
    }
    else {

        head.css('background-color', 'red');
    }
}

function control() {

    var pos = head.position();

    if (dir == 'u') {

        if (pos.top == limit.top)
            return false;
    }
    else if (dir == 'd') {

        if (pos.top == limit.bottom)
            return false;
    }
    else if (dir == 'r') {

        if (pos.left == limit.right)
            return false;
    }
    else if (dir == 'l') {

        if (pos.left == limit.left)
            return false;
    }

    var headPos = head.position();

    for (var i = 0; i < bodyArray.length - 1; i++) {

        if (headPos.left == bodyArray[i][0] && headPos.top == bodyArray[i][1])
            return false;
    }

    return true;
}

function feed() {

    var rand = emptyArray[Math.floor(Math.random() * emptyArray.length)];
    $('#sn_main').append('<div class="sn_food" style="top:' + rand[1] + ';left:' + rand[0] + '"></div>');
}

function eat() {

    var pos = $('#p' + p_index).position();
    $('#p' + p_index).after('<div style="top:' + pos.top + ';left:' + pos.left + '" id="p' + (++p_index) + '" class="sn_point"></div>');
    $('.sn_food').remove();
    feed();
}

feed();
move();