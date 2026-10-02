const colorNames = new Set(`
    aliceblue antiquewhite aqua aquamarine azure beige bisque black
    blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse
    chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan
    darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta
    darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen
    darkslateblue darkslategray darkslategrey darkturquoise darkviolet
    deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite
    forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green
    greenyellow grey honeydew hotpink indianred indigo ivory khaki
    lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral
    lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink
    lightsalmon lightseagreen lightskyblue lightslategray lightslategrey
    lightsteelblue lightyellow lime limegreen linen magenta maroon
    mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen
    mediumslateblue mediumspringgreen mediumturquoise mediumvioletred
    midnightblue mintcream mistyrose moccasin navajowhite navy oldlace
    olive olivedrab orange orangered orchid palegoldenrod palegreen
    paleturquoise palevioletred papayawhip peachpuff peru pink plum
    powderblue purple rebeccapurple red rosybrown royalblue saddlebrown
    salmon sandybrown seagreen seashell sienna silver skyblue slateblue
    slategray slategrey snow springgreen steelblue tan teal thistle
    tomato turquoise violet wheat white whitesmoke yellow yellowgreen
`.trim().split(/\s+/));

function isValidColor(value) {
    // Check a named color, ignoring capitalization.
    if (colorNames.has(value.toLowerCase())) {
        return true;
    }

    // Accept #RGB or #RRGGBB.
    if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
        return true;
    }

    // Capture the three numeric components.
    const match = value.match(
        /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i
    );

    if (match === null) {
        return false;
    }

    return match.slice(1).every(function (component) {
        return Number(component) <= 255;
    });
}

module.exports = { isValidColor };